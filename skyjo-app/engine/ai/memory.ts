import type {
  Strategy,
  StrategyContext,
  TurnAction,
  GridPosition,
  Card,
  GameState,
} from "../types";
import { COLS, ROWS, CARD_DISTRIBUTION, TOTAL_CARDS } from "../constants";
import {
  getFaceDownPositions,
  getActivePositions,
  getHighestFaceUpPosition,
  getColumnValues,
  shouldEndRoundSafely,
  analyzeOpponents,
} from "../grid";

interface CardTracker {
  seen: Map<number, number>; // value -> count seen
  totalSeen: number;
}

function createTracker(): CardTracker {
  return { seen: new Map(), totalSeen: 0 };
}

function trackCard(tracker: CardTracker, value: number): void {
  tracker.seen.set(value, (tracker.seen.get(value) || 0) + 1);
  tracker.totalSeen++;
}

function getExpectedValue(tracker: CardTracker): number {
  const remaining = TOTAL_CARDS - tracker.totalSeen;
  if (remaining === 0) return 5; // fallback

  let weightedSum = 0;
  for (const [value, totalCount] of Object.entries(CARD_DISTRIBUTION)) {
    const v = Number(value);
    const seen = tracker.seen.get(v) || 0;
    const left = totalCount - seen;
    if (left > 0) {
      weightedSum += v * left;
    }
  }
  return weightedSum / remaining;
}

function getProbOfValueOrLess(tracker: CardTracker, threshold: number): number {
  const remaining = TOTAL_CARDS - tracker.totalSeen;
  if (remaining === 0) return 0;

  let count = 0;
  for (const [value, totalCount] of Object.entries(CARD_DISTRIBUTION)) {
    const v = Number(value);
    if (v <= threshold) {
      const seen = tracker.seen.get(v) || 0;
      count += Math.max(0, totalCount - seen);
    }
  }
  return count / remaining;
}

export function createMemoryStrategy(): Strategy {
  let tracker = createTracker();

  return {
    id: "memory",
    name: "Memory",
    description:
      "Tracks seen cards and uses probability to make optimal decisions.",
    config: {
      highCardThreshold: 5,
      lowCardThreshold: 2,
      columnMatchWeight: 0.6,
      flipRiskTolerance: 0.4,
      roundEndAggressiveness: 0.4,
      explorationRate: 0.03,
    },

    chooseSetupFlips(ctx: StrategyContext): [GridPosition, GridPosition] {
      // Reset tracker for new round
      tracker = createTracker();

      // Track the initial discard card
      trackCard(tracker, ctx.topDiscard.value);

      // Track visible cards from other players
      for (const p of ctx.gameState.players) {
        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            if (p.grid[row]?.[col]?.card && p.grid[row][col].faceUp) {
              trackCard(tracker, p.grid[row][col].card!.value);
            }
          }
        }
      }

      // Flip two cards in the same column for match potential
      return [
        { row: 0, col: 1 },
        { row: 2, col: 1 },
      ];
    },

    chooseTurnAction(ctx: StrategyContext): TurnAction {
      const { player, topDiscard, config, gameState } = ctx;
      const grid = player.grid;
      const faceDownPositions = getFaceDownPositions(grid);

      // Update tracker with all visible info
      updateTrackerFromState(tracker, gameState);

      // Analyze opponent state for informed decisions
      const opp = analyzeOpponents(player, gameState.players);

      const expectedDrawValue = getExpectedValue(tracker);
      // Under pressure: expand what counts as "low" to accept more cards
      const effectiveLowThreshold =
        config.lowCardThreshold + (opp.isUnderPressure ? 2 : 0);
      const probLowDraw = getProbOfValueOrLess(tracker, effectiveLowThreshold);

      // Column completion opportunity with discard
      const colTarget = findColumnCompleterMemory(grid, topDiscard.value);
      if (colTarget) {
        return {
          type: "take-discard",
          targetRow: colTarget.row,
          targetCol: colTarget.col,
        };
      }

      // Take discard if below expected value (lower bar when under pressure)
      const discardMargin = opp.isUnderPressure ? 1 : -1;
      if (topDiscard.value < expectedDrawValue + discardMargin) {
        const highest = getHighestFaceUpPosition(grid);
        if (
          highest &&
          grid[highest.row][highest.col].card!.value > topDiscard.value
        ) {
          return {
            type: "take-discard",
            targetRow: highest.row,
            targetCol: highest.col,
          };
        }
      }

      // Try to end round if safely ahead (using memory-informed estimate)
      if (faceDownPositions.length > 0 && faceDownPositions.length <= 3) {
        const otherGrids = gameState.players
          .filter((p) => p.id !== player.id)
          .map((p) => p.grid);
        if (
          shouldEndRoundSafely(grid, otherGrids, config.roundEndAggressiveness)
        ) {
          const target = pickBestFlipMemory(grid, tracker);
          return {
            type: "draw-and-discard-flip",
            targetRow: target.row,
            targetCol: target.col,
          };
        }
      }

      // Very low discard — always take (raise threshold under pressure)
      const alwaysTakeThreshold = opp.isUnderPressure ? 2 : 0;
      if (topDiscard.value <= alwaysTakeThreshold) {
        const target = findBestTarget(grid, topDiscard.value);
        return {
          type: "take-discard",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // If probability of drawing low is high, draw and swap
      if (probLowDraw > 0.4) {
        const highest = getHighestFaceUpPosition(grid);
        if (
          highest &&
          grid[highest.row][highest.col].card!.value >= config.highCardThreshold
        ) {
          return {
            type: "draw-and-swap",
            targetRow: highest.row,
            targetCol: highest.col,
          };
        }
      }

      // Flip face-down cards to gather information
      if (faceDownPositions.length > 0) {
        const target = pickBestFlipMemory(grid, tracker);
        return {
          type: "draw-and-discard-flip",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // All face up: swap highest
      const highest = getHighestFaceUpPosition(grid);
      if (highest) {
        return {
          type: "draw-and-swap",
          targetRow: highest.row,
          targetCol: highest.col,
        };
      }

      const active = getActivePositions(grid);
      const target = active[Math.floor(Math.random() * active.length)];
      return {
        type: "draw-and-swap",
        targetRow: target.row,
        targetCol: target.col,
      };
    },
  };
}

function updateTrackerFromState(tracker: CardTracker, state: GameState): void {
  // Reset and rebuild from current state
  tracker.seen.clear();
  tracker.totalSeen = 0;

  // Track discard pile top
  if (state.discardPile.length > 0) {
    trackCard(tracker, state.discardPile[state.discardPile.length - 1].value);
  }

  // Track all visible cards in all grids
  for (const p of state.players) {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (p.grid[row]?.[col]?.card && p.grid[row][col].faceUp) {
          trackCard(tracker, p.grid[row][col].card!.value);
        }
      }
    }
  }
}

function findColumnCompleterMemory(
  grid: any[][],
  value: number,
): GridPosition | null {
  for (let col = 0; col < COLS; col++) {
    const colValues = getColumnValues(grid, col);
    const matchCount = colValues.filter((v) => v === value).length;
    if (matchCount === 2) {
      for (let row = 0; row < ROWS; row++) {
        const cell = grid[row][col];
        if (cell.card && cell.faceUp && cell.card.value !== value) {
          return { row, col };
        }
        if (cell.card && !cell.faceUp) {
          return { row, col };
        }
      }
    }
  }
  return null;
}

function findBestTarget(grid: any[][], newValue: number): GridPosition {
  const highest = getHighestFaceUpPosition(grid);
  if (highest && grid[highest.row][highest.col].card!.value > newValue) {
    return highest;
  }
  const faceDown = getFaceDownPositions(grid);
  if (faceDown.length > 0) {
    return faceDown[Math.floor(Math.random() * faceDown.length)];
  }
  const active = getActivePositions(grid);
  return active[Math.floor(Math.random() * active.length)];
}

function pickBestFlipMemory(grid: any[][], tracker: CardTracker): GridPosition {
  const faceDown = getFaceDownPositions(grid);

  // Prefer positions that could complete column matches
  for (const pos of faceDown) {
    const colValues = getColumnValues(grid, pos.col);
    const known = colValues.filter((v) => v !== null);
    if (known.length === 2 && known[0] === known[1]) {
      // Check probability of the match value still being available
      const matchValue = known[0] as number;
      const totalCards = CARD_DISTRIBUTION[matchValue] || 0;
      const seenCount = tracker.seen.get(matchValue) || 0;
      const remaining = totalCards - seenCount;
      if (remaining > 0) {
        return pos; // Good chance to complete!
      }
    }
  }

  // Otherwise flip in columns with most info
  const scored = faceDown.map((pos) => {
    const colVals = getColumnValues(grid, pos.col);
    const knownCount = colVals.filter((v) => v !== null).length;
    return { pos, score: knownCount };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.pos || faceDown[0];
}

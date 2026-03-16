import type {
  Strategy,
  StrategyContext,
  TurnAction,
  GridPosition,
  Card,
  GameState,
  PlayerGrid,
} from "../types";
import { COLS, ROWS, CARD_DISTRIBUTION, TOTAL_CARDS } from "../constants";
import {
  getFaceDownPositions,
  getActivePositions,
  getHighestFaceUpPosition,
  getColumnValues,
  countActiveCards,
  shouldEndRoundSafely,
  analyzeOpponents,
} from "../grid";

// ── Card Tracker (from Memory strategy) ──────────────────────────────

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
  if (remaining === 0) return 5;

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

function getProbOfValueOrLess(
  tracker: CardTracker,
  threshold: number,
): number {
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

function updateTrackerFromState(
  tracker: CardTracker,
  state: GameState,
): void {
  tracker.seen.clear();
  tracker.totalSeen = 0;

  if (state.discardPile.length > 0) {
    trackCard(tracker, state.discardPile[state.discardPile.length - 1].value);
  }

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

// ── Ultimate Strategy ────────────────────────────────────────────────

export function createUltimateStrategy(): Strategy {
  let tracker = createTracker();

  return {
    id: "ultimate",
    name: "Ultimate",
    description:
      "Combines the best aspects of all strategies: memory tracking, column hunting, phase-adaptive play, and informed draw decisions.",
    config: {
      highCardThreshold: 5,
      lowCardThreshold: 2,
      columnMatchWeight: 0.8,
      flipRiskTolerance: 0.3,
      roundEndAggressiveness: 0.6,
      explorationRate: 0.02,
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

      // Flip two cards in the same column for early column-match potential
      // (from Column Hunter / Aggressive — best setup for column removal)
      return [
        { row: 0, col: 1 },
        { row: 2, col: 1 },
      ];
    },

    chooseTurnAction(ctx: StrategyContext): TurnAction {
      const { player, topDiscard, config, gameState } = ctx;
      const grid = player.grid;
      const faceDownPositions = getFaceDownPositions(grid);
      const totalActive = countActiveCards(grid);
      const faceDownCount = faceDownPositions.length;
      const progress = 1 - faceDownCount / totalActive;

      // Update memory tracker with all visible info (from Memory)
      updateTrackerFromState(tracker, gameState);

      // Analyze opponent state (used by all advanced strategies)
      const opp = analyzeOpponents(player, gameState.players);

      const expectedDrawValue = getExpectedValue(tracker);

      // Dynamic thresholds (from Balanced) boosted by memory-informed decisions
      const pressureBoost = opp.isUnderPressure ? 2 : opp.urgency * 1.5;
      const effectiveLowThreshold =
        config.lowCardThreshold + pressureBoost;
      const effectiveHighThreshold =
        config.highCardThreshold - progress * 3 - pressureBoost;

      // ── Priority 1: Complete a column match from discard (from Column Hunter) ──
      const completer = findColumnCompleter(grid, topDiscard.value);
      if (completer) {
        return {
          type: "take-discard",
          targetRow: completer.row,
          targetCol: completer.col,
        };
      }

      // ── Priority 2: Build toward a column pair (from Column Hunter) ──
      // Skip pair-building when under heavy pressure — focus on speed
      if (!opp.isUnderPressure) {
        const pairTarget = findColumnPairTarget(grid, topDiscard.value);
        if (pairTarget) {
          return {
            type: "take-discard",
            targetRow: pairTarget.row,
            targetCol: pairTarget.col,
          };
        }
      }

      // ── Priority 3: Take discard if below expected draw value (from Memory) ──
      const discardMargin = opp.isUnderPressure ? 1 : -1;
      if (topDiscard.value < expectedDrawValue + discardMargin) {
        const highest = getHighestFaceUpPosition(grid);
        if (
          highest &&
          grid[highest.row][highest.col].card!.value > topDiscard.value + 2
        ) {
          return {
            type: "take-discard",
            targetRow: highest.row,
            targetCol: highest.col,
          };
        }
      }

      // ── Priority 4: Very low discard — always take (from Memory) ──
      const alwaysTakeThreshold = opp.isUnderPressure ? 2 : 0;
      if (topDiscard.value <= alwaysTakeThreshold) {
        const target = findBestTarget(grid, topDiscard.value);
        return {
          type: "take-discard",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // ── Priority 5: Under pressure — rush to flip (from Aggressive/Balanced) ──
      if (opp.isUnderPressure && faceDownPositions.length > 2) {
        const target = pickBestFlip(grid, tracker);
        return {
          type: "draw-and-discard-flip",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // ── Priority 6: End round if safely ahead (from Aggressive — enhanced) ──
      const maxFaceDownToEnd = opp.isLeading ? 4 : 3;
      if (
        faceDownPositions.length > 0 &&
        faceDownPositions.length <= maxFaceDownToEnd
      ) {
        const otherGrids = gameState.players
          .filter((p) => p.id !== player.id)
          .map((p) => p.grid);
        if (
          shouldEndRoundSafely(grid, otherGrids, config.roundEndAggressiveness)
        ) {
          const target = pickBestFlip(grid, tracker);
          return {
            type: "draw-and-discard-flip",
            targetRow: target.row,
            targetCol: target.col,
          };
        }
      }

      // ── Priority 7: Phase-adaptive play (from Balanced) ──
      // Early game: prefer flipping to gather information
      const earlyThreshold = opp.isUnderPressure ? 0.7 : 0.5;
      if (progress < earlyThreshold && faceDownPositions.length > 0) {
        const target = pickBestFlip(grid, tracker);
        return {
          type: "draw-and-discard-flip",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // ── Priority 8: Probability-informed draw (from Memory) ──
      const probLowDraw = getProbOfValueOrLess(tracker, effectiveLowThreshold);
      if (probLowDraw > 0.4) {
        const highest = getHighestFaceUpPosition(grid);
        if (
          highest &&
          grid[highest.row][highest.col].card!.value >= effectiveHighThreshold
        ) {
          return {
            type: "draw-and-swap",
            targetRow: highest.row,
            targetCol: highest.col,
          };
        }
      }

      // ── Priority 9: Flip remaining face-down cards ──
      if (faceDownPositions.length > 0) {
        const target = pickBestFlip(grid, tracker);
        return {
          type: "draw-and-discard-flip",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // ── Fallback: swap highest card ──
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

// ── Helper functions ─────────────────────────────────────────────────

/** Find a position that completes a 3-of-a-kind column (from Column Hunter). */
function findColumnCompleter(
  grid: PlayerGrid,
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
      }
      for (let row = 0; row < ROWS; row++) {
        const cell = grid[row][col];
        if (cell.card && !cell.faceUp) {
          return { row, col };
        }
      }
    }
  }
  return null;
}

/** Find a position to build a pair toward a column match (from Column Hunter). */
function findColumnPairTarget(
  grid: PlayerGrid,
  value: number,
): GridPosition | null {
  for (let col = 0; col < COLS; col++) {
    const colValues = getColumnValues(grid, col);
    const matchCount = colValues.filter((v) => v === value).length;
    if (matchCount === 1) {
      for (let row = 0; row < ROWS; row++) {
        const cell = grid[row][col];
        if (cell.card && cell.faceUp && cell.card.value !== value) {
          if (cell.card.value >= value) {
            return { row, col };
          }
        }
      }
    }
  }
  return null;
}

/** Find the best target for placing a new card (from Memory). */
function findBestTarget(grid: PlayerGrid, newValue: number): GridPosition {
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

/**
 * Pick the best face-down card to flip, using memory-informed column match
 * probability (from Memory) and column-match awareness (from Column Hunter).
 */
function pickBestFlip(grid: PlayerGrid, tracker: CardTracker): GridPosition {
  const faceDown = getFaceDownPositions(grid);

  // Prefer positions that could complete column matches with cards still available
  for (const pos of faceDown) {
    const colValues = getColumnValues(grid, pos.col);
    const known = colValues.filter((v) => v !== null);
    if (known.length === 2 && known[0] === known[1]) {
      const matchValue = known[0] as number;
      const totalCards = CARD_DISTRIBUTION[matchValue] || 0;
      const seenCount = tracker.seen.get(matchValue) || 0;
      const remaining = totalCards - seenCount;
      if (remaining > 0) {
        return pos;
      }
    }
  }

  // Then prefer columns with most info for strategic flipping
  const scored = faceDown.map((pos) => {
    const colVals = getColumnValues(grid, pos.col);
    const knownCount = colVals.filter((v) => v !== null).length;
    return { pos, score: knownCount };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.pos || faceDown[0];
}

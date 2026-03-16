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
  countActiveCards,
  shouldEndRoundSafely,
  analyzeOpponents,
} from "../grid";

// ---------------------------------------------------------------------------
// Card probability tracker (from Memory strategy)
// ---------------------------------------------------------------------------

interface CardTracker {
  seen: Map<number, number>;
  totalSeen: number;
}

function createTracker(): CardTracker {
  return { seen: new Map(), totalSeen: 0 };
}

function trackCard(tracker: CardTracker, value: number): void {
  tracker.seen.set(value, (tracker.seen.get(value) || 0) + 1);
  tracker.totalSeen++;
}

function updateTrackerFromState(tracker: CardTracker, state: GameState): void {
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

// ---------------------------------------------------------------------------
// Grid helpers
// ---------------------------------------------------------------------------

/**
 * Find a position that would complete a 3-of-a-kind column with the given value.
 * Prefers replacing a face-up non-matching card; falls back to a face-down card.
 */
function findColumnCompleter(
  grid: any[][],
  value: number,
): GridPosition | null {
  for (let col = 0; col < COLS; col++) {
    const colValues = getColumnValues(grid, col);
    const matchCount = colValues.filter((v) => v === value).length;
    if (matchCount === 2) {
      for (let row = 0; row < ROWS; row++) {
        const cell = grid[row]![col]!;
        if (cell.card && cell.faceUp && cell.card.value !== value) {
          return { row, col };
        }
      }
      for (let row = 0; row < ROWS; row++) {
        const cell = grid[row]![col]!;
        if (cell.card && !cell.faceUp) {
          return { row, col };
        }
      }
    }
  }
  return null;
}

/**
 * Find a position that would create a pair (1-of-a-kind → 2-of-a-kind) in a column,
 * replacing a card with a higher or equal value.
 */
function findColumnPairBuilder(
  grid: any[][],
  value: number,
): GridPosition | null {
  for (let col = 0; col < COLS; col++) {
    const colValues = getColumnValues(grid, col);
    const matchCount = colValues.filter((v) => v === value).length;
    if (matchCount === 1) {
      for (let row = 0; row < ROWS; row++) {
        const cell = grid[row]![col]!;
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

/**
 * Pick the best face-down card to flip, preferring:
 * 1. Columns where 2 known cards already match (high column-completion potential)
 * 2. Columns where a matching card is still statistically available (tracker-aware)
 * 3. Columns with the most known cards (information density)
 */
function pickBestFlipTarget(
  grid: any[][],
  tracker: CardTracker,
): GridPosition {
  const faceDown = getFaceDownPositions(grid);

  // Prefer columns where 2 known cards match — flip to complete
  for (const pos of faceDown) {
    const colValues = getColumnValues(grid, pos.col);
    const known = colValues.filter((v) => v !== null);
    if (known.length === 2 && known[0] === known[1]) {
      const matchValue = known[0] as number;
      const totalCards = CARD_DISTRIBUTION[matchValue] || 0;
      const seenCount = tracker.seen.get(matchValue) || 0;
      if (totalCards - seenCount > 0) {
        return pos;
      }
    }
  }

  // Then prefer columns with the most known cards
  const scored = faceDown.map((pos) => {
    const colVals = getColumnValues(grid, pos.col);
    const knownCount = colVals.filter((v) => v !== null).length;
    return { pos, score: knownCount };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.pos || faceDown[0];
}

/**
 * Find the best swap target for an incoming card:
 * - Replace the highest known face-up card if it's worse than the new card.
 * - Fall back to a face-down position.
 */
function findBestSwapTarget(
  grid: any[][],
  newValue: number,
): GridPosition | null {
  const highest = getHighestFaceUpPosition(grid);
  if (highest && grid[highest.row][highest.col].card!.value > newValue) {
    return highest;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Ultimate strategy factory
// ---------------------------------------------------------------------------

export function createUltimateStrategy(): Strategy {
  let tracker = createTracker();

  return {
    id: "ultimate",
    name: "Ultimate",
    description:
      "Combines the best aspects of every strategy: probability tracking, column hunting, phase-aware play, and pressure-sensitive adaptation.",
    config: {
      highCardThreshold: 5,
      lowCardThreshold: 1,
      columnMatchWeight: 0.85,
      flipRiskTolerance: 0.45,
      roundEndAggressiveness: 0.55,
      explorationRate: 0.02,
    },

    chooseSetupFlips(ctx: StrategyContext): [GridPosition, GridPosition] {
      // Reset tracker for the new round
      tracker = createTracker();

      // Seed tracker with the initial discard and any already-visible cards
      trackCard(tracker, ctx.topDiscard.value);
      for (const p of ctx.gameState.players) {
        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            if (p.grid[row]?.[col]?.card && p.grid[row][col].faceUp) {
              trackCard(tracker, p.grid[row][col].card!.value);
            }
          }
        }
      }

      // Flip two cards in the same column for immediate match potential (Memory + Column Hunter)
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

      // Game phase: 0 = all face-down, 1 = all revealed (Balanced)
      const progress = totalActive > 0 ? 1 - faceDownCount / totalActive : 1;

      // Rebuild probability tracker from full visible game state (Memory)
      updateTrackerFromState(tracker, gameState);

      // Opponent pressure analysis (all opponent-aware strategies)
      const opp = analyzeOpponents(player, gameState.players);
      const pressureBoost = opp.isUnderPressure ? 2 : opp.urgency * 1.5;

      // Effective thresholds that shift with phase and pressure (Balanced + Memory)
      const effectiveLowThreshold =
        config.lowCardThreshold +
        (1 - progress) * 1.5 +
        (opp.isUnderPressure ? 2 : 0);
      const effectiveHighThreshold =
        config.highCardThreshold - progress * 2 - pressureBoost;

      // Probability-based draw value estimates (Memory)
      const expectedDrawValue = getExpectedValue(tracker);
      const probLowDraw = getProbOfValueOrLess(
        tracker,
        effectiveLowThreshold,
      );

      // ── Priority 1: Complete a column with the discard (Column Hunter + Memory) ──
      const colCompleter = findColumnCompleter(grid, topDiscard.value);
      if (colCompleter) {
        return {
          type: "take-discard",
          targetRow: colCompleter.row,
          targetCol: colCompleter.col,
        };
      }

      // ── Priority 2: Under heavy pressure — rush to flip unknowns (Balanced + Aggressive) ──
      if (opp.isUnderPressure && faceDownCount > 3) {
        const target = pickBestFlipTarget(grid, tracker);
        return {
          type: "draw-and-discard-flip",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // ── Priority 3: Take a very low discard (always safe) ──
      const alwaysTakeThreshold = opp.isUnderPressure ? 2 : 0;
      if (topDiscard.value <= alwaysTakeThreshold) {
        const swapTarget = findBestSwapTarget(grid, topDiscard.value);
        if (swapTarget) {
          return {
            type: "take-discard",
            targetRow: swapTarget.row,
            targetCol: swapTarget.col,
          };
        }
        // Replace a face-down card as a last resort
        if (faceDownCount > 0) {
          return {
            type: "take-discard",
            targetRow: faceDownPositions[0].row,
            targetCol: faceDownPositions[0].col,
          };
        }
      }

      // ── Priority 4: Take discard when it's better than expected draw value (Memory) ──
      const discardMargin = opp.isUnderPressure ? 1 : -1;
      if (topDiscard.value < expectedDrawValue + discardMargin) {
        const swapTarget = findBestSwapTarget(grid, topDiscard.value);
        if (swapTarget) {
          return {
            type: "take-discard",
            targetRow: swapTarget.row,
            targetCol: swapTarget.col,
          };
        }
      }

      // ── Priority 5: Build column pair with the discard (Column Hunter, skip when pressured) ──
      if (!opp.isUnderPressure) {
        const pairTarget = findColumnPairBuilder(grid, topDiscard.value);
        if (pairTarget) {
          return {
            type: "take-discard",
            targetRow: pairTarget.row,
            targetCol: pairTarget.col,
          };
        }
      }

      // ── Priority 6: Take discard if below effective threshold and replaces high card (Balanced) ──
      if (topDiscard.value <= effectiveLowThreshold) {
        const highest = getHighestFaceUpPosition(grid);
        if (
          highest &&
          grid[highest.row][highest.col].card!.value >
            topDiscard.value + 2
        ) {
          return {
            type: "take-discard",
            targetRow: highest.row,
            targetCol: highest.col,
          };
        }
      }

      // ── Priority 7: End round safely if well ahead (Conservative + Memory) ──
      if (faceDownCount > 0 && faceDownCount <= 3) {
        const otherGrids = gameState.players
          .filter((p) => p.id !== player.id)
          .map((p) => p.grid);
        if (
          shouldEndRoundSafely(grid, otherGrids, config.roundEndAggressiveness)
        ) {
          const target = pickBestFlipTarget(grid, tracker);
          return {
            type: "draw-and-discard-flip",
            targetRow: target.row,
            targetCol: target.col,
          };
        }
      }

      // ── Priority 8: Early game — flip for information (Conservative + Balanced) ──
      const earlyThreshold = opp.isUnderPressure ? 0.65 : 0.45;
      if (progress < earlyThreshold && faceDownCount > 0) {
        const target = pickBestFlipTarget(grid, tracker);
        return {
          type: "draw-and-discard-flip",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // ── Priority 9: Draw and swap when probability of low card is high (Memory) ──
      if (probLowDraw > 0.4) {
        const highest = getHighestFaceUpPosition(grid);
        if (
          highest &&
          grid[highest.row][highest.col].card!.value >=
            config.highCardThreshold
        ) {
          return {
            type: "draw-and-swap",
            targetRow: highest.row,
            targetCol: highest.col,
          };
        }
      }

      // ── Priority 10: Swap a high card if one is visible (Greedy + Memory) ──
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

      // ── Fallback: flip a face-down card, prioritising columns with match potential ──
      if (faceDownCount > 0) {
        const target = pickBestFlipTarget(grid, tracker);
        return {
          type: "draw-and-discard-flip",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // All cards face-up: swap the highest
      if (highest) {
        return {
          type: "draw-and-swap",
          targetRow: highest.row,
          targetCol: highest.col,
        };
      }

      const active = getActivePositions(grid);
      const fallback = active[Math.floor(Math.random() * active.length)];
      return {
        type: "draw-and-swap",
        targetRow: fallback.row,
        targetCol: fallback.col,
      };
    },
  };
}

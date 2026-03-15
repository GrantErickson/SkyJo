import type {
  Strategy,
  StrategyContext,
  TurnAction,
  GridPosition,
} from "../types";
import { COLS, ROWS } from "../constants";
import {
  getFaceDownPositions,
  getActivePositions,
  getHighestFaceUpPosition,
  getColumnValues,
  shouldEndRoundSafely,
  analyzeOpponents,
} from "../grid";

export function createColumnHunterStrategy(): Strategy {
  return {
    id: "column-hunter",
    name: "Column Hunter",
    description:
      "Obsessively pursues column matches to remove entire columns. Sacrifices short-term score for column removal bonuses.",
    config: {
      highCardThreshold: 6,
      lowCardThreshold: 3,
      columnMatchWeight: 0.95,
      flipRiskTolerance: 0.4,
      roundEndAggressiveness: 0.3,
      explorationRate: 0.05,
    },

    chooseSetupFlips(ctx: StrategyContext): [GridPosition, GridPosition] {
      // Flip two cards in the same column for early match info
      return [
        { row: 0, col: 0 },
        { row: 2, col: 0 },
      ];
    },

    chooseTurnAction(ctx: StrategyContext): TurnAction {
      const { player, topDiscard, config, gameState } = ctx;
      const grid = player.grid;
      const faceDownPositions = getFaceDownPositions(grid);

      // Analyze opponents — abandon column-hunting when under heavy pressure
      const opp = analyzeOpponents(player, gameState.players);

      // Under heavy pressure with many unknowns: just flip cards, don't hunt columns
      if (opp.isUnderPressure && faceDownPositions.length > 3) {
        const target = findMatchPotentialFlip(grid) ?? faceDownPositions[0]!;
        return {
          type: "draw-and-discard-flip",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // Priority 1: Complete a column match from discard
      const completer = findColumnCompleter(grid, topDiscard.value);
      if (completer) {
        return {
          type: "take-discard",
          targetRow: completer.row,
          targetCol: completer.col,
        };
      }

      // Priority 2: Build toward a column match — take discard if it
      // creates a pair in a column (skip when under pressure — focus on speed)
      const pairTarget = opp.isUnderPressure ? null : findColumnPairTarget(
        grid,
        topDiscard.value,
      ) as GridPosition | null;
      if (pairTarget) {
        return {
          type: "take-discard",
          targetRow: pairTarget.row,
          targetCol: pairTarget.col,
        };
      }

      // Priority 3: End round if safely ahead
      if (faceDownPositions.length > 0 && faceDownPositions.length <= 2) {
        const otherGrids = gameState.players
          .filter((p) => p.id !== player.id)
          .map((p) => p.grid);
        if (
          shouldEndRoundSafely(grid, otherGrids, config.roundEndAggressiveness)
        ) {
          const target = findMatchPotentialFlip(grid) ?? faceDownPositions[0]!;
          return {
            type: "draw-and-discard-flip",
            targetRow: target.row,
            targetCol: target.col,
          };
        }
      }

      // Priority 4: Take low cards from discard (widen under pressure)
      const lowCardThreshold = opp.isUnderPressure ? 2 : 0;
      if (topDiscard.value <= lowCardThreshold) {
        const highest = getHighestFaceUpPosition(grid);
        if (
          highest &&
          grid[highest.row]![highest.col]!.card!.value > topDiscard.value
        ) {
          return {
            type: "take-discard",
            targetRow: highest.row,
            targetCol: highest.col,
          };
        }
      }

      // Priority 4: Flip face-down cards in columns with potential matches
      const matchFlip = findMatchPotentialFlip(grid);
      if (matchFlip) {
        return {
          type: "draw-and-discard-flip",
          targetRow: matchFlip.row,
          targetCol: matchFlip.col,
        };
      }

      // Priority 5: Flip any face-down card
      if (faceDownPositions.length > 0) {
        const target = faceDownPositions[0]!;
        return {
          type: "draw-and-discard-flip",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // Fallback: swap with highest card
      const highest = getHighestFaceUpPosition(grid);
      if (highest) {
        return {
          type: "draw-and-swap",
          targetRow: highest.row,
          targetCol: highest.col,
        };
      }

      const active = getActivePositions(grid);
      const target = active[Math.floor(Math.random() * active.length)]!;
      return {
        type: "draw-and-swap",
        targetRow: target.row,
        targetCol: target.col,
      };
    },
  };
}

function findColumnCompleter(
  grid: any[][],
  value: number,
): GridPosition | null {
  for (let col = 0; col < COLS; col++) {
    const colValues = getColumnValues(grid, col);
    const matchCount = colValues.filter((v) => v === value).length;
    if (matchCount === 2) {
      // Replace the non-matching card
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

function findColumnPairTarget(
  grid: any[][],
  value: number,
): GridPosition | null {
  for (let col = 0; col < COLS; col++) {
    const colValues = getColumnValues(grid, col);
    const matchCount = colValues.filter((v) => v === value).length;
    if (matchCount === 1) {
      // Place the card to form a pair — replace the non-matching face-up card
      for (let row = 0; row < ROWS; row++) {
        const cell = grid[row]![col]!;
        if (cell.card && cell.faceUp && cell.card.value !== value) {
          // Only worth it if we're replacing a higher card
          if (cell.card.value >= value) {
            return { row, col };
          }
        }
      }
    }
  }
  return null;
}

function findMatchPotentialFlip(grid: any[][]): GridPosition | null {
  const faceDown = getFaceDownPositions(grid);
  // Prefer flipping in columns where 2 known cards already match
  for (const pos of faceDown) {
    const colValues = getColumnValues(grid, pos.col);
    const known = colValues.filter((v) => v !== null);
    if (known.length === 2 && known[0] === known[1]) {
      return pos;
    }
  }
  // Then prefer columns with at least 1 known card
  for (const pos of faceDown) {
    const colValues = getColumnValues(grid, pos.col);
    const known = colValues.filter((v) => v !== null);
    if (known.length >= 1) {
      return pos;
    }
  }
  return faceDown.length > 0 ? faceDown[0]! : null;
}

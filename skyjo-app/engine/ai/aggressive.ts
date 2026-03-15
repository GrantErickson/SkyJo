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
} from "../grid";

export function createAggressiveStrategy(): Strategy {
  return {
    id: "aggressive",
    name: "Aggressive",
    description:
      "Pursues column matches and tries to end rounds quickly when ahead.",
    config: {
      highCardThreshold: 4,
      lowCardThreshold: 1,
      columnMatchWeight: 0.7,
      flipRiskTolerance: 0.2,
      roundEndAggressiveness: 0.8,
      explorationRate: 0.05,
    },

    chooseSetupFlips(ctx: StrategyContext): [GridPosition, GridPosition] {
      // Flip same column for column match potential
      return [
        { row: 0, col: 0 },
        { row: 1, col: 0 },
      ];
    },

    chooseTurnAction(ctx: StrategyContext): TurnAction {
      const { player, topDiscard, config, gameState } = ctx;
      const grid = player.grid;
      const faceDownPositions = getFaceDownPositions(grid);

      // Eagerly take column-completing cards from discard
      const colTarget = findColumnCompleter(grid, topDiscard.value);
      if (colTarget) {
        return {
          type: "take-discard",
          targetRow: colTarget.row,
          targetCol: colTarget.col,
        };
      }

      // Take discard if below average
      if (topDiscard.value <= config.lowCardThreshold) {
        const target = findBestReplacementTarget(grid, topDiscard.value);
        return {
          type: "take-discard",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // If few face-down cards remain, try to end round quickly
      // But only if we're confident we have the lowest score (avoid 2x penalty)
      if (faceDownPositions.length > 0 && faceDownPositions.length <= 3) {
        const otherGrids = gameState.players
          .filter((p) => p.id !== player.id)
          .map((p) => p.grid);
        if (
          shouldEndRoundSafely(grid, otherGrids, config.roundEndAggressiveness)
        ) {
          const target = faceDownPositions[0];
          return {
            type: "draw-and-discard-flip",
            targetRow: target.row,
            targetCol: target.col,
          };
        }
      }

      // Draw and swap with highest card
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

      // Flip a face-down card
      if (faceDownPositions.length > 0) {
        const target = pickAggressiveFlipTarget(grid);
        return {
          type: "draw-and-discard-flip",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // Fallback
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

function findColumnCompleter(
  grid: any[][],
  value: number,
): GridPosition | null {
  for (let col = 0; col < COLS; col++) {
    const colValues = getColumnValues(grid, col);
    const matchCount = colValues.filter((v) => v === value).length;
    const unknownCount = colValues.filter((v) => v === null).length;

    // Can complete: 2 matching + 1 non-matching face-up to replace
    if (matchCount === 2) {
      for (let row = 0; row < ROWS; row++) {
        const cell = grid[row][col];
        if (cell.card && cell.faceUp && cell.card.value !== value) {
          return { row, col };
        }
      }
      // Or replace a face-down in that column
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

function findBestReplacementTarget(
  grid: any[][],
  newValue: number,
): GridPosition {
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

function pickAggressiveFlipTarget(grid: any[][]): GridPosition {
  const faceDown = getFaceDownPositions(grid);
  // Prefer positions in columns that could form matches
  for (const pos of faceDown) {
    const colValues = getColumnValues(grid, pos.col);
    const known = colValues.filter((v) => v !== null);
    if (known.length >= 1) {
      return pos;
    }
  }
  return faceDown[Math.floor(Math.random() * faceDown.length)];
}

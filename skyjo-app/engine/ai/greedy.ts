import type {
  Strategy,
  StrategyContext,
  TurnAction,
  GridPosition,
} from "../types";
import { ROWS, COLS } from "../constants";
import {
  getFaceDownPositions,
  getActivePositions,
  getHighestFaceUpPosition,
  getColumnValues,
  shouldEndRoundSafely,
} from "../grid";

export function createGreedyStrategy(): Strategy {
  return {
    id: "greedy",
    name: "Greedy",
    description:
      "Always takes the immediately best card. Replaces highest known cards.",
    config: {
      highCardThreshold: 5,
      lowCardThreshold: 2,
      columnMatchWeight: 0.3,
      flipRiskTolerance: 0.3,
      roundEndAggressiveness: 0.3,
      explorationRate: 0.05,
    },

    chooseSetupFlips(ctx: StrategyContext): [GridPosition, GridPosition] {
      // Flip corners — they reveal information with maximum column coverage
      return [
        { row: 0, col: 0 },
        { row: 2, col: 3 },
      ];
    },

    chooseTurnAction(ctx: StrategyContext): TurnAction {
      const { player, topDiscard, config, gameState } = ctx;
      const grid = player.grid;
      const faceDownPositions = getFaceDownPositions(grid);

      // If discard is low enough, take it
      if (topDiscard.value <= config.lowCardThreshold) {
        const target = findBestSwapTarget(grid, topDiscard.value, config);
        return {
          type: "take-discard",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // Try to end round if we're safely ahead
      if (faceDownPositions.length > 0 && faceDownPositions.length <= 2) {
        const otherGrids = gameState.players
          .filter((p) => p.id !== player.id)
          .map((p) => p.grid);
        if (shouldEndRoundSafely(grid, otherGrids, config.roundEndAggressiveness)) {
          const target = faceDownPositions[0];
          return {
            type: "draw-and-discard-flip",
            targetRow: target.row,
            targetCol: target.col,
          };
        }
      }

      // Check if discard can complete a column match
      const columnTarget = findColumnMatchTarget(grid, topDiscard.value);
      if (columnTarget && config.columnMatchWeight > Math.random()) {
        return {
          type: "take-discard",
          targetRow: columnTarget.row,
          targetCol: columnTarget.col,
        };
      }

      // Otherwise draw from pile — we'll decide in the action
      // Since we can't peek, we use draw-and-swap for low drawn cards
      // and draw-and-discard-flip for high drawn cards
      // But we must decide the action type now. Use exploration rate to decide.
      if (
        faceDownPositions.length > 0 &&
        Math.random() < config.flipRiskTolerance
      ) {
        const target = pickBestFlipTarget(grid, config);
        return {
          type: "draw-and-discard-flip",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // Default: draw and swap with highest face-up card
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

      // Swap with a random face-down card
      if (faceDownPositions.length > 0) {
        const target =
          faceDownPositions[
            Math.floor(Math.random() * faceDownPositions.length)
          ];
        return {
          type: "draw-and-swap",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // Fallback: swap with any active position
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

function findBestSwapTarget(
  grid: any[][],
  newValue: number,
  config: any,
): GridPosition {
  const highest = getHighestFaceUpPosition(grid);
  if (highest && grid[highest.row][highest.col].card!.value > newValue) {
    return highest;
  }
  // Try face down positions
  const faceDown = getFaceDownPositions(grid);
  if (faceDown.length > 0) {
    return faceDown[Math.floor(Math.random() * faceDown.length)];
  }
  const active = getActivePositions(grid);
  return active[Math.floor(Math.random() * active.length)];
}

function findColumnMatchTarget(
  grid: any[][],
  value: number,
): GridPosition | null {
  for (let col = 0; col < COLS; col++) {
    const colValues = getColumnValues(grid, col);
    const matchingCount = colValues.filter((v) => v === value).length;
    const nullCount = colValues.filter((v) => v === null).length;
    if (matchingCount === 2 && nullCount === 0) {
      // Find the non-matching row to replace
      for (let row = 0; row < ROWS; row++) {
        const cell = grid[row][col];
        if (cell.card && cell.faceUp && cell.card.value !== value) {
          return { row, col };
        }
      }
    }
  }
  return null;
}

function pickBestFlipTarget(grid: any[][], config: any): GridPosition {
  const faceDown = getFaceDownPositions(grid);
  // Prefer positions that could form column matches
  for (const pos of faceDown) {
    const colValues = getColumnValues(grid, pos.col);
    const known = colValues.filter((v) => v !== null);
    if (known.length === 2 && known[0] === known[1]) {
      return pos; // Flipping here could complete a column!
    }
  }
  return faceDown[Math.floor(Math.random() * faceDown.length)];
}

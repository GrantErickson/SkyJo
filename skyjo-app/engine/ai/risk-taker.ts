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

export function createRiskTakerStrategy(): Strategy {
  return {
    id: "risk-taker",
    name: "Risk Taker",
    description:
      "Gambles on face-down cards and aggressively draws from the pile. High variance — can win big or lose big.",
    config: {
      highCardThreshold: 4,
      lowCardThreshold: 0,
      columnMatchWeight: 0.3,
      flipRiskTolerance: 0.1,
      roundEndAggressiveness: 0.7,
      explorationRate: 0.15,
    },

    chooseSetupFlips(ctx: StrategyContext): [GridPosition, GridPosition] {
      // Bold: flip two random positions
      const positions = getActivePositions(ctx.player.grid);
      const i = Math.floor(Math.random() * positions.length);
      let j = Math.floor(Math.random() * (positions.length - 1));
      if (j >= i) j++;
      return [positions[i], positions[j]];
    },

    chooseTurnAction(ctx: StrategyContext): TurnAction {
      const { player, topDiscard, config, gameState } = ctx;
      const grid = player.grid;
      const faceDownPositions = getFaceDownPositions(grid);

      // Column completion is always worth it
      const colComplete = findColumnCompleter(grid, topDiscard.value);
      if (colComplete) {
        return {
          type: "take-discard",
          targetRow: colComplete.row,
          targetCol: colComplete.col,
        };
      }

      // Only take discard if it's very low (gambler ignores mediocre cards)
      if (topDiscard.value <= config.lowCardThreshold) {
        const highest = getHighestFaceUpPosition(grid);
        if (highest) {
          return {
            type: "take-discard",
            targetRow: highest.row,
            targetCol: highest.col,
          };
        }
      }

      // Aggressive round ending — but still check we're likely winning
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

      // Gamble: draw and swap with highest visible card (hoping for a low draw)
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

      // Otherwise gamble on a face-down card with a draw-and-swap
      if (faceDownPositions.length > 0 && Math.random() < 0.4) {
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

      // Flip face-down cards
      if (faceDownPositions.length > 0) {
        const target =
          faceDownPositions[
            Math.floor(Math.random() * faceDownPositions.length)
          ];
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

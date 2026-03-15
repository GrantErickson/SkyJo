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

export function createConservativeStrategy(): Strategy {
  return {
    id: "conservative",
    name: "Conservative",
    description:
      "Gathers information first. Only swaps for significant improvements.",
    config: {
      highCardThreshold: 7,
      lowCardThreshold: 3,
      columnMatchWeight: 0.4,
      flipRiskTolerance: 0.7,
      roundEndAggressiveness: 0.2,
      explorationRate: 0.1,
    },

    chooseSetupFlips(ctx: StrategyContext): [GridPosition, GridPosition] {
      // Flip middle positions for balanced info
      return [
        { row: 1, col: 1 },
        { row: 1, col: 2 },
      ];
    },

    chooseTurnAction(ctx: StrategyContext): TurnAction {
      const { player, topDiscard, config, gameState } = ctx;
      const grid = player.grid;
      const faceDownPositions = getFaceDownPositions(grid);

      // Analyze opponents — conservative loosens up under pressure
      const opp = analyzeOpponents(player, gameState.players);

      // Under pressure: widen discard acceptance (take cards up to 3 instead of just ≤0)
      const discardAcceptThreshold = opp.isUnderPressure ? 3 : 0;
      if (topDiscard.value <= discardAcceptThreshold) {
        const highest = getHighestFaceUpPosition(grid);
        if (
          highest &&
          grid[highest.row][highest.col].card!.value >= config.highCardThreshold
        ) {
          return {
            type: "take-discard",
            targetRow: highest.row,
            targetCol: highest.col,
          };
        }
        if (faceDownPositions.length > 0) {
          const target =
            faceDownPositions[
              Math.floor(Math.random() * faceDownPositions.length)
            ];
          return {
            type: "take-discard",
            targetRow: target.row,
            targetCol: target.col,
          };
        }
      }

      // Check for column match opportunity with discard (wider range under pressure)
      const effectiveColThreshold =
        config.lowCardThreshold + (opp.isUnderPressure ? 2 : 0);
      if (topDiscard.value <= effectiveColThreshold) {
        const colTarget = findColumnTarget(grid, topDiscard.value);
        if (colTarget) {
          return {
            type: "take-discard",
            targetRow: colTarget.row,
            targetCol: colTarget.col,
          };
        }
      }

      // Under pressure: prioritize flipping to avoid being caught with unknowns
      if (opp.isUnderPressure && faceDownPositions.length > 2) {
        const target = pickFlipTarget(grid);
        return {
          type: "draw-and-discard-flip",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // End round only if very safely ahead (but be less cautious when clearly leading)
      const endThreshold = opp.isLeading && opp.scoreDelta > 10 ? 3 : 2;
      if (
        faceDownPositions.length > 0 &&
        faceDownPositions.length <= endThreshold
      ) {
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

      // Conservative prefers to flip and gather information
      if (faceDownPositions.length > 0) {
        const target = pickFlipTarget(grid);
        return {
          type: "draw-and-discard-flip",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // If all face up, draw and swap the highest
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

function findColumnTarget(grid: any[][], value: number): GridPosition | null {
  for (let col = 0; col < COLS; col++) {
    const colValues = getColumnValues(grid, col);
    const matchCount = colValues.filter((v) => v === value).length;
    if (matchCount >= 2) {
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

function pickFlipTarget(grid: any[][]): GridPosition {
  const faceDown = getFaceDownPositions(grid);
  // Prefer positions where we might complete a column
  for (const pos of faceDown) {
    const colValues = getColumnValues(grid, pos.col);
    const known = colValues.filter((v) => v !== null);
    if (known.length === 2 && known[0] === known[1]) {
      return pos;
    }
  }
  // Otherwise pick randomly
  return faceDown[Math.floor(Math.random() * faceDown.length)];
}

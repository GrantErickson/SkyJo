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
  countActiveCards,
  shouldEndRoundSafely,
  analyzeOpponents,
} from "../grid";

export function createBalancedStrategy(): Strategy {
  return {
    id: "balanced",
    name: "Balanced",
    description:
      "Adapts strategy based on game phase — conservative early, aggressive late.",
    config: {
      highCardThreshold: 5,
      lowCardThreshold: 2,
      columnMatchWeight: 0.5,
      flipRiskTolerance: 0.5,
      roundEndAggressiveness: 0.5,
      explorationRate: 0.08,
    },

    chooseSetupFlips(ctx: StrategyContext): [GridPosition, GridPosition] {
      // Balanced: flip diagonal for good coverage
      return [
        { row: 0, col: 1 },
        { row: 2, col: 2 },
      ];
    },

    chooseTurnAction(ctx: StrategyContext): TurnAction {
      const { player, topDiscard, config, gameState } = ctx;
      const grid = player.grid;
      const faceDownPositions = getFaceDownPositions(grid);
      const totalActive = countActiveCards(grid);
      const faceDownCount = faceDownPositions.length;
      const progress = 1 - faceDownCount / totalActive; // 0 = all face down, 1 = all revealed

      // Analyze opponent state to adjust play dynamically
      const opp = analyzeOpponents(player, gameState.players);

      // Dynamic thresholds based on game phase AND opponent state
      // Under pressure (opponent close to ending): accept higher cards, be less picky
      const pressureBoost = opp.isUnderPressure ? 2 : opp.urgency * 1.5;
      const effectiveHighThreshold =
        config.highCardThreshold - progress * 3 - pressureBoost;
      const effectiveLowThreshold =
        config.lowCardThreshold + (1 - progress) * 2 + pressureBoost;

      // Column match opportunities
      const colTarget = findColumnMatch(grid, topDiscard.value);
      if (colTarget) {
        return {
          type: "take-discard",
          targetRow: colTarget.row,
          targetCol: colTarget.col,
        };
      }

      // Take discard if good enough
      if (topDiscard.value <= effectiveLowThreshold) {
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

      // Under pressure: prioritize flipping to reveal cards before opponent ends round
      if (opp.isUnderPressure && faceDownPositions.length > 2) {
        const target = pickSmartFlipTarget(grid);
        return {
          type: "draw-and-discard-flip",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // Early game: prefer flipping (shift threshold earlier when under pressure)
      const earlyThreshold = opp.isUnderPressure ? 0.7 : 0.5;
      if (progress < earlyThreshold && faceDownPositions.length > 0) {
        const target = pickSmartFlipTarget(grid);
        return {
          type: "draw-and-discard-flip",
          targetRow: target.row,
          targetCol: target.col,
        };
      }

      // Late game: try to end round if safely ahead
      if (progress > 0.5 && faceDownPositions.length > 0) {
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

      // Mid game: swap high cards
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

      // Default: flip if possible, otherwise draw and swap
      if (faceDownPositions.length > 0) {
        const target = pickSmartFlipTarget(grid);
        return {
          type: "draw-and-discard-flip",
          targetRow: target.row,
          targetCol: target.col,
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

function findColumnMatch(grid: any[][], value: number): GridPosition | null {
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

function pickSmartFlipTarget(grid: any[][]): GridPosition {
  const faceDown = getFaceDownPositions(grid);
  // Prefer positions that could form column matches
  for (const pos of faceDown) {
    const colValues = getColumnValues(grid, pos.col);
    const known = colValues.filter((v) => v !== null);
    if (known.length === 2 && known[0] === known[1]) {
      return pos;
    }
  }
  // Then prefer positions in columns with some info
  for (const pos of faceDown) {
    const colValues = getColumnValues(grid, pos.col);
    const known = colValues.filter((v) => v !== null);
    if (known.length >= 1) {
      return pos;
    }
  }
  return faceDown[Math.floor(Math.random() * faceDown.length)];
}

import type {
  Strategy,
  StrategyContext,
  TurnAction,
  GridPosition,
  Card,
} from "../types";
import { getFaceDownPositions, getActivePositions } from "../grid";

function randomElement<T>(arr: T[], rng?: () => number): T {
  const random = rng ?? Math.random;
  return arr[Math.floor(random() * arr.length)];
}

export function createRandomStrategy(): Strategy {
  return {
    id: "random",
    name: "Random",
    description: "Makes random valid moves. Baseline for comparison.",
    config: {
      highCardThreshold: 12,
      lowCardThreshold: -2,
      columnMatchWeight: 0,
      flipRiskTolerance: 0.5,
      roundEndAggressiveness: 0.5,
      explorationRate: 1.0,
    },

    chooseSetupFlips(ctx: StrategyContext): [GridPosition, GridPosition] {
      const positions = getActivePositions(ctx.player.grid);
      const first = randomElement(positions);
      const remaining = positions.filter(
        (p) => p.row !== first.row || p.col !== first.col,
      );
      const second = randomElement(remaining);
      return [first, second];
    },

    chooseTurnAction(ctx: StrategyContext): TurnAction {
      const activePositions = getActivePositions(ctx.player.grid);
      const faceDownPositions = getFaceDownPositions(ctx.player.grid);
      const roll = Math.random();

      if (roll < 0.33) {
        // Take from discard
        const target = randomElement(activePositions);
        return {
          type: "take-discard",
          targetRow: target.row,
          targetCol: target.col,
        };
      } else if (roll < 0.66 || faceDownPositions.length === 0) {
        // Draw and swap
        const target = randomElement(activePositions);
        return {
          type: "draw-and-swap",
          targetRow: target.row,
          targetCol: target.col,
        };
      } else {
        // Draw, discard, flip
        const target = randomElement(faceDownPositions);
        return {
          type: "draw-and-discard-flip",
          targetRow: target.row,
          targetCol: target.col,
        };
      }
    },

    chooseDrawAction(drawnCard: Card, ctx: StrategyContext): TurnAction {
      const activePositions = getActivePositions(ctx.player.grid);
      const faceDownPositions = getFaceDownPositions(ctx.player.grid);
      if (Math.random() < 0.5 || faceDownPositions.length === 0) {
        const target = randomElement(activePositions);
        return {
          type: "draw-and-swap",
          targetRow: target.row,
          targetCol: target.col,
        };
      }
      const target = randomElement(faceDownPositions);
      return {
        type: "draw-and-discard-flip",
        targetRow: target.row,
        targetCol: target.col,
      };
    },
  };
}

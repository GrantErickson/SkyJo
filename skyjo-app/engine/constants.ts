import type { CardValue, StrategyConfig, StrategyId } from "./types";

export const ROWS = 3;
export const COLS = 4;
export const CARDS_PER_PLAYER = ROWS * COLS;
export const SETUP_FLIPS = 2;
export const GAME_OVER_THRESHOLD = 100;

export const CARD_DISTRIBUTION: Record<number, number> = {
  [-2]: 5,
  [-1]: 10,
  [0]: 15,
  [1]: 10,
  [2]: 10,
  [3]: 10,
  [4]: 10,
  [5]: 10,
  [6]: 10,
  [7]: 10,
  [8]: 10,
  [9]: 10,
  [10]: 10,
  [11]: 10,
  [12]: 10,
};

export const TOTAL_CARDS = Object.values(CARD_DISTRIBUTION).reduce(
  (a, b) => a + b,
  0,
); // 150

export const ALL_CARD_VALUES: CardValue[] = [
  -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
];

export const EXPECTED_CARD_VALUE = (() => {
  let sum = 0;
  let count = 0;
  for (const [value, cnt] of Object.entries(CARD_DISTRIBUTION)) {
    sum += Number(value) * cnt;
    count += cnt;
  }
  return sum / count;
})();

export const STRATEGY_NAMES: Record<StrategyId, string> = {
  random: "Random",
  greedy: "Greedy",
  conservative: "Conservative",
  aggressive: "Aggressive",
  balanced: "Balanced",
  memory: "Memory",
};

export const STRATEGY_DESCRIPTIONS: Record<StrategyId, string> = {
  random: "Makes random valid moves. Baseline for comparison.",
  greedy:
    "Always takes the immediately best card. Replaces highest known cards.",
  conservative:
    "Gathers information first. Only swaps for significant improvements.",
  aggressive:
    "Pursues column matches and tries to end rounds quickly when ahead.",
  balanced:
    "Adapts strategy based on game phase — conservative early, aggressive late.",
  memory: "Tracks seen cards and uses probability to make optimal decisions.",
};

export const DEFAULT_CONFIGS: Record<StrategyId, StrategyConfig> = {
  random: {
    highCardThreshold: 12,
    lowCardThreshold: -2,
    columnMatchWeight: 0,
    flipRiskTolerance: 0.5,
    roundEndAggressiveness: 0.5,
    explorationRate: 1.0,
  },
  greedy: {
    highCardThreshold: 5,
    lowCardThreshold: 2,
    columnMatchWeight: 0.3,
    flipRiskTolerance: 0.3,
    roundEndAggressiveness: 0.3,
    explorationRate: 0.05,
  },
  conservative: {
    highCardThreshold: 7,
    lowCardThreshold: 3,
    columnMatchWeight: 0.4,
    flipRiskTolerance: 0.7,
    roundEndAggressiveness: 0.2,
    explorationRate: 0.1,
  },
  aggressive: {
    highCardThreshold: 4,
    lowCardThreshold: 1,
    columnMatchWeight: 0.7,
    flipRiskTolerance: 0.2,
    roundEndAggressiveness: 0.8,
    explorationRate: 0.05,
  },
  balanced: {
    highCardThreshold: 5,
    lowCardThreshold: 2,
    columnMatchWeight: 0.5,
    flipRiskTolerance: 0.5,
    roundEndAggressiveness: 0.5,
    explorationRate: 0.08,
  },
  memory: {
    highCardThreshold: 5,
    lowCardThreshold: 2,
    columnMatchWeight: 0.6,
    flipRiskTolerance: 0.4,
    roundEndAggressiveness: 0.4,
    explorationRate: 0.03,
  },
};

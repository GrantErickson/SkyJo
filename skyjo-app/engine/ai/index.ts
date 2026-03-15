import type { Strategy, StrategyId, StrategyConfig } from "../types";
import { DEFAULT_CONFIGS } from "../constants";
import { createRandomStrategy } from "./random";
import { createGreedyStrategy } from "./greedy";
import { createConservativeStrategy } from "./conservative";
import { createAggressiveStrategy } from "./aggressive";
import { createBalancedStrategy } from "./balanced";
import { createMemoryStrategy } from "./memory";

const strategyFactories: Record<StrategyId, () => Strategy> = {
  random: createRandomStrategy,
  greedy: createGreedyStrategy,
  conservative: createConservativeStrategy,
  aggressive: createAggressiveStrategy,
  balanced: createBalancedStrategy,
  memory: createMemoryStrategy,
};

export function getStrategy(
  id: StrategyId,
  configOverrides?: Partial<StrategyConfig>,
): Strategy {
  const factory = strategyFactories[id];
  const strategy = factory();

  // Apply default config
  const defaultConfig = DEFAULT_CONFIGS[id];
  strategy.config = { ...defaultConfig };

  // Apply overrides if any
  if (configOverrides) {
    strategy.config = { ...strategy.config, ...configOverrides };
  }

  return strategy;
}

export function getAllStrategyIds(): StrategyId[] {
  return Object.keys(strategyFactories) as StrategyId[];
}

export { createRandomStrategy } from "./random";
export { createGreedyStrategy } from "./greedy";
export { createConservativeStrategy } from "./conservative";
export { createAggressiveStrategy } from "./aggressive";
export { createBalancedStrategy } from "./balanced";
export { createMemoryStrategy } from "./memory";

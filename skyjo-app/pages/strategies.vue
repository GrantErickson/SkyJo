<template>
  <div class="min-h-[calc(100vh-8rem)] py-6 px-4 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-white mb-2">AI Strategies</h1>
    <p class="text-indigo-300 mb-8">
      Each AI opponent uses a different strategy to decide how to play. All
      strategies (except Random) are
      <span class="text-yellow-400 font-medium">opponent-aware</span> — they
      monitor other players' grids and adjust their play dynamically.
    </p>
    <p class="text-indigo-400/70 text-sm mb-8">
      When an opponent is close to finishing a round, strategies shift into
      pressure mode: accepting higher-value cards, rushing to flip unknowns, and
      adjusting risk tolerance.
    </p>

    <div class="space-y-5">
      <div
        v-for="strategy in strategies"
        :key="strategy.id"
        class="bg-indigo-800/30 border border-indigo-700/30 rounded-xl p-5"
      >
        <div class="flex items-start gap-4">
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
            :class="strategy.badgeClass"
          >
            {{ strategy.icon }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1">
              <h2 class="text-lg font-semibold text-white">
                {{ strategy.name }}
              </h2>
              <span
                class="text-xs px-2 py-0.5 rounded-full"
                :class="strategy.difficultyClass"
              >
                {{ strategy.difficulty }}
              </span>
            </div>
            <p class="text-indigo-300 text-sm mb-3">
              {{ strategy.description }}
            </p>
            <p class="text-indigo-400/60 text-xs mb-3 leading-relaxed">
              {{ strategy.detail }}
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div
                v-for="trait in strategy.traits"
                :key="trait.label"
                class="bg-indigo-900/40 rounded-lg px-2.5 py-1.5"
              >
                <span class="text-indigo-400/70">{{ trait.label }}:</span>
                <span class="text-white ml-1 font-medium">{{
                  trait.value
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="mt-8 bg-indigo-800/20 border border-indigo-700/20 rounded-xl p-5 text-center"
    >
      <p class="text-indigo-300 text-sm mb-3">
        Want to see how these strategies compare?
      </p>
      <NuxtLink
        to="/simulation"
        class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
      >
        Run a Simulation
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { STRATEGY_NAMES, STRATEGY_DESCRIPTIONS } from "~/engine/constants";
import type { StrategyId } from "~/engine/types";

useHead({ title: "SkyJo – Strategies" });

interface StrategyInfo {
  id: StrategyId;
  name: string;
  description: string;
  detail: string;
  icon: string;
  badgeClass: string;
  difficulty: string;
  difficultyClass: string;
  traits: { label: string; value: string }[];
}

const strategies: StrategyInfo[] = [
  {
    id: "random",
    name: STRATEGY_NAMES.random,
    description: STRATEGY_DESCRIPTIONS.random,
    detail:
      "Picks between taking the discard, drawing and swapping, or flipping a card with roughly equal probability. No awareness of card values, column matches, or opponent state. Useful as a baseline to measure how much smarter strategies actually help.",
    icon: "🎲",
    badgeClass: "bg-gray-700/60",
    difficulty: "Beginner",
    difficultyClass: "bg-gray-600/40 text-gray-300",
    traits: [
      { label: "Risk", value: "Random" },
      { label: "Column Focus", value: "None" },
      { label: "Opponent Aware", value: "No" },
      { label: "Predictability", value: "Chaotic" },
    ],
  },
  {
    id: "greedy",
    name: STRATEGY_NAMES.greedy,
    description: STRATEGY_DESCRIPTIONS.greedy,
    detail:
      "Always chases the best immediate trade — takes low discards and replaces the highest visible card. Flips cards in columns that could form matches. When falling behind opponents, loosens its standards and accepts slightly higher-value cards to try to close the gap. Prioritizes revealing face-down cards when an opponent is close to ending the round.",
    icon: "💰",
    badgeClass: "bg-yellow-700/60",
    difficulty: "Easy",
    difficultyClass: "bg-green-600/40 text-green-300",
    traits: [
      { label: "Risk", value: "Low" },
      { label: "Column Focus", value: "Low" },
      { label: "Opponent Aware", value: "Yes" },
      { label: "Predictability", value: "High" },
    ],
  },
  {
    id: "conservative",
    name: STRATEGY_NAMES.conservative,
    description: STRATEGY_DESCRIPTIONS.conservative,
    detail:
      "Prioritizes flipping face-down cards to gather information before making swaps. Only takes discards when they're very low value (≤0), and only ends a round when safely ahead with ≤2 unknowns. Under pressure from opponents, widens discard acceptance to ≤3, expands column-match range, and force-flips when too many unknowns remain. When leading by a large margin (10+ points), becomes slightly bolder about ending rounds.",
    icon: "🛡️",
    badgeClass: "bg-indigo-700/60",
    difficulty: "Medium",
    difficultyClass: "bg-indigo-600/40 text-indigo-300",
    traits: [
      { label: "Risk", value: "Very Low" },
      { label: "Column Focus", value: "Medium" },
      { label: "Opponent Aware", value: "Yes" },
      { label: "Predictability", value: "Steady" },
    ],
  },
  {
    id: "aggressive",
    name: STRATEGY_NAMES.aggressive,
    description: STRATEGY_DESCRIPTIONS.aggressive,
    detail:
      "Actively hunts column completions from the discard pile and tries to end rounds quickly. Flips setup cards in the same column for early match potential. Raises its discard acceptance threshold under opponent pressure and rushes to reveal cards when caught with many unknowns. When leading, extends its round-ending tolerance to 4 face-down cards instead of the usual 3.",
    icon: "⚔️",
    badgeClass: "bg-red-700/60",
    difficulty: "Medium",
    difficultyClass: "bg-yellow-600/40 text-yellow-300",
    traits: [
      { label: "Risk", value: "High" },
      { label: "Column Focus", value: "High" },
      { label: "Opponent Aware", value: "Yes" },
      { label: "Predictability", value: "Aggressive" },
    ],
  },
  {
    id: "balanced",
    name: STRATEGY_NAMES.balanced,
    description: STRATEGY_DESCRIPTIONS.balanced,
    detail:
      "Plays in phases: flips cards early for information, hunts column matches mid-game, and tries to end rounds when safely ahead late. Card acceptance thresholds shift dynamically based on both game progress and opponent state. Under pressure, extends the early-game flip phase and widens acceptance thresholds using a pressure boost. Always seeks column-match completions from the discard regardless of phase.",
    icon: "⚖️",
    badgeClass: "bg-indigo-700/60",
    difficulty: "Hard",
    difficultyClass: "bg-orange-600/40 text-orange-300",
    traits: [
      { label: "Risk", value: "Adaptive" },
      { label: "Column Focus", value: "Medium" },
      { label: "Opponent Aware", value: "Yes" },
      { label: "Predictability", value: "Variable" },
    ],
  },
  {
    id: "memory",
    name: STRATEGY_NAMES.memory,
    description: STRATEGY_DESCRIPTIONS.memory,
    detail:
      'Maintains a full card tracker — counts every visible card across all players to calculate the probability distribution of what remains in the draw pile. Uses expected value and probability thresholds to decide whether to draw or take the discard. Targets flips in columns where matching cards are still statistically likely. Under pressure, widens its "low card" threshold, takes discards more eagerly, and raises the always-take ceiling.',
    icon: "🧠",
    badgeClass: "bg-purple-700/60",
    difficulty: "Hard",
    difficultyClass: "bg-red-600/40 text-red-300",
    traits: [
      { label: "Risk", value: "Calculated" },
      { label: "Column Focus", value: "High" },
      { label: "Opponent Aware", value: "Yes" },
      { label: "Predictability", value: "Optimal" },
    ],
  },
  {
    id: "column-hunter",
    name: STRATEGY_NAMES["column-hunter"],
    description: STRATEGY_DESCRIPTIONS["column-hunter"],
    detail:
      "Single-minded focus on completing 3-of-a-kind columns to remove them entirely. Eagerly takes any discard that completes a column, and actively builds pairs by swapping cards into partially-matched columns. Flips preferentially in columns with existing pairs. Under heavy pressure with many unknowns, abandons the column hunt entirely and just flips cards. Under moderate pressure, skips pair-building and widens low-card acceptance from ≤0 to ≤2.",
    icon: "🎯",
    badgeClass: "bg-cyan-700/60",
    difficulty: "Medium",
    difficultyClass: "bg-yellow-600/40 text-yellow-300",
    traits: [
      { label: "Risk", value: "Medium" },
      { label: "Column Focus", value: "Extreme" },
      { label: "Opponent Aware", value: "Yes" },
      { label: "Predictability", value: "Focused" },
    ],
  },
  {
    id: "risk-taker",
    name: STRATEGY_NAMES["risk-taker"],
    description: STRATEGY_DESCRIPTIONS["risk-taker"],
    detail:
      "Thrives on uncertainty — draws from the pile and blindly swaps into face-down positions hoping for lucky breaks. Uses random setup flips for unpredictability. When falling behind, cranks up the gamble rate to 60% and accepts discards up to value 2, lowering swap thresholds by 2 points. When leading, dials risk way down to just 20% gamble rate to protect the advantage. Always takes column completions.",
    icon: "🎰",
    badgeClass: "bg-amber-700/60",
    difficulty: "Medium",
    difficultyClass: "bg-yellow-600/40 text-yellow-300",
    traits: [
      { label: "Risk", value: "Very High" },
      { label: "Column Focus", value: "Low" },
      { label: "Opponent Aware", value: "Yes" },
      { label: "Predictability", value: "Wild" },
    ],
  },
];
</script>

<template>
  <div class="min-h-[calc(100vh-8rem)] py-6 px-4 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-white mb-2">AI Strategies</h1>
    <p class="text-emerald-300 mb-8">
      Each AI opponent uses a different strategy to decide how to play. Learn
      what makes each one tick.
    </p>

    <div class="space-y-4">
      <div
        v-for="strategy in strategies"
        :key="strategy.id"
        class="bg-emerald-800/30 border border-emerald-700/30 rounded-xl p-5"
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
            <p class="text-emerald-300 text-sm mb-3">
              {{ strategy.description }}
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div
                v-for="trait in strategy.traits"
                :key="trait.label"
                class="bg-emerald-900/40 rounded-lg px-2.5 py-1.5"
              >
                <span class="text-emerald-400/70">{{ trait.label }}:</span>
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
      class="mt-8 bg-emerald-800/20 border border-emerald-700/20 rounded-xl p-5 text-center"
    >
      <p class="text-emerald-300 text-sm mb-3">
        Want to see how these strategies compare?
      </p>
      <NuxtLink
        to="/simulation"
        class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
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
    icon: "🎲",
    badgeClass: "bg-gray-700/60",
    difficulty: "Beginner",
    difficultyClass: "bg-gray-600/40 text-gray-300",
    traits: [
      { label: "Risk", value: "Random" },
      { label: "Column Focus", value: "None" },
      { label: "Predictability", value: "Chaotic" },
    ],
  },
  {
    id: "greedy",
    name: STRATEGY_NAMES.greedy,
    description: STRATEGY_DESCRIPTIONS.greedy,
    icon: "💰",
    badgeClass: "bg-yellow-700/60",
    difficulty: "Easy",
    difficultyClass: "bg-green-600/40 text-green-300",
    traits: [
      { label: "Risk", value: "Low" },
      { label: "Column Focus", value: "Low" },
      { label: "Predictability", value: "High" },
    ],
  },
  {
    id: "conservative",
    name: STRATEGY_NAMES.conservative,
    description: STRATEGY_DESCRIPTIONS.conservative,
    icon: "🛡️",
    badgeClass: "bg-blue-700/60",
    difficulty: "Medium",
    difficultyClass: "bg-blue-600/40 text-blue-300",
    traits: [
      { label: "Risk", value: "Very Low" },
      { label: "Column Focus", value: "Medium" },
      { label: "Predictability", value: "Steady" },
    ],
  },
  {
    id: "aggressive",
    name: STRATEGY_NAMES.aggressive,
    description: STRATEGY_DESCRIPTIONS.aggressive,
    icon: "⚔️",
    badgeClass: "bg-red-700/60",
    difficulty: "Medium",
    difficultyClass: "bg-yellow-600/40 text-yellow-300",
    traits: [
      { label: "Risk", value: "High" },
      { label: "Column Focus", value: "High" },
      { label: "Predictability", value: "Aggressive" },
    ],
  },
  {
    id: "balanced",
    name: STRATEGY_NAMES.balanced,
    description: STRATEGY_DESCRIPTIONS.balanced,
    icon: "⚖️",
    badgeClass: "bg-emerald-700/60",
    difficulty: "Hard",
    difficultyClass: "bg-orange-600/40 text-orange-300",
    traits: [
      { label: "Risk", value: "Adaptive" },
      { label: "Column Focus", value: "Medium" },
      { label: "Predictability", value: "Variable" },
    ],
  },
  {
    id: "memory",
    name: STRATEGY_NAMES.memory,
    description: STRATEGY_DESCRIPTIONS.memory,
    icon: "🧠",
    badgeClass: "bg-purple-700/60",
    difficulty: "Hard",
    difficultyClass: "bg-red-600/40 text-red-300",
    traits: [
      { label: "Risk", value: "Calculated" },
      { label: "Column Focus", value: "High" },
      { label: "Predictability", value: "Optimal" },
    ],
  },
  {
    id: "column-hunter",
    name: STRATEGY_NAMES["column-hunter"],
    description: STRATEGY_DESCRIPTIONS["column-hunter"],
    icon: "🎯",
    badgeClass: "bg-cyan-700/60",
    difficulty: "Medium",
    difficultyClass: "bg-yellow-600/40 text-yellow-300",
    traits: [
      { label: "Risk", value: "Medium" },
      { label: "Column Focus", value: "Extreme" },
      { label: "Predictability", value: "Focused" },
    ],
  },
  {
    id: "risk-taker",
    name: STRATEGY_NAMES["risk-taker"],
    description: STRATEGY_DESCRIPTIONS["risk-taker"],
    icon: "🎰",
    badgeClass: "bg-amber-700/60",
    difficulty: "Medium",
    difficultyClass: "bg-yellow-600/40 text-yellow-300",
    traits: [
      { label: "Risk", value: "Very High" },
      { label: "Column Focus", value: "Low" },
      { label: "Predictability", value: "Wild" },
    ],
  },
];
</script>

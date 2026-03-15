<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-indigo-700/30">
          <th class="px-4 py-2 text-left text-indigo-400 font-medium">
            Strategy
          </th>
          <th class="px-4 py-2 text-right text-indigo-400 font-medium">
            Wins
          </th>
          <th class="px-4 py-2 text-right text-indigo-400 font-medium">
            Win %
          </th>
          <th class="px-4 py-2 text-right text-indigo-400 font-medium">
            Avg Score
          </th>
          <th class="px-4 py-2 text-right text-indigo-400 font-medium">
            Median
          </th>
          <th class="px-4 py-2 text-right text-indigo-400 font-medium">Min</th>
          <th class="px-4 py-2 text-right text-indigo-400 font-medium">Max</th>
          <th class="px-4 py-2 text-right text-indigo-400 font-medium">
            Std Dev
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="pr in sortedResults"
          :key="pr.playerIndex"
          class="border-b border-indigo-700/10 hover:bg-indigo-800/20"
          :class="{ 'bg-yellow-400/5': pr.strategyId === result.bestStrategy }"
        >
          <td class="px-4 py-2 font-medium text-white">
            {{ strategyNames[pr.strategyId] }}
            <span
              v-if="pr.strategyId === result.bestStrategy"
              class="text-yellow-400 text-xs ml-1"
              >★</span
            >
          </td>
          <td class="px-4 py-2 text-right text-white">
            {{ formatNumber(pr.wins) }}
          </td>
          <td class="px-4 py-2 text-right text-white font-bold">
            {{ formatPercent(pr.winRate) }}
          </td>
          <td class="px-4 py-2 text-right text-white">
            {{ pr.avgScore.toFixed(1) }}
          </td>
          <td class="px-4 py-2 text-right text-white">
            {{ pr.medianScore.toFixed(0) }}
          </td>
          <td class="px-4 py-2 text-right text-indigo-300">
            {{ pr.minScore }}
          </td>
          <td class="px-4 py-2 text-right text-red-300">{{ pr.maxScore }}</td>
          <td class="px-4 py-2 text-right text-white/60">
            {{ pr.stdDeviation.toFixed(1) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { STRATEGY_NAMES } from "~/engine/constants";
import { formatNumber, formatPercent } from "~/utils/formatters";
import { useSimStore } from "~/stores/simStore";

const simStore = useSimStore();
const result = computed(() => simStore.result!);

const strategyNames = STRATEGY_NAMES;

const sortedResults = computed(() => {
  return [...result.value.playerResults].sort((a, b) => b.winRate - a.winRate);
});
</script>

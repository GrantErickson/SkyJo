<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="bg-indigo-800/20 rounded-xl border border-indigo-700/20 p-4 text-center"
    >
      <div class="text-2xl font-bold text-white">{{ stat.value }}</div>
      <div class="text-xs text-indigo-400 mt-1">{{ stat.label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSimStore } from "~/stores/simStore";
import { formatDuration } from "~/utils/formatters";
import { mean } from "~/utils/stats";

const simStore = useSimStore();
const result = computed(() => simStore.result!);

const stats = computed(() => {
  const r = result.value;
  const avgRounds = mean(r.gamesData.map((g) => g.numRounds));
  return [
    { label: "Games Played", value: r.totalGames.toLocaleString() },
    { label: "Duration", value: formatDuration(r.duration) },
    { label: "Avg Rounds/Game", value: avgRounds.toFixed(1) },
    {
      label: "Best Strategy",
      value:
        r.playerResults
          .reduce((a, b) => (a.winRate > b.winRate ? a : b))
          .strategyId.charAt(0)
          .toUpperCase() + r.bestStrategy.slice(1),
    },
  ];
});
</script>

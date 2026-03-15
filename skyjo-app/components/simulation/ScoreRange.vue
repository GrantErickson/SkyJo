<template>
  <div class="bg-indigo-800/20 rounded-xl border border-indigo-700/20 p-4">
    <h3 class="text-sm font-medium text-indigo-300 mb-3">
      Score Range by Strategy
    </h3>
    <div class="space-y-3">
      <div
        v-for="(pr, idx) in result.playerResults"
        :key="pr.playerIndex"
        class="space-y-1"
      >
        <div class="flex items-center justify-between text-xs">
          <span class="text-indigo-300 font-medium">{{
            strategyNames[pr.strategyId]
          }}</span>
          <span class="text-white/60"
            >{{ pr.minScore }} – {{ pr.maxScore }}</span
          >
        </div>
        <div class="relative h-6 bg-indigo-900/30 rounded">
          <!-- Full range bar -->
          <div
            class="absolute h-full rounded opacity-30"
            :style="{
              left: scalePos(pr.minScore) + '%',
              width: scalePos(pr.maxScore) - scalePos(pr.minScore) + '%',
              backgroundColor: barColors[idx % barColors.length],
            }"
          />
          <!-- IQR bar (approx using stddev) -->
          <div
            class="absolute h-full rounded opacity-70"
            :style="{
              left: scalePos(pr.avgScore - pr.stdDeviation) + '%',
              width:
                scalePos(pr.avgScore + pr.stdDeviation) -
                scalePos(pr.avgScore - pr.stdDeviation) +
                '%',
              backgroundColor: barColors[idx % barColors.length],
            }"
          />
          <!-- Median line -->
          <div
            class="absolute h-full w-0.5 bg-white"
            :style="{
              left: scalePos(pr.medianScore) + '%',
            }"
          />
          <!-- Avg marker -->
          <div
            class="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-black/30"
            :style="{
              left: `calc(${scalePos(pr.avgScore)}% - 4px)`,
            }"
          />
        </div>
      </div>
      <!-- Legend -->
      <div class="flex gap-4 justify-center text-xs text-indigo-400/70 mt-2">
        <span>◆ Avg</span>
        <span>│ Median</span>
        <span class="opacity-70">█ ±1 Std Dev</span>
        <span class="opacity-30">█ Full Range</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { STRATEGY_NAMES } from "~/engine/constants";
import { useSimStore } from "~/stores/simStore";

const simStore = useSimStore();
const result = computed(() => simStore.result!);
const strategyNames = STRATEGY_NAMES;

const barColors = [
  "rgb(16, 185, 129)",
  "rgb(59, 130, 246)",
  "rgb(245, 158, 11)",
  "rgb(239, 68, 68)",
];

const globalMin = computed(() =>
  Math.min(...result.value.playerResults.map((p) => p.minScore)),
);
const globalMax = computed(() =>
  Math.max(...result.value.playerResults.map((p) => p.maxScore)),
);

function scalePos(value: number): number {
  const range = globalMax.value - globalMin.value || 1;
  return Math.max(0, Math.min(100, ((value - globalMin.value) / range) * 100));
}
</script>

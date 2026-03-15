<template>
  <div class="bg-emerald-800/20 rounded-xl border border-emerald-700/20 p-4">
    <h3 class="text-sm font-medium text-emerald-300 mb-3">
      Strategy Comparison
    </h3>
    <div class="h-64">
      <Radar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Radar } from "vue-chartjs";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { STRATEGY_NAMES } from "~/engine/constants";
import { useSimStore } from "~/stores/simStore";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

const simStore = useSimStore();
const result = computed(() => simStore.result!);

const chartColors = [
  { bg: "rgba(16, 185, 129, 0.2)", border: "rgba(16, 185, 129, 0.8)" },
  { bg: "rgba(59, 130, 246, 0.2)", border: "rgba(59, 130, 246, 0.8)" },
  { bg: "rgba(245, 158, 11, 0.2)", border: "rgba(245, 158, 11, 0.8)" },
  { bg: "rgba(239, 68, 68, 0.2)", border: "rgba(239, 68, 68, 0.8)" },
];

const chartData = computed(() => {
  const maxScore =
    Math.max(...result.value.playerResults.map((p) => p.maxScore)) || 1;
  const maxWinRate =
    Math.max(...result.value.playerResults.map((p) => p.winRate)) || 1;

  return {
    labels: ["Win Rate", "Low Avg Score", "Consistency", "Best Min", "Low Max"],
    datasets: result.value.playerResults.map((pr, idx) => ({
      label: STRATEGY_NAMES[pr.strategyId],
      data: [
        (pr.winRate / maxWinRate) * 100,
        Math.max(0, 100 - (pr.avgScore / maxScore) * 100),
        Math.max(0, 100 - pr.stdDeviation * 2),
        Math.max(0, 100 - (Math.max(0, pr.minScore) / maxScore) * 100),
        Math.max(0, 100 - (pr.maxScore / maxScore) * 100),
      ],
      backgroundColor: chartColors[idx % chartColors.length]!.bg,
      borderColor: chartColors[idx % chartColors.length]!.border,
      borderWidth: 2,
      pointBackgroundColor: chartColors[idx % chartColors.length]!.border,
    })),
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: "#6ee7b7" },
    },
  },
  scales: {
    r: {
      angleLines: { color: "rgba(16, 185, 129, 0.2)" },
      grid: { color: "rgba(16, 185, 129, 0.15)" },
      pointLabels: { color: "#6ee7b7", font: { size: 11 } },
      ticks: { display: false },
      suggestedMin: 0,
      suggestedMax: 100,
    },
  },
};
</script>

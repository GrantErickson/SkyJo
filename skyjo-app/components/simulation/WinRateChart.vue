<template>
  <div class="bg-emerald-800/20 rounded-xl border border-emerald-700/20 p-4">
    <h3 class="text-sm font-medium text-emerald-300 mb-3">
      Win Rate by Strategy
    </h3>
    <div class="h-64">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { SimulationResult } from "~/engine/types";
import { STRATEGY_NAMES } from "~/engine/constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const props = defineProps<{
  result: SimulationResult;
}>();

const chartColors = [
  "rgba(16, 185, 129, 0.8)", // emerald
  "rgba(59, 130, 246, 0.8)", // blue
  "rgba(245, 158, 11, 0.8)", // amber
  "rgba(239, 68, 68, 0.8)", // red
];

const chartData = computed(() => ({
  labels: props.result.playerResults.map((pr) => STRATEGY_NAMES[pr.strategyId]),
  datasets: [
    {
      label: "Win Rate",
      data: props.result.playerResults.map(
        (pr) => +(pr.winRate * 100).toFixed(1),
      ),
      backgroundColor: props.result.playerResults.map(
        (_, i) => chartColors[i % chartColors.length],
      ),
      borderColor: props.result.playerResults.map((_, i) =>
        chartColors[i % chartColors.length].replace("0.8", "1"),
      ),
      borderWidth: 1,
      borderRadius: 6,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => `${ctx.parsed.y}%`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: { color: "#6ee7b7", callback: (v: any) => `${v}%` },
      grid: { color: "rgba(16, 185, 129, 0.1)" },
    },
    x: {
      ticks: { color: "#6ee7b7" },
      grid: { display: false },
    },
  },
};
</script>

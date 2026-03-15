<template>
  <div class="bg-indigo-800/20 rounded-xl border border-indigo-700/20 p-4">
    <h3 class="text-sm font-medium text-indigo-300 mb-3">
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
import { STRATEGY_NAMES } from "~/engine/constants";
import { useSimStore } from "~/stores/simStore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const simStore = useSimStore();
const result = computed(() => simStore.result!);

const chartColors = [
  "rgba(99, 102, 241, 0.8)", // indigo
  "rgba(59, 130, 246, 0.8)", // blue
  "rgba(245, 158, 11, 0.8)", // amber
  "rgba(239, 68, 68, 0.8)", // red
];

const chartData = computed(() => ({
  labels: result.value.playerResults.map((pr) => STRATEGY_NAMES[pr.strategyId]),
  datasets: [
    {
      label: "Win Rate",
      data: result.value.playerResults.map(
        (pr) => +(pr.winRate * 100).toFixed(1),
      ),
      backgroundColor: result.value.playerResults.map(
        (_, i) => chartColors[i % chartColors.length],
      ),
      borderColor: result.value.playerResults.map((_, i) =>
        chartColors[i % chartColors.length]!.replace("0.8", "1"),
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
      grid: { color: "rgba(99, 102, 241, 0.1)" },
    },
    x: {
      ticks: { color: "#6ee7b7" },
      grid: { display: false },
    },
  },
};
</script>

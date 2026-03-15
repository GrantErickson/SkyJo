<template>
  <div class="bg-emerald-800/20 rounded-xl border border-emerald-700/20 p-4">
    <h3 class="text-sm font-medium text-emerald-300 mb-3">
      Score Distribution
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
  "rgba(16, 185, 129, 0.5)",
  "rgba(59, 130, 246, 0.5)",
  "rgba(245, 158, 11, 0.5)",
  "rgba(239, 68, 68, 0.5)",
];

const chartData = computed(() => {
  const bucketCount = 20;
  const labels = Array.from({ length: bucketCount }, (_, i) => `${i + 1}`);

  return {
    labels,
    datasets: result.value.playerResults.map((pr, idx) => ({
      label: STRATEGY_NAMES[pr.strategyId],
      data: pr.scoreDistribution,
      backgroundColor: chartColors[idx % chartColors.length],
      borderColor: chartColors[idx % chartColors.length]!.replace("0.5", "0.8"),
      borderWidth: 1,
      borderRadius: 3,
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
    y: {
      beginAtZero: true,
      ticks: { color: "#6ee7b7" },
      grid: { color: "rgba(16, 185, 129, 0.1)" },
    },
    x: {
      ticks: { color: "#6ee7b7" },
      grid: { display: false },
    },
  },
};
</script>

<template>
  <div class="bg-indigo-800/20 rounded-xl border border-indigo-700/20 p-4">
    <h3 class="text-sm font-medium text-indigo-300 mb-3">
      Rounds per Game Distribution
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

const chartData = computed(() => {
  const rounds = result.value.gamesData.map((g) => g.numRounds);
  const min = Math.min(...rounds);
  const max = Math.max(...rounds);
  const bucketCount = Math.min(max - min + 1, 15);
  const bucketSize = Math.max(1, Math.ceil((max - min + 1) / bucketCount));
  const buckets = new Array(bucketCount).fill(0);
  const labels: string[] = [];

  for (let i = 0; i < bucketCount; i++) {
    const lo = min + i * bucketSize;
    const hi = lo + bucketSize - 1;
    labels.push(lo === hi ? `${lo}` : `${lo}-${hi}`);
  }

  for (const r of rounds) {
    const idx = Math.min(Math.floor((r - min) / bucketSize), bucketCount - 1);
    buckets[idx]++;
  }

  return {
    labels,
    datasets: [
      {
        label: "Games",
        data: buckets,
        backgroundColor: "rgba(16, 185, 129, 0.6)",
        borderColor: "rgba(16, 185, 129, 0.9)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { color: "#6ee7b7" },
      grid: { color: "rgba(16, 185, 129, 0.1)" },
      title: { display: true, text: "Games", color: "#6ee7b7" },
    },
    x: {
      ticks: { color: "#6ee7b7" },
      grid: { display: false },
      title: { display: true, text: "Rounds", color: "#6ee7b7" },
    },
  },
};
</script>

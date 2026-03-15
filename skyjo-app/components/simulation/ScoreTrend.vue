<template>
  <div class="bg-emerald-800/20 rounded-xl border border-emerald-700/20 p-4">
    <h3 class="text-sm font-medium text-emerald-300 mb-3">
      Average Score Trend
    </h3>
    <div class="h-64">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { STRATEGY_NAMES } from "~/engine/constants";
import { useSimStore } from "~/stores/simStore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const simStore = useSimStore();
const result = computed(() => simStore.result!);

const lineColors = [
  "rgba(16, 185, 129, 0.9)",
  "rgba(59, 130, 246, 0.9)",
  "rgba(245, 158, 11, 0.9)",
  "rgba(239, 68, 68, 0.9)",
];

const chartData = computed(() => {
  const games = result.value.gamesData;
  const numPlayers = result.value.config.numPlayers;
  const totalGames = games.length;

  const sampleInterval = Math.max(1, Math.floor(totalGames / 50));
  const labels: string[] = [];
  const datasets: any[] = [];

  const cumulativeScores = new Array(numPlayers).fill(0);
  const dataPoints: number[][] = Array.from({ length: numPlayers }, () => []);

  for (let i = 0; i < totalGames; i++) {
    for (let p = 0; p < numPlayers; p++) {
      cumulativeScores[p] += games[i].playerScores[p];
    }

    if (i % sampleInterval === 0 || i === totalGames - 1) {
      labels.push(`${i + 1}`);
      for (let p = 0; p < numPlayers; p++) {
        dataPoints[p].push(+(cumulativeScores[p] / (i + 1)).toFixed(1));
      }
    }
  }

  for (let p = 0; p < numPlayers; p++) {
    datasets.push({
      label: STRATEGY_NAMES[result.value.config.strategies[p]],
      data: dataPoints[p],
      borderColor: lineColors[p % lineColors.length],
      backgroundColor: "transparent",
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.3,
    });
  }

  return { labels, datasets };
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
      ticks: { color: "#6ee7b7" },
      grid: { color: "rgba(16, 185, 129, 0.1)" },
      title: { display: true, text: "Avg Score", color: "#6ee7b7" },
    },
    x: {
      ticks: {
        color: "#6ee7b7",
        maxTicksLimit: 10,
      },
      grid: { display: false },
      title: { display: true, text: "Games Played", color: "#6ee7b7" },
    },
  },
};
</script>

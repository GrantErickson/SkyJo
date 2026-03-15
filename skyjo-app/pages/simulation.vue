<template>
  <div class="min-h-[calc(100vh-8rem)] py-6 px-4 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-white mb-6">Strategy Simulation</h1>

    <!-- Config -->
    <SimulationConfig v-if="!sim.isRunning && !sim.result" @run="runSim" />

    <!-- Progress -->
    <SimulationProgress v-if="sim.isRunning" />

    <!-- Results -->
    <template v-if="sim.result && !sim.isRunning">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-white">Results</h2>
        <div class="flex gap-3">
          <ExportButton />
          <UiBaseButton variant="primary" size="sm" @click="clearAndReset()">
            New Simulation
          </UiBaseButton>
        </div>
      </div>

      <!-- Summary stats -->
      <SimulationSummary />

      <!-- Results table -->
      <ResultsTable class="mb-8" />

      <!-- Row 1: Win Rate + Score Distribution -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <WinRateChart />
        <ScoreDistribution />
      </div>

      <!-- Row 2: Win Rate Convergence + Avg Score Trend -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SimulationWinRateConvergence />
        <SimulationScoreTrend />
      </div>

      <!-- Row 3: Score Range + Rounds Distribution -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SimulationScoreRange />
        <SimulationRoundsDistribution />
      </div>

      <!-- Strategy Comparison Radar -->
      <StrategyComparison class="mb-8" />

      <!-- Recommendation -->
      <div
        v-if="sim.result.recommendation"
        class="bg-indigo-800/50 border border-indigo-600/30 rounded-xl p-6"
      >
        <h3 class="text-lg font-semibold text-yellow-400 mb-2">
          📝 Recommendation
        </h3>
        <p class="text-indigo-200 whitespace-pre-line">
          {{ sim.result.recommendation }}
        </p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { SimulationConfig } from "~/engine/types";
import { useSimStore } from "~/stores/simStore";

useHead({ title: "SkyJo – Simulation" });

const sim = useSimStore();

function runSim(config: SimulationConfig) {
  sim.setConfig(config);
  sim.startSimulation();
}

function clearAndReset() {
  sim.result = null;
}
</script>

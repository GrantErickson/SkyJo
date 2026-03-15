<template>
  <div class="max-w-md mx-auto space-y-6">
    <h2 class="text-xl font-bold text-white text-center">
      Strategy Simulation
    </h2>

    <!-- Player count -->
    <div>
      <label class="block text-sm text-emerald-300 mb-2"
        >Number of Players</label
      >
      <div class="flex gap-2">
        <button
          v-for="n in [2, 3, 4] as const"
          :key="n"
          class="flex-1 py-2 rounded-lg text-sm font-medium transition"
          :class="
            simStore.config.numPlayers === n
              ? 'bg-emerald-600 text-white'
              : 'bg-emerald-800/40 text-emerald-300 hover:bg-emerald-700/50'
          "
          @click="simStore.setNumPlayers(n)"
        >
          {{ n }}P
        </button>
      </div>
    </div>

    <!-- Strategy selection -->
    <div v-for="i in simStore.config.numPlayers" :key="i" class="space-y-1">
      <label class="block text-sm text-emerald-300"
        >Player {{ i }} Strategy</label
      >
      <select
        :value="simStore.config.strategies[i - 1]"
        class="w-full bg-emerald-800/50 border border-emerald-700/50 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        @change="
          updateStrategy(
            i - 1,
            ($event.target as HTMLSelectElement).value as any,
          )
        "
      >
        <option v-for="s in allStrategies" :key="s" :value="s">
          {{ strategyNames[s] }}
        </option>
      </select>
    </div>

    <!-- Number of games -->
    <div>
      <label class="block text-sm text-emerald-300 mb-1">Number of Games</label>
      <input
        v-model.number="numGames"
        type="number"
        min="10"
        max="100000"
        step="100"
        class="w-full bg-emerald-800/50 border border-emerald-700/50 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />
    </div>

    <!-- Seed -->
    <div>
      <label class="block text-sm text-emerald-300 mb-1"
        >Seed (optional, for reproducibility)</label
      >
      <input
        v-model.number="seed"
        type="number"
        placeholder="Leave empty for random"
        class="w-full bg-emerald-800/50 border border-emerald-700/50 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-emerald-700"
      />
    </div>

    <UiBaseButton
      variant="primary"
      size="lg"
      class="w-full"
      :disabled="simStore.isRunning"
      @click="runSim"
    >
      {{ simStore.isRunning ? "Running..." : "Run Simulation" }}
    </UiBaseButton>
  </div>
</template>

<script setup lang="ts">
import type { StrategyId } from "~/engine/types";
import { STRATEGY_NAMES } from "~/engine/constants";
import { getAllStrategyIds } from "~/engine/ai";
import { useSimStore } from "~/stores/simStore";

const simStore = useSimStore();

const allStrategies = getAllStrategyIds();
const strategyNames = STRATEGY_NAMES;

const numGames = ref(simStore.config.numGames);
const seed = ref<number | undefined>(simStore.config.seed);

function updateStrategy(index: number, strategyId: StrategyId) {
  const strats = [...simStore.config.strategies];
  strats[index] = strategyId;
  simStore.setStrategies(strats);
}

async function runSim() {
  simStore.setConfig({
    numGames: numGames.value,
    seed: seed.value || undefined,
  });
  await simStore.startSimulation();
}
</script>

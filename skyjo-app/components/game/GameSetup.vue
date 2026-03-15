<template>
  <div class="max-w-md mx-auto space-y-6">
    <h2 class="text-xl font-bold text-white text-center">Game Setup</h2>

    <!-- Player count -->
    <div>
      <label class="block text-sm text-indigo-300 mb-2"
        >Number of Players</label
      >
      <div class="flex gap-2">
        <button
          v-for="n in [2, 3, 4]"
          :key="n"
          class="flex-1 py-2 rounded-lg text-sm font-medium transition"
          :class="
            playerCount === n
              ? 'bg-indigo-600 text-white'
              : 'bg-indigo-800/40 text-indigo-300 hover:bg-indigo-700/50'
          "
          @click="playerCount = n"
        >
          {{ n }} Players
        </button>
      </div>
    </div>

    <!-- Strategy selection for each AI player -->
    <div v-for="i in playerCount - 1" :key="i" class="space-y-1">
      <label class="block text-sm text-indigo-300"
        >AI Player {{ i }} Strategy</label
      >
      <select
        v-model="strategies[i - 1]"
        class="w-full bg-indigo-800/50 border border-indigo-700/50 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option v-for="s in allStrategies" :key="s" :value="s">
          {{ strategyNames[s] }} — {{ strategyDescriptions[s] }}
        </option>
      </select>
    </div>

    <UiBaseButton variant="primary" size="lg" class="w-full" @click="startGame">
      Start Game
    </UiBaseButton>
  </div>
</template>

<script setup lang="ts">
import type { StrategyId } from "~/engine/types";
import { STRATEGY_NAMES, STRATEGY_DESCRIPTIONS } from "~/engine/constants";
import { getAllStrategyIds } from "~/engine/ai";
import { useGameStore } from "~/stores/gameStore";

const gameStore = useGameStore();

const playerCount = ref(2);
const strategies = ref<StrategyId[]>(["balanced", "memory", "aggressive"]);
const allStrategies = getAllStrategyIds();
const strategyNames = STRATEGY_NAMES;
const strategyDescriptions = STRATEGY_DESCRIPTIONS;

function startGame() {
  gameStore.startNewGame(playerCount.value, strategies.value);
}
</script>

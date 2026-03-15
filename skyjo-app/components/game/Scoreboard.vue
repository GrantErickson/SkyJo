<template>
  <div
    class="bg-emerald-800/20 rounded-lg border border-emerald-700/20 px-4 py-2"
  >
    <div class="flex items-center justify-between">
      <div class="text-sm">
        <span class="text-emerald-400">Round</span>
        <span class="text-white font-bold ml-1">{{
          gameStore.gameState?.roundNumber ?? 0
        }}</span>
      </div>
      <div class="flex gap-4">
        <div
          v-for="player in gameStore.gameState?.players"
          :key="player.id"
          class="text-center"
        >
          <div class="text-xs text-emerald-400/70">{{ player.name }}</div>
          <div
            class="text-sm font-bold"
            :class="
              player.cumulativeScore < 0 ? 'text-emerald-300' : 'text-white'
            "
          >
            {{ player.cumulativeScore }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "~/stores/gameStore";

const gameStore = useGameStore();
</script>

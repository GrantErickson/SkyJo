<template>
  <UiBaseModal
    :model-value="gameStore.showGameOver"
    @update:model-value="() => {}"
  >
    <div class="text-center">
      <h2 class="text-2xl font-bold text-yellow-400 mb-2">Game Over!</h2>
      <p class="text-emerald-300 text-sm mb-6">Final Standings</p>

      <div class="space-y-2 mb-6">
        <div
          v-for="(player, index) in rankedPlayers"
          :key="player.id"
          class="flex items-center justify-between px-4 py-3 rounded-lg"
          :class="
            index === 0
              ? 'bg-yellow-400/10 border border-yellow-400/30'
              : 'bg-emerald-800/30'
          "
        >
          <div class="flex items-center gap-3">
            <span
              class="text-lg font-bold"
              :class="index === 0 ? 'text-yellow-400' : 'text-white/50'"
            >
              #{{ index + 1 }}
            </span>
            <span class="text-white font-medium">{{ player.name }}</span>
            <span
              v-if="index === 0"
              class="text-xs bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full"
            >
              Winner
            </span>
          </div>
          <span
            class="font-bold text-lg"
            :class="
              player.cumulativeScore < 0 ? 'text-emerald-300' : 'text-white'
            "
          >
            {{ player.cumulativeScore }}
          </span>
        </div>
      </div>

      <div class="flex gap-3 justify-center">
        <UiBaseButton
          variant="primary"
          size="lg"
          @click="gameStore.resetGame()"
        >
          New Game
        </UiBaseButton>
        <UiBaseButton variant="secondary" size="lg" @click="navigateTo('/')">
          Main Menu
        </UiBaseButton>
      </div>
    </div>
  </UiBaseModal>
</template>

<script setup lang="ts">
import { useGameStore } from "~/stores/gameStore";

const gameStore = useGameStore();

const rankedPlayers = computed(() => {
  if (!gameStore.gameState) return [];
  return [...gameStore.gameState.players].sort(
    (a, b) => a.cumulativeScore - b.cumulativeScore,
  );
});
</script>

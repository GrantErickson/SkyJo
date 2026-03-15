<template>
  <UiBaseModal
    :model-value="gameStore.showRoundSummary"
    @update:model-value="() => {}"
  >
    <div class="text-center">
      <h2 class="text-xl font-bold text-white mb-4">
        Round {{ gameStore.lastRoundResult?.roundNumber }} Complete
      </h2>

      <div class="space-y-2 mb-6">
        <div
          v-for="ps in sortedScores"
          :key="ps.playerId"
          class="flex items-center justify-between px-4 py-2 rounded-lg"
          :class="
            ps.wasDoubled
              ? 'bg-red-900/30 border border-red-700/50'
              : 'bg-indigo-800/30'
          "
        >
          <span class="text-sm text-white">{{
            getPlayerName(ps.playerId)
          }}</span>
          <div class="flex items-center gap-2">
            <span
              v-if="ps.wasDoubled"
              class="text-xs text-red-400 line-through"
            >
              {{ ps.rawScore }}
            </span>
            <span
              class="font-bold"
              :class="[
                ps.finalScore < 0
                  ? 'text-indigo-300'
                  : ps.wasDoubled
                    ? 'text-red-400'
                    : 'text-white',
              ]"
            >
              {{ ps.finalScore }}
            </span>
            <span v-if="ps.wasDoubled" class="text-xs text-red-400">
              (doubled!)
            </span>
            <span
              v-if="ps.playerId === gameStore.lastRoundResult?.roundEnderId"
              class="text-xs text-yellow-400"
            >
              ender
            </span>
          </div>
        </div>
      </div>

      <UiBaseButton
        variant="primary"
        size="lg"
        @click="gameStore.proceedAfterRound()"
      >
        {{ gameStore.isGameFinished ? "See Final Results" : "Next Round" }}
      </UiBaseButton>
    </div>
  </UiBaseModal>
</template>

<script setup lang="ts">
import { useGameStore } from "~/stores/gameStore";

const gameStore = useGameStore();

const sortedScores = computed(() => {
  if (!gameStore.lastRoundResult) return [];
  return [...gameStore.lastRoundResult.playerScores].sort(
    (a, b) => a.finalScore - b.finalScore,
  );
});

function getPlayerName(playerId: number): string {
  return (
    gameStore.gameState?.players.find((p) => p.id === playerId)?.name ??
    `Player ${playerId}`
  );
}
</script>

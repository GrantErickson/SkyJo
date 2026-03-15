<template>
  <div class="space-y-4">
    <!-- Scoreboard -->
    <GameScoreboard />

    <!-- Opponent grids -->
    <div class="grid gap-4" :class="opponentGridClass">
      <GamePlayerGrid
        v-for="player in opponents"
        :key="player.id"
        :player="player"
        :is-active="gameStore.currentPlayer?.id === player.id"
        :is-human="false"
        highlight-mode="none"
      />
    </div>

    <!-- Draw / Discard piles -->
    <div class="flex items-center justify-center gap-8 py-4">
      <GameDrawPile
        :count="gameStore.gameState?.drawPile.length ?? 0"
        :highlighted="gameStore.turnPhase === 'awaiting-source'"
        @click="handleDrawClick"
      />
      <GameDiscardPile
        :top-card="gameStore.topDiscard"
        :highlighted="gameStore.turnPhase === 'awaiting-source'"
        @click="handleDiscardClick"
      />
    </div>

    <!-- Drawn card display -->
    <div
      v-if="gameStore.drawnCard && gameStore.selectedSource === 'draw'"
      class="flex justify-center"
    >
      <div
        class="bg-emerald-700/30 rounded-xl px-4 py-2 border border-emerald-600/30"
      >
        <span class="text-emerald-300 text-sm">Drawn: </span>
        <span class="text-white font-bold text-lg">{{
          gameStore.drawnCard.value
        }}</span>
      </div>
    </div>

    <!-- Human player grid -->
    <GamePlayerGrid
      v-if="gameStore.humanPlayer"
      :player="gameStore.humanPlayer"
      :is-active="gameStore.isHumanTurn"
      :is-human="true"
      :highlight-mode="humanHighlightMode"
      @cell-click="handleCellClick"
    />

    <!-- Action panel -->
    <GameActionPanel />

    <!-- Overlays -->
    <GameRoundSummary />
    <GameOverOverlay />
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "~/stores/gameStore";
import { useAI } from "~/composables/useAI";

const gameStore = useGameStore();
const { runAITurns } = useAI();

const opponents = computed(() => {
  return gameStore.gameState?.players.filter((p) => !p.isHuman) ?? [];
});

const opponentGridClass = computed(() => {
  const count = opponents.value.length;
  if (count === 1) return "grid-cols-1 max-w-md mx-auto";
  if (count === 2) return "grid-cols-2 max-w-2xl mx-auto";
  return "grid-cols-3 max-w-4xl mx-auto";
});

const humanHighlightMode = computed(() => {
  const phase = gameStore.gameState?.phase;
  const turnPhase = gameStore.turnPhase;

  if (phase === "setup-flip") return "face-down" as const;
  if (turnPhase === "awaiting-swap-target") return "all" as const;
  if (turnPhase === "awaiting-flip-target") return "face-down" as const;
  return "none" as const;
});

function handleDrawClick() {
  if (gameStore.turnPhase === "awaiting-source") {
    gameStore.selectSource("draw");
  }
}

function handleDiscardClick() {
  if (gameStore.turnPhase === "awaiting-source") {
    gameStore.selectSource("discard");
  }
}

function handleCellClick(row: number, col: number) {
  const phase = gameStore.gameState?.phase;
  const turnPhase = gameStore.turnPhase;

  if (phase === "setup-flip") {
    gameStore.humanSetupFlip(row, col);
    // Check if setup is done and AI should play
    if (gameStore.gameState?.phase === "playing" && !gameStore.isHumanTurn) {
      nextTick(() => runAITurns());
    }
    return;
  }

  if (turnPhase === "awaiting-swap-target") {
    gameStore.humanSwap(row, col);
    if (!gameStore.showRoundSummary && !gameStore.isHumanTurn) {
      nextTick(() => runAITurns());
    }
    return;
  }

  if (turnPhase === "awaiting-flip-target") {
    const cell = gameStore.humanPlayer?.grid[row]?.[col];
    if (cell && !cell.faceUp && cell.card) {
      gameStore.humanDiscardAndFlip(row, col);
      if (!gameStore.showRoundSummary && !gameStore.isHumanTurn) {
        nextTick(() => runAITurns());
      }
    }
    return;
  }
}

// Watch for AI turns
watch(
  () => gameStore.isHumanTurn,
  (isHuman) => {
    if (
      (!isHuman && gameStore.gameState?.phase === "playing") ||
      gameStore.gameState?.phase === "final-turns"
    ) {
      nextTick(() => runAITurns());
    }
  },
);
</script>

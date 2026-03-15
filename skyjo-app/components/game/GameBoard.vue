<template>
  <div
    class="flex flex-col h-[calc(100vh-6rem)] max-h-[calc(100dvh-6rem)] overflow-hidden px-2 py-1 sm:px-4 sm:py-2"
  >
    <!-- Top: Scoreboard + Opponents -->
    <div class="shrink-0 space-y-1">
      <GameScoreboard />
      <div class="grid gap-2" :class="opponentGridClass">
        <GamePlayerGrid
          v-for="player in opponents"
          :key="player.id"
          :player="player"
          :is-active="gameStore.currentPlayer?.id === player.id"
          :is-human="false"
          highlight-mode="none"
          compact
        />
      </div>
    </div>

    <!-- Middle: Draw/Discard piles + Action panel (flex-1 to fill space) -->
    <div
      class="flex-1 flex flex-col items-center justify-center gap-1 min-h-0 py-1"
    >
      <!-- Drawn card display -->
      <div
        v-if="gameStore.drawnCard && gameStore.selectedSource === 'draw'"
        class="shrink-0"
      >
        <div
          class="bg-emerald-700/30 rounded-lg px-3 py-1 border border-emerald-600/30 text-center"
        >
          <span class="text-emerald-300 text-xs">Drawn: </span>
          <span class="text-white font-bold text-base">{{
            gameStore.drawnCard.value
          }}</span>
        </div>
      </div>

      <div class="flex items-center justify-center gap-6 shrink-0">
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

      <GameActionPanel class="shrink-0 w-full max-w-md" />
    </div>

    <!-- Bottom: Human player grid (anchored to bottom) -->
    <div class="shrink-0">
      <GamePlayerGrid
        v-if="gameStore.humanPlayer"
        :player="gameStore.humanPlayer"
        :is-active="gameStore.isHumanTurn"
        :is-human="true"
        :highlight-mode="humanHighlightMode"
        @cell-click="handleCellClick"
      />
    </div>

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
      !isHuman &&
      (gameStore.gameState?.phase === "playing" ||
        gameStore.gameState?.phase === "final-turns")
    ) {
      nextTick(() => runAITurns());
    }
  },
);
</script>

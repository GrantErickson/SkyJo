<template>
  <div
    class="bg-indigo-800/30 rounded-xl border border-indigo-700/30 p-2 sm:p-3"
  >
    <!-- Setup phase -->
    <template v-if="gameStore.gameState?.phase === 'setup-flip'">
      <p class="text-indigo-300 text-sm text-center">
        Click <strong>2 cards</strong> in your grid to flip them face-up
      </p>
    </template>

    <!-- Awaiting source selection -->
    <template v-else-if="gameStore.turnPhase === 'awaiting-source'">
      <p class="text-indigo-300 text-sm text-center mb-3">
        Your turn — choose a card source:
      </p>
      <div class="flex gap-3 justify-center">
        <UiBaseButton
          variant="secondary"
          size="md"
          @click="gameStore.selectSource('draw')"
        >
          Draw from Pile
        </UiBaseButton>
        <UiBaseButton
          variant="primary"
          size="md"
          @click="gameStore.selectSource('discard')"
        >
          Take Discard
          <span v-if="gameStore.topDiscard" class="ml-1 opacity-75"
            >({{ gameStore.topDiscard.value }})</span
          >
        </UiBaseButton>
      </div>
    </template>

    <!-- Awaiting swap target (from discard) -->
    <template
      v-else-if="
        gameStore.turnPhase === 'awaiting-swap-target' &&
        gameStore.selectedSource === 'discard'
      "
    >
      <p class="text-yellow-300 text-sm text-center">
        Click a card in your grid to swap with the
        <strong class="text-white">{{ gameStore.drawnCard?.value }}</strong>
      </p>
    </template>

    <!-- Awaiting swap or discard (from draw) -->
    <template
      v-else-if="
        gameStore.turnPhase === 'awaiting-swap-target' &&
        gameStore.selectedSource === 'draw'
      "
    >
      <div class="text-center">
        <p class="text-indigo-300 text-sm mb-2">
          You drew a
          <strong class="text-white text-lg">{{
            gameStore.drawnCard?.value
          }}</strong>
        </p>
        <p class="text-indigo-400/70 text-xs mb-3">
          Click a card to swap, or discard and flip:
        </p>
        <UiBaseButton
          variant="secondary"
          size="sm"
          @click="gameStore.cancelDrawnCard()"
        >
          Discard &amp; Flip a Card
        </UiBaseButton>
      </div>
    </template>

    <!-- Awaiting flip target -->
    <template v-else-if="gameStore.turnPhase === 'awaiting-flip-target'">
      <p class="text-yellow-300 text-sm text-center">
        Click a <strong>face-down</strong> card to flip it
      </p>
    </template>

    <!-- AI is playing -->
    <template
      v-else-if="
        !gameStore.isHumanTurn &&
        (gameStore.gameState?.phase === 'playing' ||
          gameStore.gameState?.phase === 'final-turns')
      "
    >
      <p class="text-indigo-400/70 text-sm text-center animate-pulse">
        {{ gameStore.currentPlayer?.name }} is thinking...
      </p>
    </template>

    <!-- Speed controls -->
    <div
      v-if="
        gameStore.gameState?.phase === 'playing' ||
        gameStore.gameState?.phase === 'final-turns'
      "
      class="mt-3 flex items-center justify-center gap-2"
    >
      <span class="text-xs text-indigo-600">Speed:</span>
      <button
        v-for="speed in ['slow', 'normal', 'fast'] as const"
        :key="speed"
        class="text-xs px-2 py-1 rounded transition"
        :class="
          gameStore.gameSpeed === speed
            ? 'bg-indigo-600 text-white'
            : 'text-indigo-400 hover:bg-indigo-700/50'
        "
        @click="gameStore.gameSpeed = speed"
      >
        {{ speed }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "~/stores/gameStore";

const gameStore = useGameStore();
</script>

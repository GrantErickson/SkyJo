<template>
  <div class="min-h-[calc(100vh-8rem)] py-6 px-4">
    <GameSetup v-if="!game.gameStarted" @start="startGame" />
    <GameBoard v-else />
  </div>
</template>

<script setup lang="ts">
import type { StrategyId } from "~/engine/types";
import { useGameStore } from "~/stores/gameStore";

useHead({ title: "SkyJo – Play" });

const game = useGameStore();

interface SetupPayload {
  playerCount: number;
  strategies: StrategyId[];
}

function startGame(payload: SetupPayload) {
  game.startNewGame(payload.playerCount, payload.strategies);
}
</script>

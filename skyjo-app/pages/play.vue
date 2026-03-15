<template>
  <div>
    <div v-if="!game.gameStarted" class="py-6 px-4">
      <GameSetup />
    </div>
    <GameBoard v-else />
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "~/stores/gameStore";

useHead({ title: "SkyJo – Play" });

const game = useGameStore();
</script>

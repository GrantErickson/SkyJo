<template>
  <div v-if="simStore.isRunning" class="max-w-md mx-auto mt-6">
    <div class="bg-indigo-800/30 rounded-xl border border-indigo-700/30 p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-indigo-300">Simulating...</span>
        <span class="text-sm text-white font-mono"
          >{{ simStore.progress }}%</span
        >
      </div>
      <div class="w-full bg-indigo-900/50 rounded-full h-3">
        <div
          class="bg-indigo-500 h-3 rounded-full transition-all duration-300"
          :style="{ width: `${simStore.progress}%` }"
        />
      </div>
      <div class="mt-2 text-center">
        <UiBaseButton
          variant="ghost"
          size="sm"
          @click="simStore.cancelSimulation()"
        >
          Cancel
        </UiBaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSimStore } from "~/stores/simStore";

const simStore = useSimStore();
</script>

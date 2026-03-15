<template>
  <div class="flex gap-2">
    <UiBaseButton
      variant="secondary"
      size="sm"
      @click="simStore.exportResults('csv')"
    >
      Export CSV
    </UiBaseButton>
    <UiBaseButton
      variant="secondary"
      size="sm"
      @click="simStore.exportResults('json')"
    >
      Export JSON
    </UiBaseButton>
  </div>
</template>

<script setup lang="ts">
import { useSimStore } from "~/stores/simStore";

const simStore = useSimStore();
</script>

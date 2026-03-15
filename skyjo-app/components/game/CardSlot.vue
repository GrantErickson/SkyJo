<template>
  <div
    class="relative"
    :class="{
      'card-slot-highlight rounded-lg': highlighted,
      'card-slot-removed': removed,
    }"
    @click="handleClick"
  >
    <template v-if="!removed">
      <GameCard
        :value="cardValue"
        :face-up="faceUp"
        :clickable="clickable"
        @click="handleClick"
      />
    </template>
    <template v-else>
      <div
        class="w-14 h-20 sm:w-16 sm:h-22 md:w-18 md:h-24 rounded-lg border-2 border-dashed border-emerald-700/30 opacity-30"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { GridCell } from "~/engine/types";

const props = defineProps<{
  cell: GridCell;
  highlighted?: boolean;
  clickable?: boolean;
}>();

const emit = defineEmits<{
  click: [];
}>();

const removed = computed(() => props.cell.card === null);
const faceUp = computed(() => props.cell.faceUp);
const cardValue = computed(() => props.cell.card?.value ?? 0);

function handleClick() {
  if (props.clickable && !removed.value) {
    emit("click");
  }
}
</script>

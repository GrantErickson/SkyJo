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
        :compact="compact"
        @click="handleClick"
      />
    </template>
    <template v-else>
      <div
        class="rounded-lg border-2 border-dashed border-indigo-700/30 opacity-30"
        :class="
          compact ? 'w-9 h-14 sm:w-11 sm:h-16' : 'w-11 h-16 sm:w-14 sm:h-20'
        "
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
  compact?: boolean;
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

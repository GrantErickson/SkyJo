<template>
  <div
    class="w-14 h-20 sm:w-16 sm:h-24 rounded-lg border-2 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-lg"
    :class="[
      topCard ? colorClass : 'bg-indigo-800/40 border-indigo-700/30',
      topCard ? borderClass : '',
      { 'ring-2 ring-yellow-400 ring-opacity-75': highlighted },
    ]"
    @click="$emit('click')"
  >
    <template v-if="topCard">
      <span class="font-bold text-xl">{{ topCard.value }}</span>
    </template>
    <template v-else>
      <span class="text-indigo-400 text-xs">Empty</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Card } from "~/engine/types";
import { getCardColor, getCardBorderColor } from "~/utils/colors";

const props = defineProps<{
  topCard: Card | null;
  highlighted?: boolean;
}>();

defineEmits<{
  click: [];
}>();

const colorClass = computed(() =>
  props.topCard ? getCardColor(props.topCard.value) : "",
);
const borderClass = computed(() =>
  props.topCard ? getCardBorderColor(props.topCard.value) : "",
);
</script>

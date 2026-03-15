<template>
  <div
    class="card-container w-14 h-20 sm:w-16 sm:h-22 md:w-18 md:h-24 select-none"
    :class="{ 'cursor-pointer': clickable }"
    @click="handleClick"
  >
    <div class="card-inner" :class="{ flipped: faceUp }">
      <!-- Back face -->
      <div
        class="card-face card-back rounded-lg shadow-md border-2 border-blue-600"
      >
        <div class="text-blue-400 font-bold text-lg opacity-50">?</div>
      </div>
      <!-- Front face -->
      <div
        class="card-face card-front rounded-lg shadow-md border-2 font-bold text-xl flex items-center justify-center"
        :class="[colorClass, borderClass]"
      >
        {{ value }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CardValue } from "~/engine/types";
import { getCardColor, getCardBorderColor } from "~/utils/colors";

const props = defineProps<{
  value: CardValue;
  faceUp: boolean;
  clickable?: boolean;
}>();

const emit = defineEmits<{
  click: [];
}>();

const colorClass = computed(() => getCardColor(props.value));
const borderClass = computed(() => getCardBorderColor(props.value));

function handleClick() {
  if (props.clickable) emit("click");
}
</script>

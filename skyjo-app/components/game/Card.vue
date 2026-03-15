<template>
  <div
    class="card-container select-none"
    :class="[
      compact ? 'w-9 h-14 sm:w-11 sm:h-16' : 'w-11 h-16 sm:w-14 sm:h-20',
      { 'cursor-pointer': clickable },
    ]"
    @click="handleClick"
  >
    <div class="card-inner" :class="{ flipped: faceUp }">
      <!-- Back face -->
      <div
        class="card-face card-back rounded-lg shadow-md border-2 border-blue-600"
      >
        <div
          class="text-blue-400 font-bold opacity-50"
          :class="compact ? 'text-sm' : 'text-lg'"
        >
          ?
        </div>
      </div>
      <!-- Front face -->
      <div
        class="card-face card-front rounded-lg shadow-md border-2 font-bold flex items-center justify-center"
        :class="[
          colorClass,
          borderClass,
          compact ? 'text-sm' : 'text-lg sm:text-xl',
        ]"
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
  compact?: boolean;
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

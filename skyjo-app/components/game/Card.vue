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
        class="card-face card-back rounded-lg shadow-md"
      >
        <svg viewBox="0 0 44 60" class="w-5/6 h-5/6 opacity-30" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <polygon points="22,10 24.5,17.5 32,17.5 26,22 28,29.5 22,25 16,29.5 18,22 12,17.5 19.5,17.5" fill="white"/>
          <rect x="10" y="32" width="10" height="16" rx="2" fill="white" transform="rotate(-8 15 40)" opacity="0.5"/>
          <rect x="14" y="32" width="10" height="16" rx="2" fill="white" opacity="0.7"/>
          <text x="19" y="44" font-family="Arial,sans-serif" font-size="8" font-weight="bold" fill="#6366f1" text-anchor="middle" dominant-baseline="middle">0</text>
        </svg>
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

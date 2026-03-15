<template>
  <div
    class="w-16 h-22 sm:w-18 sm:h-24 rounded-lg bg-blue-900/60 border-2 border-blue-700/50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition shadow-lg"
    :class="{ 'ring-2 ring-yellow-400 ring-opacity-75': highlighted }"
    @click="$emit('click')"
  >
    <div class="text-blue-300 text-xs font-medium mb-1">DRAW</div>
    <div class="text-blue-400/60 text-xs">({{ count }})</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  count: number;
  highlighted?: boolean;
}>();

defineEmits<{
  click: [];
}>();
</script>

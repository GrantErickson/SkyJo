<template>
  <div
    class="w-14 h-20 sm:w-16 sm:h-24 rounded-lg border-2 border-violet-500/50 flex flex-col items-center justify-center cursor-pointer hover:border-violet-300 transition shadow-lg"
    :class="{ 'ring-2 ring-yellow-400 ring-opacity-75': highlighted }"
    style="background: linear-gradient(135deg, #6366f1, #8b5cf6)"
    @click="$emit('click')"
  >
    <div class="text-white/80 text-xs font-medium mb-1">DRAW</div>
    <div class="text-white/50 text-xs">({{ count }})</div>
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

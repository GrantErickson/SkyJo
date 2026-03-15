<template>
  <button
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-table-dark',
      sizeClasses,
      variantClasses,
      { 'opacity-50 cursor-not-allowed': disabled },
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
  }>(),
  {
    variant: "primary",
    size: "md",
    disabled: false,
  },
);

defineEmits<{
  click: [event: MouseEvent];
}>();

const sizeClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "px-3 py-1.5 text-sm";
    case "md":
      return "px-4 py-2 text-sm";
    case "lg":
      return "px-6 py-3 text-base";
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case "primary":
      return "bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-500 shadow-lg shadow-indigo-900/30";
    case "secondary":
      return "bg-white/10 hover:bg-white/20 text-white focus:ring-white/30 border border-white/20";
    case "danger":
      return "bg-red-600 hover:bg-red-500 text-white focus:ring-red-500";
    case "ghost":
      return "hover:bg-white/10 text-indigo-300 hover:text-white focus:ring-white/20";
  }
});
</script>

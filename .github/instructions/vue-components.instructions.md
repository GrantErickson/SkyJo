---
applyTo: "skyjo-app/components/**/*.vue"
---

# Vue Component Instructions

## Component Structure

Always use `<script setup lang="ts">` with the Composition API. Follow this ordering:

1. `<template>` block
2. `<script setup lang="ts">` block
3. No `<style>` blocks — use Tailwind CSS utility classes exclusively

## Props and Events

- Define props using `defineProps<{ ... }>()` with TypeScript generics.
- Use `withDefaults()` when props need default values.
- Define emits using `defineEmits<{ eventName: [payload: Type] }>()`.

## Styling

- Use **Tailwind CSS utility classes** for all styling — do not use scoped CSS or inline styles.
- Follow the indigo/violet color theme:
  - Backgrounds: `bg-table-dark`, `bg-table`, `bg-table-light`, `bg-white/5`, `bg-white/10`
  - Text: `text-white`, `text-indigo-200`, `text-indigo-300`, `text-indigo-400`
  - Accents: `bg-indigo-600`, `bg-indigo-500`, `text-yellow-400`
- Use consistent spacing (`p-4`, `p-6`, `gap-4`, `gap-6`, `space-y-4`).
- Use `rounded-lg` or `rounded-xl` for containers, `rounded-md` for smaller elements.
- Add `shadow-lg` or `shadow-xl` for elevated elements.
- Use `transition-all duration-200` for interactive elements.

## Component Organization

- `ui/` — Reusable base components (buttons, modals, headers).
- `game/` — Game board and interactive play components.
- `simulation/` — Analytics, charts, and simulation UI components.

## Icons

Use `lucide-vue-next` for all icons. Import individual icon components:

```vue
<script setup lang="ts">
import { Play, Settings, BarChart3 } from 'lucide-vue-next'
</script>
```

## State Access

- Access Pinia stores via composable functions: `useGameStore()`, `useSimStore()`, `useSettingsStore()`.
- Use `computed()` for derived reactive state.
- Prefer store actions for state mutations rather than direct state modification.

<template>
  <div
    class="rounded-xl transition-all duration-300"
    :class="[
      compact ? 'p-2' : 'p-2 sm:p-3',
      isActive
        ? 'bg-indigo-700/40 ring-2 ring-yellow-400/60'
        : 'bg-indigo-800/30',
      isHuman ? 'border border-indigo-500/40' : 'border border-indigo-700/20',
    ]"
  >
    <div class="flex items-center justify-between mb-1">
      <div class="flex items-center gap-2">
        <span
          class="font-semibold"
          :class="[
            isHuman ? 'text-indigo-300' : 'text-white/80',
            compact ? 'text-xs' : 'text-sm',
          ]"
        >
          {{ player.name }}
        </span>
        <span
          v-if="isActive"
          class="text-xs bg-yellow-400/20 text-yellow-300 px-1.5 py-0.5 rounded-full"
        >
          Playing
        </span>
      </div>
      <div class="text-right">
        <span class="text-xs text-indigo-400">Score: </span>
        <span
          class="text-sm font-bold"
          :class="visibleScore < 0 ? 'text-indigo-300' : 'text-white'"
        >
          {{ visibleScore }}
        </span>
        <span
          v-if="player.cumulativeScore > 0"
          class="text-xs text-white/50 ml-1"
        >
          ({{ player.cumulativeScore }})
        </span>
      </div>
    </div>

    <!-- 3 rows × 4 columns grid -->
    <div class="grid grid-rows-3" :class="compact ? 'gap-0.5' : 'gap-1'">
      <div
        v-for="(row, rowIdx) in player.grid"
        :key="rowIdx"
        class="flex justify-center"
        :class="compact ? 'gap-0.5' : 'gap-1'"
      >
        <GameCardSlot
          v-for="(cell, colIdx) in row"
          :key="colIdx"
          :cell="cell"
          :highlighted="isCellHighlighted(rowIdx, colIdx)"
          :clickable="isCellClickable(rowIdx, colIdx)"
          :compact="compact"
          @click="$emit('cellClick', rowIdx, colIdx)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Player } from "~/engine/types";
import { getVisibleScore } from "~/engine/grid";

const props = defineProps<{
  player: Player;
  isActive: boolean;
  isHuman: boolean;
  highlightMode?: "all" | "face-down" | "none";
  compact?: boolean;
}>();

defineEmits<{
  cellClick: [row: number, col: number];
}>();

const visibleScore = computed(() => getVisibleScore(props.player.grid));

function isCellHighlighted(row: number, col: number): boolean {
  if (props.highlightMode === "none" || !props.highlightMode) return false;
  const cell = props.player.grid[row]?.[col];
  if (!cell || cell.card === null) return false;
  if (props.highlightMode === "all") return true;
  if (props.highlightMode === "face-down") return !cell.faceUp;
  return false;
}

function isCellClickable(row: number, col: number): boolean {
  if (!props.isHuman) return false;
  if (props.highlightMode === "none" || !props.highlightMode) return false;
  return isCellHighlighted(row, col);
}
</script>

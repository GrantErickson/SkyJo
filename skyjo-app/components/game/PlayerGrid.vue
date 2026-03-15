<template>
  <div
    class="rounded-xl p-3 transition-all duration-300"
    :class="[
      isActive
        ? 'bg-emerald-700/40 ring-2 ring-yellow-400/60'
        : 'bg-emerald-800/30',
      isHuman ? 'border border-emerald-500/40' : 'border border-emerald-700/20',
    ]"
  >
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <span
          class="text-sm font-semibold"
          :class="isHuman ? 'text-emerald-300' : 'text-white/80'"
        >
          {{ player.name }}
        </span>
        <span
          v-if="isActive"
          class="text-xs bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full"
        >
          Playing
        </span>
      </div>
      <div class="text-right">
        <span class="text-xs text-emerald-400">Score: </span>
        <span
          class="text-sm font-bold"
          :class="visibleScore < 0 ? 'text-emerald-300' : 'text-white'"
        >
          {{ visibleScore }}
        </span>
        <span
          v-if="player.cumulativeScore > 0"
          class="text-xs text-white/50 ml-1"
        >
          (Total: {{ player.cumulativeScore }})
        </span>
      </div>
    </div>

    <!-- 3 rows × 4 columns grid -->
    <div class="grid grid-rows-3 gap-1.5">
      <div
        v-for="(row, rowIdx) in player.grid"
        :key="rowIdx"
        class="flex gap-1.5 justify-center"
      >
        <GameCardSlot
          v-for="(cell, colIdx) in row"
          :key="colIdx"
          :cell="cell"
          :highlighted="isCellHighlighted(rowIdx, colIdx)"
          :clickable="isCellClickable(rowIdx, colIdx)"
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

import type { CardValue } from "~/engine/types";

export function getCardColor(value: CardValue): string {
  if (value === -2) return "bg-yellow-400 text-yellow-900";
  if (value <= 0) return "bg-emerald-500 text-white";
  if (value <= 4) return "bg-gray-100 text-gray-800";
  if (value <= 8) return "bg-orange-400 text-white";
  return "bg-red-500 text-white";
}

export function getCardBorderColor(value: CardValue): string {
  if (value === -2) return "border-yellow-500";
  if (value <= 0) return "border-emerald-600";
  if (value <= 4) return "border-gray-300";
  if (value <= 8) return "border-orange-500";
  return "border-red-600";
}

export function getCardShadow(value: CardValue): string {
  if (value === -2) return "shadow-yellow-400/30";
  if (value <= 0) return "shadow-emerald-400/30";
  return "shadow-black/20";
}

import type { CSSProperties } from 'react';

const BLOCK_COLORS = [
  'bg-rose-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-cyan-500',
  'bg-lime-500',
  'bg-amber-500',
] as const;

const BLOCK_SHADOWS = [
  'shadow-rose-800',
  'shadow-blue-800',
  'shadow-green-800',
  'shadow-yellow-800',
  'shadow-purple-800',
  'shadow-orange-800',
  'shadow-teal-800',
  'shadow-pink-800',
  'shadow-indigo-800',
  'shadow-cyan-800',
  'shadow-lime-800',
  'shadow-amber-800',
] as const;

/** Hex color definitions for inline gradient generation. Index 0 is the goal-block color. */
const COLOR_HEX: Array<{ base: string; light: string; dark: string }> = [
  // Rose — goal block
  { base: '#f43f5e', light: '#fb7185', dark: '#be123c' },
  // Blue
  { base: '#3b82f6', light: '#60a5fa', dark: '#1d4ed8' },
  // Green
  { base: '#22c55e', light: '#4ade80', dark: '#15803d' },
  // Yellow
  { base: '#eab308', light: '#facc15', dark: '#a16207' },
  // Purple
  { base: '#a855f7', light: '#c084fc', dark: '#7e22ce' },
  // Orange
  { base: '#f97316', light: '#fb923c', dark: '#c2410c' },
  // Teal
  { base: '#14b8a6', light: '#2dd4bf', dark: '#0f766e' },
  // Pink
  { base: '#ec4899', light: '#f472b6', dark: '#be185d' },
  // Indigo
  { base: '#6366f1', light: '#818cf8', dark: '#3730a3' },
  // Cyan
  { base: '#06b6d4', light: '#22d3ee', dark: '#0e7490' },
  // Lime
  { base: '#84cc16', light: '#a3e635', dark: '#4d7c0f' },
  // Amber
  { base: '#f59e0b', light: '#fbbf24', dark: '#b45309' },
];

export function getBlockColor(blockId: number, isGoal: boolean): string {
  if (isGoal) return BLOCK_COLORS[0];
  return BLOCK_COLORS[(blockId % (BLOCK_COLORS.length - 1)) + 1];
}

export function getBlockShadow(blockId: number, isGoal: boolean): string {
  if (isGoal) return BLOCK_SHADOWS[0];
  return BLOCK_SHADOWS[(blockId % (BLOCK_SHADOWS.length - 1)) + 1];
}

export function getBlockName(blockId: number, isGoal: boolean): string {
  if (isGoal) return 'red car';
  const names = ['Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Teal', 'Pink', 'Indigo', 'Cyan', 'Lime', 'Amber'];
  return names[(blockId % (names.length - 1)) + 1] + ' block';
}

/**
 * Returns an inline style object with a 3D bevel gradient and inner shadow
 * for a block cell. The goal block receives a special glow treatment.
 */
export function getBlockGradient(blockId: number, isGoal: boolean): CSSProperties {
  const idx = isGoal ? 0 : (blockId % (COLOR_HEX.length - 1)) + 1;
  const h = COLOR_HEX[idx];

  if (isGoal) {
    return {
      background: `linear-gradient(135deg, ${h.light} 0%, ${h.base} 35%, ${h.dark} 100%)`,
      boxShadow: `inset 1px 1px 0 ${h.light}99, inset -2px -2px 4px ${h.dark}66, 0 0 10px ${h.base}40`,
    };
  }

  return {
    background: `linear-gradient(135deg, ${h.light} 0%, ${h.base} 45%, ${h.dark} 100%)`,
    boxShadow: `inset 1px 1px 0 ${h.light}66, inset -2px -2px 4px ${h.dark}33`,
  };
}

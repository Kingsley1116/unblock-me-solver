const BLOCK_COLORS = [
  'bg-red-500',
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
  'bg-rose-500',
] as const;

const BLOCK_SHADOWS = [
  'shadow-red-800',
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
  'shadow-rose-800',
] as const;

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
  const names = ['Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Teal', 'Pink', 'Indigo', 'Cyan', 'Lime', 'Rose'];
  return names[(blockId % (names.length - 1)) + 1] + ' block';
}

'use client';

import React from 'react';
import { Block } from '@/lib/types';
import { getBlockColor, getBlockShadow } from './color-utils';

const BOARD_SIZE = 6;

interface BoardProps {
  blocks: Block[];
  highlightBlockId?: number;
  onClickCell?: (row: number, col: number) => void;
  onHoverCell?: (row: number, col: number) => void;
  onLeaveCell?: () => void;
  cellSize?: number;
  animated?: boolean;
  previewCells?: Array<{ row: number; col: number }>;
  previewBlockId?: number;
}

export function Board({
  blocks,
  highlightBlockId,
  onClickCell,
  onHoverCell,
  onLeaveCell,
  cellSize = 64,
  animated = true,
  previewCells,
  previewBlockId,
}: BoardProps) {
  // Build a 6x6 occupancy grid
  const grid: number[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(0)
  );

  for (const block of blocks) {
    for (let i = 0; i < block.size; i++) {
      const row = block.orientation === 'horizontal' ? block.row : block.row + i;
      const col = block.orientation === 'horizontal' ? block.col + i : block.col;
      if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
        grid[row][col] = block.id;
      }
    }
  }

  // Map block ID to block for quick lookup
  const blockMap = new Map<number, Block>();
  for (const block of blocks) {
    blockMap.set(block.id, block);
  }

  // Find the goal block and its row
  const goalBlock = blocks.find((b) => b.isGoal);
  const goalRow = goalBlock?.row ?? -1;

  // Build preview set
  const previewSet = new Set<string>();
  if (previewCells) {
    for (const cell of previewCells) {
      previewSet.add(`${cell.row},${cell.col}`);
    }
  }

  // Get cell rounding info
  function getCellRounding(row: number, col: number): string {
    const blockId = grid[row][col];
    if (blockId === 0) return 'rounded-md';
    const block = blockMap.get(blockId);
    if (!block) return 'rounded-md';

    const isFirst = row === block.row && col === block.col;
    const isLast =
      block.orientation === 'horizontal'
        ? row === block.row && col === block.col + block.size - 1
        : row === block.row + block.size - 1 && col === block.col;

    if (block.orientation === 'horizontal') {
      if (isFirst && isLast) return 'rounded-md';
      if (isFirst) return 'rounded-l-md rounded-r-sm';
      if (isLast) return 'rounded-r-md rounded-l-sm';
      return 'rounded-sm';
    } else {
      if (isFirst && isLast) return 'rounded-md';
      if (isFirst) return 'rounded-t-md rounded-b-sm';
      if (isLast) return 'rounded-b-md rounded-t-sm';
      return 'rounded-sm';
    }
  }

  function isGoalExit(row: number, col: number): boolean {
    if (!goalBlock || goalBlock.orientation !== 'horizontal') return false;
    return row === goalRow && col === BOARD_SIZE - 1;
  }

  return (
    <div
      className="relative select-none"
      style={{ width: cellSize * BOARD_SIZE + 10, height: cellSize * BOARD_SIZE + 10 }}
    >
      {/* Board background / grid lines */}
      <div
        className="absolute inset-0 rounded-xl bg-zinc-300 dark:bg-zinc-600"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
          gap: '2px',
          padding: '2px',
        }}
      >
        {Array.from({ length: BOARD_SIZE }, (_, row) =>
          Array.from({ length: BOARD_SIZE }, (_, col) => {
            const blockId = grid[row][col];
            const block = blockId !== 0 ? blockMap.get(blockId) : undefined;
            const isHighlighted = blockId !== 0 && blockId === highlightBlockId;
            const rounding = getCellRounding(row, col);
            const isExit = isGoalExit(row, col);
            const isPreview = previewSet.has(`${row},${col}`);

            let cellBg = 'bg-zinc-100 dark:bg-zinc-800';
            if (block) {
              cellBg = getBlockColor(block.id, block.isGoal);
            }
            if (isPreview && !block) {
              cellBg = previewBlockId
                ? getBlockColor(previewBlockId, false)
                : 'bg-blue-400/40';
            }

            let shadowClass = '';
            if (block) {
              shadowClass = getBlockShadow(block.id, block.isGoal);
            }

            return (
              <div
                key={`${row}-${col}`}
                className={`
                  ${cellBg}
                  ${rounding}
                  ${shadowClass}
                  flex items-center justify-center relative
                  ${animated ? 'transition-all duration-300' : ''}
                  ${block ? 'cursor-pointer hover:brightness-110' : ''}
                  ${isHighlighted ? 'ring-2 ring-white ring-offset-1 ring-offset-zinc-400 dark:ring-offset-zinc-600 z-10 scale-105' : ''}
                  ${isPreview && !block ? 'opacity-60 ring-1 ring-blue-400 dark:ring-blue-300' : ''}
                  ${isExit && !block ? 'border-2 border-dashed border-zinc-400 dark:border-zinc-500 bg-transparent' : ''}
                `}
                style={{ width: cellSize, height: cellSize }}
                onClick={() => onClickCell?.(row, col)}
                onMouseEnter={() => onHoverCell?.(row, col)}
                onMouseLeave={() => onLeaveCell?.()}
              >
                {block && isHighlighted && (
                  <span className="text-white text-xs font-bold drop-shadow-md select-none">
                    {block.id}
                  </span>
                )}
                {isExit && !block && (
                  <span className="text-zinc-400 dark:text-zinc-500 text-lg font-bold select-none pointer-events-none">
                    &rarr;
                  </span>
                )}
                {isExit && block && block.id === goalBlock?.id && (
                  <span className="text-white text-lg font-bold drop-shadow-md select-none pointer-events-none">
                    &rarr;
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Exit arrow outside the board */}
      {goalBlock && goalBlock.orientation === 'horizontal' && (
        <div
          className="absolute flex items-center justify-center text-zinc-400 dark:text-zinc-500 font-bold text-xl animate-pulse"
          style={{
            right: -(cellSize * 0.6),
            top: goalBlock.row * cellSize + (cellSize / 2) - 12 + (goalBlock.row + 1) * 2,
            width: cellSize * 0.5,
            height: cellSize,
          }}
        >
          &rarr;
        </div>
      )}
    </div>
  );
}

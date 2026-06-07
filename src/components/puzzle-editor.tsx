'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Block, Orientation, BlockSize } from '@/lib/types';
import { Board } from './board';

interface PuzzleEditorProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  cellSize?: number;
}

type EditorTool = 'horizontal-2' | 'horizontal-3' | 'vertical-2' | 'vertical-3' | 'goal' | 'erase';

interface ToolDef {
  tool: EditorTool;
  label: string;
  icon: string;
  title: string;
}

const tools: ToolDef[] = [
  { tool: 'horizontal-2', label: '═2', icon: '═', title: 'Horizontal block, size 2' },
  { tool: 'horizontal-3', label: '═3', icon: '═', title: 'Horizontal block, size 3' },
  { tool: 'vertical-2', label: '║2', icon: '║', title: 'Vertical block, size 2' },
  { tool: 'vertical-3', label: '║3', icon: '║', title: 'Vertical block, size 3' },
  { tool: 'goal', label: '🎯', icon: '🎯', title: 'Set goal block' },
  { tool: 'erase', label: '🗑', icon: '🗑', title: 'Erase block' },
];

const BOARD_SIZE = 6;

function parseTool(tool: EditorTool): { orientation: Orientation; size: BlockSize } | null {
  if (tool === 'horizontal-2') return { orientation: 'horizontal', size: 2 };
  if (tool === 'horizontal-3') return { orientation: 'horizontal', size: 3 };
  if (tool === 'vertical-2') return { orientation: 'vertical', size: 2 };
  if (tool === 'vertical-3') return { orientation: 'vertical', size: 3 };
  return null;
}

export function PuzzleEditor({ blocks, onBlocksChange, cellSize = 64 }: PuzzleEditorProps) {
  const [selectedTool, setSelectedTool] = useState<EditorTool>('horizontal-2');
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(null);

  const hasGoal = useMemo(() => blocks.some((b) => b.isGoal), [blocks]);

  // Compute hover preview cells
  const previewCells = useMemo(() => {
    if (!hoverCell) return undefined;
    const parsed = parseTool(selectedTool);
    if (!parsed) return undefined;

    const { orientation, size } = parsed;
    const { row, col } = hoverCell;

    // Check bounds
    if (orientation === 'horizontal' && col + size > BOARD_SIZE) return undefined;
    if (orientation === 'vertical' && row + size > BOARD_SIZE) return undefined;

    // Check overlap with existing blocks
    const occupied = getOccupiedSet(blocks);
    const cells: Array<{ row: number; col: number }> = [];
    for (let i = 0; i < size; i++) {
      const r = orientation === 'horizontal' ? row : row + i;
      const c = orientation === 'horizontal' ? col + i : col;
      if (occupied.has(`${r},${c}`)) return undefined;
      cells.push({ row: r, col: c });
    }
    return cells;
  }, [hoverCell, selectedTool, blocks]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (selectedTool === 'goal') {
        // Find the block at this cell
        const blockId = findBlockAt(blocks, row, col);
        if (blockId === null) return;
        const newBlocks = blocks.map((b) => ({
          ...b,
          isGoal: b.id === blockId,
        }));
        onBlocksChange(newBlocks);
        return;
      }

      if (selectedTool === 'erase') {
        const blockId = findBlockAt(blocks, row, col);
        if (blockId === null) return;
        let newBlocks = blocks.filter((b) => b.id !== blockId);
        // If the erased block was the goal, make the first remaining block the goal
        const wasGoal = blocks.find((b) => b.id === blockId)?.isGoal;
        if (wasGoal && newBlocks.length > 0 && !newBlocks.some((b) => b.isGoal)) {
          newBlocks = newBlocks.map((b, i) => (i === 0 ? { ...b, isGoal: true } : b));
        }
        onBlocksChange(newBlocks);
        return;
      }

      // Block placement tools
      const parsed = parseTool(selectedTool);
      if (!parsed) return;

      const { orientation, size } = parsed;

      // Check bounds
      if (orientation === 'horizontal' && col + size > BOARD_SIZE) return;
      if (orientation === 'vertical' && row + size > BOARD_SIZE) return;

      // Check overlap
      const occupied = getOccupiedSet(blocks);
      for (let i = 0; i < size; i++) {
        const r = orientation === 'horizontal' ? row : row + i;
        const c = orientation === 'horizontal' ? col + i : col;
        if (occupied.has(`${r},${c}`)) return;
      }

      // Assign new ID
      const maxId = blocks.reduce((max, b) => Math.max(max, b.id), 0);
      const newId = blocks.length === 0 ? 1 : maxId + 1;

      const newBlock: Block = {
        id: newId,
        orientation,
        size,
        row,
        col,
        isGoal: blocks.length === 0, // first block is goal by default
      };

      onBlocksChange([...blocks, newBlock]);
    },
    [blocks, selectedTool, onBlocksChange]
  );

  const handleHoverCell = useCallback(
    (row: number, col: number) => {
      setHoverCell({ row, col });
    },
    []
  );

  const handleLeaveCell = useCallback(() => {
    setHoverCell(null);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Toolbar */}
      <div className="inline-flex rounded-lg border border-zinc-300 dark:border-zinc-600 overflow-hidden shadow-sm">
        {tools.map((t) => (
          <button
            key={t.tool}
            title={t.title}
            onClick={() => setSelectedTool(t.tool)}
            className={`
              px-3 py-2 text-sm font-medium transition-all border-r border-zinc-300 dark:border-zinc-600 last:border-r-0
              ${
                selectedTool === t.tool
                  ? 'bg-blue-600 text-white ring-1 ring-blue-600 scale-105 z-10'
                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }
            `}
          >
            <span className="flex items-center gap-1">
              <span className="text-base">{t.icon}</span>
              {t.tool !== 'goal' && t.tool !== 'erase' && (
                <span className="text-xs font-bold">
                  {t.tool.includes('2') ? '2' : '3'}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Board with hover preview */}
      <Board
        blocks={blocks}
        onClickCell={handleCellClick}
        onHoverCell={handleHoverCell}
        onLeaveCell={handleLeaveCell}
        cellSize={cellSize}
        animated
        previewCells={previewCells}
        previewBlockId={previewCells ? blocks.length + 1 : undefined}
      />

      {/* Block count + goal status */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">
          Blocks: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{blocks.length}</span>
        </span>
        <span className="text-zinc-400 dark:text-zinc-500">/</span>
        <span className="flex items-center gap-1">
          <span className="text-zinc-600 dark:text-zinc-400">Goal:</span>
          {hasGoal ? (
            <span className="text-green-600 dark:text-green-400 font-medium">&#10003;</span>
          ) : (
            <span className="text-amber-600 dark:text-amber-400 font-medium text-xs">
              Set goal!
            </span>
          )}
        </span>
      </div>

      {blocks.length > 0 && !hasGoal && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Click a block with the &#127919; tool to set it as the goal, or add a new block.
        </p>
      )}
    </div>
  );
}

/** Returns the block ID at a given cell, or null if empty */
function findBlockAt(blocks: Block[], row: number, col: number): number | null {
  for (const block of blocks) {
    for (let i = 0; i < block.size; i++) {
      const r = block.orientation === 'horizontal' ? block.row : block.row + i;
      const c = block.orientation === 'horizontal' ? block.col + i : block.col;
      if (r === row && c === col) return block.id;
    }
  }
  return null;
}

/** Returns a Set of "row,col" strings for all occupied cells */
function getOccupiedSet(blocks: Block[]): Set<string> {
  const set = new Set<string>();
  for (const block of blocks) {
    for (let i = 0; i < block.size; i++) {
      const r = block.orientation === 'horizontal' ? block.row : block.row + i;
      const c = block.orientation === 'horizontal' ? block.col + i : block.col;
      set.add(`${r},${c}`);
    }
  }
  return set;
}

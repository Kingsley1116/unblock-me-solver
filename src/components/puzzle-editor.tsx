"use client";

import React, { useState } from "react";
import { Block, Orientation, BlockSize } from "@/lib/types";
import { Board } from "./board";

interface PuzzleEditorProps {
  blocks: Block[];
  onBlocksChange: (blocks: Block[]) => void;
  cellSize?: number;
}

type EditorTool =
  | "horizontal-2"
  | "horizontal-3"
  | "vertical-2"
  | "vertical-3"
  | "goal"
  | "erase";

interface ToolDef {
  tool: EditorTool;
  label: string;
  icon: string;
  title: string;
}

const tools: ToolDef[] = [
  {
    tool: "horizontal-2",
    label: "H2",
    icon: "→",
    title: "Horizontal block, size 2",
  },
  {
    tool: "horizontal-3",
    label: "H3",
    icon: "→",
    title: "Horizontal block, size 3",
  },
  {
    tool: "vertical-2",
    label: "V2",
    icon: "↓",
    title: "Vertical block, size 2",
  },
  {
    tool: "vertical-3",
    label: "V3",
    icon: "↓",
    title: "Vertical block, size 3",
  },
  { tool: "goal", label: "", icon: "🚩", title: "Set goal block" },
  { tool: "erase", label: "", icon: "🗑️", title: "Erase block" },
];

const BOARD_SIZE = 6;

function parseTool(
  tool: EditorTool,
): { orientation: Orientation; size: BlockSize } | null {
  if (tool === "horizontal-2") return { orientation: "horizontal", size: 2 };
  if (tool === "horizontal-3") return { orientation: "horizontal", size: 3 };
  if (tool === "vertical-2") return { orientation: "vertical", size: 2 };
  if (tool === "vertical-3") return { orientation: "vertical", size: 3 };
  return null;
}

export function PuzzleEditor({
  blocks,
  onBlocksChange,
  cellSize = 64,
}: PuzzleEditorProps) {
  const [selectedTool, setSelectedTool] = useState<EditorTool>("horizontal-2");
  const [hoverCell, setHoverCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const hasGoal = blocks.some((b) => b.isGoal);

  // Compute hover preview cells
  const computePreviewCells = () => {
    if (!hoverCell) return undefined;
    const parsed = parseTool(selectedTool);
    if (!parsed) return undefined;

    const { orientation, size } = parsed;
    const { row, col } = hoverCell;

    // Check bounds
    if (orientation === "horizontal" && col + size > BOARD_SIZE)
      return undefined;
    if (orientation === "vertical" && row + size > BOARD_SIZE) return undefined;

    // Check overlap with existing blocks
    const occupied = getOccupiedSet(blocks);
    const cells: Array<{ row: number; col: number }> = [];
    for (let i = 0; i < size; i++) {
      const r = orientation === "horizontal" ? row : row + i;
      const c = orientation === "horizontal" ? col + i : col;
      if (occupied.has(`${r},${c}`)) return undefined;
      cells.push({ row: r, col: c });
    }
    return cells;
  };
  const previewCells = computePreviewCells();

  const handleCellClick = (row: number, col: number) => {
    if (selectedTool === "goal") {
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

    if (selectedTool === "erase") {
      const blockId = findBlockAt(blocks, row, col);
      if (blockId === null) return;
      let newBlocks = blocks.filter((b) => b.id !== blockId);
      // If the erased block was the goal, make the first remaining block the goal
      const wasGoal = blocks.find((b) => b.id === blockId)?.isGoal;
      if (wasGoal && newBlocks.length > 0 && !newBlocks.some((b) => b.isGoal)) {
        newBlocks = newBlocks.map((b, i) =>
          i === 0 ? { ...b, isGoal: true } : b,
        );
      }
      onBlocksChange(newBlocks);
      return;
    }

    // Block placement tools
    const parsed = parseTool(selectedTool);
    if (!parsed) return;

    const { orientation, size } = parsed;

    // Check bounds
    if (orientation === "horizontal" && col + size > BOARD_SIZE) return;
    if (orientation === "vertical" && row + size > BOARD_SIZE) return;

    // Check overlap
    const occupied = getOccupiedSet(blocks);
    for (let i = 0; i < size; i++) {
      const r = orientation === "horizontal" ? row : row + i;
      const c = orientation === "horizontal" ? col + i : col;
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
  };

  const handleHoverCell = (row: number, col: number) => {
    setHoverCell({ row, col });
  };

  const handleLeaveCell = () => {
    setHoverCell(null);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Toolbar */}
      <div className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-1 shadow-sm">
        {tools.map((t) => {
          const isActive = selectedTool === t.tool;
          return (
            <button
              key={t.tool}
              title={t.title}
              onClick={() => setSelectedTool(t.tool)}
              className={`
                px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer
                ${
                  isActive
                    ? "bg-amber-500 text-white shadow-md scale-105 z-10"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200"
                }
              `}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-base leading-none">{t.icon}</span>
                {t.label && <span>{t.label}</span>}
              </span>
            </button>
          );
        })}
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

      {/* Status bar: block count + goal indicator */}
      <div className="flex items-center gap-3 text-sm">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium border border-stone-200 dark:border-stone-700">
          <span className="text-base leading-none">🧱</span>
          <span className="font-semibold">{blocks.length}</span>
          <span className="text-stone-400 dark:text-stone-500 font-normal">
            block{blocks.length !== 1 ? "s" : ""}
          </span>
        </span>
        {hasGoal ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <span className="text-base leading-none">&#10003;</span>
            <span>Goal set</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <span className="text-base leading-none">&#9888;</span>
            <span>No goal</span>
          </span>
        )}
      </div>

      {/* Empty state hint */}
      {blocks.length === 0 && (
        <p className="text-sm text-stone-400 dark:text-stone-500 text-center">
          Select a tool and click the board to place blocks
        </p>
      )}
    </div>
  );
}

/** Returns the block ID at a given cell, or null if empty */
function findBlockAt(blocks: Block[], row: number, col: number): number | null {
  for (const block of blocks) {
    for (let i = 0; i < block.size; i++) {
      const r = block.orientation === "horizontal" ? block.row : block.row + i;
      const c = block.orientation === "horizontal" ? block.col + i : block.col;
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
      const r = block.orientation === "horizontal" ? block.row : block.row + i;
      const c = block.orientation === "horizontal" ? block.col + i : block.col;
      set.add(`${r},${c}`);
    }
  }
  return set;
}

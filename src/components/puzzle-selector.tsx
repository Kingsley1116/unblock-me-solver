"use client";

import React from "react";
import { Puzzle, Block } from "@/lib/types";
import { presets } from "@/lib/presets";
import { getBlockColor } from "./color-utils";

interface PuzzleSelectorProps {
  onSelectPuzzle: (puzzle: Puzzle, index: number) => void;
  onClear: () => void;
  selectedIndex?: number;
}

const difficultyConfig: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  easy: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800/50",
    label: "Easy",
  },
  medium: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800/50",
    label: "Medium",
  },
  hard: {
    bg: "bg-rose-100 dark:bg-rose-900/30",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800/50",
    label: "Hard",
  },
};

/**
 * Build a 6×6 grid representation of a puzzle.
 * Each cell holds the block ID that occupies it, or 0 for empty.
 */
function buildBoardGrid(blocks: Block[]): number[][] {
  const grid: number[][] = Array.from({ length: 6 }, () => Array(6).fill(0));
  for (const block of blocks) {
    for (let i = 0; i < block.size; i++) {
      const r = block.orientation === "horizontal" ? block.row : block.row + i;
      const c = block.orientation === "horizontal" ? block.col + i : block.col;
      if (r >= 0 && r < 6 && c >= 0 && c < 6) {
        grid[r][c] = block.id;
      }
    }
  }
  return grid;
}

/** Map block ID to a Tailwind background color class for the thumbnail dot. */
function getDotColor(blockId: number, blocks: Block[]): string {
  const block = blocks.find((b) => b.id === blockId);
  if (!block) return "bg-transparent";
  const colorClass = getBlockColor(block.id, block.isGoal);
  // getBlockColor returns classes like 'bg-red-500' — extract the color name
  const match = colorClass.match(/^bg-(\S+)$/);
  if (!match) return "bg-stone-400";
  const colorName = match[1].split("-")[0];
  // Use a richer shade for thumbnails — 500 in light, 400 in dark
  return `bg-${colorName}-500 dark:bg-${colorName}-400`;
}

function MiniBoard({ puzzle }: { puzzle: Puzzle }) {
  const grid = buildBoardGrid(puzzle.blocks);
  const dotColors = (() => {
    const map = new Map<number, string>();
    for (const block of puzzle.blocks) {
      map.set(block.id, getDotColor(block.id, puzzle.blocks));
    }
    map.set(0, "bg-stone-200 dark:bg-stone-700");
    return map;
  })();

  return (
    <div
      className="grid shrink-0 rounded-md overflow-hidden"
      style={{
        gridTemplateColumns: "repeat(6, 8px)",
        gridTemplateRows: "repeat(6, 8px)",
        gap: "2px",
        width: "58px",
        height: "58px",
      }}
    >
      {grid.flat().map((cellId, i) => (
        <div
          key={i}
          className={`rounded-[1.5px] ${dotColors.get(cellId) ?? "bg-stone-200 dark:bg-stone-700"}`}
        />
      ))}
    </div>
  );
}

export function PuzzleSelector({
  onSelectPuzzle,
  onClear,
  selectedIndex,
}: PuzzleSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-4 w-full justify-center">
      <div className="flex gap-3 justify-center w-full flex-wrap">
        {presets.map((preset, index) => {
          const diff = difficultyConfig[preset.difficulty];
          const isSelected = selectedIndex === index;

          return (
            <button
              key={preset.name}
              onClick={() => onSelectPuzzle(preset, index)}
              className={`
                group relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2
                bg-white dark:bg-stone-900
                transition-all duration-200 ease-out
                min-w-[140px]
                hover:-translate-y-1
                ${
                  isSelected
                    ? "scale-[1.03] border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10"
                    : "border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-lg hover:shadow-stone-200/50 dark:hover:shadow-stone-900/50"
                }
              `}
            >
              {/* Mini board thumbnail */}
              <MiniBoard puzzle={preset} />

              {/* Puzzle name */}
              <span className="font-semibold text-sm text-stone-800 dark:text-stone-100">
                {preset.name}
              </span>

              {/* Difficulty badge */}
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${diff.bg} ${diff.text} ${diff.border}`}
              >
                {diff.label}
              </span>

              {/* Block count */}
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                {preset.blocks.length} blocks
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onClear}
        className="px-5 py-2 text-sm font-medium text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
      >
        Clear Board
      </button>
    </div>
  );
}

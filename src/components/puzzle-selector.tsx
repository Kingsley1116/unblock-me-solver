'use client';

import React from 'react';
import { Puzzle } from '@/lib/types';
import { presets } from '@/lib/presets';

interface PuzzleSelectorProps {
  onSelectPuzzle: (puzzle: Puzzle, index: number) => void;
  onClear: () => void;
  selectedIndex?: number;
}

const difficultyConfig: Record<string, { bg: string; text: string; border: string; darkBg: string; darkText: string }> = {
  easy: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    darkBg: 'dark:bg-green-900/40',
    darkText: 'dark:text-green-300',
  },
  medium: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    darkBg: 'dark:bg-yellow-900/40',
    darkText: 'dark:text-yellow-300',
  },
  hard: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    darkBg: 'dark:bg-red-900/40',
    darkText: 'dark:text-red-300',
  },
};

export function PuzzleSelector({ onSelectPuzzle, onClear, selectedIndex }: PuzzleSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md">
      <div className="flex gap-3 justify-center w-full flex-wrap">
        {presets.map((preset, index) => {
          const diff = difficultyConfig[preset.difficulty];
          const isSelected = selectedIndex === index;

          return (
            <button
              key={preset.name}
              onClick={() => onSelectPuzzle(preset, index)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-xl border-2
                bg-white dark:bg-zinc-800
                transition-all duration-200 ease-out
                min-w-[120px]
                hover:scale-[1.02] hover:shadow-lg
                ${
                  isSelected
                    ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/30 shadow-md'
                    : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md'
                }
              `}
            >
              <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                {preset.name}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border ${diff.bg} ${diff.text} ${diff.border} ${diff.darkBg} ${diff.darkText}`}
              >
                {preset.difficulty}
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {preset.blocks.length} blocks
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onClear}
        className="px-5 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-600 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
      >
        Clear Board
      </button>
    </div>
  );
}

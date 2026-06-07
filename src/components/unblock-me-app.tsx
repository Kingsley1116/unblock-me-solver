'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Block, Puzzle, Solution } from '@/lib/types';
import { solve } from '@/lib/solver';
import { Board } from '@/components/board';
import { PuzzleEditor } from '@/components/puzzle-editor';
import { PuzzleSelector } from '@/components/puzzle-selector';
import { SolutionPlayer } from '@/components/solution-player';

type AppMode = 'presets' | 'editor';

export function UnblockMeApp() {
  const [mode, setMode] = useState<AppMode>('presets');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [displayBlocks, setDisplayBlocks] = useState<Block[]>([]);
  const [highlightBlockId, setHighlightBlockId] = useState<number | undefined>();
  const [solvingError, setSolvingError] = useState<string | null>(null);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | undefined>();
  const [solvedInitialBlocks, setSolvedInitialBlocks] = useState<Block[]>([]);
  const [cellSize, setCellSize] = useState(64);

  // Responsive cell size
  useEffect(() => {
    const updateSize = () => {
      setCellSize(window.innerWidth < 640 ? 48 : 64);
    };
    updateSize();
    const mq = window.matchMedia('(max-width: 639px)');
    mq.addEventListener('change', updateSize);
    return () => mq.removeEventListener('change', updateSize);
  }, []);

  const handleSelectPuzzle = useCallback((puzzle: Puzzle, index: number) => {
    setBlocks(puzzle.blocks);
    setDisplayBlocks(puzzle.blocks);
    setSolution(null);
    setSolvingError(null);
    setSelectedPresetIndex(index);
    setMode('presets');
  }, []);

  const handleClear = useCallback(() => {
    setBlocks([]);
    setDisplayBlocks([]);
    setSolution(null);
    setSolvingError(null);
    setSelectedPresetIndex(undefined);
  }, []);

  const handleBlocksChange = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks);
    setDisplayBlocks(newBlocks);
    setSolution(null);
    setSolvingError(null);
    setSelectedPresetIndex(undefined);
  }, []);

  const handleSolve = useCallback(() => {
    if (blocks.length === 0) return;
    const goalBlock = blocks.find((b) => b.isGoal);
    if (!goalBlock) {
      setSolvingError('Set a goal block first');
      return;
    }

    setIsSolving(true);
    setSolvingError(null);
    const initial = [...blocks];
    setSolvedInitialBlocks(initial);

    // setTimeout to let the UI update before blocking solver
    setTimeout(() => {
      try {
        const puzzle: Puzzle = { name: 'Custom', difficulty: 'easy', blocks: initial };
        const result = solve(puzzle);
        if (result) {
          setSolution(result);
          setDisplayBlocks(initial);
          setHighlightBlockId(undefined);
        } else {
          setSolvingError('No solution found');
        }
      } catch (e) {
        setSolvingError(String(e));
      } finally {
        setIsSolving(false);
      }
    }, 50);
  }, [blocks]);

  const handleStepUpdate = useCallback(
    (newBlocks: Block[], _stepIndex: number, movedBlockId: number) => {
      setDisplayBlocks(newBlocks);
      setHighlightBlockId(movedBlockId > 0 ? movedBlockId : undefined);
    },
    []
  );

  const hasGoal = useMemo(() => blocks.some((b) => b.isGoal), [blocks]);

  return (
    <div className="flex flex-col items-center gap-6 p-4 sm:p-6 font-sans max-w-2xl mx-auto min-h-screen">
      {/* Header */}
      <header className="text-center mt-4 sm:mt-8">
        <div className="text-5xl mb-3">&#128666;</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Unblock Me Solver
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm sm:text-base max-w-md">
          Design a puzzle or pick a preset, then find the optimal solution with step-by-step visualization.
        </p>
      </header>

      {/* Mode tabs */}
      <div className="inline-flex rounded-lg border border-zinc-300 dark:border-zinc-600 overflow-hidden shadow-sm">
        <button
          onClick={() => setMode('presets')}
          className={`px-4 py-2 text-sm font-medium transition-all ${
            mode === 'presets'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
          }`}
        >
          Presets
        </button>
        <button
          onClick={() => setMode('editor')}
          className={`px-4 py-2 text-sm font-medium transition-all border-l border-zinc-300 dark:border-zinc-600 ${
            mode === 'editor'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
          }`}
        >
          Custom
        </button>
      </div>

      {/* Mode content */}
      {mode === 'presets' && (
        <PuzzleSelector
          onSelectPuzzle={handleSelectPuzzle}
          onClear={handleClear}
          selectedIndex={selectedPresetIndex}
        />
      )}

      {mode === 'editor' && (
        <PuzzleEditor
          blocks={blocks}
          onBlocksChange={handleBlocksChange}
          cellSize={cellSize}
        />
      )}

      {/* Solve button area */}
      {blocks.length > 0 && mode === 'presets' && (
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          {/* Board preview for presets */}
          <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-md p-4 sm:p-6">
            <Board
              blocks={displayBlocks}
              highlightBlockId={highlightBlockId}
              cellSize={cellSize}
              animated
            />
          </div>

          <button
            onClick={handleSolve}
            disabled={isSolving || blocks.length === 0}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            {isSolving ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Solving...
              </>
            ) : (
              'Solve Puzzle'
            )}
          </button>
          {solvingError && (
            <p className="text-red-500 dark:text-red-400 text-sm">{solvingError}</p>
          )}
        </div>
      )}

      {blocks.length > 0 && mode === 'editor' && (
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <button
            onClick={handleSolve}
            disabled={isSolving || blocks.length === 0 || !hasGoal}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            {isSolving ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Solving...
              </>
            ) : (
              'Solve Puzzle'
            )}
          </button>
          {solvingError && (
            <p className="text-red-500 dark:text-red-400 text-sm">{solvingError}</p>
          )}
          {!hasGoal && blocks.length > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Set a goal block to enable solving.
            </p>
          )}
        </div>
      )}

      {/* Solution display */}
      {solution && (
        <div className="w-full space-y-4 animate-fade-in">
          <div className="text-center">
            <p className="font-semibold text-lg text-zinc-800 dark:text-zinc-200">
              Solution: {solution.moves.length} move{solution.moves.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex justify-center">
            <div className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-md p-4 sm:p-6">
              <Board
                blocks={displayBlocks}
                highlightBlockId={highlightBlockId}
                cellSize={cellSize}
                animated
              />
            </div>
          </div>

          <SolutionPlayer
            solution={solution}
            initialBlocks={solvedInitialBlocks}
            onBlocksUpdate={handleStepUpdate}
          />
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
        Built with Next.js &mdash; Unblock Me (Rush Hour) puzzle solver
      </footer>
    </div>
  );
}


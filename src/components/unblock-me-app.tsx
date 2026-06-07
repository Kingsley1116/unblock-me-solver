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
    <div className="flex flex-col items-center gap-6 p-4 sm:p-6 font-sans max-w-2xl mx-auto min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header — no stagger delay, appears first */}
      <header className="text-center mt-4 sm:mt-8 animate-fade-in">
        <div className="text-5xl mb-3">&#x1F9E9;</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-linear-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">
          Unblock Me Solver
        </h1>
        <p className="text-stone-500 dark:text-stone-400 mt-2 text-sm sm:text-base max-w-md mx-auto">
          Design a puzzle or pick a preset, then find the optimal solution with step-by-step visualization.
        </p>
      </header>

      {/* Mode tabs — 100ms stagger delay */}
      <div
        className="inline-flex rounded-full bg-stone-100 dark:bg-stone-800 p-1 animate-fade-in"
        style={{ animationDelay: '100ms' }}
      >
        <button
          onClick={() => setMode('presets')}
          className={`px-5 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
            mode === 'presets'
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
              : 'bg-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          Presets
        </button>
        <button
          onClick={() => setMode('editor')}
          className={`px-5 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
            mode === 'editor'
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
              : 'bg-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
          }`}
        >
          Custom
        </button>
      </div>

      {/* Mode content — 200ms stagger delay */}
      <div className="w-full animate-fade-in" style={{ animationDelay: '200ms' }}>
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
      </div>

      {/* Solve button area — presets mode */}
      {blocks.length > 0 && mode === 'presets' && (
        <div
          className="flex flex-col items-center gap-3 w-full animate-fade-in"
          style={{ animationDelay: '250ms' }}
        >
          {/* Board preview */}
          <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md p-4 sm:p-6">
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
            className={`px-6 py-3 sm:px-8 sm:py-3.5 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 ${
              isSolving
                ? 'bg-linear-to-r from-amber-500 to-amber-600 animate-pulse'
                : 'bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
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
            <p className="text-rose-500 dark:text-rose-400 text-sm font-medium">
              {solvingError}
            </p>
          )}
        </div>
      )}

      {/* Solve button area — editor mode */}
      {blocks.length > 0 && mode === 'editor' && (
        <div
          className="flex flex-col items-center gap-3 w-full animate-fade-in"
          style={{ animationDelay: '250ms' }}
        >
          <button
            onClick={handleSolve}
            disabled={isSolving || blocks.length === 0 || !hasGoal}
            className={`px-6 py-3 sm:px-8 sm:py-3.5 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 ${
              isSolving
                ? 'bg-linear-to-r from-amber-500 to-amber-600 animate-pulse'
                : 'bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
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
            <p className="text-rose-500 dark:text-rose-400 text-sm font-medium">
              {solvingError}
            </p>
          )}
          {!hasGoal && blocks.length > 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Set a goal block to enable solving.
            </p>
          )}
        </div>
      )}

      {/* Solution display — staggered entrance with step-count badge */}
      {solution && (
        <div
          className="w-full space-y-5 animate-fade-in"
          style={{ animationDelay: '150ms' }}
          key={`solution-${solution.moves.length}`}
        >
          {/* Step count badge */}
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm font-semibold shadow-sm">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {solution.moves.length} move{solution.moves.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Board */}
          <div className="flex justify-center">
            <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-md p-4 sm:p-6">
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

      {/* Footer — last stagger element */}
      <footer
        className="mt-auto w-full py-6 text-center text-xs text-stone-400 dark:text-stone-500 border-t border-stone-200 dark:border-stone-800 animate-fade-in"
        style={{ animationDelay: '300ms' }}
      >
        Built with Next.js &mdash; Unblock Me (Rush Hour) puzzle solver
      </footer>
    </div>
  );
}

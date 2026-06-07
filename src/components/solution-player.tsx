'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Block, Move, Solution } from '@/lib/types';
import { applyMove } from '@/lib/solver';
import { getBlockName } from './color-utils';

interface SolutionPlayerProps {
  solution: Solution | null;
  initialBlocks: Block[];
  onBlocksUpdate: (blocks: Block[], stepIndex: number, movedBlockId: number) => void;
}

type Speed = 0.5 | 1 | 2 | 4;

const SPEED_MS: Record<Speed, number> = {
  0.5: 1000,
  1: 500,
  2: 250,
  4: 125,
};

const speedButtons: { label: string; speed: Speed }[] = [
  { label: '0.5x', speed: 0.5 },
  { label: '1x', speed: 1 },
  { label: '2x', speed: 2 },
  { label: '4x', speed: 4 },
];

function describeMove(blocks: Block[], move: Move): string {
  const block = blocks.find((b) => b.id === move.blockId);
  if (!block) return 'Move block';
  const name = getBlockName(block.id, block.isGoal);
  const dirName =
    move.direction === 'left'
      ? 'left'
      : move.direction === 'right'
        ? 'right'
        : move.direction === 'up'
          ? 'up'
          : 'down';
  const stepText = move.steps === 1 ? '1 cell' : `${move.steps} cells`;
  return `Move ${name} ${dirName} ${stepText}`;
}

export function SolutionPlayer({ solution, initialBlocks, onBlocksUpdate }: SolutionPlayerProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);

  // Precompute all intermediate states (derived data, no effects needed)
  const states = useMemo(() => {
    if (!solution) return [] as Block[][];
    const result: Block[][] = [initialBlocks];
    let current = initialBlocks;
    for (const move of solution.moves) {
      current = applyMove(current, move);
      result.push(current);
    }
    return result;
  }, [solution, initialBlocks]);

  // Refs for values accessed in interval / event callbacks
  const statesRef = useRef(states);
  statesRef.current = states;
  const initialBlocksRef = useRef(initialBlocks);
  initialBlocksRef.current = initialBlocks;
  const onBlocksUpdateRef = useRef(onBlocksUpdate);
  onBlocksUpdateRef.current = onBlocksUpdate;
  const solutionRef = useRef(solution);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Reset internal state and notify parent when solution changes.
  // The setState calls here are responding to a prop change (solution / initialBlocks),
  // which is the intended use case for resetting local state.
  useEffect(() => {
    const solutionChanged = solution !== solutionRef.current;
    const blocksChanged = initialBlocks !== initialBlocksRef.current;
    solutionRef.current = solution;
    initialBlocksRef.current = initialBlocks;

    if (solutionChanged || blocksChanged) {
      if (solution) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStepIndex(0);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsPlaying(false);
        onBlocksUpdateRef.current(initialBlocks, 0, -1);
      }
    }
  }, [solution, initialBlocks]);

  // Auto-play with interval
  useEffect(() => {
    if (!isPlaying) return;
    if (!solution || solution.moves.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsPlaying(false);
      return;
    }

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next > solution.moves.length) {
          // End of playback — stop playing
          setIsPlaying(false);
          return prev;
        }
        const currentStates = statesRef.current;
        const move = solution.moves[next - 1];
        if (currentStates[next]) {
          onBlocksUpdateRef.current(currentStates[next], next, move.blockId);
        }
        return next;
      });
    }, SPEED_MS[speed]);

    return () => clearInterval(interval);
  }, [isPlaying, speed, solution]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const currentSolution = solutionRef.current;
      const currentStates = statesRef.current;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setStepIndex((prev) => {
            const next = Math.max(0, prev - 1);
            if (next > 0 && currentSolution) {
              const move = currentSolution.moves[next - 1];
              if (move && currentStates[next]) {
                onBlocksUpdateRef.current(currentStates[next], next, move.blockId);
              }
            } else {
              onBlocksUpdateRef.current(initialBlocksRef.current, 0, -1);
            }
            return next;
          });
          break;
        case 'ArrowRight':
          e.preventDefault();
          setStepIndex((prev) => {
            if (!currentSolution) return prev;
            const next = Math.min(currentSolution.moves.length, prev + 1);
            if (next > 0) {
              const move = currentSolution.moves[next - 1];
              if (move && currentStates[next]) {
                onBlocksUpdateRef.current(currentStates[next], next, move.blockId);
              }
            }
            return next;
          });
          break;
        case ' ':
          e.preventDefault();
          if (!currentSolution) return;
          setStepIndex((prev) => {
            if (prev >= currentSolution.moves.length) {
              onBlocksUpdateRef.current(initialBlocksRef.current, 0, -1);
              setIsPlaying(true);
              return 0;
            }
            setIsPlaying((p) => !p);
            return prev;
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // stable — uses refs for current values

  const goToStep = useCallback(
    (targetIndex: number) => {
      if (!solution) return;
      const currentStates = statesRef.current;
      if (targetIndex < 0 || targetIndex > solution.moves.length) return;

      setStepIndex(targetIndex);
      if (targetIndex > 0) {
        const move = solution.moves[targetIndex - 1];
        onBlocksUpdateRef.current(currentStates[targetIndex], targetIndex, move.blockId);
      } else {
        onBlocksUpdateRef.current(initialBlocksRef.current, 0, -1);
      }
    },
    [solution]
  );

  const handleReset = useCallback(() => {
    goToStep(0);
    setIsPlaying(false);
  }, [goToStep]);

  const togglePlay = useCallback(() => {
    if (!solution) return;
    if (stepIndex >= solution.moves.length) {
      goToStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  }, [stepIndex, solution, goToStep]);

  if (!solution) return null;

  const totalSteps = solution.moves.length;
  const progress = totalSteps > 0 ? (stepIndex / totalSteps) * 100 : 100;
  const currentMove = stepIndex > 0 && stepIndex <= totalSteps
    ? solution.moves[stepIndex - 1]
    : null;

  // Move description computed from precomputed states (not refs)
  const moveDescription = currentMove
    ? describeMove(
        stepIndex > 1 ? states[stepIndex - 1] : initialBlocks,
        currentMove
      )
    : null;

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto animate-fade-in">
      {/* Progress bar */}
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Step {stepIndex} / {totalSteps}
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {totalSteps > 0 ? `${Math.round(progress)}%` : 'Done'}
          </span>
        </div>
        <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Move description */}
      {moveDescription && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400 italic animate-fade-in">
          {moveDescription}
        </p>
      )}
      {stepIndex === 0 && totalSteps > 0 && (
        <p className="text-sm text-zinc-400 dark:text-zinc-500 italic">
          Initial state &mdash; press play to start
        </p>
      )}
      {stepIndex === totalSteps && totalSteps > 0 && (
        <p className="text-sm text-green-600 dark:text-green-400 font-medium animate-fade-in">
          Solved! The red car can exit.
        </p>
      )}

      {/* Playback controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleReset}
          disabled={stepIndex === 0}
          className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Reset to start"
        >
          &#9198;
        </button>

        <button
          onClick={() => goToStep(stepIndex - 1)}
          disabled={stepIndex === 0}
          className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Previous step (← arrow key)"
        >
          &#9664;
        </button>

        <button
          onClick={togglePlay}
          className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-blue-600 text-white hover:bg-blue-700 transition-all min-w-[52px] shadow-sm"
          title={isPlaying ? 'Pause (space)' : 'Play (space)'}
        >
          {isPlaying ? (
            <span className="text-sm">&#9646;&#9646;</span>
          ) : (
            <span>&#9654;</span>
          )}
        </button>

        <button
          onClick={() => goToStep(stepIndex + 1)}
          disabled={stepIndex >= totalSteps}
          className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="Next step (→ arrow key)"
        >
          &#9654;
        </button>
      </div>

      {/* Speed selector */}
      <div className="flex items-center gap-1 text-xs">
        <span className="text-zinc-500 dark:text-zinc-400 mr-1">Speed:</span>
        {speedButtons.map((s) => (
          <button
            key={s.speed}
            onClick={() => setSpeed(s.speed)}
            className={`px-2 py-1 rounded border transition-all ${
              speed === s.speed
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Keyboard shortcuts hint */}
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Keyboard: &#8592; &#8594; to step, Space to play/pause
      </p>
    </div>
  );
}

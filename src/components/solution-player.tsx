"use client";

import React, { useState, useEffect, useRef } from "react";
import { Block, Solution } from "@/lib/types";
import { applyMove } from "@/lib/solver";
import { getBlockName } from "./color-utils";

interface SolutionPlayerProps {
  solution: Solution | null;
  initialBlocks: Block[];
  onBlocksUpdate: (
    blocks: Block[],
    stepIndex: number,
    movedBlockId: number,
  ) => void;
}

type Speed = 0.25 | 0.5 | 1 | 2 | 4;

const SPEED_MS: Record<Speed, number> = {
  0.25: 3200,
  0.5: 1600,
  1: 800,
  2: 400,
  4: 200,
};

const speedOptions: { label: string; speed: Speed }[] = [
  { label: "0.25x", speed: 0.25 },
  { label: "0.5x", speed: 0.5 },
  { label: "1x", speed: 1 },
  { label: "2x", speed: 2 },
  { label: "4x", speed: 4 },
];

const DIRECTION_ARROW: Record<string, string> = {
  left: "←",
  right: "→",
  up: "↑",
  down: "↓",
};

const CONFETTI_COLORS = [
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
];

export function SolutionPlayer({
  solution,
  initialBlocks,
  onBlocksUpdate,
}: SolutionPlayerProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);

  // Precompute all intermediate states (derived data)
  const states = (() => {
    if (!solution) return [] as Block[][];
    const result: Block[][] = [initialBlocks];
    let current = initialBlocks;
    for (const move of solution.moves) {
      current = applyMove(current, move);
      result.push(current);
    }
    return result;
  })();

  // Refs for stale-closure avoidance in interval / keyboard callbacks
  const statesRef = useRef<Block[][]>([]);
  const initialBlocksRef = useRef<Block[]>(initialBlocks);
  const onBlocksUpdateRef = useRef(onBlocksUpdate);
  const solutionRef = useRef<Solution | null>(null);
  const isPlayingRef = useRef(false);

  // Sync refs (must be in an effect per React Compiler rules)
  useEffect(() => {
    statesRef.current = states;
    initialBlocksRef.current = initialBlocks;
    onBlocksUpdateRef.current = onBlocksUpdate;
    solutionRef.current = solution;
    isPlayingRef.current = isPlaying;
  });

  // Detect solution / initialBlocks change and reset internal state
  const prevSolutionRef = useRef<Solution | null>(null);
  const prevInitialBlocksRef = useRef<Block[]>(initialBlocks);

  useEffect(() => {
    const solutionChanged = solution !== prevSolutionRef.current;
    const blocksChanged = initialBlocks !== prevInitialBlocksRef.current;
    prevSolutionRef.current = solution;
    prevInitialBlocksRef.current = initialBlocks;

    if ((solutionChanged || blocksChanged) && solution) {
      // Resetting internal state in response to prop change.
      setStepIndex(0);
      setIsPlaying(false);
      onBlocksUpdate(initialBlocks, 0, -1);
    }
  }, [solution, initialBlocks, onBlocksUpdate]);

  // Auto-play with interval
  useEffect(() => {
    if (!isPlaying) return;
    if (!solution || solution.moves.length === 0) {
      // Edge case: solution cleared while playing. Must sync isPlaying state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsPlaying(false);
      return;
    }

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next > solution.moves.length) {
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

  // Keyboard shortcuts (stable effect — reads values from refs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const curSolution = solutionRef.current;
      const curStates = statesRef.current;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          setStepIndex((prev) => {
            const next = Math.max(0, prev - 1);
            if (next > 0 && curSolution) {
              const move = curSolution.moves[next - 1];
              if (move && curStates[next]) {
                onBlocksUpdateRef.current(curStates[next], next, move.blockId);
              }
            } else {
              onBlocksUpdateRef.current(initialBlocksRef.current, 0, -1);
            }
            return next;
          });
          break;
        case "ArrowRight":
          e.preventDefault();
          setStepIndex((prev) => {
            if (!curSolution) return prev;
            const next = Math.min(curSolution.moves.length, prev + 1);
            if (next > 0) {
              const move = curSolution.moves[next - 1];
              if (move && curStates[next]) {
                onBlocksUpdateRef.current(curStates[next], next, move.blockId);
              }
            }
            return next;
          });
          break;
        case " ":
          e.preventDefault();
          if (!curSolution) return;
          setStepIndex((prev) => {
            if (prev >= curSolution.moves.length) {
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

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const goToStep = (targetIndex: number) => {
    if (!solution) return;
    const curStates = statesRef.current;
    if (targetIndex < 0 || targetIndex > solution.moves.length) return;

    setStepIndex(targetIndex);
    if (targetIndex > 0) {
      const move = solution.moves[targetIndex - 1];
      onBlocksUpdateRef.current(
        curStates[targetIndex],
        targetIndex,
        move.blockId,
      );
    } else {
      onBlocksUpdateRef.current(initialBlocksRef.current, 0, -1);
    }
  };

  const handleReset = () => {
    goToStep(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!solution) return;
    if (stepIndex >= solution.moves.length) {
      goToStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((p) => !p);
    }
  };

  if (!solution) return null;

  const totalSteps = solution.moves.length;
  const progress = totalSteps > 0 ? (stepIndex / totalSteps) * 100 : 100;
  const isComplete = stepIndex === totalSteps && totalSteps > 0;
  const currentMove =
    stepIndex > 0 && stepIndex <= totalSteps
      ? solution.moves[stepIndex - 1]
      : null;

  // Compute move description from precomputed states (not from refs)
  const moveDescription = currentMove
    ? (() => {
        const prevBlocks =
          stepIndex > 1 ? states[stepIndex - 1] : initialBlocks;
        const block = prevBlocks.find((b) => b.id === currentMove.blockId);
        if (!block) return null;
        const name = getBlockName(block.id, block.isGoal);
        const arrow =
          DIRECTION_ARROW[currentMove.direction] ?? currentMove.direction;
        const stepText =
          currentMove.steps === 1 ? "1 cell" : `${currentMove.steps} cells`;
        return {
          name,
          arrow,
          stepText,
          blockId: currentMove.blockId,
          isGoal: block.isGoal,
        };
      })()
    : null;

  // Generate confetti pieces deterministically from step count
  const confettiPieces = (() => {
    const pieces: {
      left: string;
      color: string;
      delay: string;
      animClass: string;
    }[] = [];
    for (let i = 0; i < 30; i++) {
      const left = `${(i * 37 + 11) % 100}%`;
      const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      const delay = `${(i * 0.07).toFixed(2)}s`;
      const animClass = `confetti-${(i % 3) + 1}`;
      pieces.push({ left, color, delay, animClass });
    }
    return pieces;
  })();

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto animate-fade-in">
      {/* Progress bar */}
      <div className="w-full space-y-1.5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-600 dark:text-stone-400 tabular-nums">
              {stepIndex} / {totalSteps}
            </span>
            {isPlaying && (
              <span className="relative flex h-2 w-2">
                <span className="animate-auto-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
            )}
          </div>
          <span className="text-xs text-stone-400 dark:text-stone-500 tabular-nums">
            {totalSteps > 0 ? `${Math.round(progress)}%` : "Done"}
          </span>
        </div>
        <div className="relative w-full h-2.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-amber-400 to-amber-600 ${
              isPlaying ? "animate-shimmer" : ""
            }`}
            style={{
              width: `${progress}%`,
              backgroundImage: isPlaying
                ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%), linear-gradient(to right, #f59e0b, #d97706)"
                : undefined,
            }}
          />
          {/* Step marker dots */}
          {totalSteps > 0 && totalSteps <= 20 && (
            <div className="absolute inset-0 flex items-center pointer-events-none">
              {Array.from({ length: totalSteps }, (_, i) => {
                const dotPos = ((i + 1) / totalSteps) * 100;
                return (
                  <div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-white dark:bg-stone-300 transition-all duration-200"
                    style={{
                      left: `calc(${dotPos}% - 2px)`,
                      opacity: (i + 1) / totalSteps <= progress / 100 ? 1 : 0.3,
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Move description */}
      {moveDescription && (
        <div
          key={stepIndex}
          className="animate-slide-up-fade inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-stone-700 dark:text-stone-200"
        >
          <span
            className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-bold ${
              moveDescription.isGoal ? "bg-red-500" : "bg-amber-500"
            }`}
          >
            {moveDescription.blockId}
          </span>
          <span className="text-stone-500 dark:text-stone-400">
            {moveDescription.name}
          </span>
          <span className="text-amber-600 dark:text-amber-400 text-base leading-none">
            {moveDescription.arrow}
          </span>
          <span className="text-stone-500 dark:text-stone-400">
            {moveDescription.stepText}
          </span>
        </div>
      )}
      {stepIndex === 0 && totalSteps > 0 && (
        <div className="animate-slide-up-fade inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400">
          Initial state &mdash; press play to start
        </div>
      )}

      {/* Completion celebration */}
      {isComplete && (
        <div className="relative w-full">
          {/* Confetti */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ height: "120px", top: "-10px" }}
          >
            {confettiPieces.map((piece, i) => (
              <div
                key={i}
                className={`confetti-piece ${piece.animClass}`}
                style={{
                  left: piece.left,
                  backgroundColor: piece.color,
                  animationDelay: piece.delay,
                }}
              />
            ))}
          </div>
          {/* Success banner */}
          <div className="animate-scale-in flex flex-col items-center gap-1 py-3 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <span className="text-2xl">&#127881;</span>
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Puzzle Solved!
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400">
              Completed in {totalSteps} {totalSteps === 1 ? "move" : "moves"}
            </span>
          </div>
        </div>
      )}

      {/* Control panel */}
      <div className="w-full rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-3 py-2.5 gap-1.5">
          {/* Navigation controls */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleReset}
              disabled={stepIndex === 0}
              className="p-2 rounded-lg text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all"
              title="Reset to start"
              aria-label="Reset to start"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
              </svg>
            </button>

            <button
              onClick={() => goToStep(stepIndex - 1)}
              disabled={stepIndex === 0}
              className="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all"
              title="Previous step (← arrow key)"
              aria-label="Previous step"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                />
              </svg>
            </button>

            <button
              onClick={togglePlay}
              className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all min-w-[36px] flex items-center justify-center"
              title={isPlaying ? "Pause (space)" : "Play (space)"}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M5 3.5h2v9H5v-9zm4 0h2v9H9v-9z" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 ml-0.5"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                </svg>
              )}
            </button>

            <button
              onClick={() => goToStep(stepIndex + 1)}
              disabled={stepIndex >= totalSteps}
              className="p-2 rounded-lg text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all"
              title="Next step (→ arrow key)"
              aria-label="Next step"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                />
              </svg>
            </button>
          </div>

          {/* Speed selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              Speed
            </span>
            <div className="flex rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
              {speedOptions.map((s) => (
                <button
                  key={s.speed}
                  onClick={() => setSpeed(s.speed)}
                  className={`px-2 py-1 text-xs font-medium transition-all ${
                    speed === s.speed
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-transparent text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard hints */}
      <p className="text-md text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
        <kbd className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded text-[10px] font-mono bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-stone-500 dark:text-stone-400">
          &#8592;
        </kbd>
        <kbd className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded text-[10px] font-mono bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-stone-500 dark:text-stone-400">
          &#8594;
        </kbd>
        <span className="text-stone-400 dark:text-stone-500">to step,</span>
        <kbd className="inline-flex items-center justify-center h-4 min-w-[20px] px-1 rounded text-[10px] font-mono bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-stone-500 dark:text-stone-400">
          Space
        </kbd>
        <span className="text-stone-400 dark:text-stone-500">
          to play/pause
        </span>
      </p>
    </div>
  );
}

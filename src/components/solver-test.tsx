'use client';

import { useState, useMemo } from 'react';
import { solve } from '@/lib/solver';
import { presets } from '@/lib/presets';

type TestResult = { name: string; moves: number | null; time: number; error?: string };

function difficultyBadge(difficulty: string) {
  switch (difficulty) {
    case 'easy':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Easy
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/40 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Medium
        </span>
      );
    case 'hard':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/40 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Hard
        </span>
      );
    default:
      return null;
  }
}

function performanceBarColor(time: number) {
  if (time < 100) return 'bg-emerald-500';
  if (time < 500) return 'bg-amber-500';
  return 'bg-rose-500';
}

function performanceLabel(time: number) {
  if (time < 100) return 'text-emerald-600 dark:text-emerald-400';
  if (time < 500) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

export function SolverTest() {
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);

  const runTests = () => {
    setRunning(true);
    // Use setTimeout to let UI update before blocking
    setTimeout(() => {
      const results = presets.map((preset) => {
        const start = performance.now();
        try {
          const solution = solve(preset);
          const time = performance.now() - start;
          return { name: preset.name, moves: solution?.moves.length ?? null, time };
        } catch (e) {
          const time = performance.now() - start;
          return { name: preset.name, moves: null, time, error: String(e) };
        }
      });
      setResults(results);
      setRunning(false);
    }, 50);
  };

  const stats = useMemo(() => {
    if (!results) return null;
    const succeeded = results.filter((r) => !r.error);
    const failed = results.filter((r) => r.error);
    const avgTime =
      succeeded.length > 0
        ? succeeded.reduce((sum, r) => sum + r.time, 0) / succeeded.length
        : 0;
    const totalMoves = succeeded.reduce(
      (sum, r) => sum + (r.moves ?? 0),
      0
    );
    return { total: results.length, succeeded: succeeded.length, failed: failed.length, avgTime, totalMoves };
  }, [results]);

  const maxTime = useMemo(() => {
    if (!results) return 1;
    const times = results.filter((r) => !r.error).map((r) => r.time);
    return times.length > 0 ? Math.max(...times, 1) : 1;
  }, [results]);

  const presetMap = useMemo(() => {
    const map = new Map(presets.map((p) => [p.name, p]));
    return map;
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 p-4 sm:p-6 font-sans max-w-2xl mx-auto min-h-screen">
      {/* Header */}
      <header className="text-center mt-4 sm:mt-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Solver Test Suite
        </h1>
        <p className="text-stone-500 dark:text-stone-400 mt-2 text-sm sm:text-base max-w-md">
          Run all preset puzzles through the solver to verify correctness and
          measure performance.
        </p>
      </header>

      {/* Run button */}
      <button
        onClick={runTests}
        disabled={running}
        className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-white rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
      >
        {running ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Running tests...
          </>
        ) : (
          'Run Solver Tests'
        )}
      </button>

      {/* Results */}
      {results && stats && (
        <>
          {/* Stats summary */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                {stats.total}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Puzzles tested
              </div>
            </div>
            <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                {stats.succeeded}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Solved
              </div>
            </div>
            <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-amber-500">
                {stats.avgTime.toFixed(0)}ms
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Avg solve time
              </div>
            </div>
            <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm p-4 text-center">
              <div className="text-2xl font-bold text-emerald-500">
                {stats.totalMoves}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Total optimal moves
              </div>
            </div>
          </div>

          {/* Failures banner */}
          {stats.failed > 0 && (
            <div className="w-full rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4 text-center">
              <p className="text-rose-700 dark:text-rose-300 text-sm font-medium">
                {stats.failed} puzzle{stats.failed !== 1 ? 's' : ''} failed to
                solve
              </p>
            </div>
          )}

          {/* Results grid */}
          <div className="w-full space-y-3">
            {results.map((r) => {
              const preset = presetMap.get(r.name);
              return (
                <div
                  key={r.name}
                  className={`rounded-xl border shadow-sm p-4 sm:p-5 transition-all ${
                    r.error
                      ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-stone-800 dark:text-stone-100">
                        {r.name}
                      </h2>
                      {preset && difficultyBadge(preset.difficulty)}
                    </div>
                    {!r.error && (
                      <div className="text-3xl font-bold tabular-nums text-stone-900 dark:text-stone-100">
                        {r.moves}
                        <span className="text-sm font-normal text-stone-500 dark:text-stone-400 ml-1">
                          moves
                        </span>
                      </div>
                    )}
                  </div>

                  {r.error ? (
                    <p className="text-sm text-rose-700 dark:text-rose-300">
                      {r.error}
                    </p>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${performanceBarColor(r.time)}`}
                            style={{
                              width: `${Math.max((r.time / maxTime) * 100, 4)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span
                        className={`text-sm font-medium tabular-nums whitespace-nowrap ${performanceLabel(r.time)}`}
                      >
                        {r.time.toFixed(0)}ms
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-xs text-stone-400 dark:text-stone-600">
        Built with Next.js &mdash; Unblock Me (Rush Hour) puzzle solver
      </footer>
    </div>
  );
}

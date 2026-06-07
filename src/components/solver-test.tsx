'use client';

import { useState } from 'react';
import { solve } from '@/lib/solver';
import { presets } from '@/lib/presets';

export function SolverTest() {
  const [results, setResults] = useState<Array<{ name: string; moves: number | null; time: number; error?: string }> | null>(null);
  const [running, setRunning] = useState(false);

  const runTests = () => {
    setRunning(true);
    // Use setTimeout to let UI update before blocking
    setTimeout(() => {
      const results = presets.map(preset => {
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

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Unblock Me Solver — Test Page</h1>
      <button
        onClick={runTests}
        disabled={running}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-6"
      >
        {running ? 'Solving...' : 'Run Solver Tests'}
      </button>
      {results && (
        <div className="space-y-3">
          {results.map(r => (
            <div key={r.name} className="p-4 border rounded-lg">
              <h2 className="font-semibold">{r.name}</h2>
              {r.error ? (
                <p className="text-red-600">Error: {r.error}</p>
              ) : (
                <>
                  <p>Optimal moves: <strong>{r.moves}</strong></p>
                  <p className="text-sm text-zinc-500">Solve time: {r.time.toFixed(0)}ms</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

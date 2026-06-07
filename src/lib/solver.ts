import { Puzzle, Solution, Move, Block, Board } from './types';

const GRID_SIZE = 6;

function blocksToBoard(blocks: Block[]): Board {
  const board: Board = Array.from({ length: GRID_SIZE }, () =>
    Array<number>(GRID_SIZE).fill(0)
  );

  for (const block of blocks) {
    const { id, orientation, size, row, col } = block;
    for (let i = 0; i < size; i++) {
      const r = orientation === 'vertical' ? row + i : row;
      const c = orientation === 'horizontal' ? col + i : col;
      board[r][c] = id;
    }
  }

  return board;
}

function generateMoves(blocks: Block[], board: Board): Move[] {
  const moves: Move[] = [];

  for (const block of blocks) {
    const { id, orientation, size, row, col } = block;

    if (orientation === 'horizontal') {
      // Left: try to slide left 1 or more cells
      const maxLeft = col;
      for (let steps = 1; steps <= maxLeft; steps++) {
        if (board[row][col - steps] === 0) {
          moves.push({ blockId: id, direction: 'left', steps });
        } else {
          break;
        }
      }

      // Right: try to slide right 1 or more cells
      const rightEdge = col + size - 1;
      const maxRight = GRID_SIZE - 1 - rightEdge;
      for (let steps = 1; steps <= maxRight; steps++) {
        if (board[row][rightEdge + steps] === 0) {
          moves.push({ blockId: id, direction: 'right', steps });
        } else {
          break;
        }
      }
    } else {
      // Vertical
      // Up: try to slide up 1 or more cells
      const maxUp = row;
      for (let steps = 1; steps <= maxUp; steps++) {
        if (board[row - steps][col] === 0) {
          moves.push({ blockId: id, direction: 'up', steps });
        } else {
          break;
        }
      }

      // Down: try to slide down 1 or more cells
      const bottomEdge = row + size - 1;
      const maxDown = GRID_SIZE - 1 - bottomEdge;
      for (let steps = 1; steps <= maxDown; steps++) {
        if (board[bottomEdge + steps][col] === 0) {
          moves.push({ blockId: id, direction: 'down', steps });
        } else {
          break;
        }
      }
    }
  }

  return moves;
}

export function applyMove(blocks: Block[], move: Move): Block[] {
  const { blockId, direction, steps } = move;

  return blocks.map((block) => {
    if (block.id !== blockId) {
      return block;
    }

    const updated = { ...block };
    switch (direction) {
      case 'left':
        updated.col = block.col - steps;
        break;
      case 'right':
        updated.col = block.col + steps;
        break;
      case 'up':
        updated.row = block.row - steps;
        break;
      case 'down':
        updated.row = block.row + steps;
        break;
    }
    return updated;
  });
}

function hashState(blocks: Block[]): string {
  const sorted = [...blocks].sort((a, b) => a.id - b.id);
  return sorted.map((b) => `${b.id}:${b.row},${b.col}`).join('|');
}

function isGoalState(blocks: Block[]): boolean {
  const goalBlock = blocks.find((b) => b.isGoal);
  if (!goalBlock) return false;
  // Goal block is horizontal — its rightmost edge must be at column 5
  return goalBlock.col + goalBlock.size - 1 === GRID_SIZE - 1;
}

function reconstructPath(
  parentMap: Map<string, { prevHash: string | null; move: Move }>,
  finalHash: string
): Solution {
  const moves: Move[] = [];
  let currentHash: string | null = finalHash;

  while (currentHash !== null) {
    const entry = parentMap.get(currentHash);
    if (!entry) break;
    if (entry.prevHash === null) break; // reached the initial state, no move to record
    moves.push(entry.move);
    currentHash = entry.prevHash;
  }

  moves.reverse();
  return { moves };
}

export function solve(puzzle: Puzzle): Solution | null {
  const initialBlocks = puzzle.blocks;
  const initialHash = hashState(initialBlocks);

  const visited = new Set<string>();
  const parent = new Map<
    string,
    { prevHash: string | null; move: Move }
  >();

  visited.add(initialHash);
  // Dummy entry for the initial state — reconstructed path stops when prevHash is null
  parent.set(initialHash, {
    prevHash: null,
    move: { blockId: -1, direction: 'right', steps: 0 },
  });

  const queue: Block[][] = [initialBlocks];
  let head = 0;

  while (head < queue.length) {
    const state = queue[head++];
    const stateHash = hashState(state);

    if (isGoalState(state)) {
      return reconstructPath(parent, stateHash);
    }

    const board = blocksToBoard(state);
    const moves = generateMoves(state, board);

    for (const move of moves) {
      const newState = applyMove(state, move);
      const newHash = hashState(newState);

      if (!visited.has(newHash)) {
        visited.add(newHash);
        parent.set(newHash, { prevHash: stateHash, move });
        queue.push(newState);
      }
    }
  }

  return null;
}

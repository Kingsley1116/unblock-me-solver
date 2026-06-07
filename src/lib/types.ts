export type Direction = 'left' | 'right' | 'up' | 'down';
export type Orientation = 'horizontal' | 'vertical';
export type BlockSize = 2 | 3;

export interface Block {
  id: number;
  orientation: Orientation;
  size: BlockSize;
  row: number;
  col: number;
  isGoal: boolean;
}

export interface Puzzle {
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  blocks: Block[];
}

export interface Move {
  blockId: number;
  direction: Direction;
  steps: number;
}

export interface Solution {
  moves: Move[];
}

export type Board = number[][];

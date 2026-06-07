import { Puzzle } from './types';

export const presets: Puzzle[] = [
  {
    name: 'Beginner',
    difficulty: 'easy',
    blocks: [
      { id: 1, orientation: 'horizontal', size: 2, row: 2, col: 1, isGoal: true },
      { id: 2, orientation: 'horizontal', size: 2, row: 0, col: 0, isGoal: false },
      { id: 3, orientation: 'vertical', size: 3, row: 1, col: 3, isGoal: false },
      { id: 4, orientation: 'horizontal', size: 2, row: 3, col: 0, isGoal: false },
    ],
  },
  {
    name: 'Intermediate',
    difficulty: 'medium',
    blocks: [
      { id: 1, orientation: 'horizontal', size: 2, row: 2, col: 0, isGoal: true },
      { id: 2, orientation: 'vertical', size: 2, row: 0, col: 2, isGoal: false },
      { id: 3, orientation: 'vertical', size: 2, row: 3, col: 2, isGoal: false },
      { id: 4, orientation: 'horizontal', size: 2, row: 0, col: 4, isGoal: false },
      { id: 5, orientation: 'horizontal', size: 2, row: 5, col: 0, isGoal: false },
      { id: 6, orientation: 'vertical', size: 3, row: 1, col: 4, isGoal: false },
      { id: 7, orientation: 'horizontal', size: 2, row: 4, col: 3, isGoal: false },
    ],
  },
  {
    name: 'Advanced',
    difficulty: 'hard',
    blocks: [
      { id: 1, orientation: 'horizontal', size: 2, row: 2, col: 0, isGoal: true },
      { id: 2, orientation: 'horizontal', size: 2, row: 0, col: 0, isGoal: false },
      { id: 3, orientation: 'horizontal', size: 3, row: 0, col: 3, isGoal: false },
      { id: 4, orientation: 'vertical', size: 2, row: 1, col: 5, isGoal: false },
      { id: 5, orientation: 'vertical', size: 2, row: 4, col: 3, isGoal: false },
      { id: 6, orientation: 'vertical', size: 3, row: 0, col: 2, isGoal: false },
      { id: 7, orientation: 'horizontal', size: 3, row: 4, col: 0, isGoal: false },
      { id: 8, orientation: 'horizontal', size: 2, row: 3, col: 3, isGoal: false },
      { id: 9, orientation: 'vertical', size: 2, row: 4, col: 5, isGoal: false },
      { id: 10, orientation: 'horizontal', size: 2, row: 5, col: 1, isGoal: false },
    ],
  },
];

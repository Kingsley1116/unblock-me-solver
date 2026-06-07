# Unblock Me Solver —— Sliding Puzzle Solver

<p align="center">
  <a href="./README.zh-Hans.md">简体中文</a> •
  <a href="./README.zh-Hant.md">繁體中文</a> •
  <a href="./README.zh-yue.md">粵語</a> •
  <a href="./README.ja.md">日本語</a>
</p>

A Web-based sliding puzzle ([Rush Hour](<https://en.wikipedia.org/wiki/Rush_Hour_(puzzle)>)) optimal solver that utilizes the Breadth-First Search (BFS) algorithm to calculate the optimal solution with the minimum number of moves.

## Features

- **Optimal Solver**: Utilizes the Breadth-First Search (BFS) algorithm, guaranteeing to find the optimal solution with the fewest moves.
- **Built-in Preset Puzzles**: Provides pre-configured levels across three difficulty settings—Beginner, Intermediate, and Advanced—allowing quick experience without manual setup.
- **Custom Puzzle Editor**: Supports free placement of horizontal and vertical blocks (size 2 or 3) and marking the target block (red) to design your own custom levels.
- **Animated Solution Player**: Visualizes the solving process step-by-step, supporting play/pause, speed adjustment (0.5x to 4x), and keyboard shortcuts (`←` `→` for step-by-step movement, `Space` for play/pause). The progress bar displays the current step and annotates the block number, direction, and distance for each move.
- **Completion Effects**: Displays a colorful confetti animation to celebrate when a puzzle is successfully solved.
- **Dark Mode**: Automatically adapts to system settings via `prefers-color-scheme`, supporting both light and dark themes.
- **Responsive Design**: Optimized for both desktop and mobile devices, providing an excellent experience across various screen sizes.

## Tech Stack

| Technology                                   | Version | Purpose               |
| -------------------------------------------- | ------- | --------------------- |
| [Next.js](https://nextjs.org)                | 16.2.7  | Application Framework |
| [React](https://react.dev)                   | 19.2.4  | UI Framework          |
| [Tailwind CSS](https://tailwindcss.com)      | 4       | Styling & Design      |
| [TypeScript](https://www.typescriptlang.org) | 5       | Type Safety           |

## Quick Start

### Prerequisites

- Node.js 18 or higher

### Installation & Execution

```bash
# Clone the repository
git clone https://github.com/kingsley1116/unblock-me-solver.git
cd unblock-me-solver

# Install dependencies
npm install

# Start the development server
npm run dev

```

Open your browser and navigate to [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to use the application.

### Build for Production

```bash
npm run build
npm start

```

## How It Works

### Breadth-First Search (BFS)

The solver uses the Breadth-First Search (BFS) algorithm. Starting from the initial board configuration, it explores all possible moves level by level, ensuring that the first solution found is the one with the minimum number of moves.

#### Core Process

1. **State Encoding**: Encodes the positions of all blocks on the board into a unique string (formatted like `1:2,1|2:0,0|...`), which serves as the state hash.
2. **Visited Set**: Uses a `Set<string>` to keep track of already visited states, avoiding redundant searches of the same board configuration and preventing infinite loops.
3. **Move Generation**: For each board state, it iterates through all blocks, checks their allowed moving directions and distances, and generates all valid moves.
4. **Breadth-First Traversal**: Uses a queue to perform the BFS. The first time the target state is reached (where the right edge of the red block reaches the 6th column), it is confirmed as the optimal solution.
5. **Path Reconstruction**: Backtracks from the target state to the initial state using a parent map to reconstruct the complete sequence of moves.

#### Board Rules

- Board size: 6 × 6 grid.
- Block types: Horizontal (size 2 or 3) and vertical (size 2 or 3).
- Target block: A red horizontal block that must exit from the right side of the board (victory is achieved when the right edge of the block reaches the 6th column).
- Blocks can only slide along their own orientation; they cannot rotate or cross over other blocks.

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles (Tailwind + custom animations)
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page entry point
├── components/
│   ├── board.tsx            # Board rendering component
│   ├── color-utils.ts       # Block color utility functions
│   ├── puzzle-editor.tsx    # Custom puzzle editor
│   ├── puzzle-selector.tsx  # Preset puzzle selector
│   ├── solution-player.tsx  # Solution animation player
│   ├── solver-test.tsx      # Solver testing component
│   └── unblock-me-app.tsx   # Main application component
└── lib/
    ├── presets.ts           # Preset puzzle data
    ├── solver.ts            # BFS solver core logic
    └── types.ts             # TypeScript type definitions

```

## License

MIT.

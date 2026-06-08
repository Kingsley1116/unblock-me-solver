"use client";

import { Block } from "@/lib/types";
import { getBlockColor, getBlockGradient } from "./color-utils";

const BOARD_SIZE = 6;
const GAP = 3;
const PADDING = 3;

interface BoardProps {
  blocks: Block[];
  highlightBlockId?: number;
  onClickCell?: (row: number, col: number) => void;
  onHoverCell?: (row: number, col: number) => void;
  onLeaveCell?: () => void;
  cellSize?: number;
  animated?: boolean;
  previewCells?: Array<{ row: number; col: number }>;
  previewBlockId?: number;
}

export function Board({
  blocks,
  highlightBlockId,
  onClickCell,
  onHoverCell,
  onLeaveCell,
  cellSize = 64,
  animated = true,
  previewCells,
  previewBlockId,
}: BoardProps) {
  // Build a 6x6 occupancy grid
  const grid: number[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(0),
  );

  for (const block of blocks) {
    for (let i = 0; i < block.size; i++) {
      const row =
        block.orientation === "horizontal" ? block.row : block.row + i;
      const col =
        block.orientation === "horizontal" ? block.col + i : block.col;
      if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
        grid[row][col] = block.id;
      }
    }
  }

  const goalBlock = blocks.find((b) => b.isGoal);
  const goalRow = goalBlock?.row ?? -1;

  // Build preview set
  const previewSet = new Set<string>();
  if (previewCells) {
    for (const cell of previewCells) {
      previewSet.add(`${cell.row},${cell.col}`);
    }
  }

  function isGoalExit(row: number, col: number): boolean {
    if (!goalBlock || goalBlock.orientation !== "horizontal") return false;
    return row === goalRow && col === BOARD_SIZE - 1;
  }

  // Block overlay position as translate string
  function blockTransform(block: Block): string {
    const x = block.col * (cellSize + GAP) + PADDING;
    const y = block.row * (cellSize + GAP) + PADDING;
    return `translate(${x}px, ${y}px)`;
  }

  // Block overlay dimensions
  function blockSize(block: Block): { width: number; height: number } {
    if (block.orientation === "horizontal") {
      return {
        width: block.size * cellSize + (block.size - 1) * GAP,
        height: cellSize,
      };
    }
    return {
      width: cellSize,
      height: block.size * cellSize + (block.size - 1) * GAP,
    };
  }

  // Block rounding classes — render the whole block as one piece
  function blockRounding(block: Block): string {
    if (block.orientation === "horizontal") {
      return "rounded-l-md rounded-r-md";
    }
    return "rounded-t-md rounded-b-md";
  }

  // Whether the goal block currently occupies the exit column
  function blockAtExit(block: Block): boolean {
    if (!block.isGoal || block.orientation !== "horizontal") return false;
    return block.col + block.size - 1 === BOARD_SIZE - 1;
  }

  const boardWidth =
    cellSize * BOARD_SIZE + (BOARD_SIZE - 1) * GAP + 2 * PADDING;
  const boardHeight =
    cellSize * BOARD_SIZE + (BOARD_SIZE - 1) * GAP + 2 * PADDING;
  const clickable = onClickCell != null;

  return (
    <div
      className="relative select-none rounded-2xl shadow-lg shadow-amber-900/10 dark:shadow-black/30"
      style={{ width: boardWidth, height: boardHeight }}
    >
      {/* Board surface — CSS grid of empty cells (background) */}
      <div
        className="absolute inset-0 rounded-2xl bg-amber-100/80 dark:bg-amber-900/30"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, ${cellSize}px)`,
          gap: `${GAP}px`,
          padding: `${PADDING}px`,
          backgroundImage:
            "linear-gradient(0deg, rgba(0,0,0,0.02) 0%, transparent 50%, rgba(0,0,0,0.02) 100%)",
        }}
      >
        {Array.from({ length: BOARD_SIZE }, (_, row) =>
          Array.from({ length: BOARD_SIZE }, (_, col) => {
            const occupied = grid[row][col] !== 0;
            const isExit = isGoalExit(row, col);
            const isPreview = previewSet.has(`${row},${col}`);

            let cellBg = "bg-stone-100 dark:bg-stone-800";
            let cellClasses = "rounded-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.12)]";

            if (isPreview && !occupied) {
              cellBg = previewBlockId
                ? getBlockColor(previewBlockId, false)
                : "bg-amber-400/40";
              cellClasses =
                "rounded-md opacity-60 ring-1 ring-amber-400 dark:ring-amber-300 animate-pulse";
            }

            if (isExit && !occupied) {
              cellBg = "bg-transparent";
              cellClasses =
                "rounded-md border-2 border-dashed border-amber-400 dark:border-amber-500";
            }

            return (
              <div
                key={`${row}-${col}`}
                className={`${cellBg} ${cellClasses} flex items-center justify-center relative ${
                  clickable ? "cursor-pointer" : ""
                }`}
                style={{ width: cellSize, height: cellSize }}
                onClick={() => onClickCell?.(row, col)}
                onMouseEnter={() => onHoverCell?.(row, col)}
                onMouseLeave={() => onLeaveCell?.()}
              >
                {isExit && !occupied && (
                  <span className="text-amber-400 dark:text-amber-500 text-lg font-bold select-none pointer-events-none">
                    &rarr;
                  </span>
                )}
              </div>
            );
          }),
        )}
      </div>

      {/* Block overlays — absolutely positioned, animated via transform */}
      {blocks.map((block) => {
        const isHighlighted = block.id === highlightBlockId;
        const { width, height } = blockSize(block);
        const rounding = blockRounding(block);
        const gradient = getBlockGradient(block.id, block.isGoal);
        const atExit = blockAtExit(block);

        return (
          <div
            key={block.id}
            className={`
              absolute top-0 left-0
              ${rounding}
              ${animated ? "animate-block-slide" : ""}
              ${isHighlighted ? "ring-2 ring-amber-400 ring-offset-1 ring-offset-amber-100 dark:ring-offset-amber-900/50 z-10" : "z-[1]"}
              shadow-md pointer-events-none
            `}
            style={{
              width,
              height,
              transform: blockTransform(block),
              ...(isHighlighted ? { transform: `${blockTransform(block)} scale(1.05)` } : {}),
              ...gradient,
            }}
          >
            {isHighlighted && (
              <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold drop-shadow-md select-none">
                {block.id}
              </span>
            )}
            {atExit && (
              <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold drop-shadow-md select-none">
                &rarr;
              </span>
            )}
          </div>
        );
      })}

      {/* Exit arrow outside the board */}
      {goalBlock && goalBlock.orientation === "horizontal" && (
        <div
          className="absolute flex items-center justify-center text-amber-500 dark:text-amber-400 font-bold text-xl animate-bounce-arrow"
          style={{
            right: -(cellSize * 0.6),
            top:
              goalBlock.row * cellSize +
              cellSize / 2 -
              12 +
              (goalBlock.row + 1) * GAP,
            width: cellSize * 0.5,
            height: cellSize,
          }}
        >
          &rarr;
        </div>
      )}
    </div>
  );
}

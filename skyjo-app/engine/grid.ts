import { ROWS, COLS } from "./constants";
import type { PlayerGrid, Card, GridPosition } from "./types";

export function createGrid(cards: Card[]): PlayerGrid {
  const grid: PlayerGrid = [];
  let cardIndex = 0;
  for (let row = 0; row < ROWS; row++) {
    grid[row] = [];
    for (let col = 0; col < COLS; col++) {
      grid[row][col] = { card: cards[cardIndex++], faceUp: false };
    }
  }
  return grid;
}

export function flipCard(grid: PlayerGrid, row: number, col: number): void {
  const cell = grid[row][col];
  if (cell.card && !cell.faceUp) {
    cell.faceUp = true;
  }
}

export function flipAllCards(grid: PlayerGrid): void {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row]?.[col]?.card) {
        grid[row][col].faceUp = true;
      }
    }
  }
}

export function swapCard(
  grid: PlayerGrid,
  row: number,
  col: number,
  newCard: Card,
): Card {
  const cell = grid[row][col];
  const oldCard = cell.card!;
  cell.card = newCard;
  cell.faceUp = true;
  return oldCard;
}

export function checkColumnRemoval(grid: PlayerGrid): number[] {
  const removedColumns: number[] = [];
  for (let col = 0; col < COLS; col++) {
    const cells = [];
    for (let row = 0; row < ROWS; row++) {
      cells.push(grid[row][col]);
    }
    if (cells.every((c) => c.card !== null && c.faceUp)) {
      const values = cells.map((c) => c.card!.value);
      if (values.every((v) => v === values[0])) {
        removedColumns.push(col);
        for (let row = 0; row < ROWS; row++) {
          grid[row][col] = { card: null, faceUp: true };
        }
      }
    }
  }
  return removedColumns;
}

export function allCardsFaceUp(grid: PlayerGrid): boolean {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = grid[row][col];
      if (cell.card !== null && !cell.faceUp) return false;
    }
  }
  return true;
}

export function getFaceDownPositions(grid: PlayerGrid): GridPosition[] {
  const positions: GridPosition[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row][col].card !== null && !grid[row][col].faceUp) {
        positions.push({ row, col });
      }
    }
  }
  return positions;
}

export function getActivePositions(grid: PlayerGrid): GridPosition[] {
  const positions: GridPosition[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row][col].card !== null) {
        positions.push({ row, col });
      }
    }
  }
  return positions;
}

export function getFaceUpPositions(grid: PlayerGrid): GridPosition[] {
  const positions: GridPosition[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row][col].card !== null && grid[row][col].faceUp) {
        positions.push({ row, col });
      }
    }
  }
  return positions;
}

export function getGridScore(grid: PlayerGrid): number {
  let total = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = grid[row][col];
      if (cell.card) total += cell.card.value;
    }
  }
  return total;
}

export function getVisibleScore(grid: PlayerGrid): number {
  let total = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = grid[row][col];
      if (cell.card && cell.faceUp) total += cell.card.value;
    }
  }
  return total;
}

export function getColumnValues(
  grid: PlayerGrid,
  col: number,
): (number | null)[] {
  const values: (number | null)[] = [];
  for (let row = 0; row < ROWS; row++) {
    const cell = grid[row][col];
    if (cell.card && cell.faceUp) {
      values.push(cell.card.value);
    } else if (cell.card) {
      values.push(null); // face down
    }
    // if card is null, column was removed — skip
  }
  return values;
}

export function getHighestFaceUpPosition(
  grid: PlayerGrid,
): GridPosition | null {
  let highest: GridPosition | null = null;
  let highestValue = -Infinity;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = grid[row][col];
      if (cell.card && cell.faceUp && cell.card.value > highestValue) {
        highestValue = cell.card.value;
        highest = { row, col };
      }
    }
  }
  return highest;
}

export function countFaceDown(grid: PlayerGrid): number {
  let count = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row][col].card !== null && !grid[row][col].faceUp) count++;
    }
  }
  return count;
}

export function countActiveCards(grid: PlayerGrid): number {
  let count = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row][col].card !== null) count++;
    }
  }
  return count;
}

import { ROWS, COLS } from "./constants";
import type {
  PlayerGrid,
  Card,
  GridPosition,
  StrategyConfig,
  TurnAction,
} from "./types";

export function createGrid(cards: Card[]): PlayerGrid {
  const grid: PlayerGrid = [];
  let cardIndex = 0;
  for (let row = 0; row < ROWS; row++) {
    grid[row] = [];
    for (let col = 0; col < COLS; col++) {
      grid[row]![col] = { card: cards[cardIndex++]!, faceUp: false };
    }
  }
  return grid;
}

export function flipCard(grid: PlayerGrid, row: number, col: number): void {
  const cell = grid[row]![col]!;
  if (cell.card && !cell.faceUp) {
    cell.faceUp = true;
  }
}

export function flipAllCards(grid: PlayerGrid): void {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row]?.[col]?.card) {
        grid[row]![col]!.faceUp = true;
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
  const cell = grid[row]![col]!;
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
      cells.push(grid[row]![col]!);
    }
    if (cells.every((c) => c!.card !== null && c!.faceUp)) {
      const values = cells.map((c) => c!.card!.value);
      if (values.every((v) => v === values[0])) {
        removedColumns.push(col);
        for (let row = 0; row < ROWS; row++) {
          grid[row]![col] = { card: null, faceUp: true };
        }
      }
    }
  }
  return removedColumns;
}

export function allCardsFaceUp(grid: PlayerGrid): boolean {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = grid[row]![col]!;
      if (cell.card !== null && !cell.faceUp) return false;
    }
  }
  return true;
}

export function getFaceDownPositions(grid: PlayerGrid): GridPosition[] {
  const positions: GridPosition[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row]![col]!.card !== null && !grid[row]![col]!.faceUp) {
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
      if (grid[row]![col]!.card !== null) {
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
      if (grid[row]![col]!.card !== null && grid[row]![col]!.faceUp) {
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
      const cell = grid[row]![col]!;
      if (cell.card) total += cell.card.value;
    }
  }
  return total;
}

export function getVisibleScore(grid: PlayerGrid): number {
  let total = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = grid[row]![col]!;
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
    const cell = grid[row]![col]!;
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
      const cell = grid[row]![col]!;
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
      if (grid[row]![col]!.card !== null && !grid[row]![col]!.faceUp) count++;
    }
  }
  return count;
}

export function countActiveCards(grid: PlayerGrid): number {
  let count = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row]![col]!.card !== null) count++;
    }
  }
  return count;
}

/**
 * Estimate a player's total score including unknown face-down cards.
 * Face-down cards are estimated at `expectedFaceDownValue` (default ~5, the deck average).
 */
export function estimateTotalScore(
  grid: PlayerGrid,
  expectedFaceDownValue: number = 5,
): number {
  let total = 0;
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = grid[row]![col]!;
      if (cell.card) {
        total += cell.faceUp ? cell.card.value : expectedFaceDownValue;
      }
    }
  }
  return total;
}

/**
 * Decide whether it's safe to end the round without risking the doubling penalty.
 * Returns true only if we're likely to have the lowest score.
 *
 * @param myGrid - The player's grid
 * @param otherGrids - Other players' grids
 * @param aggressiveness - 0 = very cautious, 1 = very aggressive. Controls how much margin is needed.
 */
export function shouldEndRoundSafely(
  myGrid: PlayerGrid,
  otherGrids: PlayerGrid[],
  aggressiveness: number = 0.5,
): boolean {
  const myFaceDown = countFaceDown(myGrid);

  // Can only end if very few face-down cards remain
  if (myFaceDown > 3) return false;

  // Estimate our total score
  // Be conservative: estimate our face-down cards at a higher value
  // since we're risking the 2x penalty
  const safetyMargin = 4 * (1 - aggressiveness); // 0-4 points per unknown card
  const myEstimate = estimateTotalScore(myGrid, 5 + safetyMargin);

  // Estimate opponents' total scores
  // Opponents' face-down cards could be anything — estimate at average
  const opponentEstimates = otherGrids.map((g) => estimateTotalScore(g, 5));
  const minOpponent = Math.min(...opponentEstimates);

  // Only end if we're clearly ahead (our pessimistic estimate beats their average estimate)
  return myEstimate < minOpponent;
}

/**
 * After drawing a card from the pile, decide whether to swap it into the grid
 * or discard it and flip a face-down card. This implements proper SkyJo rules
 * where you see the drawn card before deciding.
 */
export function makeInformedDrawDecision(
  drawnCard: Card,
  grid: PlayerGrid,
  config: StrategyConfig,
): TurnAction {
  const faceDown = getFaceDownPositions(grid);
  const highest = getHighestFaceUpPosition(grid);

  // 1. Column match completion — always swap
  for (let col = 0; col < COLS; col++) {
    const colValues = getColumnValues(grid, col);
    const matchCount = colValues.filter((v) => v === drawnCard.value).length;
    if (matchCount === 2) {
      for (let row = 0; row < ROWS; row++) {
        const cell = grid[row]![col]!;
        if (cell.card && cell.faceUp && cell.card.value !== drawnCard.value) {
          return { type: "draw-and-swap", targetRow: row, targetCol: col };
        }
      }
      for (let row = 0; row < ROWS; row++) {
        const cell = grid[row]![col]!;
        if (cell.card && !cell.faceUp) {
          return { type: "draw-and-swap", targetRow: row, targetCol: col };
        }
      }
    }
  }

  // 2. Better than highest face-up card — swap
  if (
    highest &&
    drawnCard.value < grid[highest.row]![highest.col]!.card!.value
  ) {
    return {
      type: "draw-and-swap",
      targetRow: highest.row,
      targetCol: highest.col,
    };
  }

  // 3. Low drawn card — swap with face-down (expected value ~5)
  if (drawnCard.value <= config.lowCardThreshold && faceDown.length > 0) {
    // Prefer face-down positions that could form column matches
    for (const pos of faceDown) {
      const colValues = getColumnValues(grid, pos.col);
      const matchCount = colValues.filter((v) => v === drawnCard.value).length;
      if (matchCount >= 1) {
        return {
          type: "draw-and-swap",
          targetRow: pos.row,
          targetCol: pos.col,
        };
      }
    }
    return {
      type: "draw-and-swap",
      targetRow: faceDown[0].row,
      targetCol: faceDown[0].col,
    };
  }

  // 4. Not worth keeping — discard and flip
  if (faceDown.length > 0) {
    // Prefer flipping in columns with potential matches
    for (const pos of faceDown) {
      const colValues = getColumnValues(grid, pos.col);
      const known = colValues.filter((v) => v !== null);
      if (known.length === 2 && known[0] === known[1]) {
        return {
          type: "draw-and-discard-flip",
          targetRow: pos.row,
          targetCol: pos.col,
        };
      }
    }
    return {
      type: "draw-and-discard-flip",
      targetRow: faceDown[0].row,
      targetCol: faceDown[0].col,
    };
  }

  // 5. All face-up fallback — swap with highest if beneficial
  if (highest) {
    return {
      type: "draw-and-swap",
      targetRow: highest.row,
      targetCol: highest.col,
    };
  }
  const active = getActivePositions(grid);
  return {
    type: "draw-and-swap",
    targetRow: active[0].row,
    targetCol: active[0].col,
  };
}

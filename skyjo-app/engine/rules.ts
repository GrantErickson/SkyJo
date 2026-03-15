import type { GameState, TurnAction, TurnResult, Player } from "./types";
import { CARDS_PER_PLAYER } from "./constants";
import { createDeck, shuffleDeck } from "./deck";
import {
  createGrid,
  flipCard,
  swapCard,
  checkColumnRemoval,
  allCardsFaceUp,
  getVisibleScore,
} from "./grid";

export function initializeRound(
  players: Player[],
  roundNumber: number,
  rng?: () => number,
): GameState {
  const deck = shuffleDeck(createDeck(), rng);
  let cardIndex = 0;

  for (const player of players) {
    const cards = deck.slice(cardIndex, cardIndex + CARDS_PER_PLAYER);
    player.grid = createGrid(cards);
    cardIndex += CARDS_PER_PLAYER;
  }

  const drawPile = deck.slice(cardIndex);
  const topCard = drawPile.pop()!;

  return {
    players,
    drawPile,
    discardPile: [topCard],
    currentPlayerIndex: 0,
    roundNumber,
    phase: "setup-flip",
    roundEnderIndex: null,
    turnsTakenAfterEnd: new Set(),
  };
}

export function determineFirstPlayer(
  state: GameState,
  roundNumber: number,
  previousRoundEnderId?: number,
): number {
  if (roundNumber > 1 && previousRoundEnderId !== undefined) {
    return previousRoundEnderId;
  }
  // First round: highest sum of revealed cards
  let highestSum = -Infinity;
  let firstPlayer = 0;
  for (let i = 0; i < state.players.length; i++) {
    const sum = getVisibleScore(state.players[i].grid);
    if (sum > highestSum) {
      highestSum = sum;
      firstPlayer = i;
    }
  }
  return firstPlayer;
}

export function executeTurn(state: GameState, action: TurnAction): TurnResult {
  const player = state.players[state.currentPlayerIndex];
  const result: TurnResult = {
    action,
    columnsRemoved: [],
    playerFinishedRound: false,
  };

  switch (action.type) {
    case "take-discard": {
      const discardCard = state.discardPile.pop()!;
      result.drawnCard = discardCard;
      const replaced = swapCard(
        player.grid,
        action.targetRow,
        action.targetCol,
        discardCard,
      );
      result.replacedCard = replaced;
      state.discardPile.push(replaced);
      break;
    }
    case "draw-and-swap": {
      const drawn = state.drawPile.pop()!;
      result.drawnCard = drawn;
      const replaced = swapCard(
        player.grid,
        action.targetRow,
        action.targetCol,
        drawn,
      );
      result.replacedCard = replaced;
      state.discardPile.push(replaced);
      break;
    }
    case "draw-and-discard-flip": {
      const drawn = state.drawPile.pop()!;
      result.drawnCard = drawn;
      state.discardPile.push(drawn);
      flipCard(player.grid, action.targetRow, action.targetCol);
      result.flippedCard =
        player.grid[action.targetRow][action.targetCol].card!;
      break;
    }
  }

  result.columnsRemoved = checkColumnRemoval(player.grid);

  if (allCardsFaceUp(player.grid)) {
    result.playerFinishedRound = true;
    if (state.roundEnderIndex === null) {
      state.roundEnderIndex = state.currentPlayerIndex;
      state.phase = "final-turns";
    }
  }

  return result;
}

export function advancePlayer(state: GameState): void {
  if (state.phase === "final-turns") {
    state.turnsTakenAfterEnd.add(state.currentPlayerIndex);
    const allDone = state.players.every(
      (_, i) => i === state.roundEnderIndex || state.turnsTakenAfterEnd.has(i),
    );
    if (allDone) {
      state.phase = "round-scoring";
      return;
    }
  }

  state.currentPlayerIndex =
    (state.currentPlayerIndex + 1) % state.players.length;

  if (
    state.phase === "final-turns" &&
    state.currentPlayerIndex === state.roundEnderIndex
  ) {
    state.currentPlayerIndex =
      (state.currentPlayerIndex + 1) % state.players.length;
  }
}

export function reshuffleDiscardIntoDraw(
  state: GameState,
  rng?: () => number,
): void {
  if (state.discardPile.length <= 1) return;
  const topDiscard = state.discardPile.pop()!;
  state.drawPile = shuffleDeck(state.discardPile, rng);
  state.discardPile = [topDiscard];
}

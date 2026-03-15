import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  GameState,
  GamePhase,
  Player,
  Card,
  TurnAction,
  TurnResult,
  StrategyId,
  RoundResult,
} from "~/engine/types";
import {
  initializeRound,
  executeTurn,
  advancePlayer,
  determineFirstPlayer,
  reshuffleDiscardIntoDraw,
} from "~/engine/rules";
import { scoreRound, isGameOver, getWinner } from "~/engine/scoring";
import {
  flipCard,
  flipAllCards,
  checkColumnRemoval,
  allCardsFaceUp,
  getVisibleScore,
} from "~/engine/grid";
import { getStrategy } from "~/engine/ai";
import { STRATEGY_NAMES } from "~/engine/constants";

export type UITurnPhase =
  | "idle"
  | "awaiting-source"
  | "awaiting-swap-target"
  | "awaiting-flip-target";

export const useGameStore = defineStore("game", () => {
  const gameState = ref<GameState | null>(null);
  const turnPhase = ref<UITurnPhase>("idle");
  const drawnCard = ref<Card | null>(null);
  const selectedSource = ref<"discard" | "draw" | null>(null);
  const isAnimating = ref(false);
  const gameSpeed = ref<"slow" | "normal" | "fast">("normal");
  const gameStarted = ref(false);
  const lastRoundResult = ref<RoundResult | null>(null);
  const showRoundSummary = ref(false);
  const showGameOver = ref(false);
  const previousRoundEnderId = ref<number | undefined>(undefined);

  // Player setup
  const playerCount = ref(2);
  const aiStrategies = ref<StrategyId[]>(["balanced"]);

  const currentPlayer = computed(() => {
    if (!gameState.value) return null;
    return gameState.value.players[gameState.value.currentPlayerIndex];
  });

  const isHumanTurn = computed(() => {
    return currentPlayer.value?.isHuman ?? false;
  });

  const humanPlayer = computed(() => {
    return gameState.value?.players.find((p) => p.isHuman) ?? null;
  });

  const topDiscard = computed(() => {
    if (!gameState.value || gameState.value.discardPile.length === 0)
      return null;
    return gameState.value.discardPile[gameState.value.discardPile.length - 1];
  });

  const isRoundOver = computed(() => {
    return gameState.value?.phase === "round-scoring";
  });

  const isGameFinished = computed(() => {
    if (!gameState.value) return false;
    return isGameOver(gameState.value.players);
  });

  const speedDelay = computed(() => {
    switch (gameSpeed.value) {
      case "slow":
        return 1500;
      case "normal":
        return 800;
      case "fast":
        return 300;
    }
  });

  function startNewGame(numPlayers: number, strategies: StrategyId[]) {
    const players: Player[] = [
      {
        id: 0,
        name: "You",
        isHuman: true,
        grid: [],
        cumulativeScore: 0,
        roundScores: [],
      },
      ...strategies.slice(0, numPlayers - 1).map((s, i) => ({
        id: i + 1,
        name: `${STRATEGY_NAMES[s]} AI`,
        isHuman: false,
        grid: [],
        strategyId: s,
        cumulativeScore: 0,
        roundScores: [],
      })),
    ];

    playerCount.value = numPlayers;
    aiStrategies.value = strategies.slice(0, numPlayers - 1);
    previousRoundEnderId.value = undefined;
    gameStarted.value = true;
    showGameOver.value = false;

    startNewRound(players, 1);
  }

  function startNewRound(players: Player[], roundNumber: number) {
    const state = initializeRound(players, roundNumber);
    gameState.value = state;
    turnPhase.value = "idle";
    drawnCard.value = null;
    selectedSource.value = null;
    showRoundSummary.value = false;
    lastRoundResult.value = null;

    // Phase: setup-flip — human needs to pick 2 cards
    gameState.value.phase = "setup-flip";
  }

  function humanSetupFlip(row: number, col: number) {
    if (!gameState.value || gameState.value.phase !== "setup-flip") return;
    const player = gameState.value.players[0];
    const cell = player.grid[row][col];
    if (!cell.card || cell.faceUp) return;

    flipCard(player.grid, row, col);

    // Count flipped cards
    let flippedCount = 0;
    for (const r of player.grid) {
      for (const c of r) {
        if (c.card && c.faceUp) flippedCount++;
      }
    }

    if (flippedCount >= 2) {
      // AI players flip their cards
      for (let i = 1; i < gameState.value.players.length; i++) {
        const p = gameState.value.players[i];
        const strategy = getStrategy(p.strategyId!);
        const flips = strategy.chooseSetupFlips({
          gameState: gameState.value,
          player: p,
          topDiscard:
            gameState.value.discardPile[gameState.value.discardPile.length - 1],
          config: strategy.config,
        });
        flipCard(p.grid, flips[0].row, flips[0].col);
        flipCard(p.grid, flips[1].row, flips[1].col);
      }

      // Determine first player
      gameState.value.currentPlayerIndex = determineFirstPlayer(
        gameState.value,
        gameState.value.roundNumber,
        previousRoundEnderId.value,
      );
      gameState.value.phase = "playing";
      turnPhase.value = isHumanTurn.value ? "awaiting-source" : "idle";
    }
  }

  function selectSource(source: "discard" | "draw") {
    if (!gameState.value || !isHumanTurn.value) return;
    selectedSource.value = source;

    if (source === "discard") {
      // Must swap with a grid card
      drawnCard.value =
        gameState.value.discardPile[gameState.value.discardPile.length - 1];
      turnPhase.value = "awaiting-swap-target";
    } else {
      // Draw from pile — peek at the card
      if (gameState.value.drawPile.length === 0) {
        reshuffleDiscardIntoDraw(gameState.value);
      }
      const drawn =
        gameState.value.drawPile[gameState.value.drawPile.length - 1];
      drawnCard.value = drawn;
      // Player can now choose to swap or discard+flip
      turnPhase.value = "awaiting-swap-target"; // will also show discard option
    }
  }

  function humanSwap(row: number, col: number) {
    if (!gameState.value || !isHumanTurn.value || !drawnCard.value) return;

    let action: TurnAction;
    if (selectedSource.value === "discard") {
      action = { type: "take-discard", targetRow: row, targetCol: col };
    } else {
      action = { type: "draw-and-swap", targetRow: row, targetCol: col };
    }

    const result = executeTurn(gameState.value, action);
    finishHumanTurn(result);
  }

  function humanDiscardAndFlip(row: number, col: number) {
    if (!gameState.value || !isHumanTurn.value) return;
    if (selectedSource.value !== "draw") return;

    const action: TurnAction = {
      type: "draw-and-discard-flip",
      targetRow: row,
      targetCol: col,
    };
    const result = executeTurn(gameState.value, action);
    finishHumanTurn(result);
  }

  function finishHumanTurn(result: TurnResult) {
    drawnCard.value = null;
    selectedSource.value = null;
    turnPhase.value = "idle";

    const phase = gameState.value!.phase as GamePhase;
    if (phase === "round-scoring") {
      endRound();
    } else {
      advancePlayer(gameState.value!);
      const newPhase = gameState.value!.phase as GamePhase;
      if (newPhase === "round-scoring") {
        endRound();
      } else {
        turnPhase.value = isHumanTurn.value ? "awaiting-source" : "idle";
      }
    }
  }

  async function executeAITurn(): Promise<TurnResult | null> {
    if (!gameState.value || isHumanTurn.value) return null;
    const player = currentPlayer.value!;
    const strategy = getStrategy(player.strategyId!);

    const action = strategy.chooseTurnAction({
      gameState: gameState.value,
      player,
      topDiscard:
        gameState.value.discardPile[gameState.value.discardPile.length - 1],
      config: strategy.config,
    });

    const result = executeTurn(gameState.value, action);

    if ((gameState.value.phase as GamePhase) === "round-scoring") {
      endRound();
      return result;
    }

    advancePlayer(gameState.value);

    if ((gameState.value.phase as GamePhase) === "round-scoring") {
      endRound();
    } else if (isHumanTurn.value) {
      turnPhase.value = "awaiting-source";
    }

    if (gameState.value.drawPile.length === 0) {
      reshuffleDiscardIntoDraw(gameState.value);
    }

    return result;
  }

  function endRound() {
    if (!gameState.value) return;

    // Flip all remaining face-down cards
    for (const player of gameState.value.players) {
      flipAllCards(player.grid);
      checkColumnRemoval(player.grid);
    }

    const result = scoreRound(
      gameState.value.players,
      gameState.value.roundEnderIndex ?? 0,
      gameState.value.roundNumber,
    );

    for (const ps of result.playerScores) {
      const player = gameState.value.players.find((p) => p.id === ps.playerId)!;
      player.cumulativeScore += ps.finalScore;
      player.roundScores.push(ps.finalScore);
    }

    previousRoundEnderId.value = gameState.value.roundEnderIndex ?? undefined;
    lastRoundResult.value = result;
    showRoundSummary.value = true;
  }

  function proceedAfterRound() {
    if (!gameState.value) return;
    showRoundSummary.value = false;

    if (isGameOver(gameState.value.players)) {
      showGameOver.value = true;
      gameState.value.phase = "game-over";
    } else {
      // Start next round with same players
      startNewRound(gameState.value.players, gameState.value.roundNumber + 1);
    }
  }

  function resetGame() {
    gameState.value = null;
    gameStarted.value = false;
    turnPhase.value = "idle";
    drawnCard.value = null;
    selectedSource.value = null;
    showRoundSummary.value = false;
    showGameOver.value = false;
    lastRoundResult.value = null;
  }

  function cancelDrawnCard() {
    if (selectedSource.value === "draw" && drawnCard.value) {
      turnPhase.value = "awaiting-flip-target";
    }
  }

  return {
    // State
    gameState,
    turnPhase,
    drawnCard,
    selectedSource,
    isAnimating,
    gameSpeed,
    gameStarted,
    lastRoundResult,
    showRoundSummary,
    showGameOver,
    playerCount,
    aiStrategies,

    // Getters
    currentPlayer,
    isHumanTurn,
    humanPlayer,
    topDiscard,
    isRoundOver,
    isGameFinished,
    speedDelay,

    // Actions
    startNewGame,
    humanSetupFlip,
    selectSource,
    humanSwap,
    humanDiscardAndFlip,
    cancelDrawnCard,
    executeAITurn,
    proceedAfterRound,
    resetGame,
  };
});

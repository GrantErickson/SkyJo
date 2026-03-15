import { useGameStore } from "~/stores/gameStore";

export function useAI() {
  const gameStore = useGameStore();

  async function runAITurns() {
    while (
      gameStore.gameState &&
      gameStore.gameState.phase !== "round-scoring" &&
      gameStore.gameState.phase !== "game-over" &&
      gameStore.gameState.phase !== "setup-flip" &&
      !gameStore.isHumanTurn
    ) {
      gameStore.isAnimating = true;
      await delay(gameStore.speedDelay);
      await gameStore.executeAITurn();
      gameStore.isAnimating = false;

      // Check if round ended
      if (gameStore.showRoundSummary || gameStore.showGameOver) break;
    }
  }

  return { runAITurns };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

import type { Player, RoundResult } from "./types";
import { getGridScore } from "./grid";
import { GAME_OVER_THRESHOLD } from "./constants";

export function scoreRound(
  players: Player[],
  roundEnderId: number,
  roundNumber: number,
): RoundResult {
  const playerScores = players.map((player) => {
    const rawScore = getGridScore(player.grid);
    return {
      playerId: player.id,
      rawScore,
      wasDoubled: false,
      finalScore: rawScore,
    };
  });

  const enderEntry = playerScores.find((ps) => ps.playerId === roundEnderId)!;
  const lowestScore = Math.min(...playerScores.map((ps) => ps.rawScore));

  if (enderEntry.rawScore > lowestScore && enderEntry.rawScore > 0) {
    enderEntry.wasDoubled = true;
    enderEntry.finalScore = enderEntry.rawScore * 2;
  }

  return {
    roundNumber,
    playerScores,
    roundEnderId,
  };
}

export function isGameOver(players: Player[]): boolean {
  return players.some((p) => p.cumulativeScore >= GAME_OVER_THRESHOLD);
}

export function getWinner(players: Player[]): Player {
  return players.reduce((best, p) =>
    p.cumulativeScore < best.cumulativeScore ? p : best,
  );
}

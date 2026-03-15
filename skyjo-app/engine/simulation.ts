import type {
  SimulationConfig,
  SimulationResult,
  GameSimData,
  PlayerSimResult,
  Player,
  StrategyId,
} from "./types";
import {
  initializeRound,
  executeTurn,
  advancePlayer,
  determineFirstPlayer,
  reshuffleDiscardIntoDraw,
} from "./rules";
import { scoreRound, isGameOver, getWinner } from "./scoring";
import { flipCard, flipAllCards, checkColumnRemoval } from "./grid";
import { getStrategy } from "./ai";
import { createSeededRng } from "../utils/random";
import { mean, median, stdDev, histogram } from "../utils/stats";
import { STRATEGY_NAMES } from "./constants";

function createPlayers(config: SimulationConfig): Player[] {
  return config.strategies.map((strategyId, i) => ({
    id: i,
    name: `Player ${i + 1} (${STRATEGY_NAMES[strategyId]})`,
    isHuman: false,
    grid: [],
    strategyId,
    cumulativeScore: 0,
    roundScores: [],
  }));
}

export function runSimulation(
  config: SimulationConfig,
  onProgress?: (completed: number, total: number) => void,
): SimulationResult {
  const ctx = createSimulationContext(config);

  for (let game = 0; game < config.numGames; game++) {
    runSingleGame(ctx, config, game);

    if (
      onProgress &&
      game % Math.max(1, Math.floor(config.numGames / 100)) === 0
    ) {
      onProgress(game + 1, config.numGames);
    }
  }

  return finalizeResults(ctx, config);
}

export async function runSimulationAsync(
  config: SimulationConfig,
  onProgress: (completed: number, total: number) => void,
): Promise<SimulationResult> {
  const ctx = createSimulationContext(config);
  const chunkSize = Math.max(1, Math.min(50, Math.floor(config.numGames / 100)));

  for (let game = 0; game < config.numGames; game++) {
    runSingleGame(ctx, config, game);

    if (game % chunkSize === 0) {
      onProgress(game + 1, config.numGames);
      await yieldToUI();
    }
  }

  onProgress(config.numGames, config.numGames);
  return finalizeResults(ctx, config);
}

function yieldToUI(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

interface SimContext {
  startTime: number;
  rng: ((n?: number) => number) | undefined;
  gamesData: GameSimData[];
  winsPerPlayer: number[];
  scoresPerPlayer: number[][];
  roundsPerGame: number[];
  strategies: ReturnType<typeof getStrategy>[];
}

function createSimulationContext(config: SimulationConfig): SimContext {
  return {
    startTime: performance.now(),
    rng: config.seed !== undefined ? createSeededRng(config.seed) : undefined,
    gamesData: [],
    winsPerPlayer: new Array(config.numPlayers).fill(0),
    scoresPerPlayer: Array.from({ length: config.numPlayers }, () => []),
    roundsPerGame: [],
    strategies: config.strategies.map((id) =>
      getStrategy(id, config.strategyConfigs?.[id]),
    ),
  };
}

function runSingleGame(ctx: SimContext, config: SimulationConfig, gameIndex: number): void {
  const players = createPlayers(config);
  let roundNumber = 0;
  let previousRoundEnderId: number | undefined;

  while (!isGameOver(players)) {
    roundNumber++;
    const state = initializeRound(players, roundNumber, ctx.rng);

    for (const player of players) {
      const strategy = ctx.strategies[player.id];
      const flips = strategy.chooseSetupFlips({
        gameState: state,
        player,
        topDiscard: state.discardPile[state.discardPile.length - 1],
        config: strategy.config,
      });
      flipCard(player.grid, flips[0].row, flips[0].col);
      flipCard(player.grid, flips[1].row, flips[1].col);
    }

    state.currentPlayerIndex = determineFirstPlayer(
      state,
      roundNumber,
      previousRoundEnderId,
    );
    state.phase = "playing";

    let turnSafety = 0;
    const maxTurns = 500;

    while (
      (state.phase === "playing" || state.phase === "final-turns") &&
      turnSafety < maxTurns
    ) {
      turnSafety++;
      const player = state.players[state.currentPlayerIndex];
      const strategy = ctx.strategies[player.id];
      const action = strategy.chooseTurnAction({
        gameState: state,
        player,
        topDiscard: state.discardPile[state.discardPile.length - 1],
        config: strategy.config,
      });
      executeTurn(state, action);
      advancePlayer(state);

      if (state.drawPile.length === 0) {
        reshuffleDiscardIntoDraw(state, ctx.rng);
      }
    }

    for (const player of players) {
      flipAllCards(player.grid);
      checkColumnRemoval(player.grid);
    }

    const roundResult = scoreRound(
      players,
      state.roundEnderIndex ?? 0,
      roundNumber,
    );
    previousRoundEnderId = state.roundEnderIndex ?? undefined;

    for (const ps of roundResult.playerScores) {
      const player = players.find((p) => p.id === ps.playerId)!;
      player.cumulativeScore += ps.finalScore;
      player.roundScores.push(ps.finalScore);
    }

    if (roundNumber > 100) break;
  }

  const winner = getWinner(players);
  ctx.winsPerPlayer[winner.id]++;
  for (const player of players) {
    ctx.scoresPerPlayer[player.id].push(player.cumulativeScore);
  }
  ctx.roundsPerGame.push(roundNumber);

  ctx.gamesData.push({
    gameIndex,
    winnerIndex: winner.id,
    winnerStrategy: config.strategies[winner.id],
    playerScores: players.map((p) => p.cumulativeScore),
    numRounds: roundNumber,
  });
}

function finalizeResults(ctx: SimContext, config: SimulationConfig): SimulationResult {
  const playerResults: PlayerSimResult[] = config.strategies.map(
    (strategyId, i) => ({
      playerIndex: i,
      strategyId,
      wins: ctx.winsPerPlayer[i],
      winRate: ctx.winsPerPlayer[i] / config.numGames,
      avgScore: mean(ctx.scoresPerPlayer[i]),
      medianScore: median(ctx.scoresPerPlayer[i]),
      minScore: Math.min(...ctx.scoresPerPlayer[i]),
      maxScore: Math.max(...ctx.scoresPerPlayer[i]),
      stdDeviation: stdDev(ctx.scoresPerPlayer[i]),
      avgRoundsPerGame: mean(ctx.roundsPerGame),
      scoreDistribution: histogram(ctx.scoresPerPlayer[i], 20),
    }),
  );

  const bestIdx = playerResults.reduce(
    (best, pr, i) => (pr.winRate > playerResults[best].winRate ? i : best),
    0,
  );

  return {
    config,
    totalGames: config.numGames,
    completedGames: config.numGames,
    playerResults,
    gamesData: ctx.gamesData,
    duration: performance.now() - ctx.startTime,
    bestStrategy: playerResults[bestIdx].strategyId,
    recommendation: generateRecommendation(playerResults, config.numPlayers),
  };
}

function generateRecommendation(
  results: PlayerSimResult[],
  numPlayers: number,
): string {
  const sorted = [...results].sort((a, b) => b.winRate - a.winRate);
  const best = sorted[0];
  const second = sorted[1];

  const totalGames = best.wins / best.winRate;

  let rec = `In ${totalGames.toLocaleString()} games with ${numPlayers} players, `;
  rec += `the ${STRATEGY_NAMES[best.strategyId]} strategy performed best with a `;
  rec += `${(best.winRate * 100).toFixed(1)}% win rate (avg score: ${best.avgScore.toFixed(1)}). `;

  if (second) {
    rec += `The ${STRATEGY_NAMES[second.strategyId]} strategy came second at ${(second.winRate * 100).toFixed(1)}%. `;
  }

  rec += `For ${numPlayers}-player games, we recommend the ${STRATEGY_NAMES[best.strategyId]} strategy.`;

  return rec;
}

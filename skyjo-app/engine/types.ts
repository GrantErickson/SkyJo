export type CardValue =
  | -2
  | -1
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;

export interface Card {
  id: number;
  value: CardValue;
}

export interface GridCell {
  card: Card | null;
  faceUp: boolean;
}

export type PlayerGrid = GridCell[][];

export interface Player {
  id: number;
  name: string;
  isHuman: boolean;
  grid: PlayerGrid;
  strategyId?: StrategyId;
  cumulativeScore: number;
  roundScores: number[];
}

export type StrategyId =
  | "random"
  | "greedy"
  | "conservative"
  | "aggressive"
  | "balanced"
  | "memory"
  | "column-hunter"
  | "risk-taker";

export interface GameState {
  players: Player[];
  drawPile: Card[];
  discardPile: Card[];
  currentPlayerIndex: number;
  roundNumber: number;
  phase: GamePhase;
  roundEnderIndex: number | null;
  turnsTakenAfterEnd: Set<number>;
}

export type GamePhase =
  | "setup-flip"
  | "playing"
  | "final-turns"
  | "round-scoring"
  | "game-over";

export type TurnAction =
  | { type: "take-discard"; targetRow: number; targetCol: number }
  | { type: "draw-and-swap"; targetRow: number; targetCol: number }
  | { type: "draw-and-discard-flip"; targetRow: number; targetCol: number };

export interface TurnResult {
  action: TurnAction;
  drawnCard?: Card;
  replacedCard?: Card;
  flippedCard?: Card;
  columnsRemoved: number[];
  playerFinishedRound: boolean;
}

export interface RoundResult {
  roundNumber: number;
  playerScores: RoundPlayerScore[];
  roundEnderId: number;
}

export interface RoundPlayerScore {
  playerId: number;
  rawScore: number;
  wasDoubled: boolean;
  finalScore: number;
}

export interface SimulationConfig {
  numGames: number;
  numPlayers: 2 | 3 | 4 | 5 | 6;
  strategies: StrategyId[];
  randomizeStrategies?: boolean;
  strategyConfigs?: Partial<Record<StrategyId, Partial<StrategyConfig>>>;
  seed?: number;
}

export interface SimulationResult {
  config: SimulationConfig;
  totalGames: number;
  completedGames: number;
  playerResults: PlayerSimResult[];
  gamesData: GameSimData[];
  duration: number;
  bestStrategy: StrategyId;
  recommendation: string;
}

export interface PlayerSimResult {
  playerIndex: number;
  strategyId: StrategyId;
  wins: number;
  winRate: number;
  avgScore: number;
  medianScore: number;
  minScore: number;
  maxScore: number;
  stdDeviation: number;
  avgRoundsPerGame: number;
  scoreDistribution: number[];
}

export interface GameSimData {
  gameIndex: number;
  winnerIndex: number;
  winnerStrategy: StrategyId;
  playerScores: number[];
  numRounds: number;
}

export interface GridPosition {
  row: number;
  col: number;
}

export interface StrategyConfig {
  highCardThreshold: number;
  lowCardThreshold: number;
  columnMatchWeight: number;
  flipRiskTolerance: number;
  roundEndAggressiveness: number;
  explorationRate: number;
}

export interface StrategyContext {
  gameState: Readonly<GameState>;
  player: Readonly<Player>;
  topDiscard: Card;
  config: StrategyConfig;
}

export interface Strategy {
  id: StrategyId;
  name: string;
  description: string;
  config: StrategyConfig;
  chooseSetupFlips(context: StrategyContext): [GridPosition, GridPosition];
  chooseTurnAction(context: StrategyContext): TurnAction;
  /** After drawing from pile, decide what to do with the card (swap or discard+flip). */
  chooseDrawAction?(drawnCard: Card, context: StrategyContext): TurnAction;
}

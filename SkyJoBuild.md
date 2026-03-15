# SkyJo — Full Design & Implementation Document

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Game Rules Reference](#game-rules-reference)
4. [Architecture](#architecture)
5. [Project Structure](#project-structure)
6. [Data Models](#data-models)
7. [State Management (Pinia)](#state-management-pinia)
8. [Game Engine](#game-engine)
9. [AI Strategies](#ai-strategies)
10. [Self-Play Simulation Engine](#self-play-simulation-engine)
11. [UI Design](#ui-design)
12. [Component Hierarchy](#component-hierarchy)
13. [Animations & Interactions](#animations--interactions)
14. [Routing](#routing)
15. [Testing Strategy](#testing-strategy)
16. [Build & Deployment](#build--deployment)
17. [Implementation Phases](#implementation-phases)

---

## Overview

SkyJo is a client-side card game built with Nuxt 3 where a human player competes against 1–3 AI opponents. It also includes a self-play simulation mode where AI strategies compete against each other over configurable run sizes to discover optimal strategies. Results include interactive charts and exportable data.

**Key Goals:**

- Faithful implementation of SkyJo rules (with column removal always enabled)
- Responsive, animated UI with Tailwind CSS
- 8 built-in AI strategies that can be tuned via discovery data
- Self-play mode with rich visual analytics and data export

---

## Technology Stack

| Layer      | Technology                          | Purpose                                 |
| ---------- | ----------------------------------- | --------------------------------------- |
| Framework  | **Nuxt 3** (SPA mode, `ssr: false`) | Vue 3 app framework, file-based routing |
| Styling    | **Tailwind CSS 3**                  | Utility-first styling                   |
| State      | **Pinia**                           | Reactive state management               |
| Charts     | **Chart.js + vue-chartjs**          | Simulation result visualization         |
| Animations | **Vue transitions + CSS**           | Card flips, score animations            |
| Icons      | **lucide-vue-next**                 | UI icons                                |
| Export     | Native Blob API                     | CSV/JSON data export                    |
| Testing    | **Vitest**                          | Unit tests                              |

**No server-side rendering.** Nuxt config sets `ssr: false` to generate a pure SPA.

---

## Game Rules Reference

### Card Distribution (150 cards total)

| Value | Count |
| ----- | ----- |
| -2    | 5     |
| -1    | 10    |
| 0     | 15    |
| 1     | 10    |
| 2     | 10    |
| 3     | 10    |
| 4     | 10    |
| 5     | 10    |
| 6     | 10    |
| 7     | 10    |
| 8     | 10    |
| 9     | 10    |
| 10    | 10    |
| 11    | 10    |
| 12    | 10    |

### Setup (Per Round)

1. Shuffle all 150 cards.
2. Deal 12 cards face-down to each player arranged in a **3 rows × 4 columns** grid.
3. Remaining cards form the **draw pile**; flip the top card to start the **discard pile**.
4. Each player flips **2 cards** of their choice face-up.
5. **First round:** The player with the highest sum of their 2 revealed cards goes first.
6. **Subsequent rounds:** The player who ended the previous round goes first.

### Turn Actions

A player must do **one** of the following:

**Option A — Take from discard pile:**

- Pick up the top card of the discard pile.
- **Must** swap it with one card in their grid (face-up or face-down).
- The replaced card goes to the discard pile.

**Option B — Draw from draw pile:**

- Draw the top card from the draw pile and look at it.
- **Either** swap it with a grid card (replaced card goes to discard pile).
- **Or** discard it, then flip one face-down card in their grid face-up.

### Column Removal (Always Enabled)

If at any point a player has **3 revealed cards of the same value in a vertical column**, all 3 cards are removed from the game (placed on discard pile). This can happen mid-turn after any card is revealed or swapped.

### End of Round

- A round ends when **one player has all cards face-up** (the "round ender").
- Every other player gets **exactly one more turn**.
- All remaining face-down cards are flipped (column removal is checked after flipping).
- Each player totals the values of their remaining cards.

**Penalty rule:** If the round ender does **not** have the strictly lowest score **and** their score is **positive**, their score is **doubled**.

### End of Game

- After each round, cumulative scores are updated.
- The game ends when **any player's cumulative score reaches 100 or more**.
- The player with the **lowest cumulative score** wins.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Nuxt 3 SPA                       │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐ │
│  │  Pages   │  │Components│  │   Composables      │ │
│  │          │  │          │  │                     │ │
│  │ - Home   │  │ - Board  │  │ - useAI()          │ │
│  │ - Play   │  │ - Card   │  │                     │ │
│  │ - Strats │  │ - Hand   │  │                     │ │
│  │ - SimRun │  │ - Score  │  │                     │ │
│  │          │  │ - Charts │  │                     │ │
│  └────┬─────┘  └────┬─────┘  └────────┬──────────┘ │
│       │              │                 │            │
│       └──────────────┴─────────────────┘            │
│                      │                              │
│              ┌───────▼────────┐                     │
│              │  Pinia Stores  │                     │
│              │                │                     │
│              │ - gameStore    │                     │
│              │ - simStore     │                     │
│              │ - settingsStore│                     │
│              └───────┬────────┘                     │
│                      │                              │
│              ┌───────▼────────┐                     │
│              │  Game Engine   │                     │
│              │  (Pure Logic)  │                     │
│              │                │                     │
│              │ - deck.ts      │                     │
│              │ - rules.ts     │                     │
│              │ - scoring.ts   │                     │
│              │ - ai/*.ts      │                     │
│              │ - simulation.ts│                     │
│              └────────────────┘                     │
└─────────────────────────────────────────────────────┘
```

**Key architectural principle:** The game engine is **pure TypeScript** with no Vue dependencies. This allows the simulation engine to run thousands of games without any reactivity overhead. Pinia stores wrap the engine for the interactive UI.

---

## Project Structure

```
skyjo-app/
├── nuxt.config.ts
├── tailwind.config.ts
├── package.json
├── tsconfig.json
├── app.vue
│
├── assets/
│   └── css/
│       └── main.css                # Tailwind directives + custom styles
│
├── pages/
│   ├── index.vue                   # Home / main menu
│   ├── play.vue                    # Game board (human vs AI)
│   ├── strategies.vue              # Strategy descriptions and comparison
│   └── simulation.vue              # Self-play config, progress, and results
│
├── components/
│   ├── game/
│   │   ├── GameBoard.vue           # Main game board layout (viewport-fitting flex)
│   │   ├── PlayerGrid.vue          # A single player's 3×4 card grid (supports compact mode)
│   │   ├── CardSlot.vue            # Individual card slot (handles flip animation)
│   │   ├── Card.vue                # Card face rendering (value + color, supports compact)
│   │   ├── DrawPile.vue            # Draw pile with card count
│   │   ├── DiscardPile.vue         # Discard pile showing top card
│   │   ├── ActionPanel.vue         # Human action buttons / prompts
│   │   ├── Scoreboard.vue          # Current round + cumulative scores
│   │   ├── GameSetup.vue           # Pre-game: select opponents & strategies
│   │   ├── RoundSummary.vue        # End-of-round overlay with scores
│   │   └── GameOverOverlay.vue     # End-of-game overlay with final standings
│   │
│   ├── simulation/
│   │   ├── SimulationConfig.vue    # Config panel: strategies, player count, game count
│   │   ├── SimulationProgress.vue  # Progress bar during simulation run
│   │   ├── SimulationSummary.vue   # Summary stat cards (games, duration, best strategy)
│   │   ├── ResultsTable.vue        # Tabular results
│   │   ├── WinRateChart.vue        # Bar chart of win rates
│   │   ├── WinRateConvergence.vue  # Line chart showing win rate over games
│   │   ├── ScoreDistribution.vue   # Histogram of score distributions
│   │   ├── ScoreTrend.vue          # Line chart of score moving average
│   │   ├── ScoreRange.vue          # Box-plot style min/avg/max visualization
│   │   ├── RoundsDistribution.vue  # Histogram of rounds per game
│   │   ├── StrategyComparison.vue  # Radar chart across strategy metrics
│   │   └── ExportButton.vue        # Export results as CSV/JSON
│   │
│   └── ui/
│       ├── AppHeader.vue           # Top navigation bar (Play, Strategies, Simulate)
│       ├── AppFooter.vue           # Footer
│       ├── BaseButton.vue          # Styled button component
│       └── BaseModal.vue           # Modal overlay
│
├── composables/
│   └── useAI.ts                    # AI turn execution with delays for UX
│
├── stores/
│   ├── gameStore.ts                # Current game state (round, turn, cards)
│   ├── simStore.ts                 # Simulation config, progress, results
│   └── settingsStore.ts            # App settings (animation speed, etc.)
│
├── engine/
│   ├── deck.ts                     # Deck creation, shuffle, draw
│   ├── rules.ts                    # Rule validation and game flow
│   ├── scoring.ts                  # Score calculation, penalty logic
│   ├── grid.ts                     # Grid operations (swap, flip, column check)
│   ├── types.ts                    # All TypeScript interfaces & types
│   ├── constants.ts                # Card distribution, grid dimensions, strategy configs
│   ├── simulation.ts               # Headless game loop (sync + async chunked with progress)
│   └── ai/
│       ├── random.ts               # Random strategy
│       ├── greedy.ts               # Greedy strategy
│       ├── conservative.ts         # Conservative strategy
│       ├── aggressive.ts           # Aggressive strategy
│       ├── balanced.ts             # Balanced strategy
│       ├── memory.ts               # Memory/card-counting strategy
│       ├── column-hunter.ts        # Column-focused strategy
│       ├── risk-taker.ts           # High-variance gambling strategy
│       └── index.ts                # Strategy registry & factory
│
└── utils/
    ├── colors.ts                   # Card color mapping by value
    ├── formatters.ts               # Number/score formatters
    ├── random.ts                   # Seeded random for reproducible sims
    └── stats.ts                    # Statistical helpers (mean, median, stdDev)
```

---

## Data Models

### `engine/types.ts`

```typescript
// Card values range from -2 to 12
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
  id: number; // Unique card ID (0-149)
  value: CardValue;
}

export interface GridCell {
  card: Card | null; // null = column was removed
  faceUp: boolean;
}

// Grid is [row][col] — 3 rows × 4 columns
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
  roundEnderIndex: number | null; // Player who flipped all cards
  turnsTakenAfterEnd: Set<number>; // Track who has taken their final turn
}

export type GamePhase =
  | "setup-flip" // Players choosing 2 cards to flip
  | "playing" // Normal turns
  | "final-turns" // Other players taking last turn after someone finished
  | "round-scoring" // Showing round results
  | "game-over"; // Final results

export type TurnAction =
  | { type: "take-discard"; targetRow: number; targetCol: number }
  | { type: "draw-and-swap"; targetRow: number; targetCol: number }
  | { type: "draw-and-discard-flip"; targetRow: number; targetCol: number };

export interface TurnResult {
  action: TurnAction;
  drawnCard?: Card;
  replacedCard?: Card;
  flippedCard?: Card;
  columnsRemoved: number[]; // Column indices removed this turn
  playerFinishedRound: boolean; // Did this action reveal all cards?
}

export interface RoundResult {
  roundNumber: number;
  playerScores: {
    playerId: number;
    rawScore: number;
    wasDoubled: boolean;
    finalScore: number;
  }[];
  roundEnderId: number;
}
```

### `engine/types.ts` (Strategy types)

```typescript
import type { GameState, TurnAction, Player, Card, StrategyId } from "../types";

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
  chooseSetupFlips(context: StrategyContext): [GridPosition, GridPosition];
  chooseTurnAction(context: StrategyContext): TurnAction;
}

export interface GridPosition {
  row: number;
  col: number;
}

// Tunable parameters for each strategy, adjustable via discovery data
export interface StrategyConfig {
  // Threshold at which a card is considered "high" (worth replacing)
  highCardThreshold: number;
  // Threshold at which a card is considered "low" (worth keeping)
  lowCardThreshold: number;
  // How aggressively to pursue column matches (0-1)
  columnMatchWeight: number;
  // Risk tolerance for flipping unknown cards (0-1)
  flipRiskTolerance: number;
  // How early to consider ending the round (0-1, higher = earlier)
  roundEndAggressiveness: number;
  // Probability of deviating from optimal play (exploration)
  explorationRate: number;
}

export const DEFAULT_CONFIGS: Record<StrategyId, StrategyConfig> = {
  random: {
    highCardThreshold: 12,
    lowCardThreshold: -2,
    columnMatchWeight: 0,
    flipRiskTolerance: 0.5,
    roundEndAggressiveness: 0.5,
    explorationRate: 1.0,
  },
  greedy: {
    highCardThreshold: 5,
    lowCardThreshold: 2,
    columnMatchWeight: 0.3,
    flipRiskTolerance: 0.3,
    roundEndAggressiveness: 0.3,
    explorationRate: 0.05,
  },
  conservative: {
    highCardThreshold: 7,
    lowCardThreshold: 3,
    columnMatchWeight: 0.4,
    flipRiskTolerance: 0.7,
    roundEndAggressiveness: 0.2,
    explorationRate: 0.1,
  },
  aggressive: {
    highCardThreshold: 4,
    lowCardThreshold: 1,
    columnMatchWeight: 0.7,
    flipRiskTolerance: 0.2,
    roundEndAggressiveness: 0.8,
    explorationRate: 0.05,
  },
  balanced: {
    highCardThreshold: 5,
    lowCardThreshold: 2,
    columnMatchWeight: 0.5,
    flipRiskTolerance: 0.5,
    roundEndAggressiveness: 0.5,
    explorationRate: 0.08,
  },
  memory: {
    highCardThreshold: 5,
    lowCardThreshold: 2,
    columnMatchWeight: 0.6,
    flipRiskTolerance: 0.4,
    roundEndAggressiveness: 0.4,
    explorationRate: 0.03,
  },
  "column-hunter": {
    highCardThreshold: 6,
    lowCardThreshold: 3,
    columnMatchWeight: 0.95,
    flipRiskTolerance: 0.6,
    roundEndAggressiveness: 0.3,
    explorationRate: 0.05,
  },
  "risk-taker": {
    highCardThreshold: 3,
    lowCardThreshold: 0,
    columnMatchWeight: 0.2,
    flipRiskTolerance: 0.1,
    roundEndAggressiveness: 0.9,
    explorationRate: 0.15,
  },
};
```

### Simulation Result Types

```typescript
export interface SimulationConfig {
  numGames: number;
  numPlayers: 2 | 3 | 4;
  strategies: StrategyId[]; // One per player
  strategyConfigs?: Partial<Record<StrategyId, Partial<StrategyConfig>>>;
  seed?: number; // For reproducible runs
}

export interface SimulationResult {
  config: SimulationConfig;
  totalGames: number;
  completedGames: number;
  playerResults: PlayerSimResult[];
  gamesData: GameSimData[]; // Per-game data for charts
  duration: number; // Total runtime in ms
  bestStrategy: StrategyId;
  recommendation: string; // Human-readable recommendation
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
  scoreDistribution: number[]; // Histogram buckets
}

export interface GameSimData {
  gameIndex: number;
  winnerIndex: number;
  winnerStrategy: StrategyId;
  playerScores: number[];
  numRounds: number;
}
```

---

## State Management (Pinia)

### `stores/gameStore.ts`

Manages the active game state for the interactive play mode.

**State:**

- `gameState: GameState | null` — current game state
- `turnPhase: 'idle' | 'awaiting-source' | 'awaiting-swap-target' | 'awaiting-flip-target'` — UI turn phases for human player
- `drawnCard: Card | null` — card the human drew (before deciding)
- `selectedAction: 'discard' | 'draw' | null`
- `isAnimating: boolean`
- `gameSpeed: 'slow' | 'normal' | 'fast'` — controls AI turn delay

**Actions:**

- `startNewGame(playerCount, strategies)` — initializes game state
- `humanAction(action: TurnAction)` — processes a human turn
- `executeAITurn()` — runs the current AI player's turn
- `advanceToNextPlayer()` — moves to next player
- `endRound()` — scores the round and prepares next
- `endGame()` — finalizes the game

**Getters:**

- `currentPlayer` — the player whose turn it is
- `isHumanTurn` — whether it's the human's turn
- `humanPlayer` — the human player object
- `isRoundOver` — whether the round has ended
- `isGameOver` — whether cumulative score limit reached
- `roundScores` — computed scores for current round

### `stores/simStore.ts`

Manages self-play simulation state.

**State:**

- `config: SimulationConfig`
- `isRunning: boolean`
- `progress: number` (0-100)
- `result: SimulationResult | null`
- `error: string | null`

**Actions:**

- `startSimulation()` — launches async chunked simulation
- `cancelSimulation()` — stops the simulation
- `exportResults(format: 'csv' | 'json')` — exports result data

### `stores/settingsStore.ts`

**State:**

- `animationSpeed: number` (ms multiplier, default 1.0)
- `showCardValues: boolean` (accessibility: always show face-down card values)
- `soundEnabled: boolean`
- `theme: 'light' | 'dark'`

Persisted to `localStorage`.

---

## Game Engine

### `engine/deck.ts`

```typescript
import { CARD_DISTRIBUTION } from "./constants";
import type { Card } from "./types";

export function createDeck(): Card[] {
  const cards: Card[] = [];
  let id = 0;
  for (const [value, count] of Object.entries(CARD_DISTRIBUTION)) {
    for (let i = 0; i < count; i++) {
      cards.push({ id: id++, value: Number(value) as CardValue });
    }
  }
  return cards;
}

export function shuffleDeck(cards: Card[], rng?: () => number): Card[] {
  const deck = [...cards];
  const random = rng ?? Math.random;
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
```

### `engine/grid.ts`

```typescript
import type { PlayerGrid, GridCell, Card, CardValue } from "./types";

export function createGrid(cards: Card[]): PlayerGrid {
  // Takes 12 cards, creates 3 rows × 4 columns, all face-down
  const grid: PlayerGrid = [];
  let cardIndex = 0;
  for (let row = 0; row < 3; row++) {
    grid[row] = [];
    for (let col = 0; col < 4; col++) {
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
  // Check each column (4 columns)
  for (let col = 0; col < 4; col++) {
    // Column might already be removed (null cards)
    const cells = [grid[0][col], grid[1][col], grid[2][col]];
    if (cells.every((c) => c.card !== null && c.faceUp)) {
      const values = cells.map((c) => c.card!.value);
      if (values[0] === values[1] && values[1] === values[2]) {
        removedColumns.push(col);
        // Remove the cards
        for (let row = 0; row < 3; row++) {
          grid[row][col] = { card: null, faceUp: true };
        }
      }
    }
  }
  return removedColumns;
}

export function allCardsFaceUp(grid: PlayerGrid): boolean {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const cell = grid[row][col];
      if (cell.card !== null && !cell.faceUp) return false;
    }
  }
  return true;
}

export function getFaceDownPositions(
  grid: PlayerGrid,
): { row: number; col: number }[] {
  const positions: { row: number; col: number }[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      if (grid[row][col].card !== null && !grid[row][col].faceUp) {
        positions.push({ row, col });
      }
    }
  }
  return positions;
}

export function getGridScore(grid: PlayerGrid): number {
  let total = 0;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const cell = grid[row][col];
      if (cell.card) total += cell.card.value;
    }
  }
  return total;
}

export function getVisibleScore(grid: PlayerGrid): number {
  let total = 0;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const cell = grid[row][col];
      if (cell.card && cell.faceUp) total += cell.card.value;
    }
  }
  return total;
}
```

### `engine/scoring.ts`

```typescript
import type { Player, RoundResult } from "./types";
import { getGridScore } from "./grid";

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

  // Check penalty: if round ender doesn't have strictly lowest score and score is positive
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
  return players.some((p) => p.cumulativeScore >= 100);
}

export function getWinner(players: Player[]): Player {
  return players.reduce((best, p) =>
    p.cumulativeScore < best.cumulativeScore ? p : best,
  );
}
```

### `engine/rules.ts`

Core game flow logic: validates actions, executes turns, advances phases. This module exposes pure functions that take a `GameState` and return a new state or mutate in place for the headless simulation.

```typescript
import type { GameState, TurnAction, TurnResult, Player, Card } from "./types";
import { createDeck, shuffleDeck } from "./deck";
import {
  createGrid,
  flipCard,
  swapCard,
  checkColumnRemoval,
  allCardsFaceUp,
} from "./grid";

export function initializeRound(
  players: Player[],
  roundNumber: number,
  rng?: () => number,
): GameState {
  const deck = shuffleDeck(createDeck(), rng);
  let cardIndex = 0;

  for (const player of players) {
    const cards = deck.slice(cardIndex, cardIndex + 12);
    player.grid = createGrid(cards);
    cardIndex += 12;
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

  // Check column removal
  result.columnsRemoved = checkColumnRemoval(player.grid);

  // Check if this player has revealed all cards
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
    // Check if all non-ender players have taken their final turn
    const allDone = state.players.every(
      (_, i) => i === state.roundEnderIndex || state.turnsTakenAfterEnd.has(i),
    );
    if (allDone) {
      state.phase = "round-scoring";
      return;
    }
  }

  // Move to next player
  state.currentPlayerIndex =
    (state.currentPlayerIndex + 1) % state.players.length;

  // Skip the round ender in final turns
  if (
    state.phase === "final-turns" &&
    state.currentPlayerIndex === state.roundEnderIndex
  ) {
    state.currentPlayerIndex =
      (state.currentPlayerIndex + 1) % state.players.length;
  }
}

export function drawPileEmpty(state: GameState): boolean {
  return state.drawPile.length === 0;
}

export function reshuffleDiscardIntoDraw(
  state: GameState,
  rng?: () => number,
): void {
  const topDiscard = state.discardPile.pop()!;
  state.drawPile = shuffleDeck(state.discardPile, rng);
  state.discardPile = [topDiscard];
}
```

---

## AI Strategies

All strategies implement the `Strategy` interface. Each has a `StrategyConfig` with tunable parameters that can be adjusted by self-play discovery data.

### Strategy Descriptions

#### 1. Random (`random.ts`)

- Chooses all actions uniformly at random from valid options.
- Serves as the baseline for comparison.

#### 2. Greedy (`greedy.ts`)

- **Draw decision:** Takes discard if value ≤ `lowCardThreshold`; otherwise draws.
- **Swap target:** Always replaces the highest-value known card if the new card is lower. Prefers replacing face-up high cards over face-down unknowns.
- **Discard & flip:** If drawn card is above threshold, discards it and flips the face-down card with the best column-match potential.
- **Column pursuit:** Small weight toward placing cards that could form column matches.

#### 3. Conservative (`conservative.ts`)

- **Draw decision:** Rarely takes from discard (only very low values like ≤ 0). Prefers drawing to gain information.
- **Swap target:** Only swaps if the improvement is significant (drawn card at least `highCardThreshold - lowCardThreshold` lower).
- **Discard & flip:** Frequently discards draws to flip and reveal information.
- **Avoids ending round** unless very confident of having the lowest score.

#### 4. Aggressive (`aggressive.ts`)

- **Draw decision:** Eagerly takes from discard if even marginally beneficial.
- **Swap target:** Replaces any card that's above average. Strongly pursues column matches (`columnMatchWeight` high).
- **Round ending:** Actively tries to end the round when visible score is low, even with some face-down cards remaining.
- **Targets opponents:** Considers opponent visible scores when deciding to end.

#### 5. Balanced (`balanced.ts`)

- Dynamically blends greedy and conservative based on game state:
  - Early in round → more conservative (gather info)
  - Mid-round → greedy optimization
  - Late round (few face-down cards) → more aggressive
- Adjusts `roundEndAggressiveness` based on relative position.

#### 6. Memory (`memory.ts`)

- Tracks all cards seen in the discard pile and revealed in other players' grids.
- **Estimates probabilities** for unknown face-down cards based on remaining card distribution.
- Uses expected value calculations to guide swap decisions.
- Can estimate likelihood of draw pile cards being beneficial.
- Makes column-match decisions based on probability of completing a column.

#### 7. Column Hunter (`column-hunter.ts`)

- **Obsessively pursues column matches** to remove entire columns from the grid.
- **Prioritizes:** Column completion > column pair building > low card taking > match-potential flipping.
- Willing to sacrifice short-term score improvements to build matching columns.
- Takes discards that match an existing column pair, even if the card value is moderate.
- When flipping face-down cards, targets columns with the best match potential.

#### 8. Risk Taker (`risk-taker.ts`)

- **High-variance gambling strategy** — can win big or lose big.
- Only takes very low discards (value ≤ 0); otherwise draws from the pile.
- Aggressively draws and swaps with face-down cards, gambling on unknown values.
- Ends rounds quickly when ahead, betting opponents have worse hidden cards.
- High exploration rate leads to unpredictable play patterns.

### Strategy Config Tuning

Strategies accept a `StrategyConfig` object. The self-play simulation can run parameter sweeps:

```typescript
// Example: tune greedy's high card threshold
const configs: Partial<StrategyConfig>[] = [
  { highCardThreshold: 3 },
  { highCardThreshold: 5 },
  { highCardThreshold: 7 },
];
// Run simulations for each config and compare win rates
```

After a discovery run, results can be saved and loaded as "tuned" configs for strategies used in human-play mode.

---

## Self-Play Simulation Engine

### Architecture

```
Main Thread (async chunked execution)
┌──────────────────────────────────────────────┐
│ SimStore                                      │
│                                              │
│ config ───► runSimulationAsync()             │
│              │                               │
│              ├── batch of ~50 games          │
│              ├── yieldToUI() (setTimeout 0)  │
│              ├── batch of ~50 games          │
│              ├── yieldToUI() → progress      │
│              ├── ...                         │
│              └── finalizeResults()           │
│                                              │
│ progress ◄── onProgress callback             │
│ result ◄──── final SimulationResult          │
└──────────────────────────────────────────────┘
```

**Why async chunked execution?** Running thousands of games blocks the main thread. The simulation runs in batches of ~50 games, yielding to the browser event loop between batches via `setTimeout(0)`. This keeps the UI responsive and allows Vue to re-render progress updates.

### `engine/simulation.ts`

Exports two entry points:

- `runSimulation(config)` — synchronous, for testing
- `runSimulationAsync(config, onProgress)` — async chunked, for the UI

Internal helpers:

- `createSimulationContext(config)` — sets up strategies, RNG, accumulators
- `runSingleGame(context)` — plays one complete game and records results
- `finalizeResults(context)` — aggregates stats into a `SimulationResult`
- `yieldToUI()` — `new Promise(resolve => setTimeout(resolve, 0))`

### `engine/simulation.ts`

```typescript
import type {
  SimulationConfig,
  SimulationResult,
  GameSimData,
  PlayerSimResult,
  StrategyId,
} from "./types";
import { initializeRound, executeTurn, advancePlayer } from "./rules";
import { scoreRound, isGameOver, getWinner } from "./scoring";
import { getStrategy } from "./ai";
import { createSeededRng } from "../utils/random";

export function runSimulation(
  config: SimulationConfig,
  onProgress?: (completed: number, total: number) => void,
): SimulationResult {
  const startTime = performance.now();
  const rng = config.seed ? createSeededRng(config.seed) : undefined;

  const gamesData: GameSimData[] = [];
  const winsPerPlayer = new Array(config.numPlayers).fill(0);
  const scoresPerPlayer: number[][] = Array.from(
    { length: config.numPlayers },
    () => [],
  );

  const strategies = config.strategies.map((id) =>
    getStrategy(id, config.strategyConfigs?.[id]),
  );

  for (let game = 0; game < config.numGames; game++) {
    const players = createPlayers(config);
    let roundNumber = 0;

    // Play rounds until game over
    while (!isGameOver(players)) {
      roundNumber++;
      const state = initializeRound(players, roundNumber, rng);

      // AI setup flips
      for (const player of players) {
        const strategy = strategies[player.id];
        const flips = strategy.chooseSetupFlips({
          gameState: state,
          player,
          topDiscard: state.discardPile[state.discardPile.length - 1],
          config: strategy.config,
        });
        flipCard(player.grid, flips[0].row, flips[0].col);
        flipCard(player.grid, flips[1].row, flips[1].col);
      }

      // Determine first player (highest sum of revealed cards for round 1)
      state.currentPlayerIndex = determineFirstPlayer(state, roundNumber);
      state.phase = "playing";

      // Play turns
      while (state.phase === "playing" || state.phase === "final-turns") {
        const player = state.players[state.currentPlayerIndex];
        const strategy = strategies[player.id];
        const action = strategy.chooseTurnAction({
          gameState: state,
          player,
          topDiscard: state.discardPile[state.discardPile.length - 1],
          config: strategy.config,
        });
        executeTurn(state, action);
        advancePlayer(state);

        // Safety: reshuffle if draw pile empty
        if (state.drawPile.length === 0) {
          reshuffleDiscardIntoDraw(state, rng);
        }
      }

      // Score the round
      // Flip all remaining face-down cards
      for (const player of players) {
        flipAllCards(player.grid);
        checkColumnRemoval(player.grid);
      }

      const roundResult = scoreRound(
        players,
        state.roundEnderIndex!,
        roundNumber,
      );
      for (const ps of roundResult.playerScores) {
        const player = players.find((p) => p.id === ps.playerId)!;
        player.cumulativeScore += ps.finalScore;
        player.roundScores.push(ps.finalScore);
      }
    }

    // Record game results
    const winner = getWinner(players);
    winsPerPlayer[winner.id]++;
    for (const player of players) {
      scoresPerPlayer[player.id].push(player.cumulativeScore);
    }
    gamesData.push({
      gameIndex: game,
      winnerIndex: winner.id,
      winnerStrategy: config.strategies[winner.id],
      playerScores: players.map((p) => p.cumulativeScore),
      numRounds: roundNumber,
    });

    if (onProgress && game % 100 === 0) {
      onProgress(game, config.numGames);
    }
  }

  // Aggregate results
  const playerResults: PlayerSimResult[] = config.strategies.map(
    (strategyId, i) => ({
      playerIndex: i,
      strategyId,
      wins: winsPerPlayer[i],
      winRate: winsPerPlayer[i] / config.numGames,
      avgScore: mean(scoresPerPlayer[i]),
      medianScore: median(scoresPerPlayer[i]),
      minScore: Math.min(...scoresPerPlayer[i]),
      maxScore: Math.max(...scoresPerPlayer[i]),
      stdDeviation: stdDev(scoresPerPlayer[i]),
      avgRoundsPerGame: mean(gamesData.map((g) => g.numRounds)),
      scoreDistribution: histogram(scoresPerPlayer[i], 20),
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
    gamesData,
    duration: performance.now() - startTime,
    bestStrategy: playerResults[bestIdx].strategyId,
    recommendation: generateRecommendation(playerResults, config.numPlayers),
  };
}
```

### Recommendation Generation

After simulation, the engine generates a human-readable recommendation:

```
"In 10,000 games with 3 players, the Memory strategy performed best with a
42.3% win rate (avg score: 47.2). The Balanced strategy came second at 31.1%.
For 3-player games, we recommend the Memory strategy with the following tuned
parameters: highCardThreshold=4, columnMatchWeight=0.7..."
```

### Export Formats

**CSV Export:**

```csv
game,winner_strategy,player_0_strategy,player_0_score,player_1_strategy,player_1_score,...
1,memory,greedy,87,memory,42,aggressive,103
```

**JSON Export:**
Full `SimulationResult` object serialized.

---

## UI Design

### Visual Theme

- **Card table green** background (`bg-emerald-800` / `bg-emerald-900`)
- Cards are rounded rectangles with drop shadows
- Face-down cards have a dark blue pattern
- Face-up cards are color-coded by value:
  - **-2:** Gold/Yellow (highlight – best card)
  - **-1, 0:** Green
  - **1–4:** White/Light gray
  - **5–8:** Orange
  - **9–12:** Red (danger – worst cards)
- Player areas have subtle borders; active player is highlighted
- The human player is always at the bottom of the screen

### Layout — Game Board (`play.vue`)

```
┌──────────────────────────────────────────────────────┐
│  ╔═══ Header: Round X · Player Turn · Scores ════╗   │
│  ║                                                ║   │
│  ╚════════════════════════════════════════════════╝   │
│                                                      │
│  ┌─── Opponent 1 ───┐  ┌─── Opponent 2 ───┐         │
│  │ [?][3][?][?]      │  │ [?][7][?][?]      │        │
│  │ [?][?][2][?]      │  │ [?][?][?][?]      │        │
│  │ [?][?][?][?]      │  │ [?][?][1][?]      │        │
│  │ Score: 5          │  │ Score: 8          │         │
│  └───────────────────┘  └───────────────────┘        │
│                                                      │
│       ┌──────────┐          ┌──────────┐             │
│       │  DRAW    │          │ DISCARD  │             │
│       │  PILE    │          │  [  6 ]  │             │
│       │ (87)     │          │          │             │
│       └──────────┘          └──────────┘             │
│                                                      │
│  ┌────────────── You ───────────────────────┐        │
│  │  [ 5 ][ ? ][ 0 ][ ? ]                   │        │
│  │  [ ? ][ ? ][ ? ][ ? ]                   │        │
│  │  [ ? ][ 11][ ? ][ ? ]                   │        │
│  │  Visible Score: 16                       │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  ┌──── Action Panel ─────────────────────────┐       │
│  │  Take from discard (6)  |  Draw from pile │       │
│  └───────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────┘
```

### Layout — Simulation (`simulation.vue`)

```
┌──────────────────────────────────────────────────────┐
│  Strategy Simulation                                  │
│                                                      │
│  Number of Players: [2] [3] [4]                      │
│                                                      │
│  Player 1 Strategy: [▼ Greedy    ]                   │
│  Player 2 Strategy: [▼ Memory    ]                   │
│  Player 3 Strategy: [▼ Aggressive]                   │
│                                                      │
│  Number of Games: [10000]                            │
│  Seed (optional): [______]                           │
│                                                      │
│  [ ▶ Run Simulation ]                                │
│                                                      │
│  ┌──── Progress ─────────────────────────┐           │
│  │ ████████████░░░░░░░░ 62% (6,200/10,000)│          │
│  └───────────────────────────────────────┘           │
└──────────────────────────────────────────────────────┘
```

### Layout — Results (`results.vue`)

```
┌──────────────────────────────────────────────────────┐
│  Simulation Results — 10,000 games, 3 players        │
│                                                      │
│  ┌──── Summary Table ───────────────────────────┐    │
│  │ Strategy    │ Wins  │ Win%  │ Avg  │ Median  │    │
│  │ Greedy      │ 2,831 │ 28.3% │ 52.1 │ 49     │    │
│  │ Memory      │ 4,230 │ 42.3% │ 47.2 │ 44     │    │
│  │ Aggressive  │ 2,939 │ 29.4% │ 55.8 │ 53     │    │
│  └─────────────────────────────────────────────┘     │
│                                                      │
│  ┌──── Win Rate Chart ─────┐ ┌── Score Dist. ────┐  │
│  │   ██                    │ │  ▁▃▆█▇▅▃▁         │  │
│  │   ██  ████              │ │                    │  │
│  │   ██  ████  ██          │ │  histogram...      │  │
│  └─────────────────────────┘ └────────────────────┘  │
│                                                      │
│  📊 Recommendation:                                  │
│  "Memory strategy performs best in 3-player games..." │
│                                                      │
│  [ Export CSV ] [ Export JSON ] [ Run Again ]         │
└──────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
app.vue
├── AppHeader.vue (Play, Strategies, Simulate nav)
├── <NuxtPage />
│   ├── index.vue (Home)
│   │   └── (route to /play, /strategies, or /simulation)
│   │
│   ├── play.vue (Game)
│   │   ├── GameSetup.vue (pre-game: select opponents & strategies)
│   │   └── GameBoard.vue (during game — viewport-fitting flex layout)
│   │       ├── Scoreboard.vue
│   │       ├── PlayerGrid.vue (×N, one per player; opponents use compact mode)
│   │       │   └── CardSlot.vue (×12 per grid)
│   │       │       └── Card.vue
│   │       ├── DrawPile.vue
│   │       ├── DiscardPile.vue
│   │       │   └── Card.vue
│   │       ├── ActionPanel.vue
│   │       ├── RoundSummary.vue (modal overlay after round)
│   │       └── GameOverOverlay.vue (modal overlay after game)
│   │
│   ├── strategies.vue
│   │   └── (strategy cards with icons, difficulty, traits)
│   │
│   └── simulation.vue
│       ├── SimulationConfig.vue
│       ├── SimulationProgress.vue
│       ├── SimulationSummary.vue
│       ├── ResultsTable.vue
│       ├── WinRateChart.vue
│       ├── WinRateConvergence.vue
│       ├── ScoreDistribution.vue
│       ├── ScoreTrend.vue
│       ├── ScoreRange.vue
│       ├── RoundsDistribution.vue
│       ├── StrategyComparison.vue
│       └── ExportButton.vue
│
└── AppFooter.vue
```

---

## Animations & Interactions

### Card Flip Animation

- CSS 3D transform: `rotateY(180deg)` with `backface-visibility: hidden`
- Duration: 400ms ease-in-out
- Front face shows value + color; back face shows card back pattern

### Card Swap Animation

- Outgoing card slides up and fades out (300ms)
- Incoming card slides down into position and fades in (300ms)
- Net movement creates a "replacement" feel

### Column Removal Animation

- 3 matching cards glow briefly (gold border pulse, 500ms)
- Cards shrink and fade out simultaneously (400ms)
- Remaining columns slide to fill gap (300ms)

### AI Turn Visualization

- Brief highlight on AI player's area (pulse border)
- Show drawn/discard card floating above grid momentarily
- Animate the card moving to its target slot
- Configurable speed: Slow (1.5s per step), Normal (0.8s), Fast (0.3s)

### Score Animations

- Numbers count up/down to final value
- Doubled scores flash red
- Negative scores glow green

### Interactions (Human Player)

- **Click draw pile or discard pile** to pick a card source
- After drawing: **click a grid slot** to swap, or **click discard button** to discard + flip
- Hoverable card slots glow when they're valid targets
- Disabled/unavailable actions are grayed out
- Clear text prompts in the ActionPanel guide the player through each step

---

## Routing

| Route         | Page             | Description                                                     |
| ------------- | ---------------- | --------------------------------------------------------------- |
| `/`           | `index.vue`      | Main menu with Play, Strategies, and Simulate options           |
| `/play`       | `play.vue`       | Game setup → active game board                                  |
| `/strategies` | `strategies.vue` | Strategy descriptions, difficulty ratings, and trait breakdowns |
| `/simulation` | `simulation.vue` | Configure, run, and view self-play simulation results inline    |

All routes are client-side only (SPA mode).

---

## Testing Strategy

### Unit Tests (`vitest`)

| Module                 | Tests                                                                      |
| ---------------------- | -------------------------------------------------------------------------- |
| `engine/deck.ts`       | Deck has 150 cards, correct distribution, shuffle produces different order |
| `engine/grid.ts`       | Grid creation, flip, swap, column removal detection, score calculation     |
| `engine/scoring.ts`    | Round scoring, penalty doubling logic, game-over detection                 |
| `engine/rules.ts`      | Turn execution for all 3 action types, player advancement, round flow      |
| `engine/ai/*.ts`       | Each strategy returns valid actions, respects config parameters            |
| `engine/simulation.ts` | Full simulation completes, results have correct structure                  |

### Component Tests (`@vue/test-utils`)

- `Card.vue` renders correct value and color
- `PlayerGrid.vue` displays 3×4 grid, handles clicks
- `ActionPanel.vue` shows correct actions per turn phase
- `SimulationConfig.vue` validates inputs

### Integration Tests

- Full game round cycle: setup → turns → scoring → next round
- Human+AI game completes without errors
- Simulation of 100 games produces valid results

---

## Build & Deployment

### Nuxt Config (`nuxt.config.ts`)

```typescript
export default defineNuxtConfig({
  ssr: false,
  modules: ["@pinia/nuxt", "@nuxtjs/tailwindcss"],
  app: {
    head: {
      title: "SkyJo",
      meta: [
        {
          name: "description",
          content: "Play SkyJo card game against AI opponents",
        },
      ],
    },
  },
  tailwindcss: {
    cssPath: "~/assets/css/main.css",
  },
});
```

### Scripts

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt generate",
    "preview": "nuxt preview",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint .",
    "typecheck": "nuxi typecheck"
  }
}
```

### Deployment

- `nuxt generate` outputs static files to `.output/public/`
- Can be deployed to any static host (Netlify, Vercel, GitHub Pages, etc.)

---

## Implementation Phases

### Phase 1: Foundation ✅

- [x] Initialize Nuxt project with Tailwind, Pinia, TypeScript
- [x] Implement `engine/types.ts`, `engine/constants.ts`
- [x] Implement `engine/deck.ts` with tests
- [x] Implement `engine/grid.ts` with tests
- [x] Implement `engine/scoring.ts` with tests
- [x] Implement `engine/rules.ts` with tests

### Phase 2: AI Strategies ✅

- [x] Implement `StrategyConfig` in `engine/types.ts`
- [x] Implement Random strategy with tests
- [x] Implement Greedy strategy with tests
- [x] Implement Conservative strategy with tests
- [x] Implement Aggressive strategy with tests
- [x] Implement Balanced strategy with tests
- [x] Implement Memory strategy with tests
- [x] Implement Column Hunter strategy
- [x] Implement Risk Taker strategy
- [x] Strategy registry and factory (`engine/ai/index.ts`)

### Phase 3: Game UI ✅

- [x] Build `Card.vue` and `CardSlot.vue` with flip animation
- [x] Build `PlayerGrid.vue` with compact mode for opponents
- [x] Build `DrawPile.vue` and `DiscardPile.vue`
- [x] Build `GameBoard.vue` layout (viewport-fitting flex design)
- [x] Build `ActionPanel.vue` for human interaction
- [x] Build `Scoreboard.vue`
- [x] Implement `gameStore.ts`
- [x] Wire human turn flow (click draw/discard → select target → execute)
- [x] Implement AI turn execution with `useAI.ts` and visual delays
- [x] Build `RoundSummary.vue` and `GameOverOverlay.vue`
- [x] Build `GameSetup.vue`

### Phase 4: Navigation & Pages ✅

- [x] Build `AppHeader.vue` with Play, Strategies, Simulate nav
- [x] Set up page routing (`index.vue`, `play.vue`, `strategies.vue`, `simulation.vue`)
- [x] Build `settingsStore.ts` with localStorage persistence
- [x] Build strategies page with descriptions, difficulty, and traits

### Phase 5: Self-Play Simulation ✅

- [x] Implement `engine/simulation.ts` headless game loop (sync + async chunked)
- [x] Build `SimulationConfig.vue`
- [x] Build `SimulationProgress.vue`
- [x] Implement `simStore.ts` with async chunked simulation

### Phase 6: Results & Analytics ✅

- [x] Install and configure Chart.js + vue-chartjs
- [x] Build `SimulationSummary.vue` (stat cards)
- [x] Build `ResultsTable.vue`
- [x] Build `WinRateChart.vue` (bar chart)
- [x] Build `WinRateConvergence.vue` (line chart)
- [x] Build `ScoreDistribution.vue` (histogram)
- [x] Build `ScoreTrend.vue` (line chart)
- [x] Build `ScoreRange.vue` (box-plot visualization)
- [x] Build `RoundsDistribution.vue` (histogram)
- [x] Build `StrategyComparison.vue` (radar chart)
- [x] Implement recommendation generation
- [x] Build `ExportButton.vue` with CSV and JSON export

### Phase 7: Polish ✅

- [x] Card flip animations
- [x] Responsive design with viewport-fitting game board
- [x] Color-coded card values
- [x] Comprehensive game flow (setup → play → round scoring → game over)
- [x] Async simulation with progress bar updates

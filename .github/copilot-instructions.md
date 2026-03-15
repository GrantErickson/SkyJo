# Copilot Instructions for SkyJo

## Project Overview

SkyJo is a client-side card game built with **Nuxt 4 (SPA mode)** where a human player competes against 1–3 AI opponents. It also includes a **self-play simulation mode** where AI strategies compete against each other over configurable run sizes to discover optimal strategies. Results include interactive charts and exportable data.

There is no backend — all game logic runs in the browser via a pure TypeScript engine.

## Tech Stack

| Layer      | Technology              | Purpose                                 |
| ---------- | ----------------------- | --------------------------------------- |
| Framework  | Nuxt 4 (`ssr: false`)   | Vue 3 app framework, file-based routing |
| Styling    | Tailwind CSS 3          | Utility-first styling                   |
| State      | Pinia                   | Reactive state management               |
| Charts     | Chart.js + vue-chartjs  | Simulation result visualization         |
| Icons      | lucide-vue-next         | UI icons                                |
| Language   | TypeScript              | Type-safe development                   |
| Testing    | Vitest                  | Unit tests                              |

## Build & Run Commands

All commands run from the `skyjo-app/` directory:

```bash
cd skyjo-app
npm install          # Install dependencies
npm run dev          # Dev server with hot reload
npm run build        # Static site generation (nuxt generate)
npm run preview      # Preview production build
npm run test         # Run Vitest unit tests
npm run typecheck    # TypeScript validation
```

## Project Structure

```
skyjo-app/
├── app.vue                  # Root component (header + NuxtPage + footer)
├── pages/                   # File-based routing (index, play, simulation, strategies, instructions)
├── components/
│   ├── ui/                  # Reusable UI components (BaseButton, BaseModal, AppHeader, AppFooter)
│   ├── game/                # Game board components (Card, PlayerGrid, DrawPile, etc.)
│   └── simulation/          # Simulation analytics components (charts, tables, export)
├── stores/                  # Pinia stores (gameStore, simStore, settingsStore)
├── engine/                  # Pure TypeScript game engine (no Vue dependencies)
│   ├── types.ts             # All interfaces and type definitions
│   ├── constants.ts         # Card distribution, strategy configs
│   ├── deck.ts              # Deck creation and shuffling
│   ├── grid.ts              # Grid operations (flip, swap, column removal)
│   ├── scoring.ts           # Round scoring with doubling penalty
│   ├── rules.ts             # Turn execution, round initialization
│   ├── simulation.ts        # Headless game loop (sync + async)
│   └── ai/                  # 8 AI strategy implementations
├── composables/             # Vue composables (useAI)
├── utils/                   # Helper functions (colors, formatters, stats, random)
└── assets/css/main.css      # Tailwind entry + card animations
```

## Coding Conventions

### TypeScript

- Use strict TypeScript with explicit type annotations for function parameters and return types.
- Define types and interfaces in `engine/types.ts` for game-related models.
- Use union types for constrained values (e.g., `CardValue`, `StrategyId`, `GamePhase`).
- Use `Readonly<>` wrapper for strategy context parameters to prevent mutation.
- Prefer `export function` over arrow function exports for top-level functions.

### Vue Components

- Use `<script setup lang="ts">` for all components (Composition API).
- Use `defineProps` with TypeScript generics (not runtime declaration).
- Use `withDefaults()` for default prop values.
- Use `defineEmits` with TypeScript-based event signatures.
- Use `computed()` for derived state instead of methods.
- Components are organized into `ui/`, `game/`, and `simulation/` subdirectories.

### State Management

- Pinia stores use the Options API style (`defineStore` with `state`, `getters`, `actions`).
- Three stores: `gameStore` (interactive game), `simStore` (simulation), `settingsStore` (persisted preferences).
- The `settingsStore` uses `persist: true` for localStorage persistence.

### Styling & UI

- **Use Tailwind CSS utility classes** — no custom CSS except for card animations in `main.css`.
- **Color theme:** Deep indigo/violet palette. The custom `table` color (`#312e81`, `#3730a3`, `#1e1b4b`) is used for backgrounds.
- **Card value colors** (defined in `utils/colors.ts`):
  - `-2` → Yellow (`bg-yellow-400`)
  - `≤ 0` → Emerald green (`bg-emerald-500`)
  - `1–4` → Gray (`bg-gray-100`)
  - `5–8` → Orange (`bg-orange-400`)
  - `9+` → Red (`bg-red-500`)
- **Button variants:** primary (indigo), secondary (white/translucent), danger (red), ghost (transparent).
- **Animations:** Card flip (3D `rotateY`), glow pulse, slide up/down — defined in `tailwind.config.ts`.
- Make UIs look polished with shadows, rounded corners (`rounded-lg`, `rounded-xl`), smooth transitions, and appropriate spacing.
- Use `lucide-vue-next` icons for UI elements.
- All pages use a dark background (`bg-table-dark`) with white text.

### Game Engine Architecture

- The `engine/` directory contains **pure TypeScript** with zero Vue/Nuxt dependencies.
- Game logic is fully separated from UI — stores bridge the engine to Vue components.
- AI strategies implement the `Strategy` interface with `chooseSetupFlips()` and `chooseTurnAction()` methods.
- The simulation engine runs headless game loops for self-play analysis.
- Use the seeded RNG (`utils/random.ts`, Mulberry32) for reproducible simulations.

## Game Rules Summary

- 150-card deck with values from -2 to 12.
- Each player has a 3×4 grid (3 rows, 4 columns) of face-down cards.
- Players flip 2 cards during setup, then take turns drawing/swapping/flipping.
- **Column removal:** When all 3 cards in a column match and are face-up, the column is removed.
- **Round ending:** A round ends when any player reveals all cards; others get 1 more turn.
- **Doubling penalty:** The round-ender's positive score is doubled if it isn't the lowest.
- **Game end:** Game ends when any player reaches 100+ cumulative points; lowest total wins.

## Testing Guidelines

- Use **Vitest** for unit tests.
- The pure game engine (`engine/`) is ideal for unit testing since it has no Vue dependencies.
- Test files should be co-located or placed in a `__tests__` directory.
- Focus tests on game logic: deck operations, grid operations, scoring, and AI strategy decisions.

## PR and Code Quality

- Run `npm run typecheck` to ensure TypeScript validity.
- Run `npm run build` to verify the static site generates successfully.
- Run `npm run test` to execute unit tests.
- Keep the game engine (`engine/`) free of Vue/Nuxt imports.
- Ensure new UI components follow the existing indigo/violet theme and use Tailwind utilities.

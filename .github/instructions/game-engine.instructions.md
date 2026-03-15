---
applyTo: "skyjo-app/engine/**/*.ts"
---

# Game Engine Instructions

## Architecture

The `engine/` directory contains **pure TypeScript** — never import from Vue, Nuxt, Pinia, or any browser API. This keeps the engine testable and framework-agnostic.

## Type Safety

- All types and interfaces are defined in `types.ts`. Import from there, not inline.
- Use the `CardValue` union type (`-2 | -1 | 0 | ... | 12`) for card values.
- Use `StrategyId` for strategy identification.
- Use `Readonly<>` wrappers for strategy context parameters to prevent mutation.

## Module Responsibilities

- `types.ts` — All interfaces, types, and enums.
- `constants.ts` — Card distribution array, default strategy configs.
- `deck.ts` — `createDeck()`, `shuffleDeck()`.
- `grid.ts` — Grid cell operations (flip, swap, check/remove matching columns).
- `scoring.ts` — Round score calculation including the doubling penalty.
- `rules.ts` — Turn execution logic and round initialization.
- `simulation.ts` — Headless game loop for self-play (sync and async variants).

## AI Strategy Implementation

All strategies implement the `Strategy` interface from `types.ts`:

```typescript
export interface Strategy {
  id: StrategyId;
  name: string;
  description: string;
  config: StrategyConfig;
  chooseSetupFlips(context: StrategyContext): [GridPosition, GridPosition];
  chooseTurnAction(context: StrategyContext): TurnAction;
  chooseDrawAction?(drawnCard: Card, context: StrategyContext): TurnAction;
}
```

When adding new strategies:
1. Create a new file in `engine/ai/` named after the strategy (e.g., `my-strategy.ts`).
2. Implement the `Strategy` interface.
3. Register it in `engine/ai/index.ts` strategy factory.
4. Add the new `StrategyId` to the union type in `types.ts`.

## Testing

- Engine code is ideal for unit testing with Vitest since it has no framework dependencies.
- Use the seeded RNG (`utils/random.ts`) for deterministic, reproducible test scenarios.
- Test edge cases: column removal, doubling penalty, round-ending logic, deck exhaustion.

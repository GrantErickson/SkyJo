import { CARD_DISTRIBUTION } from "./constants";
import type { Card, CardValue } from "./types";

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
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

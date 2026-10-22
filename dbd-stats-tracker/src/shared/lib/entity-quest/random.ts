import type { Rng } from "./types";

export function randomInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function randomChoice<T>(rng: Rng, items: readonly T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(rng() * items.length)];
}

/** Picks a key with probability proportional to its weight; zero/negative weights never win. */
export function weightedChoice<K extends string>(rng: Rng, weights: Readonly<Record<K, number>>): K {
  const entries = (Object.entries(weights) as [K, number][]).filter(([, weight]) => weight > 0);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = rng() * total;
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll < 0) return key;
  }
  return entries[entries.length - 1][0];
}

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

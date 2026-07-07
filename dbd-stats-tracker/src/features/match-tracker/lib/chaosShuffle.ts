import type { PerkDefinition } from "../../../shared/data/perks";

/** Draws `count` distinct perk names at random from the pool (Fisher-Yates partial shuffle). */
export function pickRandomPerks(pool: readonly PerkDefinition[], count: number): string[] {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count).map((perk) => perk.name);
}

/** Picks one random item from the pool, or `undefined` if it's empty. */
export function pickRandomItem<T>(pool: readonly T[]): T | undefined {
  if (pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)];
}

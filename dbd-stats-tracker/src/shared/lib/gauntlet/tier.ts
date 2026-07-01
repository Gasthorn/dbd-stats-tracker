/**
 * Faithful port of legacy-web-prototype/js/app.js's Survivor/Killer Gauntlet logic
 * (getGauntletTierInfo, validateGauntletBuild, rollGauntletSurvivor's draw algorithm).
 */
export interface GauntletTierInfo {
  tier: 1 | 2 | 3 | 4 | 5;
  name: string;
  perksLabel: string;
  /** How many completed characters to roll back to on a loss at this tier. */
  checkpoint: number;
}

export function getGauntletTierInfo(completedCount: number, totalUnlocked: number): GauntletTierInfo {
  const segment = totalUnlocked / 5;
  if (completedCount < segment) {
    return { tier: 1, name: "The Warm Up", perksLabel: "4 Perks (1 Unique)", checkpoint: 0 };
  }
  if (completedCount < segment * 2) {
    return { tier: 2, name: "The Thinning", perksLabel: "3 Perks (1 Unique)", checkpoint: Math.floor(segment) };
  }
  if (completedCount < segment * 3) {
    return {
      tier: 3,
      name: "The Struggle",
      perksLabel: "2 Perks (1 Unique)",
      checkpoint: Math.floor(segment * 2),
    };
  }
  if (completedCount < segment * 4) {
    return {
      tier: 4,
      name: "The Hardcore",
      perksLabel: "1 Perk (Character Unique)",
      checkpoint: Math.floor(segment * 3),
    };
  }
  return { tier: 5, name: "The Legend", perksLabel: "No Perks Allowed", checkpoint: Math.floor(segment * 4) };
}

function normalizeCharacterName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Perks owned specifically by this character (matched the same accent/case/space-insensitive way as legacy). */
export function getCharacterUniquePerkNames<T extends { name: string; owner: string }>(
  perks: readonly T[],
  characterName: string,
): string[] {
  const normalized = normalizeCharacterName(characterName);
  return perks.filter((perk) => normalizeCharacterName(perk.owner) === normalized).map((perk) => perk.name);
}

export function isGauntletBuildValid(
  perks: readonly string[],
  uniquePerkNames: readonly string[],
  tier: GauntletTierInfo,
): boolean {
  const activePerks = perks.filter((perk) => perk && perk !== "None");
  const hasUnique = activePerks.some((perk) => uniquePerkNames.includes(perk));

  switch (tier.tier) {
    case 1:
      return activePerks.length <= 4 && hasUnique;
    case 2:
      return activePerks.length <= 3 && hasUnique;
    case 3:
      return activePerks.length <= 2 && hasUnique;
    case 4:
      return activePerks.length === 1 && hasUnique;
    default:
      return activePerks.length === 0;
  }
}

/**
 * Draws the next character from the queue, reshuffling (Fisher-Yates) a fresh queue of the
 * still-uncompleted unlocked roster when it runs out.
 */
export function drawNextGauntletCharacter(
  queue: readonly string[],
  completed: readonly string[],
  allUnlocked: readonly string[],
): { next: string | null; queue: string[] } {
  let currentQueue = [...queue];

  if (currentQueue.length === 0) {
    const remaining = allUnlocked.filter((character) => !completed.includes(character));
    if (remaining.length === 0) return { next: null, queue: [] };

    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    currentQueue = remaining;
  }

  const [next, ...rest] = currentQueue;
  return { next: next ?? null, queue: rest };
}

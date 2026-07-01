/**
 * Faithful port of legacy-web-prototype/js/app.js's Hardcore rank/season logic
 * (HC_TIERS, HC_SUBRANKS, HC_COLORS, getHardcoreSeason, calculateRank).
 */
export const HARDCORE_TIERS = ["Ash", "Bronze", "Silver", "Gold", "Iridescent"] as const;
export const HARDCORE_SUBRANKS = ["IV", "III", "II", "I"] as const;

export const HARDCORE_TIER_COLORS: Record<(typeof HARDCORE_TIERS)[number], string> = {
  Ash: "#b1b1b1",
  Bronze: "#cd7f32",
  Silver: "#e8e8e8",
  Gold: "#ffd700",
  Iridescent: "#a91d1d",
};

export interface HardcoreRank {
  name: string;
  current: number;
  /** Pips needed to reach the next rank, or null once at the max rank (Iridescent I). */
  needed: number | null;
  color: string;
}

/**
 * Season resets on the 13th of each month (matches legacy's cadence, presumably aligned
 * with DbD's mid-chapter patch schedule).
 */
export function getHardcoreSeasonId(now: Date = new Date()): string {
  let year = now.getFullYear();
  let month = now.getMonth();
  if (now.getDate() < 13) {
    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
  }
  return `Saison-${year}-${month + 1}`;
}

const PIP_REQUIREMENTS = [
  3, 3, 4, 4, // Ash IV, III, II, I
  4, 4, 4, 4, // Bronze IV, III, II, I
  5, 5, 5, 5, // Silver IV, III, II, I
  5, 5, 5, 5, // Gold IV, III, II, I
  5, 5, 5, // Iridescent IV, III, II
];

export function calculateHardcoreRank(totalPips: number): HardcoreRank {
  let remaining = totalPips;

  for (let i = 0; i < PIP_REQUIREMENTS.length; i++) {
    const needed = PIP_REQUIREMENTS[i];
    if (remaining < needed) {
      const tierIndex = Math.floor(i / 4);
      const subIndex = i % 4;
      const tierName = HARDCORE_TIERS[tierIndex];
      return {
        name: `${tierName} ${HARDCORE_SUBRANKS[subIndex]}`,
        current: remaining,
        needed,
        color: HARDCORE_TIER_COLORS[tierName],
      };
    }
    remaining -= needed;
  }

  return {
    name: "Iridescent I Max",
    current: remaining,
    needed: null,
    color: HARDCORE_TIER_COLORS.Iridescent,
  };
}

/**
 * Perks allowed for a Hardcore match: Base Kit perks are always available; character-owned
 * perks require the owner to be unlocked, and the owner must still be alive this season
 * unless it's the character currently being played (they aren't "dead" until this match ends).
 */
export function getAvailableHardcorePerks<T extends { owner: string }>(
  perks: readonly T[],
  unlockedCharacters: readonly string[],
  deadCharacters: readonly string[],
  selectedCharacterName: string,
): T[] {
  return perks.filter((perk) => {
    if (perk.owner === "Base Kit") return true;
    const isUnlocked = unlockedCharacters.includes(perk.owner);
    if (!isUnlocked && perk.owner !== selectedCharacterName) return false;
    return !deadCharacters.includes(perk.owner) || perk.owner === selectedCharacterName;
  });
}

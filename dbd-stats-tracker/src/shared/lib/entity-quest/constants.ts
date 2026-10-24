import type { CollectibleKind, QuestDifficulty, QuestMission, QuestRarity, QuestRole } from "./types";

/**
 * Tuning values. Unless noted, numbers are lifted from Crown Quest's own source
 * so the run pacing (rarity curve, prices, event odds) matches the original.
 */
export const QUEST_FLOORS = 13;
export const QUEST_CHEST_FLOOR = 6;
export const QUEST_BOSS_FLOOR = QUEST_FLOORS - 1;
export const MIN_NODES_PER_FLOOR = 2;
export const MAX_NODES_PER_FLOOR = 4;

export const RARITY_ORDER: readonly QuestRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

export interface DifficultySettings {
  lives: number;
  shardMultiplier: number;
}

export const DIFFICULTY_SETTINGS: Record<QuestDifficulty, DifficultySettings> = {
  easy: { lives: 5, shardMultiplier: 1.5 },
  medium: { lives: 3, shardMultiplier: 1 },
  impossible: { lives: 1, shardMultiplier: 1 },
};

export const QUEST_DIFFICULTIES: readonly QuestDifficulty[] = ["easy", "medium", "impossible"];

/** Node types on floors 2-12 (floor 1 is all trials, floor 7 all chests, floor 13 the boss). */
export const NODE_TYPE_WEIGHTS = { trial: 50, event: 20, hard_trial: 15, shop: 15 } as const;

/** Trial missions per role (hooks are killer-only, unhooks/heals survivor-only). */
export const MISSION_WEIGHTS: Record<QuestRole, Partial<Record<QuestMission, number>>> = {
  killer: { standard: 34, generators: 22, bloodpoints: 22, hooks: 22 },
  survivor: { standard: 28, generators: 18, bloodpoints: 18, unhooks: 18, heals: 18 },
};

/**
 * Variety on a floor: each node type / mission already rolled on the same floor multiplies its
 * weight by this factor for the next nodes, so a row rarely repeats itself.
 */
export const SAME_FLOOR_TYPE_PENALTY = 0.12;
export const SAME_FLOOR_MISSION_PENALTY = 0.15;

/**
 * Odds of each collectible kind when a trial/event hands out an unlock (Crown Quest is
 * 50/50 characters/karts). Both roles lean on perks, which shape a build far more.
 */
export const UNLOCK_KIND_WEIGHTS: Record<QuestRole, Partial<Record<CollectibleKind, number>>> = {
  killer: { character: 25, perk: 75 },
  survivor: { perk: 75, equipment: 25 },
};

/**
 * When an unlock of this kind drops, the player picks one among this many options of the
 * same rarity (perks are numerous, so a choice keeps builds coherent). Kinds not listed are
 * granted directly. Shop purchases are already a choice and are not affected.
 */
export const UNLOCK_CHOICES: Partial<Record<CollectibleKind, number>> = { perk: 3, character: 2 };

export type RarityWeights = Record<QuestRarity, number>;

/** Unlock rarity odds per floor (0-based). Crown Quest skips floor 6 (always a chest); it's interpolated here. */
export const FLOOR_RARITY_WEIGHTS: Record<number, RarityWeights> = {
  0: { common: 80, uncommon: 20, rare: 0, epic: 0, legendary: 0 },
  1: { common: 68, uncommon: 27, rare: 5, epic: 0, legendary: 0 },
  2: { common: 55, uncommon: 33, rare: 12, epic: 0, legendary: 0 },
  3: { common: 42, uncommon: 35, rare: 23, epic: 0, legendary: 0 },
  4: { common: 28, uncommon: 33, rare: 31, epic: 8, legendary: 0 },
  5: { common: 14, uncommon: 28, rare: 32, epic: 26, legendary: 0 },
  6: { common: 7, uncommon: 23, rare: 35, epic: 35, legendary: 0 },
  7: { common: 0, uncommon: 18, rare: 38, epic: 44, legendary: 0 },
  8: { common: 0, uncommon: 10, rare: 26, epic: 50, legendary: 14 },
  9: { common: 0, uncommon: 0, rare: 22, epic: 58, legendary: 20 },
  10: { common: 0, uncommon: 0, rare: 15, epic: 60, legendary: 25 },
  11: { common: 0, uncommon: 0, rare: 0, epic: 70, legendary: 30 },
};

/** Hard trials: share of each tier promoted to the next one up. */
export const HARD_TRIAL_PROMOTE_RATE = 0.2;
/** Hard trials: tier removed entirely (its weight moves up) on these floors. */
export const HARD_TRIAL_EXCLUDED_TIER: Record<number, QuestRarity> = {
  0: "common",
  1: "common",
  2: "common",
  3: "common",
  4: "common",
  5: "common",
  6: "common",
  7: "uncommon",
  8: "uncommon",
  9: "uncommon",
  10: "uncommon",
};
export const HARD_TRIAL_GUARANTEED_TIER: Record<number, QuestRarity> = { 11: "legendary" };

/** Shop: additive bonus on top of the floor's weights. */
export const SHOP_RARITY_BONUS: RarityWeights = { common: -20, uncommon: -10, rare: 5, epic: 15, legendary: 10 };
/** Shop slots per kind (6 in total, like Crown Quest); shops favor perks, like unlocks. */
export const SHOP_SLOTS_BY_KIND: Record<QuestRole, Partial<Record<CollectibleKind, number>>> = {
  killer: { character: 2, perk: 4 },
  survivor: { perk: 4, equipment: 2 },
};
export const SHOP_MAX_PER_RARITY = 3;
export const SHOP_REROLL_BASE_COST = 5;
/** Each reroll in the same shop costs this much more than the previous one (not in Crown Quest). */
export const SHOP_REROLL_COST_STEP = 5;
/** Price curve: legendary = 160, each tier below is 1.75x cheaper (17 / 30 / 52 / 91 / 160). */
export const SHOP_RARITY_COSTS: Record<QuestRarity, number> = {
  common: Math.round((160 / Math.pow(1.75, 4)) * Math.pow(1.75, 0)),
  uncommon: Math.round((160 / Math.pow(1.75, 4)) * Math.pow(1.75, 1)),
  rare: Math.round((160 / Math.pow(1.75, 4)) * Math.pow(1.75, 2)),
  epic: Math.round((160 / Math.pow(1.75, 4)) * Math.pow(1.75, 3)),
  legendary: 160,
};
export const SHOP_PRICE_JITTER = 0.15;

export type QuestEventType = "unlock" | "shards_small" | "shards_large" | "reroll" | "heal" | "jackpot";

export const EVENT_WEIGHTS: Record<QuestEventType, number> = {
  unlock: 30,
  shards_small: 20,
  shards_large: 5,
  reroll: 10,
  heal: 10,
  jackpot: 5,
};

/** Number of flavor-text variants per event type in the locale files (entityQuest.events.<type>.v0..). */
export const EVENT_MESSAGE_VARIANTS = 3;

/** Legendary quests offered by chests (2 drawn at random), per role. Text lives in entityQuest.quests.<id>. */
export const LEGENDARY_QUEST_IDS: Record<QuestRole, readonly string[]> = {
  killer: ["noAddons", "hookAll", "trueColors", "noKicks", "slowBurn", "noPerks"],
  survivor: ["neverHooked", "cleanseTotems", "noItem", "trueColors", "slowBurn", "unhookTwo"],
};
export const CHEST_QUEST_CHOICES = 2;

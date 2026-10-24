/**
 * Entity Quest game-rule types: a roguelike run adapted from Crown Quest
 * (https://chrop.co.uk/Crown-Quest/Crown-Quest, a Mario Kart World challenge).
 * Everything here is plain serializable data - it is persisted as-is in
 * entity_quest_runs.state.
 */
export type QuestRole = "killer" | "survivor";
export type QuestDifficulty = "easy" | "medium" | "impossible";
export type QuestRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

/** Injectable randomness source (Math.random in the app, seeded in checks). */
export type Rng = () => number;

/**
 * What a run collects. Killer runs: killers + killer perks. Survivor runs: survivor
 * perks + equipment (item types and survivor add-ons); the survivor played is free
 * since survivors are cosmetic.
 */
export type CollectibleKind = "character" | "perk" | "equipment";

export interface Collectible {
  kind: CollectibleKind;
  name: string;
  rarity: QuestRarity;
}

/** Every name the player could ever collect in this run, by kind (already filtered to owned DLC). */
export type QuestPools = Record<CollectibleKind, readonly string[]>;

export type QuestNodeType = "trial" | "hard_trial" | "event" | "shop" | "chest" | "boss";

/**
 * What a trial asks for. "standard": kills (killer) or an escape level (survivor).
 * "generators": hold generators down (killer) or repair them (survivor).
 * "bloodpoints": earn a bloodpoint total.
 * "hooks" (killer only): land a number of hooks.
 * "unhooks" / "heals" (survivor only): unhook / fully heal a number of teammates.
 */
export type QuestMission = "standard" | "generators" | "bloodpoints" | "hooks" | "unhooks" | "heals";

export interface QuestMapNode {
  id: string;
  floor: number;
  index: number;
  type: QuestNodeType;
  /** Trial mission, rolled with the map. Absent on non-trial nodes and on runs created before missions existed (= standard). */
  mission?: QuestMission;
  /** Ids of the nodes this one leads to on the next floor. */
  connections: string[];
}

/** Floors bottom-up: map[0] is the first floor, the last floor is the single boss node. */
export type QuestMap = QuestMapNode[][];

export interface ShopOffer {
  item: Collectible;
  cost: number;
  purchased: boolean;
}

export interface QuestShopState {
  nodeId: string;
  offers: ShopOffer[];
  rerollCost: number;
}

export interface QuestChestState {
  nodeId: string;
  questOptions: string[];
}

/** An unlock waiting for the player to pick one of its options (all same kind and rarity). */
export interface QuestPendingChoice {
  options: Collectible[];
}

export interface QuestRunState {
  version: 1;
  map: QuestMap;
  visitedNodeIds: string[];
  currentNodeId: string | null;
  /** Everything collected so far, in unlock order (starting combo first). */
  collection: Collectible[];
  startingCombo: Collectible[];
  /** Legendary quest picked at a chest; stays active until completed during a successful trial. */
  activeQuestId: string | null;
  /** A shop the player is standing in (persisted so a reload keeps the same offers). */
  shop: QuestShopState | null;
  /** A chest opened but whose quest hasn't been picked yet. */
  chest: QuestChestState | null;
  /** Ids of the matches recorded during this run. */
  matchIds: string[];
  /** Unlock awaiting a pick; absent on runs created before choices existed. */
  pendingChoice?: QuestPendingChoice | null;
}

export type QuestObjective =
  | { role: "killer"; kind: "kills"; minKills: number }
  /** At most this many generators completed by the end of the match. */
  | { role: "killer"; kind: "generators"; maxGens: number }
  | { role: "killer"; kind: "hooks"; minHooks: number }
  /**
   * 1: at least `minGens` generators done, or escape through the hatch.
   * 2: escape (hatch or exit gates).
   * 3: escape through the exit gates.
   */
  | { role: "survivor"; kind: "escape"; level: 1 | 2 | 3; minGens: number }
  | { role: "survivor"; kind: "generators"; minGens: number }
  | { role: "survivor"; kind: "unhooks"; minUnhooks: number }
  | { role: "survivor"; kind: "heals"; minHeals: number }
  | { role: QuestRole; kind: "bloodpoints"; minBloodpoints: number };

interface BaseMatchResult {
  generatorsCompleted: number;
  bloodpoints: number;
}

export type QuestMatchResult =
  | (BaseMatchResult & { role: "killer"; kills: number; hooks: number })
  | (BaseMatchResult & {
      role: "survivor";
      escapeResult: "escaped_door" | "escaped_hatch" | "sacrificed" | "killed" | "disconnected";
      unhooks: number;
      heals: number;
    });

export type QuestEventOutcome =
  | { type: "unlock"; unlock: Collectible }
  | { type: "shards_small"; shards: number; alreadyHealthy: boolean }
  | { type: "shards_large"; shards: number }
  | { type: "reroll"; from: Collectible; to: Collectible }
  | { type: "heal" }
  | { type: "jackpot"; shards: number; unlock: Collectible | null }
  | { type: "nothing" };

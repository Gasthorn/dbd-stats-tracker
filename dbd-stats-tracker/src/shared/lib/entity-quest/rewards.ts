import {
  CHEST_QUEST_CHOICES,
  DIFFICULTY_SETTINGS,
  EVENT_WEIGHTS,
  FLOOR_RARITY_WEIGHTS,
  HARD_TRIAL_EXCLUDED_TIER,
  HARD_TRIAL_GUARANTEED_TIER,
  HARD_TRIAL_PROMOTE_RATE,
  LEGENDARY_QUEST_IDS,
  RARITY_ORDER,
  SHOP_MAX_PER_RARITY,
  SHOP_PRICE_JITTER,
  SHOP_RARITY_BONUS,
  SHOP_RARITY_COSTS,
  SHOP_REROLL_BASE_COST,
  SHOP_SLOTS_BY_KIND,
  UNLOCK_CHOICES,
  UNLOCK_KIND_WEIGHTS,
  type RarityWeights,
} from "./constants";
import { generateMap } from "./map";
import { getAddonItem, remainingPool, ROLE_KINDS, toCollectible } from "./pools";
import { randomChoice, shuffle, weightedChoice } from "./random";
import { getQuestRarity } from "./rarity";
import type {
  Collectible,
  CollectibleKind,
  QuestDifficulty,
  QuestEventOutcome,
  QuestPools,
  QuestRarity,
  QuestRole,
  QuestRunState,
  QuestShopState,
  Rng,
  ShopOffer,
} from "./types";

interface RollContext {
  rng: Rng;
  role: QuestRole;
  pools: QuestPools;
  collection: readonly Collectible[];
}

function floorWeights(floor: number): RarityWeights {
  const clamped = Math.max(0, Math.min(11, floor));
  return { ...FLOOR_RARITY_WEIGHTS[clamped] };
}

/** Floor odds, adjusted for hard trials: one tier excluded, 20% of each tier promoted, legendary guaranteed on floor 12. */
export function getRarityWeights(floor: number, hard: boolean): RarityWeights {
  const original = floorWeights(floor);
  if (!hard) return original;

  const guaranteed = HARD_TRIAL_GUARANTEED_TIER[floor];
  if (guaranteed) {
    return Object.fromEntries(RARITY_ORDER.map((tier) => [tier, tier === guaranteed ? 100 : 0])) as RarityWeights;
  }

  const adjusted = { ...original };
  const excluded = HARD_TRIAL_EXCLUDED_TIER[floor];
  if (excluded && adjusted[excluded] > 0) {
    const destination = RARITY_ORDER.slice(RARITY_ORDER.indexOf(excluded) + 1).find((tier) => original[tier] > 0);
    if (destination) {
      adjusted[destination] += adjusted[excluded];
      adjusted[excluded] = 0;
    }
  }

  const result = { ...adjusted };
  const tiers = RARITY_ORDER.filter((tier) => adjusted[tier] > 0);
  for (let i = 0; i < tiers.length - 1; i++) {
    const promoted = adjusted[tiers[i]] * HARD_TRIAL_PROMOTE_RATE;
    result[tiers[i]] -= promoted;
    result[tiers[i + 1]] += promoted;
  }
  return result;
}

function pickOfRarity(ctx: RollContext, kind: CollectibleKind, rarity: QuestRarity, exclude: ReadonlySet<string> = new Set()) {
  const candidates = remainingPool(ctx.pools, ctx.collection, kind).filter(
    (name) => !exclude.has(name) && getQuestRarity(kind, name) === rarity,
  );
  const name = randomChoice(ctx.rng, candidates);
  return name === undefined ? null : toCollectible(kind, name);
}

/** Tries the rolled rarity first, then alternates outward (higher first), like Crown Quest's fallback. */
function pickNearRarity(ctx: RollContext, kind: CollectibleKind, rarity: QuestRarity): Collectible | null {
  const start = RARITY_ORDER.indexOf(rarity);
  const exact = pickOfRarity(ctx, kind, rarity);
  if (exact) return exact;
  for (let offset = 1; offset < RARITY_ORDER.length; offset++) {
    const higher = RARITY_ORDER[start + offset];
    const lower = RARITY_ORDER[start - offset];
    const found = (higher && pickOfRarity(ctx, kind, higher)) || (lower && pickOfRarity(ctx, kind, lower));
    if (found) return found;
  }
  return null;
}

/** The role's two kinds, the first drawn by UNLOCK_KIND_WEIGHTS, the other kept as a fallback. */
function rollKindOrder(ctx: RollContext): CollectibleKind[] {
  const weights = Object.fromEntries(
    ROLE_KINDS[ctx.role].map((kind) => [kind, UNLOCK_KIND_WEIGHTS[ctx.role][kind] ?? 0]),
  ) as Record<CollectibleKind, number>;
  const first = weightedChoice(ctx.rng, weights);
  return [first, ...ROLE_KINDS[ctx.role].filter((kind) => kind !== first)];
}

/** A trial/event reward: kind drawn by UNLOCK_KIND_WEIGHTS, falling back to the other kind if one is exhausted. */
export function rollUnlock(ctx: RollContext, floor: number, hard: boolean): Collectible | null {
  const rarity = weightedChoice(ctx.rng, getRarityWeights(floor, hard));
  const kinds = rollKindOrder(ctx);
  for (const kind of kinds) {
    const unlock = pickNearRarity(ctx, kind, rarity);
    if (unlock) return unlock;
  }
  return null;
}

/** Reward for a completed legendary quest: the best rarity still available. */
export function rollLegendaryUnlock(ctx: RollContext): Collectible | null {
  const kinds = rollKindOrder(ctx);
  for (const rarity of [...RARITY_ORDER].reverse()) {
    for (const kind of kinds) {
      const unlock = pickOfRarity(ctx, kind, rarity);
      if (unlock) return unlock;
    }
  }
  return null;
}

/**
 * Options offered for an unlock: the rolled item plus others of the same kind and rarity, up to
 * UNLOCK_CHOICES for that kind (fewer if the rarity tier is nearly exhausted). A single option
 * means there is nothing to choose and the unlock is granted directly.
 */
export function buildUnlockChoices(ctx: RollContext, unlock: Collectible): Collectible[] {
  const count = UNLOCK_CHOICES[unlock.kind] ?? 1;
  const others = remainingPool(ctx.pools, ctx.collection, unlock.kind).filter(
    (name) => name !== unlock.name && getQuestRarity(unlock.kind, name) === unlock.rarity,
  );
  const extra = shuffle(ctx.rng, others)
    .slice(0, count - 1)
    .map((name) => toCollectible(unlock.kind, name));
  return shuffle(ctx.rng, [unlock, ...extra]);
}

/**
 * Replaces one collected item by a different one of the same kind and same-or-higher rarity.
 * Survivor items themselves are never rerolled (their add-ons depend on them); add-ons only
 * reroll into other add-ons.
 */
function rollReroll(ctx: RollContext): { from: Collectible; to: Collectible } | null {
  const candidates = shuffle(
    ctx.rng,
    ctx.collection.filter((item) => item.kind !== "equipment" || getAddonItem(item.name) !== null),
  );
  for (const from of candidates) {
    const minTier = RARITY_ORDER.indexOf(from.rarity);
    const options = remainingPool(ctx.pools, ctx.collection, from.kind).filter(
      (name) =>
        RARITY_ORDER.indexOf(getQuestRarity(from.kind, name)) >= minTier &&
        (from.kind !== "equipment" || getAddonItem(name) !== null),
    );
    const name = randomChoice(ctx.rng, options);
    if (name !== undefined) return { from, to: toCollectible(from.kind, name) };
  }
  return null;
}

interface EventContext extends RollContext {
  floor: number;
  difficulty: QuestDifficulty;
  lives: number;
  maxLives: number;
}

/** Rolls an event node. Pure: the caller applies the outcome (shards, unlocks, heal) to the run. */
export function rollEvent(ctx: EventContext): QuestEventOutcome {
  const multiplier = DIFFICULTY_SETTINGS[ctx.difficulty].shardMultiplier;
  const smallShards = (spread: number) => Math.ceil(10 + Math.floor(ctx.rng() * spread) * multiplier);

  switch (weightedChoice(ctx.rng, EVENT_WEIGHTS)) {
    case "unlock": {
      const unlock = rollUnlock(ctx, ctx.floor, false);
      return unlock ? { type: "unlock", unlock } : { type: "shards_small", shards: smallShards(15), alreadyHealthy: false };
    }
    case "shards_small":
      return { type: "shards_small", shards: smallShards(15), alreadyHealthy: false };
    case "shards_large":
      return { type: "shards_large", shards: Math.ceil(40 + Math.floor(ctx.rng() * 30) * multiplier) };
    case "reroll": {
      const reroll = rollReroll(ctx);
      return reroll ? { type: "reroll", ...reroll } : { type: "nothing" };
    }
    case "heal":
      return ctx.lives < ctx.maxLives
        ? { type: "heal" }
        : { type: "shards_small", shards: smallShards(10), alreadyHealthy: true };
    case "jackpot":
      return {
        type: "jackpot",
        shards: Math.ceil(50 + Math.floor(ctx.rng() * 50) * multiplier),
        unlock: rollUnlock(ctx, ctx.floor, true),
      };
  }
}

export function getShopRarityWeights(floor: number): RarityWeights {
  const base = floorWeights(floor);
  return Object.fromEntries(
    RARITY_ORDER.map((tier) => [tier, Math.max(0, base[tier] + SHOP_RARITY_BONUS[tier])]),
  ) as RarityWeights;
}

/** Slot kinds for a shop, interleaved so the per-rarity cap doesn't skew toward the first kind. */
function shopSlotKinds(role: QuestRole): CollectibleKind[] {
  const remaining = { ...SHOP_SLOTS_BY_KIND[role] };
  const slots: CollectibleKind[] = [];
  while (ROLE_KINDS[role].some((kind) => (remaining[kind] ?? 0) > 0)) {
    for (const kind of ROLE_KINDS[role]) {
      if ((remaining[kind] ?? 0) > 0) {
        slots.push(kind);
        remaining[kind] = (remaining[kind] ?? 0) - 1;
      }
    }
  }
  return slots;
}

/** Offers per SHOP_SLOTS_BY_KIND, at most 3 of a rarity, prices ±15% around the rarity's base. */
export function buildShopOffers(ctx: RollContext, nodeId: string, floor: number): QuestShopState {
  const weights = getShopRarityWeights(floor);
  const rarityCount: Partial<Record<QuestRarity, number>> = {};
  const offered = new Set<string>();
  const offers: ShopOffer[] = [];
  for (const kind of shopSlotKinds(ctx.role)) {
    const allowed = { ...weights };
    for (const tier of RARITY_ORDER) {
      if ((rarityCount[tier] ?? 0) >= SHOP_MAX_PER_RARITY) allowed[tier] = 0;
    }
    if (RARITY_ORDER.every((tier) => allowed[tier] <= 0)) break;

    const rarity = weightedChoice(ctx.rng, allowed);
    rarityCount[rarity] = (rarityCount[rarity] ?? 0) + 1;
    const item = pickOfRarity(ctx, kind, rarity, offered);
    if (!item) continue;

    offered.add(item.name);
    const jitter = 1 + (ctx.rng() * 2 * SHOP_PRICE_JITTER - SHOP_PRICE_JITTER);
    offers.push({ item, cost: Math.round(SHOP_RARITY_COSTS[rarity] * jitter), purchased: false });
  }

  return { nodeId, offers, rerollCost: SHOP_REROLL_BASE_COST };
}

export function rollChestQuests(rng: Rng, role: QuestRole): string[] {
  return shuffle(rng, LEGENDARY_QUEST_IDS[role]).slice(0, CHEST_QUEST_CHOICES);
}

/** One of the lowest-rarity names still available of this kind. */
function rollStarter(ctx: RollContext, kind: CollectibleKind): Collectible | null {
  for (const rarity of RARITY_ORDER) {
    const found = pickOfRarity(ctx, kind, rarity);
    if (found) return found;
  }
  return null;
}

/** Crown Quest's "starting combo": one low-rarity collectible of each of the role's kinds. */
export function rollStartingCombo(rng: Rng, role: QuestRole, pools: QuestPools): Collectible[] {
  const combo: Collectible[] = [];
  for (const kind of ROLE_KINDS[role]) {
    const starter = rollStarter({ rng, role, pools, collection: combo }, kind);
    if (starter) combo.push(starter);
  }
  return combo;
}

export function createInitialRunState(rng: Rng, role: QuestRole, pools: QuestPools): QuestRunState {
  const startingCombo = rollStartingCombo(rng, role, pools);
  return {
    version: 1,
    map: generateMap(rng, role),
    visitedNodeIds: [],
    currentNodeId: null,
    collection: [...startingCombo],
    startingCombo,
    activeQuestId: null,
    shop: null,
    chest: null,
    matchIds: [],
  };
}

import { SURVIVOR_ADDONS, SURVIVOR_ITEMS } from "../../data/equipment";
import { KILLER_PERKS, SURVIVOR_PERKS } from "../../data/perks";
import { getQuestRarity } from "./rarity";
import type { Collectible, CollectibleKind, QuestPools, QuestRole } from "./types";

/** The two kinds of collectibles a run of this role hands out (Crown Quest's "characters" and "karts"). */
export const ROLE_KINDS: Record<QuestRole, readonly [CollectibleKind, CollectibleKind]> = {
  killer: ["character", "perk"],
  survivor: ["perk", "equipment"],
};

const ADDON_ITEM: ReadonlyMap<string, string> = new Map(
  SURVIVOR_ADDONS.flatMap((group) => group.addons.map((addon) => [addon, group.itemType] as const)),
);

/** The survivor item an add-on belongs to, or null for anything that isn't a survivor add-on. */
export function getAddonItem(name: string): string | null {
  return ADDON_ITEM.get(name) ?? null;
}

/**
 * Everything collectible in a run, restricted to what the player owns in-game: killers they
 * own, and perks whose owner they own (or "Base Kit" teachables) - same rule as the Gauntlet.
 */
export function buildQuestPools(role: QuestRole, ownedCharacters: readonly string[]): QuestPools {
  const owned = new Set(ownedCharacters);
  const perkCatalog = role === "killer" ? KILLER_PERKS : SURVIVOR_PERKS;
  const perks = perkCatalog
    .filter((perk) => perk.owner === "Base Kit" || owned.has(perk.owner))
    .map((perk) => perk.name);

  if (role === "killer") {
    return { character: [...ownedCharacters], perk: perks, equipment: [] };
  }
  const addons = SURVIVOR_ADDONS.flatMap((group) => group.addons);
  return { character: [], perk: perks, equipment: [...SURVIVOR_ITEMS, ...addons] };
}

export function toCollectible(kind: CollectibleKind, name: string): Collectible {
  return { kind, name, rarity: getQuestRarity(kind, name) };
}

export function collectionNames(collection: readonly Collectible[], kind: CollectibleKind): string[] {
  return collection.filter((item) => item.kind === kind).map((item) => item.name);
}

/**
 * Names of this kind still up for grabs. Survivor add-ons only drop once their item is
 * owned, so a run never hands out something it can't use.
 */
export function remainingPool(
  pools: QuestPools,
  collection: readonly Collectible[],
  kind: CollectibleKind,
): string[] {
  const owned = new Set(collectionNames(collection, kind));
  return pools[kind].filter((name) => {
    if (owned.has(name)) return false;
    const item = kind === "equipment" ? getAddonItem(name) : null;
    return item === null || owned.has(item);
  });
}

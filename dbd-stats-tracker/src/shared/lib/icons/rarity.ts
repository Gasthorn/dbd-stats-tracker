import { KILLER_ADDONS } from "../../data/equipment";

export type AddonRarity = "common" | "uncommon" | "rare" | "very-rare" | "iridescent";

/**
 * Killer addon rarity is positional, not an explicit field: legacy-web-prototype's
 * equipment.json lists each killer's 20 addons ordered from common to iridescent in
 * fixed-size tiers (4/5/5/4/2). Survivor items/addons have no rarity tiering in the
 * source data, so this only applies to killer addons.
 */
const RARITY_TIERS: { rarity: AddonRarity; count: number }[] = [
  { rarity: "common", count: 4 },
  { rarity: "uncommon", count: 5 },
  { rarity: "rare", count: 5 },
  { rarity: "very-rare", count: 4 },
  { rarity: "iridescent", count: 2 },
];

export function getKillerAddonRarity(
  killerName: string | null | undefined,
  addonName: string | null | undefined,
): AddonRarity | null {
  if (!killerName || !addonName) return null;
  const addons = KILLER_ADDONS[killerName];
  if (!addons) return null;

  const index = addons.indexOf(addonName);
  if (index < 0) return null;

  let cursor = 0;
  for (const tier of RARITY_TIERS) {
    cursor += tier.count;
    if (index < cursor) return tier.rarity;
  }
  return "iridescent";
}

export function rarityClassName(rarity: AddonRarity | null): string {
  return rarity ? `rarity-${rarity}` : "";
}

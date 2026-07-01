import type { ISODateString, Rarity, UUID } from "./common.types";

export type CharacterRole = "killer" | "survivor";

export type CharacterId = UUID;

export interface Realm {
  id: UUID;
  name: string;
}

export interface GameMap {
  id: UUID;
  realmId: UUID;
  name: string;
  iconUrl: string | null;
}

export interface Killer {
  id: UUID;
  name: string;
  legacyName: string | null;
  powerName: string;
  iconUrl: string | null;
  releasedAt: ISODateString | null;
  isLicensed: boolean;
}

export interface Survivor {
  id: UUID;
  name: string;
  iconUrl: string | null;
  releasedAt: ISODateString | null;
  isLicensed: boolean;
}

export interface Perk {
  id: UUID;
  name: string;
  description: string;
  role: CharacterRole;
  /** null when the perk is teachable by all / general */
  ownerCharacterId: CharacterId | null;
  iconUrl: string | null;
}

export interface Addon {
  id: UUID;
  name: string;
  description: string;
  role: CharacterRole;
  characterId: CharacterId;
  rarity: Rarity;
  iconUrl: string | null;
}

export interface Offering {
  id: UUID;
  name: string;
  description: string;
  role: CharacterRole | "both";
  rarity: Rarity;
  iconUrl: string | null;
}

export type ItemCategory = "medkit" | "toolbox" | "flashlight" | "key" | "map";

export interface Item {
  id: UUID;
  name: string;
  category: ItemCategory;
  rarity: Rarity;
  iconUrl: string | null;
}

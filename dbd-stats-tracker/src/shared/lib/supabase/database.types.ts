/**
 * Hand-authored equivalent of the `supabase gen types typescript` output.
 * Column names use snake_case to match Postgres; domain types under
 * `features/*` use camelCase and are mapped to/from these shapes in the
 * service layer.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type CharacterRoleEnum = "killer" | "survivor";
type RarityEnum =
  | "common"
  | "uncommon"
  | "rare"
  | "very_rare"
  | "ultra_rare"
  | "event"
  | "iridescent";
type SurvivorOutcomeEnum =
  | "escaped"
  | "escaped_hatch"
  | "sacrificed"
  | "killed"
  | "disconnected"
  | "suicide_on_hook";
type GauntletRunStatusEnum =
  | "not_started"
  | "in_progress"
  | "completed"
  | "failed"
  | "abandoned";
type HardcoreRunStatusEnum = "active" | "completed" | "failed" | "abandoned";

export interface ProfileRow {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
export type ProfileInsert = Omit<ProfileRow, "created_at" | "updated_at"> &
  Partial<Pick<ProfileRow, "created_at" | "updated_at">>;
export type ProfileUpdate = Partial<ProfileInsert>;

export interface KillerRow {
  id: string;
  name: string;
  legacy_name: string | null;
  power_name: string;
  icon_url: string | null;
  released_at: string | null;
  is_licensed: boolean;
}
export type KillerInsert = Omit<KillerRow, "id"> & Partial<Pick<KillerRow, "id">>;
export type KillerUpdate = Partial<KillerInsert>;

export interface SurvivorRow {
  id: string;
  name: string;
  icon_url: string | null;
  released_at: string | null;
  is_licensed: boolean;
}
export type SurvivorInsert = Omit<SurvivorRow, "id"> & Partial<Pick<SurvivorRow, "id">>;
export type SurvivorUpdate = Partial<SurvivorInsert>;

export interface PerkRow {
  id: string;
  name: string;
  description: string;
  role: CharacterRoleEnum;
  owner_character_id: string | null;
  icon_url: string | null;
}
export type PerkInsert = Omit<PerkRow, "id"> & Partial<Pick<PerkRow, "id">>;
export type PerkUpdate = Partial<PerkInsert>;

export interface AddonRow {
  id: string;
  name: string;
  description: string;
  role: CharacterRoleEnum;
  character_id: string;
  rarity: RarityEnum;
  icon_url: string | null;
}
export type AddonInsert = Omit<AddonRow, "id"> & Partial<Pick<AddonRow, "id">>;
export type AddonUpdate = Partial<AddonInsert>;

export interface OfferingRow {
  id: string;
  name: string;
  description: string;
  role: CharacterRoleEnum | "both";
  rarity: RarityEnum;
  icon_url: string | null;
}
export type OfferingInsert = Omit<OfferingRow, "id"> & Partial<Pick<OfferingRow, "id">>;
export type OfferingUpdate = Partial<OfferingInsert>;

export interface ItemRow {
  id: string;
  name: string;
  category: "medkit" | "toolbox" | "flashlight" | "key" | "map";
  rarity: RarityEnum;
  icon_url: string | null;
}
export type ItemInsert = Omit<ItemRow, "id"> & Partial<Pick<ItemRow, "id">>;
export type ItemUpdate = Partial<ItemInsert>;

export interface RealmRow {
  id: string;
  name: string;
}
export type RealmInsert = Omit<RealmRow, "id"> & Partial<Pick<RealmRow, "id">>;
export type RealmUpdate = Partial<RealmInsert>;

export interface MapRow {
  id: string;
  realm_id: string;
  name: string;
  icon_url: string | null;
}
export type MapInsert = Omit<MapRow, "id"> & Partial<Pick<MapRow, "id">>;
export type MapUpdate = Partial<MapInsert>;

export interface MatchRow {
  id: string;
  user_id: string;
  role: CharacterRoleEnum;
  map_id: string | null;
  platform: string | null;
  played_at: string;
  duration_seconds: number | null;
  /** { perkIds, offeringId, addonIds, itemId } */
  loadout: Json;
  points_earned: number | null;
  rating_before: number | null;
  rating_after: number | null;
  disconnected: boolean;
  notes: string | null;
  // killer-role columns
  killer_character_id: string | null;
  survivor_outcomes: Json | null;
  total_kills: number | null;
  total_escapes: number | null;
  // survivor-role columns
  survivor_character_id: string | null;
  opponent_killer_character_id: string | null;
  outcome: SurvivorOutcomeEnum | null;
  hooks_taken: number | null;
  unhooks_performed: number | null;
  heals_performed: number | null;
  generators_repaired: number | null;
  created_at: string;
  updated_at: string;
}
export type MatchInsert = Omit<MatchRow, "id" | "created_at" | "updated_at"> &
  Partial<Pick<MatchRow, "id" | "created_at" | "updated_at">>;
export type MatchUpdate = Partial<MatchInsert>;

export interface BuildRow {
  id: string;
  user_id: string;
  name: string;
  role: CharacterRoleEnum;
  character_id: string;
  perk_ids: Json;
  item_id: string | null;
  addon_ids: Json;
  offering_id: string | null;
  description: string | null;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}
export type BuildInsert = Omit<BuildRow, "id" | "created_at" | "updated_at"> &
  Partial<Pick<BuildRow, "id" | "created_at" | "updated_at">>;
export type BuildUpdate = Partial<BuildInsert>;

export interface GauntletRunRow {
  id: string;
  user_id: string;
  name: string;
  ruleset: Json;
  status: GauntletRunStatusEnum;
  entries: Json;
  current_survivor_id: string | null;
  started_at: string;
  completed_at: string | null;
}
export type GauntletRunInsert = Omit<GauntletRunRow, "id" | "started_at"> &
  Partial<Pick<GauntletRunRow, "id" | "started_at">>;
export type GauntletRunUpdate = Partial<GauntletRunInsert>;

export interface HardcoreRunRow {
  id: string;
  user_id: string;
  name: string;
  ruleset: Json;
  status: HardcoreRunStatusEnum;
  lives: Json;
  current_streak: number;
  best_streak: number;
  match_ids: string[];
  started_at: string;
  ended_at: string | null;
}
export type HardcoreRunInsert = Omit<HardcoreRunRow, "id" | "started_at"> &
  Partial<Pick<HardcoreRunRow, "id" | "started_at">>;
export type HardcoreRunUpdate = Partial<HardcoreRunInsert>;

export interface HardcoreEventRow {
  id: string;
  run_id: string;
  match_id: string | null;
  character_id: string | null;
  type:
    | "life_lost"
    | "character_eliminated"
    | "streak_increment"
    | "run_completed"
    | "run_failed";
  created_at: string;
}
export type HardcoreEventInsert = Omit<HardcoreEventRow, "id" | "created_at"> &
  Partial<Pick<HardcoreEventRow, "id" | "created_at">>;
export type HardcoreEventUpdate = Partial<HardcoreEventInsert>;

export interface Database {
  public: {
    Tables: {
      profiles: { Row: ProfileRow; Insert: ProfileInsert; Update: ProfileUpdate };
      killers: { Row: KillerRow; Insert: KillerInsert; Update: KillerUpdate };
      survivors: { Row: SurvivorRow; Insert: SurvivorInsert; Update: SurvivorUpdate };
      perks: { Row: PerkRow; Insert: PerkInsert; Update: PerkUpdate };
      addons: { Row: AddonRow; Insert: AddonInsert; Update: AddonUpdate };
      offerings: { Row: OfferingRow; Insert: OfferingInsert; Update: OfferingUpdate };
      items: { Row: ItemRow; Insert: ItemInsert; Update: ItemUpdate };
      realms: { Row: RealmRow; Insert: RealmInsert; Update: RealmUpdate };
      maps: { Row: MapRow; Insert: MapInsert; Update: MapUpdate };
      matches: { Row: MatchRow; Insert: MatchInsert; Update: MatchUpdate };
      builds: { Row: BuildRow; Insert: BuildInsert; Update: BuildUpdate };
      gauntlet_runs: {
        Row: GauntletRunRow;
        Insert: GauntletRunInsert;
        Update: GauntletRunUpdate;
      };
      hardcore_runs: {
        Row: HardcoreRunRow;
        Insert: HardcoreRunInsert;
        Update: HardcoreRunUpdate;
      };
      hardcore_events: {
        Row: HardcoreEventRow;
        Insert: HardcoreEventInsert;
        Update: HardcoreEventUpdate;
      };
    };
    Enums: {
      character_role: CharacterRoleEnum;
      rarity: RarityEnum;
      survivor_outcome: SurvivorOutcomeEnum;
      gauntlet_run_status: GauntletRunStatusEnum;
      hardcore_run_status: HardcoreRunStatusEnum;
    };
  };
}

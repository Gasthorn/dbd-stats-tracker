import type {
  ISODateString,
  Platform,
  UUID,
} from "../../../shared/types/common.types";
import type { CharacterId } from "../../../shared/types/dbd-entities.types";

export type MatchRole = "killer" | "survivor";

export type SurvivorMatchOutcome =
  | "escaped"
  | "escaped_hatch"
  | "sacrificed"
  | "killed"
  | "disconnected"
  | "suicide_on_hook";

export interface SurvivorOutcomeEntry {
  survivorCharacterId: CharacterId | null;
  outcome: SurvivorMatchOutcome | null;
}

export interface MatchLoadout {
  perkIds: [UUID | null, UUID | null, UUID | null, UUID | null];
  offeringId: UUID | null;
  addonIds: UUID[];
  itemId: UUID | null;
}

interface BaseMatch {
  id: UUID;
  userId: UUID;
  mapId: UUID | null;
  platform: Platform | null;
  playedAt: ISODateString;
  durationSeconds: number | null;
  loadout: MatchLoadout;
  pointsEarned: number | null;
  ratingBefore: number | null;
  ratingAfter: number | null;
  disconnected: boolean;
  notes: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface KillerMatch extends BaseMatch {
  role: "killer";
  killerCharacterId: CharacterId;
  /** always 4 entries, one per opposing survivor */
  survivorOutcomes: SurvivorOutcomeEntry[];
  totalKills: number;
  totalEscapes: number;
}

export interface SurvivorMatch extends BaseMatch {
  role: "survivor";
  survivorCharacterId: CharacterId;
  opponentKillerCharacterId: CharacterId | null;
  outcome: SurvivorMatchOutcome;
  hooksTaken: number | null;
  unhooksPerformed: number | null;
  healsPerformed: number | null;
  generatorsRepaired: number | null;
}

export type Match = KillerMatch | SurvivorMatch;

export interface MatchFilters {
  role?: MatchRole;
  characterId?: CharacterId;
  mapId?: UUID;
  dateFrom?: ISODateString;
  dateTo?: ISODateString;
  outcome?: SurvivorMatchOutcome;
}

export type CreateKillerMatchInput = Omit<
  KillerMatch,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type CreateSurvivorMatchInput = Omit<
  SurvivorMatch,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type CreateMatchInput = CreateKillerMatchInput | CreateSurvivorMatchInput;
export type UpdateMatchInput = Partial<CreateMatchInput> & { id: UUID };

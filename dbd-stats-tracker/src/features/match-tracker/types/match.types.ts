import type { ISODateString, UUID } from "../../../shared/types/common.types";

export type MatchRole = "killer" | "survivor";
export type MatchMode = "normal" | "hardcore" | "gauntlet" | "world_cup";

export type EscapeResult =
  | "escaped_door"
  | "escaped_hatch"
  | "sacrificed"
  | "killed"
  | "disconnected";

interface BaseMatch {
  id: UUID;
  userId: UUID;
  hardcoreRunId: UUID | null;
  mode: MatchMode;
  characterName: string;
  /** up to 4 perk names */
  perks: string[];
  /** up to 3 item/addon names */
  equipment: string[];
  bloodpoints: number;
  generatorsCompleted: number;
  ignoreChallenge: boolean;
  playedAt: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface KillerMatch extends BaseMatch {
  role: "killer";
  opponentName: null;
  teamId: null;
  kills: number;
  /** Hooks landed this match. Optional outside World Cup, where it's the deciding stat. */
  hooks: number | null;
  escapeResult: null;
  hardcorePips: number | null;
  hardcoreDied: boolean | null;
}

export interface SurvivorMatch extends BaseMatch {
  role: "survivor";
  opponentName: string | null;
  /** The SWF team (if any) this match was played with. */
  teamId: UUID | null;
  kills: null;
  hooks: null;
  escapeResult: EscapeResult;
  hardcorePips: number | null;
  hardcoreDied: boolean | null;
}

export type Match = KillerMatch | SurvivorMatch;

export interface MatchFilters {
  role?: MatchRole;
  mode?: MatchMode;
  characterName?: string;
  dateFrom?: ISODateString;
  dateTo?: ISODateString;
}

export type CreateKillerMatchInput = Omit<
  KillerMatch,
  "id" | "userId" | "createdAt" | "updatedAt" | "playedAt"
> & { playedAt?: ISODateString };
export type CreateSurvivorMatchInput = Omit<
  SurvivorMatch,
  "id" | "userId" | "createdAt" | "updatedAt" | "playedAt"
> & { playedAt?: ISODateString };
export type CreateMatchInput = CreateKillerMatchInput | CreateSurvivorMatchInput;

export type UpdateMatchInput = Partial<CreateMatchInput> & { id: UUID };

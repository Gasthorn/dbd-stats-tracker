import type { AsyncStatus } from "../../../shared/types/common.types";
import type { CreateMatchInput, MatchRole } from "../../match-tracker/types/match.types";
import type { GauntletProgress } from "../types/gauntlet.types";

export interface GauntletState {
  progress: Partial<Record<MatchRole, GauntletProgress>>;
  status: AsyncStatus;
  error: string | null;
}

/** Distributes Omit over the KillerMatch | SurvivorMatch union so each branch keeps its own shape. */
type OmitGauntletFields<T> = T extends unknown ? Omit<T, "mode" | "ignoreChallenge"> : never;

export interface RecordGauntletMatchInput {
  role: MatchRole;
  /** The underlying match to record, minus the fields the store fills in. */
  match: OmitGauntletFields<CreateMatchInput>;
  win: boolean;
  /** When true, the match is logged to history but doesn't affect Gauntlet progress. */
  ignoreChallenge: boolean;
}

export interface GauntletActions {
  loadRole: (role: MatchRole) => Promise<void>;
  rollNext: (role: MatchRole) => Promise<void>;
  recordMatch: (input: RecordGauntletMatchInput) => Promise<void>;
  refreshQueue: (role: MatchRole) => Promise<void>;
  resetRole: (role: MatchRole) => Promise<void>;
}

export type GauntletStore = GauntletState & GauntletActions;

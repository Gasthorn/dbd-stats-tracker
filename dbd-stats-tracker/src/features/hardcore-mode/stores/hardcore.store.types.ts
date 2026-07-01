import type { AsyncStatus } from "../../../shared/types/common.types";
import type { CreateMatchInput } from "../../match-tracker/types/match.types";
import type { HardcoreRun } from "../types/hardcore.types";

export interface HardcoreState {
  currentRun: HardcoreRun | null;
  status: AsyncStatus;
  error: string | null;
}

/** Distributes Omit over the KillerMatch | SurvivorMatch union so each branch keeps its own shape. */
type OmitHardcoreFields<T> = T extends unknown
  ? Omit<T, "mode" | "hardcoreRunId" | "hardcorePips" | "hardcoreDied" | "ignoreChallenge">
  : never;

export interface RecordHardcoreMatchInput {
  /** The underlying match to record, minus the hardcore linkage fields the store fills in. */
  match: OmitHardcoreFields<CreateMatchInput>;
  pips: number;
  died: boolean;
  /** When true, the match is logged to history but doesn't affect season pips/eliminations. */
  ignoreChallenge: boolean;
}

export interface HardcoreActions {
  initialize: () => Promise<void>;
  recordMatch: (input: RecordHardcoreMatchInput) => Promise<void>;
  resetSeason: () => Promise<void>;
}

export type HardcoreStore = HardcoreState & HardcoreActions;

import type { ISODateString, UUID } from "../../../shared/types/common.types";
import type { CharacterId } from "../../../shared/types/dbd-entities.types";

export type GauntletRunStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "failed"
  | "abandoned";

export type GauntletEntryStatus = "pending" | "completed" | "failed" | "skipped";

export interface GauntletRuleset {
  /** must escape the match, surviving-but-sacrificed does not count */
  requireEscape: boolean;
  allowRetryOnDeath: boolean;
  randomizeOrder: boolean;
  excludedSurvivorIds: CharacterId[];
}

export interface GauntletSurvivorEntry {
  survivorCharacterId: CharacterId;
  status: GauntletEntryStatus;
  matchId: UUID | null;
  attempts: number;
  completedAt: ISODateString | null;
}

export interface GauntletRun {
  id: UUID;
  userId: UUID;
  name: string;
  ruleset: GauntletRuleset;
  status: GauntletRunStatus;
  /** one entry per survivor character included in the run */
  entries: GauntletSurvivorEntry[];
  currentSurvivorId: CharacterId | null;
  startedAt: ISODateString;
  completedAt: ISODateString | null;
}

export type CreateGauntletRunInput = Pick<GauntletRun, "name" | "ruleset">;

export interface RecordGauntletAttemptInput {
  runId: UUID;
  survivorCharacterId: CharacterId;
  matchId: UUID;
  succeeded: boolean;
}

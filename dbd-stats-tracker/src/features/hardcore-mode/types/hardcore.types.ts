import type { ISODateString, UUID } from "../../../shared/types/common.types";
import type {
  CharacterId,
  CharacterRole,
} from "../../../shared/types/dbd-entities.types";

export type HardcoreRunStatus = "active" | "completed" | "failed" | "abandoned";

export type HardcoreEventType =
  | "life_lost"
  | "character_eliminated"
  | "streak_increment"
  | "run_completed"
  | "run_failed";

export interface HardcoreRuleset {
  role: CharacterRole | "both";
  livesPerCharacter: number;
  eliminateCharacterOnDeath: boolean;
  customRules: string[];
}

export interface HardcoreCharacterLife {
  characterId: CharacterId;
  livesRemaining: number;
  isEliminated: boolean;
}

export interface HardcoreRun {
  id: UUID;
  userId: UUID;
  name: string;
  ruleset: HardcoreRuleset;
  status: HardcoreRunStatus;
  lives: HardcoreCharacterLife[];
  currentStreak: number;
  bestStreak: number;
  matchIds: UUID[];
  startedAt: ISODateString;
  endedAt: ISODateString | null;
}

export interface HardcoreEvent {
  id: UUID;
  runId: UUID;
  matchId: UUID | null;
  characterId: CharacterId | null;
  type: HardcoreEventType;
  createdAt: ISODateString;
}

export type CreateHardcoreRunInput = Pick<HardcoreRun, "name" | "ruleset">;

export interface RecordHardcoreMatchInput {
  runId: UUID;
  matchId: UUID;
  characterId: CharacterId;
  survived: boolean;
}

import type { ISODateString, UUID } from "../../../shared/types/common.types";
import type { QuestDifficulty, QuestRole, QuestRunState } from "../../../shared/lib/entity-quest/types";

export type {
  Collectible,
  CollectibleKind,
  QuestDifficulty,
  QuestEventOutcome,
  QuestMapNode,
  QuestMission,
  QuestNodeType,
  QuestObjective,
  QuestRarity,
  QuestRole,
  QuestRunState,
} from "../../../shared/lib/entity-quest/types";

export type EntityQuestStatus = "in_progress" | "won" | "lost";

export interface EntityQuestRun {
  id: UUID;
  userId: UUID;
  role: QuestRole;
  difficulty: QuestDifficulty;
  status: EntityQuestStatus;
  lives: number;
  maxLives: number;
  shards: number;
  state: QuestRunState;
  startedAt: ISODateString;
  endedAt: ISODateString | null;
  updatedAt: ISODateString;
}

export type CreateEntityQuestRunInput = Pick<EntityQuestRun, "role" | "difficulty" | "lives" | "maxLives" | "state">;

export type UpdateEntityQuestRunInput = Partial<
  Pick<EntityQuestRun, "status" | "lives" | "shards" | "state" | "endedAt">
> & { id: UUID };

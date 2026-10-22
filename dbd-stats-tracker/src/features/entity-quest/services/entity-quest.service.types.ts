import type { UUID } from "../../../shared/types/common.types";
import type { QuestRole } from "../../../shared/lib/entity-quest/types";
import type {
  CreateEntityQuestRunInput,
  EntityQuestRun,
  UpdateEntityQuestRunInput,
} from "../types/entity-quest.types";

export interface EntityQuestService {
  /** The player's in-progress run for this role, or null if none. */
  getActiveRun: (userId: UUID, role: QuestRole) => Promise<EntityQuestRun | null>;
  /** Finished (won/lost) runs, most recent first. */
  listFinishedRuns: (userId: UUID, limit?: number) => Promise<EntityQuestRun[]>;
  createRun: (userId: UUID, input: CreateEntityQuestRunInput) => Promise<EntityQuestRun>;
  updateRun: (input: UpdateEntityQuestRunInput) => Promise<EntityQuestRun>;
}

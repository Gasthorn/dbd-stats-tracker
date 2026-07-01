import type { UUID } from "../../../shared/types/common.types";
import type {
  CreateHardcoreRunInput,
  HardcoreEvent,
  HardcoreRun,
  RecordHardcoreMatchInput,
} from "../types/hardcore.types";

export interface HardcoreService {
  listRuns: () => Promise<HardcoreRun[]>;
  getRunById: (id: UUID) => Promise<HardcoreRun | null>;
  createRun: (input: CreateHardcoreRunInput) => Promise<HardcoreRun>;
  recordMatchResult: (input: RecordHardcoreMatchInput) => Promise<HardcoreRun>;
  abandonRun: (id: UUID) => Promise<void>;
  listRunEvents: (runId: UUID) => Promise<HardcoreEvent[]>;
}

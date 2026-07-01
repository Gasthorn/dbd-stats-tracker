import type { UUID } from "../../../shared/types/common.types";
import type {
  CreateGauntletRunInput,
  GauntletRun,
  RecordGauntletAttemptInput,
} from "../types/gauntlet.types";

export interface GauntletService {
  listRuns: () => Promise<GauntletRun[]>;
  getRunById: (id: UUID) => Promise<GauntletRun | null>;
  createRun: (input: CreateGauntletRunInput) => Promise<GauntletRun>;
  recordAttempt: (input: RecordGauntletAttemptInput) => Promise<GauntletRun>;
  abandonRun: (id: UUID) => Promise<void>;
}

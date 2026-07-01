import type { AsyncStatus, UUID } from "../../../shared/types/common.types";
import type {
  CreateGauntletRunInput,
  GauntletRun,
  RecordGauntletAttemptInput,
} from "../types/gauntlet.types";

export interface GauntletState {
  activeRun: GauntletRun | null;
  runHistory: GauntletRun[];
  status: AsyncStatus;
  error: string | null;
}

export interface GauntletActions {
  fetchRuns: () => Promise<void>;
  startRun: (input: CreateGauntletRunInput) => Promise<GauntletRun>;
  recordAttempt: (input: RecordGauntletAttemptInput) => Promise<GauntletRun>;
  abandonRun: (id: UUID) => Promise<void>;
}

export type GauntletStore = GauntletState & GauntletActions;

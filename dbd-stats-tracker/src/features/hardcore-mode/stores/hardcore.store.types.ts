import type { AsyncStatus, UUID } from "../../../shared/types/common.types";
import type {
  CreateHardcoreRunInput,
  HardcoreRun,
  RecordHardcoreMatchInput,
} from "../types/hardcore.types";

export interface HardcoreState {
  activeRun: HardcoreRun | null;
  runHistory: HardcoreRun[];
  status: AsyncStatus;
  error: string | null;
}

export interface HardcoreActions {
  fetchRuns: () => Promise<void>;
  startRun: (input: CreateHardcoreRunInput) => Promise<HardcoreRun>;
  recordMatchResult: (input: RecordHardcoreMatchInput) => Promise<HardcoreRun>;
  abandonRun: (id: UUID) => Promise<void>;
}

export type HardcoreStore = HardcoreState & HardcoreActions;

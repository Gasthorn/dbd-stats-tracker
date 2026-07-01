import type { UUID } from "../../../shared/types/common.types";
import type { HardcoreRun, UpdateHardcoreRunInput } from "../types/hardcore.types";

export interface HardcoreService {
  /** Fetches the run for the given season, creating a fresh (all-zero) one if none exists yet. */
  getOrCreateRun: (userId: UUID, seasonId: string) => Promise<HardcoreRun>;
  updateRun: (input: UpdateHardcoreRunInput) => Promise<HardcoreRun>;
  /** Deletes the run for a season so the next getOrCreateRun call starts fresh. */
  resetRun: (id: UUID) => Promise<void>;
}

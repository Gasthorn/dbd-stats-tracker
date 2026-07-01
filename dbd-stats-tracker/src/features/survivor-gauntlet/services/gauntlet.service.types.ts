import type { UUID } from "../../../shared/types/common.types";
import type { MatchRole } from "../../match-tracker/types/match.types";
import type { GauntletProgress, UpdateGauntletProgressInput } from "../types/gauntlet.types";

export interface GauntletService {
  /** Fetches the (user, role) progress row, creating a fresh (empty) one if none exists yet. */
  getOrCreateProgress: (userId: UUID, role: MatchRole) => Promise<GauntletProgress>;
  updateProgress: (input: UpdateGauntletProgressInput) => Promise<GauntletProgress>;
  resetProgress: (id: UUID) => Promise<void>;
}

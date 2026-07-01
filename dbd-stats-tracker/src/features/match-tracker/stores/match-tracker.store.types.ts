import type { AsyncStatus, UUID } from "../../../shared/types/common.types";
import type {
  CreateMatchInput,
  Match,
  MatchFilters,
  UpdateMatchInput,
} from "../types/match.types";

export interface MatchTrackerState {
  matches: Match[];
  selectedMatchId: UUID | null;
  filters: MatchFilters;
  status: AsyncStatus;
  error: string | null;
}

export interface MatchTrackerActions {
  fetchMatches: (filters?: MatchFilters) => Promise<void>;
  createMatch: (input: CreateMatchInput) => Promise<Match>;
  updateMatch: (input: UpdateMatchInput) => Promise<Match>;
  deleteMatch: (id: UUID) => Promise<void>;
  selectMatch: (id: UUID | null) => void;
  setFilters: (filters: MatchFilters) => void;
}

export type MatchTrackerStore = MatchTrackerState & MatchTrackerActions;

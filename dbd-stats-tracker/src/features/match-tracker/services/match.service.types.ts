import type {
  PaginatedResult,
  PaginationParams,
  UUID,
} from "../../../shared/types/common.types";
import type {
  CreateMatchInput,
  Match,
  MatchFilters,
  UpdateMatchInput,
} from "../types/match.types";

export interface MatchService {
  listMatches: (
    filters?: MatchFilters,
    pagination?: PaginationParams,
  ) => Promise<PaginatedResult<Match>>;
  getMatchById: (id: UUID) => Promise<Match | null>;
  createMatch: (input: CreateMatchInput) => Promise<Match>;
  updateMatch: (input: UpdateMatchInput) => Promise<Match>;
  deleteMatch: (id: UUID) => Promise<void>;
}

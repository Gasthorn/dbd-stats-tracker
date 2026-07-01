import type {
  PaginatedResult,
  PaginationParams,
  UUID,
} from "../../../shared/types/common.types";
import type {
  Build,
  BuildFilters,
  CreateBuildInput,
  UpdateBuildInput,
} from "../types/build.types";

export interface BuildsService {
  listBuilds: (
    filters?: BuildFilters,
    pagination?: PaginationParams,
  ) => Promise<PaginatedResult<Build>>;
  getBuildById: (id: UUID) => Promise<Build | null>;
  createBuild: (input: CreateBuildInput) => Promise<Build>;
  updateBuild: (input: UpdateBuildInput) => Promise<Build>;
  deleteBuild: (id: UUID) => Promise<void>;
}

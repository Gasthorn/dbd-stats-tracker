import type { AsyncStatus, UUID } from "../../../shared/types/common.types";
import type {
  Build,
  BuildFilters,
  CreateBuildInput,
  UpdateBuildInput,
} from "../types/build.types";

export interface BuildsState {
  builds: Build[];
  selectedBuildId: UUID | null;
  filters: BuildFilters;
  status: AsyncStatus;
  error: string | null;
}

export interface BuildsActions {
  fetchBuilds: (filters?: BuildFilters) => Promise<void>;
  createBuild: (input: CreateBuildInput) => Promise<Build>;
  updateBuild: (input: UpdateBuildInput) => Promise<Build>;
  deleteBuild: (id: UUID) => Promise<void>;
  toggleFavorite: (id: UUID) => Promise<void>;
  selectBuild: (id: UUID | null) => void;
  setFilters: (filters: BuildFilters) => void;
}

export type BuildsStore = BuildsState & BuildsActions;

import type { AsyncStatus, UUID } from "../../../shared/types/common.types";
import type { Build, CreateBuildInput } from "../types/build.types";

export interface BuildsState {
  builds: Build[];
  status: AsyncStatus;
  error: string | null;
}

export interface BuildsActions {
  fetchBuilds: () => Promise<void>;
  saveBuild: (input: CreateBuildInput) => Promise<Build>;
  deleteBuild: (id: UUID) => Promise<void>;
}

export type BuildsStore = BuildsState & BuildsActions;

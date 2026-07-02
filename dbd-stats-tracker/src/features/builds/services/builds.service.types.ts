import type { UUID } from "../../../shared/types/common.types";
import type { Build, CreateBuildInput } from "../types/build.types";

export interface BuildsService {
  listBuilds: () => Promise<Build[]>;
  /** Creates the build, or overwrites the existing one with the same name (matches the legacy prototype's save-by-name behavior). */
  saveBuild: (input: CreateBuildInput) => Promise<Build>;
  deleteBuild: (id: UUID) => Promise<void>;
}

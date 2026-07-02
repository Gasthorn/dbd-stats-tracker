import type { UUID } from "../../../shared/types/common.types";

export interface SettingsService {
  getIconsFolderPath: (userId: UUID) => Promise<string | null>;
  updateIconsFolderPath: (userId: UUID, path: string | null) => Promise<void>;
}

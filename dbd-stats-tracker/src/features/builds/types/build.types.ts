import type { ISODateString, UUID } from "../../../shared/types/common.types";
import type {
  CharacterId,
  CharacterRole,
} from "../../../shared/types/dbd-entities.types";

export interface Build {
  id: UUID;
  userId: UUID;
  name: string;
  role: CharacterRole;
  characterId: CharacterId;
  perkIds: [UUID | null, UUID | null, UUID | null, UUID | null];
  itemId: UUID | null;
  addonIds: UUID[];
  offeringId: UUID | null;
  description: string | null;
  tags: string[];
  isFavorite: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface BuildFilters {
  role?: CharacterRole;
  characterId?: CharacterId;
  tag?: string;
  isFavorite?: boolean;
  search?: string;
}

export type CreateBuildInput = Omit<
  Build,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type UpdateBuildInput = Partial<CreateBuildInput> & { id: UUID };

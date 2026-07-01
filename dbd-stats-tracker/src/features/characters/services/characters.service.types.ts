import type { UUID } from "../../../shared/types/common.types";
import type { UnlockedCharacters } from "../types/characters.types";

export interface CharactersService {
  getUnlockedCharacters: (userId: UUID) => Promise<UnlockedCharacters>;
  updateUnlockedCharacters: (
    userId: UUID,
    unlocked: UnlockedCharacters,
  ) => Promise<void>;
}

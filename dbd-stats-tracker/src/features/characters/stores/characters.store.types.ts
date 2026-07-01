import type { AsyncStatus } from "../../../shared/types/common.types";
import type { CharacterRole } from "../../../shared/types/dbd-entities.types";

export interface CharactersState {
  unlockedKillers: string[];
  unlockedSurvivors: string[];
  status: AsyncStatus;
  error: string | null;
}

export interface CharactersActions {
  fetch: () => Promise<void>;
  toggleKiller: (name: string) => Promise<void>;
  toggleSurvivor: (name: string) => Promise<void>;
  unlockAll: (role: CharacterRole) => Promise<void>;
  resetToDefault: (role: CharacterRole) => Promise<void>;
}

export type CharactersStore = CharactersState & CharactersActions;

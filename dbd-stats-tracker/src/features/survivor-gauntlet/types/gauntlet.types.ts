import type { ISODateString, UUID } from "../../../shared/types/common.types";
import type { MatchRole } from "../../match-tracker/types/match.types";

export interface GauntletProgress {
  id: UUID;
  userId: UUID;
  role: MatchRole;
  completedCharacters: string[];
  currentCharacter: string | null;
  characterQueue: string[];
  updatedAt: ISODateString;
}

export type UpdateGauntletProgressInput = Partial<
  Pick<GauntletProgress, "completedCharacters" | "currentCharacter" | "characterQueue">
> & { id: UUID };

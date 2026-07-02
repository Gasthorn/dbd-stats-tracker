import type { ISODateString, UUID } from "../../../shared/types/common.types";
import type { MatchRole } from "../../match-tracker/types/match.types";

export interface Build {
  id: UUID;
  userId: UUID;
  name: string;
  role: MatchRole;
  characterName: string;
  /** Up to 4 perk names. */
  perks: string[];
  /** Up to 3 item/addon names (2 for killer, 3 for survivor). */
  equipment: string[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type CreateBuildInput = Omit<Build, "id" | "userId" | "createdAt" | "updatedAt">;

import type { ISODateString, UUID } from "../../../shared/types/common.types";

export interface Team {
  id: UUID;
  userId: UUID;
  name: string;
  /** Up to 3 teammate pseudos - the player themselves is the implicit 4th squad member. */
  memberNames: string[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type CreateTeamInput = Omit<Team, "id" | "userId" | "createdAt" | "updatedAt">;

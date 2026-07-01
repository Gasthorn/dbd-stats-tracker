import type { ISODateString, UUID } from "../../../shared/types/common.types";

export interface HardcoreRun {
  id: UUID;
  userId: UUID;
  seasonId: string;
  killerPips: number;
  survivorPips: number;
  deadKillers: string[];
  deadSurvivors: string[];
  startedAt: ISODateString;
  endedAt: ISODateString | null;
  updatedAt: ISODateString;
}

export type UpdateHardcoreRunInput = Partial<
  Pick<HardcoreRun, "killerPips" | "survivorPips" | "deadKillers" | "deadSurvivors" | "endedAt">
> & { id: UUID };

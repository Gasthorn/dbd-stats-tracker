import type { ISODateString, UUID } from "../../../shared/types/common.types";

export type WorldCupStatus = "group_stage" | "knockout" | "completed";

export type WorldCupKnockoutRound =
  | "round_of_32"
  | "round_of_16"
  | "quarterfinal"
  | "semifinal"
  | "final";

export type WorldCupRound = "group" | WorldCupKnockoutRound;

export interface WorldCupRun {
  id: UUID;
  userId: UUID;
  status: WorldCupStatus;
  currentRound: WorldCupKnockoutRound | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  completedAt: ISODateString | null;
}

export interface WorldCupGroup {
  id: UUID;
  runId: UUID;
  groupIndex: number;
  killers: string[];
}

export interface WorldCupFixture {
  id: UUID;
  runId: UUID;
  groupId: UUID | null;
  round: WorldCupRound;
  slotIndex: number;
  killerA: string;
  killerB: string;
  killerAMatchId: UUID | null;
  killerBMatchId: UUID | null;
  winner: "a" | "b" | "draw" | null;
}

export type FixtureSide = "a" | "b";

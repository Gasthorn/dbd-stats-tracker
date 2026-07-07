import type { UUID } from "../../../shared/types/common.types";
import type {
  FixtureSide,
  WorldCupFixture,
  WorldCupGroup,
  WorldCupKnockoutRound,
  WorldCupRun,
  WorldCupStatus,
} from "../types/world-cup.types";

export interface CreateWorldCupRunInput {
  userId: UUID;
  /** Each inner array is one group's 6 killer names, already drawn (pots resolved) by the caller. */
  groups: string[][];
}

export interface CreateKnockoutFixturesInput {
  userId: UUID;
  runId: UUID;
  round: WorldCupKnockoutRound;
  pairings: { killerA: string; killerB: string; slotIndex: number }[];
}

export interface WorldCupService {
  getActiveRun: (userId: UUID) => Promise<WorldCupRun | null>;
  getLastCompletedRun: (userId: UUID) => Promise<WorldCupRun | null>;
  createRun: (
    input: CreateWorldCupRunInput,
  ) => Promise<{ run: WorldCupRun; groups: WorldCupGroup[]; fixtures: WorldCupFixture[] }>;
  listGroups: (runId: UUID) => Promise<WorldCupGroup[]>;
  listFixtures: (runId: UUID) => Promise<WorldCupFixture[]>;
  /** Every fixture the user has ever recorded a side for, across all runs (used to resolve the opposing killer of a past World Cup match in history views). */
  listFixturesForUser: (userId: UUID) => Promise<WorldCupFixture[]>;
  recordFixtureSide: (fixtureId: UUID, side: FixtureSide, matchId: UUID) => Promise<WorldCupFixture>;
  setFixtureWinner: (fixtureId: UUID, winner: "a" | "b" | "draw") => Promise<WorldCupFixture>;
  createKnockoutFixtures: (input: CreateKnockoutFixturesInput) => Promise<WorldCupFixture[]>;
  advanceRunStatus: (
    runId: UUID,
    status: WorldCupStatus,
    currentRound: WorldCupKnockoutRound | null,
  ) => Promise<WorldCupRun>;
  resetActiveRun: (runId: UUID) => Promise<void>;
}

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
  /** Every completed World Cup for this user, most recent first - for browsing past tournament results. */
  listCompletedRuns: (userId: UUID) => Promise<WorldCupRun[]>;
  createRun: (
    input: CreateWorldCupRunInput,
  ) => Promise<{ run: WorldCupRun; groups: WorldCupGroup[]; fixtures: WorldCupFixture[] }>;
  listGroups: (runId: UUID) => Promise<WorldCupGroup[]>;
  listFixtures: (runId: UUID) => Promise<WorldCupFixture[]>;
  /** Every fixture the user has ever recorded a side for, across all runs (used to resolve the opposing killer of a past World Cup match in history views). */
  listFixturesForUser: (userId: UUID) => Promise<WorldCupFixture[]>;
  /** Every group from every run the user has ever drawn, across all runs (needed to label a group-stage fixture's "Poule X" in cross-tournament views). */
  listGroupsForUser: (userId: UUID) => Promise<WorldCupGroup[]>;
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

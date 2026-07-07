import type { AsyncStatus, UUID } from "../../../shared/types/common.types";
import type { GroupStanding } from "../../../shared/lib/world-cup/standings";
import type { CreateKillerMatchInput } from "../../match-tracker/types/match.types";
import type { Match } from "../../match-tracker/types/match.types";
import type { FixtureSide, WorldCupFixture, WorldCupGroup, WorldCupRun } from "../types/world-cup.types";

/** Everything the World Cup match form collects; the store fills in the killer-only mode fields. */
export type WorldCupMatchInput = Pick<
  CreateKillerMatchInput,
  "characterName" | "perks" | "equipment" | "bloodpoints" | "kills" | "hooks" | "generatorsCompleted"
>;

/** A past completed World Cup's full data, for read-only browsing. */
export interface WorldCupRunDetail {
  run: WorldCupRun;
  groups: WorldCupGroup[];
  fixtures: WorldCupFixture[];
  matchesById: Record<UUID, Match>;
}

export interface WorldCupState {
  run: WorldCupRun | null;
  groups: WorldCupGroup[];
  fixtures: WorldCupFixture[];
  matchesById: Record<UUID, Match>;
  /** Whether the player has ever completed a World Cup - if so, the next draw is auto-seeded from it. */
  hasHistory: boolean;
  status: AsyncStatus;
  error: string | null;
  /** Every completed World Cup, most recent first - populated on demand for the history browser. */
  historyRuns: WorldCupRun[];
  historyStatus: AsyncStatus;
  historyError: string | null;
  /** The past run currently being viewed in detail, if any. */
  selectedHistoryRun: WorldCupRunDetail | null;
  /** Every killer's record pooled across every match (group and knockout) from every World Cup the player has ever played, ranked best to worst. */
  careerStandings: GroupStanding[];
  /** The raw fixtures/matches/groups behind `careerStandings`, kept around so the killer-history modal can be opened from the career standings view without refetching. */
  careerFixtures: WorldCupFixture[];
  careerMatchesById: Record<UUID, Match>;
  careerGroups: WorldCupGroup[];
  careerStatus: AsyncStatus;
  careerError: string | null;
}

export interface WorldCupActions {
  initialize: () => Promise<void>;
  /** Starts a new run. Omit `manualSeedOrder` to auto-seed (from history if any exists, otherwise randomly). */
  startRun: (options?: { manualSeedOrder?: string[] }) => Promise<void>;
  recordFixtureMatch: (fixtureId: UUID, side: FixtureSide, match: WorldCupMatchInput) => Promise<void>;
  resolveManualTiebreak: (fixtureId: UUID, winner: "a" | "b") => Promise<void>;
  advanceToKnockout: () => Promise<void>;
  advanceKnockoutRound: () => Promise<void>;
  resetActiveRun: () => Promise<void>;
  loadCompletedRuns: () => Promise<void>;
  loadHistoryRunDetail: (runId: UUID) => Promise<void>;
  clearHistoryRunDetail: () => void;
  loadCareerStandings: () => Promise<void>;
}

export type WorldCupStore = WorldCupState & WorldCupActions;

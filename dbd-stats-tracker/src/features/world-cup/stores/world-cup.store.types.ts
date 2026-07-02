import type { AsyncStatus, UUID } from "../../../shared/types/common.types";
import type { CreateKillerMatchInput } from "../../match-tracker/types/match.types";
import type { Match } from "../../match-tracker/types/match.types";
import type { FixtureSide, WorldCupFixture, WorldCupGroup, WorldCupRun } from "../types/world-cup.types";

/** Everything the World Cup match form collects; the store fills in the killer-only mode fields. */
export type WorldCupMatchInput = Pick<
  CreateKillerMatchInput,
  "characterName" | "perks" | "equipment" | "bloodpoints" | "kills" | "hooks" | "generatorsCompleted"
>;

export interface WorldCupState {
  run: WorldCupRun | null;
  groups: WorldCupGroup[];
  fixtures: WorldCupFixture[];
  matchesById: Record<UUID, Match>;
  /** Whether the player has ever completed a World Cup - if so, the next draw is auto-seeded from it. */
  hasHistory: boolean;
  status: AsyncStatus;
  error: string | null;
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
}

export type WorldCupStore = WorldCupState & WorldCupActions;

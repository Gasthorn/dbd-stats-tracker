import type { FixtureSideResult } from "../../../shared/lib/world-cup/knockout";
import type { StandingsFixture } from "../../../shared/lib/world-cup/standings";
import type { Match } from "../../match-tracker/types/match.types";
import type { WorldCupFixture } from "../types/world-cup.types";

/** Reduces a fixture + the matches cache to just what the standings math needs. */
export function toStandingsFixture(
  fixture: WorldCupFixture,
  matchesById: Record<string, Match>,
): StandingsFixture {
  const matchA = fixture.killerAMatchId ? matchesById[fixture.killerAMatchId] : undefined;
  const matchB = fixture.killerBMatchId ? matchesById[fixture.killerBMatchId] : undefined;
  return {
    killerA: fixture.killerA,
    killerB: fixture.killerB,
    hooksA: matchA && matchA.role === "killer" ? matchA.hooks : null,
    hooksB: matchB && matchB.role === "killer" ? matchB.hooks : null,
  };
}

export function toFixtureSideResult(match: Match | undefined): FixtureSideResult | null {
  if (!match) return null;
  return {
    hooks: match.role === "killer" ? match.hooks : null,
    kills: match.role === "killer" ? match.kills : 0,
    bloodpoints: match.bloodpoints,
  };
}

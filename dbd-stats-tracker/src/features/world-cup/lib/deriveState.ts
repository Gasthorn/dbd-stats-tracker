import type { FixtureSideResult, RankedQualifier } from "../../../shared/lib/world-cup/knockout";
import {
  computeGroupStandings,
  rankGroupStandings,
  rankOverallStandings,
  type StandingsFixture,
} from "../../../shared/lib/world-cup/standings";
import type { Match } from "../../match-tracker/types/match.types";
import type { WorldCupFixture } from "../types/world-cup.types";

/** Fixed knockout field size (32 - the round-of-32 bracket shape). */
export const KNOCKOUT_FIELD_SIZE = 32;
/** Automatic qualifiers per group (4 * 7 groups = 28); the rest of the field is filled by the best "next in line" killers across all groups, like FIFA's best-third-placed-team wildcards. */
export const AUTO_QUALIFIERS_PER_GROUP = 4;

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
    generatorsCompleted: match.generatorsCompleted,
    bloodpoints: match.bloodpoints,
  };
}

/** Every fixture (group stage and knockout) a given killer has been drawn into, across the whole run. */
export function getKillerFixtures(killerName: string, fixtures: readonly WorldCupFixture[]): WorldCupFixture[] {
  return fixtures.filter((fixture) => fixture.killerA === killerName || fixture.killerB === killerName);
}

export interface GroupWithStandingsFixtures {
  groupIndex: number;
  killers: readonly string[];
  fixtures: readonly StandingsFixture[];
}

export interface GroupQualificationResult {
  /** Every qualifier, ranked best to worst overall - the exact field that feeds the Round of 32 draw. */
  qualifiers: RankedQualifier[];
  /** Same killers as `qualifiers`, as a lookup set for "is this killer still in it?" checks. */
  qualifiedKillers: Set<string>;
}

/**
 * FIFA-style qualification: the top `autoQualifiersPerGroup` of every group qualify automatically;
 * the remaining knockout slots go to the best "next in line" killers across all groups (like the
 * best third-placed teams at a real World Cup), ranked by their group-stage form alone.
 */
export function computeGroupQualification(
  groupsWithFixtures: readonly GroupWithStandingsFixtures[],
  autoQualifiersPerGroup: number = AUTO_QUALIFIERS_PER_GROUP,
  knockoutFieldSize: number = KNOCKOUT_FIELD_SIZE,
): GroupQualificationResult {
  const rankedByGroup = groupsWithFixtures.map((group) => ({
    groupIndex: group.groupIndex,
    ranked: rankGroupStandings(computeGroupStandings(group.killers, group.fixtures), group.fixtures),
  }));

  const autoQualifiers = rankedByGroup.flatMap(({ groupIndex, ranked }) =>
    ranked.slice(0, autoQualifiersPerGroup).map((standing) => ({ standing, groupIndex })),
  );
  const wildcardPool = rankedByGroup.flatMap(({ groupIndex, ranked }) =>
    ranked.slice(autoQualifiersPerGroup).map((standing) => ({ standing, groupIndex })),
  );
  const wildcardsNeeded = Math.max(0, knockoutFieldSize - autoQualifiers.length);
  const wildcardKillers = new Set(
    rankOverallStandings(wildcardPool.map((c) => c.standing))
      .slice(0, wildcardsNeeded)
      .map((standing) => standing.killer),
  );
  const qualified = [...autoQualifiers, ...wildcardPool.filter((c) => wildcardKillers.has(c.standing.killer))];

  const groupIndexByKiller = new Map(qualified.map((q) => [q.standing.killer, q.groupIndex]));
  const qualifiers: RankedQualifier[] = rankOverallStandings(qualified.map((q) => q.standing))
    .slice(0, knockoutFieldSize)
    .map((standing) => ({ killer: standing.killer, groupIndex: groupIndexByKiller.get(standing.killer) as number }));

  return { qualifiers, qualifiedKillers: new Set(qualifiers.map((q) => q.killer)) };
}

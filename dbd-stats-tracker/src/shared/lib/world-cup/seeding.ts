import { computeGroupStandings, rankOverallStandings, type StandingsFixture } from "./standings";
import type { KnockoutRound } from "./knockout";

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * FIFA-style pot draw: the seed order (best first) is sliced into `groupSize` pots of
 * `numGroups` killers each (pot 1 = the top `numGroups` seeds, pot 2 = the next `numGroups`, ...),
 * each pot is shuffled, then one killer from each pot is dealt into every group. This spreads
 * the strongest seeds evenly across groups instead of letting them cluster together.
 *
 * Any remainder that doesn't fill a full pot layout is dropped (sits out this tournament) so
 * every group stays perfectly comparable for the pooled top-32 cut.
 */
export function drawGroupsFromSeeding(seedOrder: readonly string[], groupSize = 6): string[][] {
  const usableCount = Math.floor(seedOrder.length / groupSize) * groupSize;
  const usable = seedOrder.slice(0, usableCount);
  const numGroups = usableCount / groupSize;
  if (numGroups === 0) return [];

  const pots: string[][] = [];
  for (let potIndex = 0; potIndex < groupSize; potIndex++) {
    pots.push(shuffle(usable.slice(potIndex * numGroups, (potIndex + 1) * numGroups)));
  }

  const groups: string[][] = Array.from({ length: numGroups }, () => []);
  for (const pot of pots) {
    for (let groupIndex = 0; groupIndex < numGroups; groupIndex++) {
      groups[groupIndex].push(pot[groupIndex]);
    }
  }
  return groups;
}

/**
 * Seed order for a player's very first World Cup (no history to rank by): every eligible
 * killer in a random order, since there's no meaningful strength signal yet.
 */
export function drawRandomSeedOrder(eligibleKillers: readonly string[]): string[] {
  return shuffle(eligibleKillers);
}

/**
 * Combines a previous tournament's final ranking with the player's currently-eligible killer
 * pool: killers who played last time keep their relative order (best first); killers who are
 * newly eligible now (unlocked since, or sat out the truncation last time) are appended after,
 * in random order since there's no data to rank them by.
 */
export function computeSeedingFromHistory(
  eligibleKillers: readonly string[],
  previousRanking: readonly string[],
): string[] {
  const eligibleSet = new Set(eligibleKillers);
  const rankedEligible = previousRanking.filter((killer) => eligibleSet.has(killer));
  const rankedSet = new Set(rankedEligible);
  const unrankedEligible = shuffle(eligibleKillers.filter((killer) => !rankedSet.has(killer)));
  return [...rankedEligible, ...unrankedEligible];
}

export interface ResolvedKnockoutFixture {
  round: KnockoutRound;
  killerA: string;
  killerB: string;
  winner: "a" | "b";
}

export interface GroupWithFixtures {
  killers: readonly string[];
  fixtures: readonly StandingsFixture[];
}

const ROUND_ELIMINATION_ORDER: Record<KnockoutRound, number> = {
  final: 0,
  semifinal: 1,
  quarterfinal: 2,
  round_of_16: 3,
  round_of_32: 4,
};

/**
 * Reconstructs a completed World Cup's final ranking (best to worst) from its group standings
 * and knockout results, for seeding the next tournament: champion, then knockout losers grouped
 * by the round that eliminated them (deepest run first, group-stage finish as the tiebreak
 * within a round), then killers who never escaped the group stage (by their overall standing).
 */
export function computePreviousTournamentRanking(
  groups: readonly GroupWithFixtures[],
  knockoutFixtures: readonly ResolvedKnockoutFixture[],
): string[] {
  const allStandings = groups.flatMap((group) => computeGroupStandings(group.killers, group.fixtures));
  const overallOrder = rankOverallStandings(allStandings).map((standing) => standing.killer);
  const overallRank = new Map(overallOrder.map((killer, index) => [killer, index]));

  const eliminationRound = new Map<string, KnockoutRound>();
  let champion: string | null = null;
  for (const fixture of knockoutFixtures) {
    const loser = fixture.winner === "a" ? fixture.killerB : fixture.killerA;
    eliminationRound.set(loser, fixture.round);
    if (fixture.round === "final") {
      champion = fixture.winner === "a" ? fixture.killerA : fixture.killerB;
    }
  }

  const knockoutKillers = Array.from(eliminationRound.keys()).sort((a, b) => {
    const roundDiff = ROUND_ELIMINATION_ORDER[eliminationRound.get(a) as KnockoutRound]
      - ROUND_ELIMINATION_ORDER[eliminationRound.get(b) as KnockoutRound];
    if (roundDiff !== 0) return roundDiff;
    return (overallRank.get(a) ?? Infinity) - (overallRank.get(b) ?? Infinity);
  });

  const groupOnlyKillers = overallOrder.filter((killer) => killer !== champion && !eliminationRound.has(killer));

  return [...(champion ? [champion] : []), ...knockoutKillers, ...groupOnlyKillers];
}

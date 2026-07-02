import { matchdayOfSlot, totalMatchdays } from "../../../shared/lib/world-cup/roundRobin";
import type { WorldCupFixture, WorldCupGroup } from "../types/world-cup.types";

export interface GroupStageBatch {
  group: WorldCupGroup;
  matchday: number;
  totalMatchdays: number;
  fixtures: WorldCupFixture[];
}

/**
 * The next batch of group-stage matches to play, World-Cup-broadcast style: every group plays
 * its matchday 1 before any group plays matchday 2, etc. Returns null once every group has
 * finished every matchday (the group stage is complete).
 */
export function getCurrentGroupStageBatch(
  groups: readonly WorldCupGroup[],
  fixtures: readonly WorldCupFixture[],
): GroupStageBatch | null {
  if (groups.length === 0) return null;
  const groupSize = groups[0].killers.length;
  const rounds = totalMatchdays(groupSize);

  for (let matchday = 1; matchday <= rounds; matchday++) {
    for (const group of groups) {
      const matchdayFixtures = fixtures
        .filter((fixture) => fixture.groupId === group.id && matchdayOfSlot(fixture.slotIndex, groupSize) === matchday)
        .sort((a, b) => a.slotIndex - b.slotIndex);
      const allResolved = matchdayFixtures.length > 0 && matchdayFixtures.every((fixture) => fixture.winner !== null);
      if (!allResolved) {
        return { group, matchday, totalMatchdays: rounds, fixtures: matchdayFixtures };
      }
    }
  }
  return null;
}

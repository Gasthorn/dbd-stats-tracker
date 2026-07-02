/** A group-stage fixture reduced to just what standings need: who played, and each side's hooks
 *  (null when that side hasn't recorded its match yet, in which case the fixture is ignored). */
export interface StandingsFixture {
  killerA: string;
  killerB: string;
  hooksA: number | null;
  hooksB: number | null;
}

export interface GroupStanding {
  killer: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  hooksFor: number;
  hooksAgainst: number;
  points: number;
}

const WIN_POINTS = 3;
const DRAW_POINTS = 1;

export function computeGroupStandings(
  killers: readonly string[],
  fixtures: readonly StandingsFixture[],
): GroupStanding[] {
  const table = new Map<string, GroupStanding>(
    killers.map((killer) => [
      killer,
      { killer, played: 0, wins: 0, draws: 0, losses: 0, hooksFor: 0, hooksAgainst: 0, points: 0 },
    ]),
  );

  for (const fixture of fixtures) {
    if (fixture.hooksA === null || fixture.hooksB === null) continue;
    const a = table.get(fixture.killerA);
    const b = table.get(fixture.killerB);
    if (!a || !b) continue;

    a.played++;
    b.played++;
    a.hooksFor += fixture.hooksA;
    a.hooksAgainst += fixture.hooksB;
    b.hooksFor += fixture.hooksB;
    b.hooksAgainst += fixture.hooksA;

    if (fixture.hooksA > fixture.hooksB) {
      a.wins++;
      a.points += WIN_POINTS;
      b.losses++;
    } else if (fixture.hooksB > fixture.hooksA) {
      b.wins++;
      b.points += WIN_POINTS;
      a.losses++;
    } else {
      a.draws++;
      b.draws++;
      a.points += DRAW_POINTS;
      b.points += DRAW_POINTS;
    }
  }

  return Array.from(table.values());
}

function hookDiff(s: GroupStanding): number {
  return s.hooksFor - s.hooksAgainst;
}

/** Head-to-head tiebreak between two standings tied on points/diff/hooksFor: negative if `x` should rank above `y`. */
function headToHead(x: GroupStanding, y: GroupStanding, fixtures: readonly StandingsFixture[]): number {
  const fixture = fixtures.find(
    (f) =>
      (f.killerA === x.killer && f.killerB === y.killer) || (f.killerA === y.killer && f.killerB === x.killer),
  );
  if (!fixture || fixture.hooksA === null || fixture.hooksB === null) return 0;

  const hooksX = fixture.killerA === x.killer ? fixture.hooksA : fixture.hooksB;
  const hooksY = fixture.killerA === x.killer ? fixture.hooksB : fixture.hooksA;
  if (hooksX > hooksY) return -1;
  if (hooksX < hooksY) return 1;
  return 0;
}

/** Ranks a single group's standings: points, then hook differential, then hooks scored, then head-to-head, then name. */
export function rankGroupStandings(
  standings: readonly GroupStanding[],
  fixtures: readonly StandingsFixture[],
): GroupStanding[] {
  return [...standings].sort((x, y) => {
    if (y.points !== x.points) return y.points - x.points;
    if (hookDiff(y) !== hookDiff(x)) return hookDiff(y) - hookDiff(x);
    if (y.hooksFor !== x.hooksFor) return y.hooksFor - x.hooksFor;
    const h2h = headToHead(x, y, fixtures);
    if (h2h !== 0) return h2h;
    return x.killer.localeCompare(y.killer);
  });
}

/**
 * Ranks standings pooled across every group (for the top-32 cut). Head-to-head doesn't apply
 * here since killers from different groups never face each other.
 */
export function rankOverallStandings(standings: readonly GroupStanding[]): GroupStanding[] {
  return [...standings].sort((x, y) => {
    if (y.points !== x.points) return y.points - x.points;
    if (hookDiff(y) !== hookDiff(x)) return hookDiff(y) - hookDiff(x);
    if (y.hooksFor !== x.hooksFor) return y.hooksFor - x.hooksFor;
    return x.killer.localeCompare(y.killer);
  });
}

export function isGroupComplete(killers: readonly string[], fixtures: readonly StandingsFixture[]): boolean {
  const expectedFixtures = (killers.length * (killers.length - 1)) / 2;
  const completed = fixtures.filter((f) => f.hooksA !== null && f.hooksB !== null).length;
  return completed >= expectedFixtures;
}

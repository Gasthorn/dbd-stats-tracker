import type { Match } from "../../match-tracker/types/match.types";
import type {
  ActivityHeatmapDay,
  PerformanceSeries,
  StatisticsSummary,
  TopBuildStat,
  TopCharacterStat,
} from "../types/statistics.types";

function isSurvivorEscaped(match: Match): boolean {
  return match.role === "survivor" && (match.escapeResult === "escaped_door" || match.escapeResult === "escaped_hatch");
}

/** Normalizes a build's perks (order-independent) into a single lookup key. */
function buildKey(perks: string[]): string {
  return perks
    .filter((perk) => perk && perk.trim() !== "")
    .slice()
    .sort()
    .join(" | ");
}

function topEntry<T>(counts: Map<T, number>): { key: T; count: number } | null {
  let top: T | null = null;
  let max = 0;
  for (const [key, count] of counts) {
    if (count > max) {
      max = count;
      top = key;
    }
  }
  return top === null ? null : { key: top, count: max };
}

export function computeSummary(matches: Match[]): StatisticsSummary {
  const survivorCounts = new Map<string, number>();
  const killerCounts = new Map<string, number>();
  const opponentCounts = new Map<string, number>();
  const survivorBuilds = new Map<string, number>();
  const killerBuilds = new Map<string, number>();

  let totalBP = 0;
  let killerBP = 0;
  let killerMatches = 0;
  let survivorBP = 0;
  let survivorMatches = 0;

  for (const match of matches) {
    totalBP += match.bloodpoints;
    const key = buildKey(match.perks);

    if (match.role === "killer") {
      killerBP += match.bloodpoints;
      killerMatches++;
      killerCounts.set(match.characterName, (killerCounts.get(match.characterName) ?? 0) + 1);
      if (key) killerBuilds.set(key, (killerBuilds.get(key) ?? 0) + 1);
    } else {
      survivorBP += match.bloodpoints;
      survivorMatches++;
      survivorCounts.set(match.characterName, (survivorCounts.get(match.characterName) ?? 0) + 1);
      if (match.opponentName) {
        opponentCounts.set(match.opponentName, (opponentCounts.get(match.opponentName) ?? 0) + 1);
      }
      if (key) survivorBuilds.set(key, (survivorBuilds.get(key) ?? 0) + 1);
    }
  }

  const toCharacterStat = (entry: { key: string; count: number } | null): TopCharacterStat | null =>
    entry ? { characterName: entry.key, count: entry.count } : null;
  const toBuildStat = (entry: { key: string; count: number } | null): TopBuildStat | null =>
    entry ? { perks: entry.key.split(" | "), count: entry.count } : null;

  return {
    topSurvivor: toCharacterStat(topEntry(survivorCounts)),
    topOpponentKiller: toCharacterStat(topEntry(opponentCounts)),
    topKiller: toCharacterStat(topEntry(killerCounts)),
    topSurvivorBuild: toBuildStat(topEntry(survivorBuilds)),
    topKillerBuild: toBuildStat(topEntry(killerBuilds)),
    avgBloodpointsGlobal: matches.length > 0 ? Math.round(totalBP / matches.length) : 0,
    avgBloodpointsKiller: killerMatches > 0 ? Math.round(killerBP / killerMatches) : 0,
    avgBloodpointsSurvivor: survivorMatches > 0 ? Math.round(survivorBP / survivorMatches) : 0,
    killerMatchCount: killerMatches,
    survivorMatchCount: survivorMatches,
  };
}

export function computeActivityHeatmap(matches: Match[], month: number, year: number): ActivityHeatmapDay[] {
  const counts = new Map<number, number>();
  for (const match of matches) {
    const played = new Date(match.playedAt);
    if (played.getMonth() === month && played.getFullYear() === year) {
      const day = played.getDate();
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
  }

  const lastDay = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: lastDay }, (_, i) => ({ day: i + 1, count: counts.get(i + 1) ?? 0 }));
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

interface DayAggregate {
  kills: number;
  killerGames: number;
  escapes: number;
  survivorGames: number;
}

export function computePerformanceSeries(matches: Match[]): PerformanceSeries {
  const byDay = new Map<string, DayAggregate>();

  for (const match of matches) {
    if (match.mode === "hardcore") continue;

    const key = dayKey(new Date(match.playedAt));
    const agg = byDay.get(key) ?? { kills: 0, killerGames: 0, escapes: 0, survivorGames: 0 };

    if (match.role === "killer") {
      agg.killerGames++;
      agg.kills += match.kills ?? 0;
    } else {
      agg.survivorGames++;
      if (isSurvivorEscaped(match)) agg.escapes++;
    }

    byDay.set(key, agg);
  }

  const labels = Array.from(byDay.keys()).sort();
  const killRate = labels.map((key) => {
    const agg = byDay.get(key) as DayAggregate;
    return agg.killerGames > 0 ? Math.round((agg.kills / (agg.killerGames * 4)) * 1000) / 10 : null;
  });
  const escapeRate = labels.map((key) => {
    const agg = byDay.get(key) as DayAggregate;
    return agg.survivorGames > 0 ? Math.round((agg.escapes / agg.survivorGames) * 1000) / 10 : null;
  });

  return { labels, killRate, escapeRate };
}

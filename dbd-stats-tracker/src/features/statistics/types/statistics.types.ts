export interface TopCharacterStat {
  characterName: string;
  count: number;
}

export interface TopBuildStat {
  perks: string[];
  count: number;
}

export interface StatisticsSummary {
  topSurvivor: TopCharacterStat | null;
  topOpponentKiller: TopCharacterStat | null;
  topKiller: TopCharacterStat | null;
  topSurvivorBuild: TopBuildStat | null;
  topKillerBuild: TopBuildStat | null;
  avgBloodpointsGlobal: number;
  avgBloodpointsKiller: number;
  avgBloodpointsSurvivor: number;
  killerMatchCount: number;
  survivorMatchCount: number;
}

export interface ActivityHeatmapDay {
  day: number;
  count: number;
}

export interface PerformanceSeries {
  /** One entry per day that has at least one non-hardcore match, chronologically sorted. */
  labels: string[];
  /** Kill rate %, aligned with labels; null on days with no killer games. */
  killRate: (number | null)[];
  /** Escape rate %, aligned with labels; null on days with no survivor games. */
  escapeRate: (number | null)[];
}

/**
 * Performance tied to one "key" - an opposing killer, a perk, or a saved build - for a given
 * role: how many matches it appeared in, and the resulting rate (escape rate for survivor,
 * kill rate for killer). `secondaryCount` is the raw numerator behind the rate: escapes for
 * survivor stats, total sacrifices for killer stats.
 */
export interface KeyedPerformanceStat {
  key: string;
  matches: number;
  secondaryCount: number;
  ratePercent: number;
}

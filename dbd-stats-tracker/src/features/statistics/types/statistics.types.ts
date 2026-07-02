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

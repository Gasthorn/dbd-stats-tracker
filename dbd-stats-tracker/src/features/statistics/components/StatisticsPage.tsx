import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "../../../shared/i18n";
import { KILLERS } from "../../../shared/data/characters";
import { KILLER_PERKS, SURVIVOR_PERKS } from "../../../shared/data/perks";
import { useBuildsStore } from "../../builds";
import { useTeamsStore } from "../../teams/stores/teams.store";
import {
  computeActivityHeatmap,
  computeBuildPerformance,
  computeOpponentPerformance,
  computePerformanceSeries,
  computePerkPerformance,
  computeSummary,
  computeSurvivorOutcomes,
  computeSwfPerformance,
  computeWinStreaks,
} from "../lib/computeStatistics";
import { useStatisticsStore } from "../stores/statistics.store";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { EntityPerformanceLookup } from "./EntityPerformanceLookup";
import { EntityPerformanceTable } from "./EntityPerformanceTable";
import { PerformanceBarChart } from "./PerformanceBarChart";
import { RoleDistributionBar } from "./RoleDistributionBar";
import { SurvivorOutcomeBar } from "./SurvivorOutcomeBar";
import { TopBuildCard } from "./TopBuildCard";
import { TopCharacterCard } from "./TopCharacterCard";
import { WinStreakCard } from "./WinStreakCard";
import "./statistics.css";

function formatBloodpoints(value: number): string {
  return value.toLocaleString(getDateLocale());
}

export function StatisticsPage() {
  const { t } = useTranslation();
  const matches = useStatisticsStore((state) => state.matches);
  const status = useStatisticsStore((state) => state.status);
  const error = useStatisticsStore((state) => state.error);
  const viewedMonth = useStatisticsStore((state) => state.viewedMonth);
  const viewedYear = useStatisticsStore((state) => state.viewedYear);
  const fetchAll = useStatisticsStore((state) => state.fetchAll);
  const changeMonth = useStatisticsStore((state) => state.changeMonth);
  const resetMonth = useStatisticsStore((state) => state.resetMonth);

  const builds = useBuildsStore((state) => state.builds);
  const buildsStatus = useBuildsStore((state) => state.status);
  const fetchBuilds = useBuildsStore((state) => state.fetchBuilds);

  const teams = useTeamsStore((state) => state.teams);
  const teamsStatus = useTeamsStore((state) => state.status);
  const fetchTeams = useTeamsStore((state) => state.fetchTeams);

  useEffect(() => {
    fetchAll();
    if (buildsStatus === "idle") fetchBuilds();
    if (teamsStatus === "idle") fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAll]);

  const summary = useMemo(() => computeSummary(matches), [matches]);
  const heatmapDays = useMemo(
    () => computeActivityHeatmap(matches, viewedMonth, viewedYear),
    [matches, viewedMonth, viewedYear],
  );
  const performance = useMemo(() => computePerformanceSeries(matches), [matches]);
  const winStreaks = useMemo(() => computeWinStreaks(matches), [matches]);
  const opponentStats = useMemo(() => computeOpponentPerformance(matches), [matches]);
  const survivorOutcomes = useMemo(() => computeSurvivorOutcomes(matches), [matches]);
  const swfComparison = useMemo(
    () => computeSwfPerformance(matches, teams, t("stats.deletedTeam")),
    [matches, teams, t],
  );

  const survivorPerkStats = useMemo(() => computePerkPerformance(matches, "survivor"), [matches]);
  const killerPerkStats = useMemo(() => computePerkPerformance(matches, "killer"), [matches]);

  const survivorBuildStats = useMemo(
    () => computeBuildPerformance(matches, "survivor", builds),
    [matches, builds],
  );
  const killerBuildStats = useMemo(() => computeBuildPerformance(matches, "killer", builds), [matches, builds]);
  const survivorBuildNames = useMemo(
    () => builds.filter((build) => build.role === "survivor").map((build) => build.name),
    [builds],
  );
  const killerBuildNames = useMemo(
    () => builds.filter((build) => build.role === "killer").map((build) => build.name),
    [builds],
  );

  return (
    <div className="statistics-page">
      <h1>{t("stats.title")}</h1>

      {error && <p className="match-error">{error}</p>}
      {status === "loading" && matches.length === 0 && <LoadingSpinner />}

      {status !== "loading" && matches.length === 0 && !error && (
        <p className="statistics-empty">{t("stats.empty")}</p>
      )}

      {matches.length > 0 && (
        <div className="statistics-grid">
          <div className="stats-zone stats-zone-wide">
            <h2>{t("stats.favoritesTitle")}</h2>
            <div className="top-stats-row">
              <TopCharacterCard label={t("stats.topSurvivor")} stat={summary.topSurvivor} />
              <TopCharacterCard label={t("stats.topOpponentKiller")} stat={summary.topOpponentKiller} />
              <TopCharacterCard label={t("stats.topKiller")} stat={summary.topKiller} />
            </div>
            <div className="top-stats-row">
              <TopBuildCard label={t("stats.topSurvivorBuild")} stat={summary.topSurvivorBuild} />
              <TopBuildCard label={t("stats.topKillerBuild")} stat={summary.topKillerBuild} />
            </div>
            <div className="top-stats-row">
              <WinStreakCard label={t("stats.survivorStreak")} streak={winStreaks.survivor} seriesClassName="is-survivor" />
              <WinStreakCard label={t("stats.killerStreak")} streak={winStreaks.killer} seriesClassName="is-killer" />
            </div>
            <div className="top-stats-row">
              <div className="top-stat-card">
                <p>{t("stats.avgSurvivorBp")}</p>
                <b className="top-stat-value is-survivor">{formatBloodpoints(summary.avgBloodpointsSurvivor)}</b>
              </div>
              <div className="top-stat-card">
                <p>{t("stats.avgGlobalBp")}</p>
                <b className="top-stat-value is-global">{formatBloodpoints(summary.avgBloodpointsGlobal)}</b>
              </div>
              <div className="top-stat-card">
                <p>{t("stats.avgKillerBp")}</p>
                <b className="top-stat-value is-killer">{formatBloodpoints(summary.avgBloodpointsKiller)}</b>
              </div>
            </div>
          </div>

          <div className="stats-zone">
            <h2>{t("stats.roleDistribution")}</h2>
            <RoleDistributionBar
              killerMatches={summary.killerMatchCount}
              survivorMatches={summary.survivorMatchCount}
            />
          </div>

          <div className="stats-zone">
            <h2>{t("stats.outcomesTitle")}</h2>
            <SurvivorOutcomeBar outcomes={survivorOutcomes} />
          </div>

          <div className="stats-zone stats-zone-wide">
            <h2>{t("stats.swfTitle")}</h2>
            <div className="top-stats-row">
              <div className="top-stat-card">
                <p>{t("stats.soloEscapeRate")}</p>
                <b className="top-stat-value is-survivor">
                  {swfComparison.solo.matches > 0 ? `${swfComparison.solo.ratePercent} %` : "—"}
                </b>
                <span className="top-stat-detail">
                  {t("stats.swfMatches", { count: swfComparison.solo.matches })}
                </span>
              </div>
              <div className="top-stat-card">
                <p>{t("stats.swfEscapeRate")}</p>
                <b className="top-stat-value is-global">
                  {swfComparison.team.matches > 0 ? `${swfComparison.team.ratePercent} %` : "—"}
                </b>
                <span className="top-stat-detail">
                  {t("stats.swfMatches", { count: swfComparison.team.matches })}
                </span>
              </div>
            </div>
            <EntityPerformanceTable
              title={t("stats.mostPlayedTeams")}
              entityColumnLabel={t("stats.teamColumn")}
              secondaryColumnLabel={t("stats.escapes")}
              rateColumnLabel={t("stats.escapeRate")}
              stats={swfComparison.perTeam}
              seriesClassName="is-survivor"
              emptyMessage={t("stats.noTeamMatches")}
            />
          </div>

          <div className="stats-zone">
            <ActivityHeatmap
              days={heatmapDays}
              month={viewedMonth}
              year={viewedYear}
              onPrevMonth={() => changeMonth(-1)}
              onNextMonth={() => changeMonth(1)}
              onToday={resetMonth}
            />
          </div>

          <div className="stats-zone stats-zone-wide">
            <h2>{t("stats.vsKillersTitle")}</h2>
            <div className="entity-section-row">
              <EntityPerformanceTable
                title={t("stats.mostFacedKillers")}
                entityColumnLabel={t("stats.killerColumn")}
                secondaryColumnLabel={t("stats.escapes")}
                rateColumnLabel={t("stats.escapeRate")}
                stats={opponentStats}
                seriesClassName="is-survivor"
                iconCategory="Characters"
                emptyMessage={t("stats.noSurvivorMatches")}
              />
              <EntityPerformanceLookup
                title={t("stats.vsSpecificKiller")}
                selectLabel={t("stats.chooseKiller")}
                stats={opponentStats}
                options={KILLERS}
                matchesLabel={t("stats.matchesPlayed")}
                secondaryLabel={t("stats.escapes")}
                rateLabel={t("stats.escapeRate")}
                seriesClassName="is-survivor"
                iconCategory="Characters"
                emptyOptionsMessage={t("stats.noKillersAvailable")}
              />
            </div>
          </div>

          <div className="stats-zone stats-zone-wide">
            <h2>{t("stats.buildsTitle")}</h2>
            <div className="entity-section-row">
              <div className="entity-role-column">
                <h3 className="entity-role-heading is-survivor">{t("common.survivor")}</h3>
                <EntityPerformanceTable
                  title={t("stats.mostPlayedBuilds")}
                  entityColumnLabel={t("stats.buildColumn")}
                  secondaryColumnLabel={t("stats.escapes")}
                  rateColumnLabel={t("stats.escapeRate")}
                  stats={survivorBuildStats}
                  seriesClassName="is-survivor"
                  emptyMessage={t("stats.noSurvivorBuildReplayed")}
                />
                <EntityPerformanceLookup
                  title={t("stats.specificBuild")}
                  selectLabel={t("stats.chooseBuild")}
                  stats={survivorBuildStats}
                  options={survivorBuildNames}
                  matchesLabel={t("stats.matchesPlayed")}
                  secondaryLabel={t("stats.escapes")}
                  rateLabel={t("stats.escapeRate")}
                  seriesClassName="is-survivor"
                  emptyOptionsMessage={t("stats.noSurvivorBuilds")}
                />
              </div>
              <div className="entity-role-column">
                <h3 className="entity-role-heading is-killer">{t("common.killer")}</h3>
                <EntityPerformanceTable
                  title={t("stats.mostPlayedBuilds")}
                  entityColumnLabel={t("stats.buildColumn")}
                  secondaryColumnLabel={t("stats.sacrifices")}
                  rateColumnLabel={t("stats.killRate")}
                  stats={killerBuildStats}
                  seriesClassName="is-killer"
                  emptyMessage={t("stats.noKillerBuildReplayed")}
                />
                <EntityPerformanceLookup
                  title={t("stats.specificBuild")}
                  selectLabel={t("stats.chooseBuild")}
                  stats={killerBuildStats}
                  options={killerBuildNames}
                  matchesLabel={t("stats.matchesPlayed")}
                  secondaryLabel={t("stats.sacrifices")}
                  rateLabel={t("stats.killRate")}
                  seriesClassName="is-killer"
                  emptyOptionsMessage={t("stats.noKillerBuilds")}
                />
              </div>
            </div>
          </div>

          <div className="stats-zone stats-zone-wide">
            <h2>{t("stats.perksTitle")}</h2>
            <div className="entity-section-row">
              <div className="entity-role-column">
                <h3 className="entity-role-heading is-survivor">{t("common.survivor")}</h3>
                <EntityPerformanceTable
                  title={t("stats.mostPlayedPerks")}
                  entityColumnLabel={t("stats.perkColumn")}
                  secondaryColumnLabel={t("stats.escapes")}
                  rateColumnLabel={t("stats.escapeRate")}
                  stats={survivorPerkStats}
                  seriesClassName="is-survivor"
                  iconCategory="Perks"
                  diamondIcon
                  emptyMessage={t("stats.noSurvivorMatches")}
                />
                <EntityPerformanceLookup
                  title={t("stats.specificPerk")}
                  selectLabel={t("stats.choosePerk")}
                  stats={survivorPerkStats}
                  options={SURVIVOR_PERKS.map((perk) => perk.name)}
                  matchesLabel={t("stats.matchesPlayed")}
                  secondaryLabel={t("stats.escapes")}
                  rateLabel={t("stats.escapeRate")}
                  seriesClassName="is-survivor"
                  iconCategory="Perks"
                  emptyOptionsMessage={t("stats.noPerksAvailable")}
                />
              </div>
              <div className="entity-role-column">
                <h3 className="entity-role-heading is-killer">{t("common.killer")}</h3>
                <EntityPerformanceTable
                  title={t("stats.mostPlayedPerks")}
                  entityColumnLabel={t("stats.perkColumn")}
                  secondaryColumnLabel={t("stats.sacrifices")}
                  rateColumnLabel={t("stats.killRate")}
                  stats={killerPerkStats}
                  seriesClassName="is-killer"
                  iconCategory="Perks"
                  diamondIcon
                  emptyMessage={t("stats.noKillerMatches")}
                />
                <EntityPerformanceLookup
                  title={t("stats.specificPerk")}
                  selectLabel={t("stats.choosePerk")}
                  stats={killerPerkStats}
                  options={KILLER_PERKS.map((perk) => perk.name)}
                  matchesLabel={t("stats.matchesPlayed")}
                  secondaryLabel={t("stats.sacrifices")}
                  rateLabel={t("stats.killRate")}
                  seriesClassName="is-killer"
                  iconCategory="Perks"
                  emptyOptionsMessage={t("stats.noPerksAvailable")}
                />
              </div>
            </div>
          </div>

          <div className="stats-zone stats-zone-wide">
            <h2>{t("stats.performanceTitle")}</h2>
            <div className="performance-charts-row">
              <PerformanceBarChart
                title={t("stats.killerKillRate")}
                labels={performance.labels}
                values={performance.killRate}
                seriesClassName="is-killer"
              />
              <PerformanceBarChart
                title={t("stats.survivorEscapeRate")}
                labels={performance.labels}
                values={performance.escapeRate}
                seriesClassName="is-survivor"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

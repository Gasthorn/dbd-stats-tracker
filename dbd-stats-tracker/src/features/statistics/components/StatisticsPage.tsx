import { useEffect, useMemo } from "react";
import { computeActivityHeatmap, computePerformanceSeries, computeSummary } from "../lib/computeStatistics";
import { useStatisticsStore } from "../stores/statistics.store";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { PerformanceBarChart } from "./PerformanceBarChart";
import { RoleDistributionBar } from "./RoleDistributionBar";
import { TopBuildCard } from "./TopBuildCard";
import { TopCharacterCard } from "./TopCharacterCard";
import "./statistics.css";

function formatBloodpoints(value: number): string {
  return value.toLocaleString("fr-FR");
}

export function StatisticsPage() {
  const matches = useStatisticsStore((state) => state.matches);
  const status = useStatisticsStore((state) => state.status);
  const error = useStatisticsStore((state) => state.error);
  const viewedMonth = useStatisticsStore((state) => state.viewedMonth);
  const viewedYear = useStatisticsStore((state) => state.viewedYear);
  const fetchAll = useStatisticsStore((state) => state.fetchAll);
  const changeMonth = useStatisticsStore((state) => state.changeMonth);
  const resetMonth = useStatisticsStore((state) => state.resetMonth);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const summary = useMemo(() => computeSummary(matches), [matches]);
  const heatmapDays = useMemo(
    () => computeActivityHeatmap(matches, viewedMonth, viewedYear),
    [matches, viewedMonth, viewedYear],
  );
  const performance = useMemo(() => computePerformanceSeries(matches), [matches]);

  return (
    <div className="statistics-page">
      <h1>Statistiques</h1>

      {error && <p className="match-error">{error}</p>}
      {status === "loading" && matches.length === 0 && <p>Chargement...</p>}

      {status !== "loading" && matches.length === 0 && !error && (
        <p className="statistics-empty">Aucune partie enregistrée pour le moment.</p>
      )}

      {matches.length > 0 && (
        <div className="statistics-grid">
          <div className="stats-zone stats-zone-wide">
            <h2>Favoris & Records</h2>
            <div className="top-stats-row">
              <TopCharacterCard label="Survivant le plus joué" stat={summary.topSurvivor} />
              <TopCharacterCard label="Tueur le plus affronté" stat={summary.topOpponentKiller} />
              <TopCharacterCard label="Tueur le plus joué" stat={summary.topKiller} />
            </div>
            <div className="top-stats-row">
              <TopBuildCard label="Build Survivant favori" stat={summary.topSurvivorBuild} />
              <TopBuildCard label="Build Tueur favori" stat={summary.topKillerBuild} />
            </div>
            <div className="top-stats-row">
              <div className="top-stat-card">
                <p>Moyenne Survivant BP</p>
                <b className="top-stat-value is-survivor">{formatBloodpoints(summary.avgBloodpointsSurvivor)}</b>
              </div>
              <div className="top-stat-card">
                <p>Moyenne Globale BP</p>
                <b className="top-stat-value is-global">{formatBloodpoints(summary.avgBloodpointsGlobal)}</b>
              </div>
              <div className="top-stat-card">
                <p>Moyenne Tueur BP</p>
                <b className="top-stat-value is-killer">{formatBloodpoints(summary.avgBloodpointsKiller)}</b>
              </div>
            </div>
          </div>

          <div className="stats-zone">
            <h2>Répartition des Rôles</h2>
            <RoleDistributionBar
              killerMatches={summary.killerMatchCount}
              survivorMatches={summary.survivorMatchCount}
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
            <h2>Performances (Taux de réussite %)</h2>
            <div className="performance-charts-row">
              <PerformanceBarChart
                title="Tueur — Kill Rate"
                labels={performance.labels}
                values={performance.killRate}
                seriesClassName="is-killer"
              />
              <PerformanceBarChart
                title="Survivant — Escape Rate"
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

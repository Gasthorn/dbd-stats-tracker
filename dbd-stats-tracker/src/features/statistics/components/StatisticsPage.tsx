import { useEffect, useMemo } from "react";
import { KILLERS } from "../../../shared/data/characters";
import { KILLER_PERKS, SURVIVOR_PERKS } from "../../../shared/data/perks";
import { useBuildsStore } from "../../builds";
import {
  computeActivityHeatmap,
  computeBuildPerformance,
  computeOpponentPerformance,
  computePerformanceSeries,
  computePerkPerformance,
  computeSummary,
} from "../lib/computeStatistics";
import { useStatisticsStore } from "../stores/statistics.store";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { EntityPerformanceLookup } from "./EntityPerformanceLookup";
import { EntityPerformanceTable } from "./EntityPerformanceTable";
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

  const builds = useBuildsStore((state) => state.builds);
  const buildsStatus = useBuildsStore((state) => state.status);
  const fetchBuilds = useBuildsStore((state) => state.fetchBuilds);

  useEffect(() => {
    fetchAll();
    if (buildsStatus === "idle") fetchBuilds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAll]);

  const summary = useMemo(() => computeSummary(matches), [matches]);
  const heatmapDays = useMemo(
    () => computeActivityHeatmap(matches, viewedMonth, viewedYear),
    [matches, viewedMonth, viewedYear],
  );
  const performance = useMemo(() => computePerformanceSeries(matches), [matches]);
  const opponentStats = useMemo(() => computeOpponentPerformance(matches), [matches]);

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
            <h2>Face aux tueurs</h2>
            <div className="entity-section-row">
              <EntityPerformanceTable
                title="Tueurs les plus affrontés"
                entityColumnLabel="Tueur"
                secondaryColumnLabel="Évasions"
                rateColumnLabel="Taux d'évasion"
                stats={opponentStats}
                seriesClassName="is-survivor"
                iconCategory="Characters"
                emptyMessage="Aucune partie en survivant enregistrée pour le moment."
              />
              <EntityPerformanceLookup
                title="Face à un tueur en particulier"
                selectLabel="Choisir un tueur"
                stats={opponentStats}
                options={KILLERS}
                matchesLabel="Matchs joués"
                secondaryLabel="Évasions"
                rateLabel="Taux d'évasion"
                seriesClassName="is-survivor"
                iconCategory="Characters"
                emptyOptionsMessage="Aucun tueur disponible."
              />
            </div>
          </div>

          <div className="stats-zone stats-zone-wide">
            <h2>Builds</h2>
            <div className="entity-section-row">
              <div className="entity-role-column">
                <h3 className="entity-role-heading is-survivor">Survivant</h3>
                <EntityPerformanceTable
                  title="Builds les plus joués"
                  entityColumnLabel="Build"
                  secondaryColumnLabel="Évasions"
                  rateColumnLabel="Taux d'évasion"
                  stats={survivorBuildStats}
                  seriesClassName="is-survivor"
                  emptyMessage="Aucun build survivant enregistré n'a encore été rejoué."
                />
                <EntityPerformanceLookup
                  title="Build en particulier"
                  selectLabel="Choisir un build"
                  stats={survivorBuildStats}
                  options={survivorBuildNames}
                  matchesLabel="Matchs joués"
                  secondaryLabel="Évasions"
                  rateLabel="Taux d'évasion"
                  seriesClassName="is-survivor"
                  emptyOptionsMessage="Aucun build survivant enregistré."
                />
              </div>
              <div className="entity-role-column">
                <h3 className="entity-role-heading is-killer">Tueur</h3>
                <EntityPerformanceTable
                  title="Builds les plus joués"
                  entityColumnLabel="Build"
                  secondaryColumnLabel="Sacrifices"
                  rateColumnLabel="Taux de kill"
                  stats={killerBuildStats}
                  seriesClassName="is-killer"
                  emptyMessage="Aucun build tueur enregistré n'a encore été rejoué."
                />
                <EntityPerformanceLookup
                  title="Build en particulier"
                  selectLabel="Choisir un build"
                  stats={killerBuildStats}
                  options={killerBuildNames}
                  matchesLabel="Matchs joués"
                  secondaryLabel="Sacrifices"
                  rateLabel="Taux de kill"
                  seriesClassName="is-killer"
                  emptyOptionsMessage="Aucun build tueur enregistré."
                />
              </div>
            </div>
          </div>

          <div className="stats-zone stats-zone-wide">
            <h2>Perks</h2>
            <div className="entity-section-row">
              <div className="entity-role-column">
                <h3 className="entity-role-heading is-survivor">Survivant</h3>
                <EntityPerformanceTable
                  title="Perks les plus joués"
                  entityColumnLabel="Perk"
                  secondaryColumnLabel="Évasions"
                  rateColumnLabel="Taux d'évasion"
                  stats={survivorPerkStats}
                  seriesClassName="is-survivor"
                  iconCategory="Perks"
                  diamondIcon
                  emptyMessage="Aucune partie en survivant enregistrée pour le moment."
                />
                <EntityPerformanceLookup
                  title="Perk en particulier"
                  selectLabel="Choisir un perk"
                  stats={survivorPerkStats}
                  options={SURVIVOR_PERKS.map((perk) => perk.name)}
                  matchesLabel="Matchs joués"
                  secondaryLabel="Évasions"
                  rateLabel="Taux d'évasion"
                  seriesClassName="is-survivor"
                  iconCategory="Perks"
                  emptyOptionsMessage="Aucun perk disponible."
                />
              </div>
              <div className="entity-role-column">
                <h3 className="entity-role-heading is-killer">Tueur</h3>
                <EntityPerformanceTable
                  title="Perks les plus joués"
                  entityColumnLabel="Perk"
                  secondaryColumnLabel="Sacrifices"
                  rateColumnLabel="Taux de kill"
                  stats={killerPerkStats}
                  seriesClassName="is-killer"
                  iconCategory="Perks"
                  diamondIcon
                  emptyMessage="Aucune partie en tueur enregistrée pour le moment."
                />
                <EntityPerformanceLookup
                  title="Perk en particulier"
                  selectLabel="Choisir un perk"
                  stats={killerPerkStats}
                  options={KILLER_PERKS.map((perk) => perk.name)}
                  matchesLabel="Matchs joués"
                  secondaryLabel="Sacrifices"
                  rateLabel="Taux de kill"
                  seriesClassName="is-killer"
                  iconCategory="Perks"
                  emptyOptionsMessage="Aucun perk disponible."
                />
              </div>
            </div>
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

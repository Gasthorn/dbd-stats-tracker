import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getDateLocale, i18n } from "../../../shared/i18n";
import { groupLetter } from "../../../shared/lib/world-cup/groups";
import { KNOCKOUT_ROUND_LABEL_KEYS, KNOCKOUT_ROUND_ORDER } from "../../../shared/lib/world-cup/knockout";
import { computeGroupStandings, rankGroupStandings } from "../../../shared/lib/world-cup/standings";
import { Icon, useGameNames } from "../../settings";
import type { Match } from "../../match-tracker/types/match.types";
import { toStandingsFixture } from "../lib/deriveState";
import { useWorldCupStore } from "../stores/world-cup.store";
import type { WorldCupRunDetail } from "../stores/world-cup.store.types";
import type { WorldCupFixture } from "../types/world-cup.types";

interface WorldCupHistoryModalProps {
  onClose: () => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return i18n.t("worldCup.unknownDate");
  return new Date(iso).toLocaleDateString(getDateLocale(), { day: "2-digit", month: "long", year: "numeric" });
}

function hooksOf(match: Match | undefined): number | null {
  return match && match.role === "killer" ? match.hooks : null;
}

/** Read-only recap of one past, completed World Cup: final group standings, then every knockout round's results. */
function WorldCupHistoryDetail({ detail }: { detail: WorldCupRunDetail }) {
  const { t } = useTranslation();
  const tGameName = useGameNames();
  const finalFixture = detail.fixtures.find((fixture) => fixture.round === "final");
  const champion =
    finalFixture?.winner === "a" ? finalFixture.killerA : finalFixture?.winner === "b" ? finalFixture.killerB : null;
  const qualifiedKillers = new Set(
    detail.fixtures.filter((fixture) => fixture.round === "round_of_32").flatMap((fixture) => [fixture.killerA, fixture.killerB]),
  );
  const knockoutRounds = KNOCKOUT_ROUND_ORDER.filter((round) => detail.fixtures.some((fixture) => fixture.round === round));

  return (
    <>
      {champion && (
        <p className="world-cup-history-champion">
          {t("worldCup.championLabel")} <b>{tGameName(champion)}</b>
        </p>
      )}

      <h4>{t("worldCup.groupsTitle")}</h4>
      <div className="world-cup-groups-grid">
        {detail.groups.map((group) => {
          const groupFixtures = detail.fixtures.filter((fixture) => fixture.groupId === group.id);
          const standingsFixtures = groupFixtures.map((fixture) => toStandingsFixture(fixture, detail.matchesById));
          const standings = rankGroupStandings(computeGroupStandings(group.killers, standingsFixtures), standingsFixtures);
          return (
            <div key={group.id} className="world-cup-group-card">
              <h3>{t("worldCup.groupTitle", { letter: groupLetter(group.groupIndex) })}</h3>
              <table className="world-cup-standings-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t("worldCup.thKiller")}</th>
                    <th>{t("worldCup.thPlayed")}</th>
                    <th>{t("worldCup.thWins")}</th>
                    <th>{t("worldCup.thDraws")}</th>
                    <th>{t("worldCup.thLosses")}</th>
                    <th>{t("worldCup.thHooks")}</th>
                    <th>{t("worldCup.thDiff")}</th>
                    <th>{t("worldCup.thPts")}</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((standing, index) => (
                    <tr key={standing.killer}>
                      <td>{index + 1}</td>
                      <td>
                        <span className="world-cup-standings-killer">
                          <span
                            className={`world-cup-result-dot ${qualifiedKillers.has(standing.killer) ? "is-win" : "is-loss"}`}
                            title={qualifiedKillers.has(standing.killer) ? t("worldCup.qualifiedTooltip") : t("worldCup.eliminatedTooltip")}
                          />
                          <Icon category="Characters" name={standing.killer} alt={standing.killer} size={32} />
                          {tGameName(standing.killer)}
                        </span>
                      </td>
                      <td>{standing.played}</td>
                      <td>{standing.wins}</td>
                      <td>{standing.draws}</td>
                      <td>{standing.losses}</td>
                      <td>
                        {standing.hooksFor} / {standing.hooksAgainst}
                      </td>
                      <td>{standing.hooksFor - standing.hooksAgainst}</td>
                      <td>
                        <b>{standing.points}</b>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {knockoutRounds.map((round) => (
        <div key={round}>
          <h4>{t(KNOCKOUT_ROUND_LABEL_KEYS[round])}</h4>
          <div className="world-cup-fixture-list">
            {detail.fixtures
              .filter((fixture): fixture is WorldCupFixture => fixture.round === round)
              .sort((a, b) => a.slotIndex - b.slotIndex)
              .map((fixture) => {
                const matchA = fixture.killerAMatchId ? detail.matchesById[fixture.killerAMatchId] : undefined;
                const matchB = fixture.killerBMatchId ? detail.matchesById[fixture.killerBMatchId] : undefined;
                return (
                  <div key={fixture.id} className="world-cup-fixture">
                    <div className="world-cup-fixture-matchup">
                      <span className={`world-cup-fixture-side${fixture.winner === "a" ? " is-winner" : ""}`}>
                        <Icon category="Characters" name={fixture.killerA} alt={fixture.killerA} size={40} />
                        <span className="world-cup-fixture-killer-name">{tGameName(fixture.killerA)}</span>
                        <span className="world-cup-fixture-hooks">{t("worldCup.hooksCount", { count: hooksOf(matchA) ?? "-" })}</span>
                      </span>
                      <span className="world-cup-fixture-vs">{fixture.winner === "draw" ? t("worldCup.draw") : "vs"}</span>
                      <span className={`world-cup-fixture-side${fixture.winner === "b" ? " is-winner" : ""}`}>
                        <Icon category="Characters" name={fixture.killerB} alt={fixture.killerB} size={40} />
                        <span className="world-cup-fixture-killer-name">{tGameName(fixture.killerB)}</span>
                        <span className="world-cup-fixture-hooks">{t("worldCup.hooksCount", { count: hooksOf(matchB) ?? "-" })}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </>
  );
}

/** Browse and review every past, completed World Cup: pick one from the list, see its full results. */
export function WorldCupHistoryModal({ onClose }: WorldCupHistoryModalProps) {
  const { t } = useTranslation();
  const historyRuns = useWorldCupStore((state) => state.historyRuns);
  const historyStatus = useWorldCupStore((state) => state.historyStatus);
  const historyError = useWorldCupStore((state) => state.historyError);
  const selected = useWorldCupStore((state) => state.selectedHistoryRun);
  const loadCompletedRuns = useWorldCupStore((state) => state.loadCompletedRuns);
  const loadHistoryRunDetail = useWorldCupStore((state) => state.loadHistoryRunDetail);
  const clearHistoryRunDetail = useWorldCupStore((state) => state.clearHistoryRunDetail);

  useEffect(() => {
    loadCompletedRuns();
  }, [loadCompletedRuns]);

  function handleClose() {
    clearHistoryRunDetail();
    onClose();
  }

  return (
    <div className="world-cup-modal-overlay" onClick={handleClose}>
      <div className="world-cup-modal world-cup-groups-modal" onClick={(event) => event.stopPropagation()}>
        <div className="world-cup-fixture-modal-header">
          {selected && (
            <button type="button" onClick={clearHistoryRunDetail}>
              {t("worldCup.back")}
            </button>
          )}
          <h3>{selected ? t("worldCup.historyItem", { date: formatDate(selected.run.completedAt) }) : t("worldCup.historyTitle")}</h3>
          <button type="button" className="world-cup-killer-modal-close" onClick={handleClose} aria-label={t("common.close")}>
            ✕
          </button>
        </div>

        {historyStatus === "loading" && <LoadingSpinner />}
        {historyError && <p className="match-error">{historyError}</p>}

        {!selected &&
          historyStatus !== "loading" &&
          (historyRuns.length === 0 ? (
            <p className="statistics-empty">{t("worldCup.historyEmpty")}</p>
          ) : (
            <ul className="world-cup-history-list">
              {historyRuns.map((run) => (
                <li key={run.id}>
                  <button type="button" onClick={() => loadHistoryRunDetail(run.id)}>
                    {t("worldCup.historyItem", { date: formatDate(run.completedAt) })}
                  </button>
                </li>
              ))}
            </ul>
          ))}

        {selected && <WorldCupHistoryDetail detail={selected} />}
      </div>
    </div>
  );
}

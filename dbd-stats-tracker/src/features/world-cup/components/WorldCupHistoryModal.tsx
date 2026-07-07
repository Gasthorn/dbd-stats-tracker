import { useEffect } from "react";
import { groupLetter } from "../../../shared/lib/world-cup/groups";
import { KNOCKOUT_ROUND_LABELS, KNOCKOUT_ROUND_ORDER } from "../../../shared/lib/world-cup/knockout";
import { computeGroupStandings, rankGroupStandings } from "../../../shared/lib/world-cup/standings";
import { Icon } from "../../settings";
import type { Match } from "../../match-tracker/types/match.types";
import { toStandingsFixture } from "../lib/deriveState";
import { useWorldCupStore } from "../stores/world-cup.store";
import type { WorldCupRunDetail } from "../stores/world-cup.store.types";
import type { WorldCupFixture } from "../types/world-cup.types";

interface WorldCupHistoryModalProps {
  onClose: () => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return "date inconnue";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function hooksOf(match: Match | undefined): number | null {
  return match && match.role === "killer" ? match.hooks : null;
}

/** Read-only recap of one past, completed World Cup: final group standings, then every knockout round's results. */
function WorldCupHistoryDetail({ detail }: { detail: WorldCupRunDetail }) {
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
          🏆 Champion : <b>{champion}</b>
        </p>
      )}

      <h4>Poules</h4>
      <div className="world-cup-groups-grid">
        {detail.groups.map((group) => {
          const groupFixtures = detail.fixtures.filter((fixture) => fixture.groupId === group.id);
          const standingsFixtures = groupFixtures.map((fixture) => toStandingsFixture(fixture, detail.matchesById));
          const standings = rankGroupStandings(computeGroupStandings(group.killers, standingsFixtures), standingsFixtures);
          return (
            <div key={group.id} className="world-cup-group-card">
              <h3>Poule {groupLetter(group.groupIndex)}</h3>
              <table className="world-cup-standings-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Tueur</th>
                    <th>J</th>
                    <th>V</th>
                    <th>N</th>
                    <th>D</th>
                    <th>Crochets +/-</th>
                    <th>Diff</th>
                    <th>Pts</th>
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
                            title={qualifiedKillers.has(standing.killer) ? "Qualifié pour les seizièmes de finale" : "Éliminé en poule"}
                          />
                          <Icon category="Characters" name={standing.killer} alt={standing.killer} size={32} />
                          {standing.killer}
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
          <h4>{KNOCKOUT_ROUND_LABELS[round]}</h4>
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
                        <span className="world-cup-fixture-killer-name">{fixture.killerA}</span>
                        <span className="world-cup-fixture-hooks">{hooksOf(matchA) ?? "-"} crochets</span>
                      </span>
                      <span className="world-cup-fixture-vs">{fixture.winner === "draw" ? "Égalité" : "vs"}</span>
                      <span className={`world-cup-fixture-side${fixture.winner === "b" ? " is-winner" : ""}`}>
                        <Icon category="Characters" name={fixture.killerB} alt={fixture.killerB} size={40} />
                        <span className="world-cup-fixture-killer-name">{fixture.killerB}</span>
                        <span className="world-cup-fixture-hooks">{hooksOf(matchB) ?? "-"} crochets</span>
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
              ← Retour
            </button>
          )}
          <h3>{selected ? `World Cup du ${formatDate(selected.run.completedAt)}` : "Anciens World Cup"}</h3>
          <button type="button" className="world-cup-killer-modal-close" onClick={handleClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        {historyStatus === "loading" && <p>Chargement...</p>}
        {historyError && <p className="match-error">{historyError}</p>}

        {!selected &&
          historyStatus !== "loading" &&
          (historyRuns.length === 0 ? (
            <p className="statistics-empty">Aucun World Cup terminé pour le moment.</p>
          ) : (
            <ul className="world-cup-history-list">
              {historyRuns.map((run) => (
                <li key={run.id}>
                  <button type="button" onClick={() => loadHistoryRunDetail(run.id)}>
                    World Cup du {formatDate(run.completedAt)}
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

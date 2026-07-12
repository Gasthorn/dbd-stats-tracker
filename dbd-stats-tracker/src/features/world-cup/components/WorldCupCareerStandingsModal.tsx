import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useEffect, useState } from "react";
import { Icon } from "../../settings";
import { useWorldCupStore } from "../stores/world-cup.store";
import { WorldCupKillerHistoryModal } from "./WorldCupKillerHistoryModal";

interface WorldCupCareerStandingsModalProps {
  onClose: () => void;
}

/** Every killer's cumulative record across every match (group and knockout) from every World Cup ever played - available any time, even before starting a new one. */
export function WorldCupCareerStandingsModal({ onClose }: WorldCupCareerStandingsModalProps) {
  const careerStandings = useWorldCupStore((state) => state.careerStandings);
  const careerFixtures = useWorldCupStore((state) => state.careerFixtures);
  const careerMatchesById = useWorldCupStore((state) => state.careerMatchesById);
  const careerGroups = useWorldCupStore((state) => state.careerGroups);
  const careerStatus = useWorldCupStore((state) => state.careerStatus);
  const careerError = useWorldCupStore((state) => state.careerError);
  const loadCareerStandings = useWorldCupStore((state) => state.loadCareerStandings);
  const [selectedKiller, setSelectedKiller] = useState<string | null>(null);

  useEffect(() => {
    loadCareerStandings();
  }, [loadCareerStandings]);

  return (
    <div className="world-cup-modal-overlay" onClick={onClose}>
      <div className="world-cup-modal world-cup-groups-modal" onClick={(event) => event.stopPropagation()}>
        <div className="world-cup-fixture-modal-header">
          <h3>Classement général</h3>
          <button type="button" className="world-cup-killer-modal-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        <p className="world-cup-seeding-hint">
          Cumul de tous les matchs (poules et phases finales) de tous les World Cup joués.
        </p>

        {careerStatus === "loading" && <LoadingSpinner />}
        {careerError && <p className="match-error">{careerError}</p>}

        {careerStatus !== "loading" && careerStandings.length === 0 && (
          <p className="statistics-empty">Aucun match de World Cup enregistré pour le moment.</p>
        )}

        {careerStandings.length > 0 && (
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
              {careerStandings.map((standing, index) => (
                <tr key={standing.killer}>
                  <td>{index + 1}</td>
                  <td>
                    <button
                      type="button"
                      className="world-cup-standings-killer"
                      onClick={() => setSelectedKiller(standing.killer)}
                    >
                      <Icon category="Characters" name={standing.killer} alt={standing.killer} size={32} />
                      {standing.killer}
                    </button>
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
        )}
      </div>

      {selectedKiller && (
        <WorldCupKillerHistoryModal
          killerName={selectedKiller}
          fixtures={careerFixtures}
          matchesById={careerMatchesById}
          groups={careerGroups}
          onClose={() => setSelectedKiller(null)}
        />
      )}
    </div>
  );
}

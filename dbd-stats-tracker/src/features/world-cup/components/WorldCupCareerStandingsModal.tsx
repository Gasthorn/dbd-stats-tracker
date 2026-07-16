import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, useGameNames } from "../../settings";
import { useWorldCupStore } from "../stores/world-cup.store";
import { WorldCupKillerHistoryModal } from "./WorldCupKillerHistoryModal";

interface WorldCupCareerStandingsModalProps {
  onClose: () => void;
}

/** Every killer's cumulative record across every match (group and knockout) from every World Cup ever played - available any time, even before starting a new one. */
export function WorldCupCareerStandingsModal({ onClose }: WorldCupCareerStandingsModalProps) {
  const { t } = useTranslation();
  const tGameName = useGameNames();
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
          <h3>{t("worldCup.careerTitle")}</h3>
          <button type="button" className="world-cup-killer-modal-close" onClick={onClose} aria-label={t("common.close")}>
            ✕
          </button>
        </div>

        <p className="world-cup-seeding-hint">{t("worldCup.careerHint")}</p>

        {careerStatus === "loading" && <LoadingSpinner />}
        {careerError && <p className="match-error">{careerError}</p>}

        {careerStatus !== "loading" && careerStandings.length === 0 && (
          <p className="statistics-empty">{t("worldCup.careerEmpty")}</p>
        )}

        {careerStandings.length > 0 && (
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
                      {tGameName(standing.killer)}
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

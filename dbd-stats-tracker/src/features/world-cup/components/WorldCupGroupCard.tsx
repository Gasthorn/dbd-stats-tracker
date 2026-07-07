import { useMemo, useState } from "react";
import { groupLetter } from "../../../shared/lib/world-cup/groups";
import { computeGroupStandings, rankGroupStandings } from "../../../shared/lib/world-cup/standings";
import { Icon } from "../../settings";
import type { Match } from "../../match-tracker/types/match.types";
import { useWorldCupStore } from "../stores/world-cup.store";
import { toStandingsFixture } from "../lib/deriveState";
import type { WorldCupFixture, WorldCupGroup } from "../types/world-cup.types";
import { WorldCupKillerHistoryModal } from "./WorldCupKillerHistoryModal";

interface WorldCupGroupCardProps {
  group: WorldCupGroup;
  fixtures: WorldCupFixture[];
  matchesById: Record<string, Match>;
  isCurrent: boolean;
  defaultOpen?: boolean;
}

/** Read-only standings for one group; match recording happens in the current matchday panel. */
export function WorldCupGroupCard({ group, fixtures, matchesById, isCurrent, defaultOpen = false }: WorldCupGroupCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [selectedKiller, setSelectedKiller] = useState<string | null>(null);
  const allFixtures = useWorldCupStore((state) => state.fixtures);
  const allMatchesById = useWorldCupStore((state) => state.matchesById);
  const allGroups = useWorldCupStore((state) => state.groups);

  const standingsFixtures = useMemo(
    () => fixtures.map((fixture) => toStandingsFixture(fixture, matchesById)),
    [fixtures, matchesById],
  );
  const standings = useMemo(
    () => rankGroupStandings(computeGroupStandings(group.killers, standingsFixtures), standingsFixtures),
    [group.killers, standingsFixtures],
  );
  const playedCount = standingsFixtures.filter((f) => f.hooksA !== null && f.hooksB !== null).length;

  return (
    <div className={`world-cup-group-card${isCurrent ? " is-current" : ""}`}>
      <button type="button" className="world-cup-group-header" onClick={() => setIsOpen((prev) => !prev)}>
        <h3>Poule {groupLetter(group.groupIndex)}</h3>
        <span className="world-cup-group-progress">
          {playedCount} / {fixtures.length} matchs
        </span>
        <span className="world-cup-group-toggle">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
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

      {selectedKiller && (
        <WorldCupKillerHistoryModal
          killerName={selectedKiller}
          fixtures={allFixtures}
          matchesById={allMatchesById}
          groups={allGroups}
          onClose={() => setSelectedKiller(null)}
        />
      )}
    </div>
  );
}

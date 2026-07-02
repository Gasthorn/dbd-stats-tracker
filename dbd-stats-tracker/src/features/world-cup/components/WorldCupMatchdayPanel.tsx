import type { Match } from "../../match-tracker/types/match.types";
import type { WorldCupMatchInput } from "../stores/world-cup.store.types";
import type { GroupStageBatch } from "../lib/matchday";
import { WorldCupFixtureRow } from "./WorldCupFixtureRow";

const GROUP_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

interface WorldCupMatchdayPanelProps {
  batch: GroupStageBatch;
  matchesById: Record<string, Match>;
  playedCount: number;
  totalCount: number;
  onRecordSide: (fixtureId: string, side: "a" | "b", input: WorldCupMatchInput) => Promise<void>;
}

export function WorldCupMatchdayPanel({
  batch,
  matchesById,
  playedCount,
  totalCount,
  onRecordSide,
}: WorldCupMatchdayPanelProps) {
  const groupLabel = GROUP_LETTERS[batch.group.groupIndex] ?? batch.group.groupIndex + 1;

  return (
    <div className="stats-zone world-cup-matchday-panel">
      <div className="world-cup-matchday-header">
        <h2>
          Journée {batch.matchday} / {batch.totalMatchdays} — Poule {groupLabel}
        </h2>
        <span className="world-cup-matchday-progress">
          {playedCount} / {totalCount} matchs joués au total
        </span>
      </div>

      <div className="world-cup-fixture-list">
        {batch.fixtures.map((fixture) => (
          <WorldCupFixtureRow
            key={fixture.id}
            fixture={fixture}
            matchesById={matchesById}
            onRecordSide={(side, input) => onRecordSide(fixture.id, side, input)}
            onManualTiebreak={() => {}}
          />
        ))}
      </div>
    </div>
  );
}

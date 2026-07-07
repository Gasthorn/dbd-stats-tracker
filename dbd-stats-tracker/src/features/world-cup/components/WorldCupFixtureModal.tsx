import { KNOCKOUT_ROUND_LABELS, type KnockoutRound } from "../../../shared/lib/world-cup/knockout";
import type { Match } from "../../match-tracker/types/match.types";
import type { WorldCupFixture } from "../types/world-cup.types";
import type { WorldCupMatchInput } from "../stores/world-cup.store.types";
import { WorldCupFixtureRow } from "./WorldCupFixtureRow";

interface WorldCupFixtureModalProps {
  fixture: WorldCupFixture;
  matchesById: Record<string, Match>;
  onRecordSide: (side: "a" | "b", input: WorldCupMatchInput) => Promise<void>;
  onManualTiebreak: (side: "a" | "b") => void;
  onClose: () => void;
}

export function WorldCupFixtureModal({ fixture, matchesById, onRecordSide, onManualTiebreak, onClose }: WorldCupFixtureModalProps) {
  const roundLabel = fixture.round === "group" ? "Poule" : KNOCKOUT_ROUND_LABELS[fixture.round as KnockoutRound];

  return (
    <div className="world-cup-modal-overlay" onClick={onClose}>
      <div className="world-cup-modal world-cup-fixture-modal" onClick={(event) => event.stopPropagation()}>
        <div className="world-cup-fixture-modal-header">
          <h3>{roundLabel}</h3>
          <button type="button" className="world-cup-killer-modal-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        <WorldCupFixtureRow
          fixture={fixture}
          matchesById={matchesById}
          onRecordSide={onRecordSide}
          onManualTiebreak={onManualTiebreak}
        />
      </div>
    </div>
  );
}

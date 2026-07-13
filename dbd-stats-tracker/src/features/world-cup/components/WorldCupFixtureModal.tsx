import { KNOCKOUT_ROUND_LABEL_KEYS, type KnockoutRound } from "../../../shared/lib/world-cup/knockout";
import type { Match } from "../../match-tracker/types/match.types";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const roundLabel = fixture.round === "group" ? t("worldCup.roundGroup") : t(KNOCKOUT_ROUND_LABEL_KEYS[fixture.round as KnockoutRound]);

  return (
    <div className="world-cup-modal-overlay" onClick={onClose}>
      <div className="world-cup-modal world-cup-fixture-modal" onClick={(event) => event.stopPropagation()}>
        <div className="world-cup-fixture-modal-header">
          <h3>{roundLabel}</h3>
          <button type="button" className="world-cup-killer-modal-close" onClick={onClose} aria-label={t("common.close")}>
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

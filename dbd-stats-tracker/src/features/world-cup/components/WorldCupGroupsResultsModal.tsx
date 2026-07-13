import type { Match } from "../../match-tracker/types/match.types";
import { useTranslation } from "react-i18next";
import type { WorldCupFixture, WorldCupGroup } from "../types/world-cup.types";
import { WorldCupGroupCard } from "./WorldCupGroupCard";

interface WorldCupGroupsResultsModalProps {
  groupFixtures: { group: WorldCupGroup; fixtures: WorldCupFixture[] }[];
  matchesById: Record<string, Match>;
  qualifiedKillers?: Set<string> | null;
  onClose: () => void;
}

/** Read-only recap of every group's final standings - handy once in the knockout bracket, e.g. to break a perfect tie by checking group-stage form. */
export function WorldCupGroupsResultsModal({
  groupFixtures,
  matchesById,
  qualifiedKillers = null,
  onClose,
}: WorldCupGroupsResultsModalProps) {
  const { t } = useTranslation();
  return (
    <div className="world-cup-modal-overlay" onClick={onClose}>
      <div className="world-cup-modal world-cup-groups-modal" onClick={(event) => event.stopPropagation()}>
        <div className="world-cup-fixture-modal-header">
          <h3>{t("worldCup.groupsResultsTitle")}</h3>
          <button type="button" className="world-cup-killer-modal-close" onClick={onClose} aria-label={t("common.close")}>
            ✕
          </button>
        </div>

        <div className="world-cup-groups-grid">
          {groupFixtures.map(({ group, fixtures }) => (
            <WorldCupGroupCard
              key={group.id}
              group={group}
              fixtures={fixtures}
              matchesById={matchesById}
              isCurrent={false}
              defaultOpen
              qualifiedKillers={qualifiedKillers}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { isGroupComplete } from "../../../shared/lib/world-cup/standings";
import { useCharactersStore } from "../../characters/stores/characters.store";
import {
  AUTO_QUALIFIERS_PER_GROUP,
  computeGroupQualification,
  KNOCKOUT_FIELD_SIZE,
  toStandingsFixture,
} from "../lib/deriveState";
import { getCurrentGroupStageBatch } from "../lib/matchday";
import { useWorldCupStore } from "../stores/world-cup.store";
import { WorldCupBracket } from "./WorldCupBracket";
import { WorldCupCareerStandingsModal } from "./WorldCupCareerStandingsModal";
import { WorldCupGroupCard } from "./WorldCupGroupCard";
import { WorldCupGroupsResultsModal } from "./WorldCupGroupsResultsModal";
import { WorldCupHistoryModal } from "./WorldCupHistoryModal";
import { WorldCupMatchdayPanel } from "./WorldCupMatchdayPanel";
import { WorldCupSeedingSetup } from "./WorldCupSeedingSetup";
import "./world-cup.css";

export function WorldCupPage() {
  const { t } = useTranslation();
  const charactersStatus = useCharactersStore((state) => state.status);
  const fetchCharacters = useCharactersStore((state) => state.fetch);
  const unlockedKillers = useCharactersStore((state) => state.unlockedKillers);

  const run = useWorldCupStore((state) => state.run);
  const groups = useWorldCupStore((state) => state.groups);
  const fixtures = useWorldCupStore((state) => state.fixtures);
  const matchesById = useWorldCupStore((state) => state.matchesById);
  const hasHistory = useWorldCupStore((state) => state.hasHistory);
  const status = useWorldCupStore((state) => state.status);
  const error = useWorldCupStore((state) => state.error);
  const initialize = useWorldCupStore((state) => state.initialize);
  const startRun = useWorldCupStore((state) => state.startRun);
  const recordFixtureMatch = useWorldCupStore((state) => state.recordFixtureMatch);
  const resolveManualTiebreak = useWorldCupStore((state) => state.resolveManualTiebreak);
  const advanceToKnockout = useWorldCupStore((state) => state.advanceToKnockout);
  const advanceKnockoutRound = useWorldCupStore((state) => state.advanceKnockoutRound);
  const resetActiveRun = useWorldCupStore((state) => state.resetActiveRun);

  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    if (charactersStatus === "idle") fetchCharacters();
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once every fixture of the current knockout round is resolved, move on automatically - no manual "next round" click.
  useEffect(() => {
    if (!run || run.status !== "knockout" || !run.currentRound || status === "loading") return;
    const currentRoundFixtures = fixtures.filter((f) => f.round === run.currentRound);
    const allResolved = currentRoundFixtures.length > 0 && currentRoundFixtures.every((f) => f.winner !== null);
    if (allResolved) advanceKnockoutRound();
  }, [run, fixtures, status, advanceKnockoutRound]);

  const groupFixtures = useMemo(
    () => groups.map((group) => ({ group, fixtures: fixtures.filter((f) => f.groupId === group.id) })),
    [groups, fixtures],
  );
  const allGroupsComplete = useMemo(
    () =>
      groupFixtures.length > 0 &&
      groupFixtures.every(({ group, fixtures: groupFxs }) =>
        isGroupComplete(
          group.killers,
          groupFxs.map((fixture) => toStandingsFixture(fixture, matchesById)),
        ),
      ),
    [groupFixtures, matchesById],
  );
  const qualifiedKillers = useMemo(() => {
    if (!allGroupsComplete) return null;
    const groupsWithStandingsFixtures = groupFixtures.map(({ group, fixtures: groupFxs }) => ({
      groupIndex: group.groupIndex,
      killers: group.killers,
      fixtures: groupFxs.map((fixture) => toStandingsFixture(fixture, matchesById)),
    }));
    return computeGroupQualification(groupsWithStandingsFixtures, AUTO_QUALIFIERS_PER_GROUP, KNOCKOUT_FIELD_SIZE)
      .qualifiedKillers;
  }, [allGroupsComplete, groupFixtures, matchesById]);
  const currentBatch = useMemo(() => getCurrentGroupStageBatch(groups, fixtures), [groups, fixtures]);
  const groupFixtureCount = fixtures.filter((f) => f.round === "group").length;
  const groupPlayedCount = fixtures.filter((f) => f.round === "group" && f.winner !== null).length;

  const finalFixture = fixtures.find((f) => f.round === "final");
  const championName =
    run?.status === "completed" && finalFixture
      ? finalFixture.winner === "a"
        ? finalFixture.killerA
        : finalFixture.winner === "b"
          ? finalFixture.killerB
          : null
      : null;

  async function handleReset() {
    if (
      !confirm(
        t("worldCup.abandonConfirm"),
      )
    ) {
      return;
    }
    await resetActiveRun();
  }

  return (
    <div className="world-cup-page">
      <div className="world-cup-header">
        <button type="button" onClick={() => setShowCareerModal(true)}>
          {t("worldCup.viewCareerStandings")}
        </button>
        {run && (run.status === "knockout" || run.status === "completed") && (
          <button type="button" onClick={() => setShowGroupsModal(true)}>
            {t("worldCup.viewGroupResults")}
          </button>
        )}
        {hasHistory && (
          <button type="button" onClick={() => setShowHistoryModal(true)}>
            {t("worldCup.viewPastWorldCups")}
          </button>
        )}
        {run && run.status !== "completed" && (
          <button type="button" className="btn-danger" onClick={handleReset}>
            {t("worldCup.abandon")}
          </button>
        )}
      </div>

      <h1>{t("worldCup.title")}</h1>

      {error && <p className="match-error">{error}</p>}
      {status === "loading" && !run && <LoadingSpinner />}

      {!run &&
        status !== "loading" &&
        (hasHistory ? (
          <div className="stats-zone">
            <p>{t("worldCup.previousCompleted")}</p>
            <button type="button" onClick={() => startRun()}>
              {t("worldCup.startNewDraw")}
            </button>
          </div>
        ) : (
          <WorldCupSeedingSetup
            eligibleKillers={unlockedKillers}
            onStart={startRun}
            isSubmitting={false}
            error={error}
          />
        ))}

      {run && run.status === "group_stage" && (
        <>
          {currentBatch ? (
            <WorldCupMatchdayPanel
              batch={currentBatch}
              matchesById={matchesById}
              playedCount={groupPlayedCount}
              totalCount={groupFixtureCount}
              onRecordSide={(fixtureId, side, input) => recordFixtureMatch(fixtureId, side, input)}
            />
          ) : (
            <p className="world-cup-matchday-progress">{t("worldCup.groupStageDone")}</p>
          )}

          <div className="world-cup-groups-grid">
            {groupFixtures.map(({ group, fixtures: groupFxs }, index) => (
              <WorldCupGroupCard
                key={group.id}
                group={group}
                fixtures={groupFxs}
                matchesById={matchesById}
                isCurrent={currentBatch?.group.id === group.id}
                defaultOpen={index === 0}
                qualifiedKillers={qualifiedKillers}
              />
            ))}
          </div>

          <button type="button" onClick={advanceToKnockout} disabled={!allGroupsComplete || status === "loading"}>
            {allGroupsComplete ? t("worldCup.launchKnockout") : t("worldCup.finishGroupsFirst")}
          </button>
        </>
      )}

      {run && (run.status === "knockout" || run.status === "completed") && (
        <WorldCupBracket
          fixtures={fixtures.filter((f) => f.round !== "group")}
          matchesById={matchesById}
          currentRound={run.currentRound}
          champion={championName}
          isAdvancing={status === "loading"}
          onRecordSide={(fixtureId, side, input) => recordFixtureMatch(fixtureId, side, input)}
          onManualTiebreak={(fixtureId, side) => resolveManualTiebreak(fixtureId, side)}
        />
      )}

      {run && run.status === "completed" && (
        <button type="button" onClick={() => startRun()} disabled={status === "loading"}>
          {t("worldCup.newWorldCup")}
        </button>
      )}

      {showGroupsModal && (
        <WorldCupGroupsResultsModal
          groupFixtures={groupFixtures}
          matchesById={matchesById}
          qualifiedKillers={qualifiedKillers}
          onClose={() => setShowGroupsModal(false)}
        />
      )}

      {showCareerModal && <WorldCupCareerStandingsModal onClose={() => setShowCareerModal(false)} />}

      {showHistoryModal && <WorldCupHistoryModal onClose={() => setShowHistoryModal(false)} />}
    </div>
  );
}

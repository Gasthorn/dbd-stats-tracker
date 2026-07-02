import { useEffect, useMemo } from "react";
import { isGroupComplete } from "../../../shared/lib/world-cup/standings";
import { useCharactersStore } from "../../characters/stores/characters.store";
import { toStandingsFixture } from "../lib/deriveState";
import { getCurrentGroupStageBatch } from "../lib/matchday";
import { useWorldCupStore } from "../stores/world-cup.store";
import { WorldCupBracket } from "./WorldCupBracket";
import { WorldCupGroupCard } from "./WorldCupGroupCard";
import { WorldCupMatchdayPanel } from "./WorldCupMatchdayPanel";
import { WorldCupSeedingSetup } from "./WorldCupSeedingSetup";
import "./world-cup.css";

export function WorldCupPage() {
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

  useEffect(() => {
    if (charactersStatus === "idle") fetchCharacters();
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        "Voulez-vous abandonner ce World Cup en cours ? Les parties déjà enregistrées resteront dans l'historique.",
      )
    ) {
      return;
    }
    await resetActiveRun();
  }

  return (
    <div className="world-cup-page">
      <div className="world-cup-header">
        {run && run.status !== "completed" && (
          <button type="button" onClick={handleReset}>
            Abandonner ce World Cup
          </button>
        )}
      </div>

      <h1>World Cup des Tueurs</h1>

      {error && <p className="match-error">{error}</p>}
      {status === "loading" && !run && <p>Chargement...</p>}

      {!run &&
        status !== "loading" &&
        (hasHistory ? (
          <div className="stats-zone">
            <p>
              Un précédent World Cup a été terminé : le tirage des poules sera automatiquement basé sur son
              classement final (chapeaux ajustés selon les résultats).
            </p>
            <button type="button" onClick={() => startRun()}>
              Lancer le tirage du nouveau World Cup
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
            <p className="world-cup-matchday-progress">Phase de poules terminée !</p>
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
              />
            ))}
          </div>

          <button type="button" onClick={advanceToKnockout} disabled={!allGroupsComplete || status === "loading"}>
            {allGroupsComplete
              ? "Lancer la phase à élimination directe (Top 32)"
              : "Terminez toutes les poules pour lancer la phase finale"}
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
          onAdvanceRound={advanceKnockoutRound}
        />
      )}

      {run && run.status === "completed" && (
        <button type="button" onClick={() => startRun()} disabled={status === "loading"}>
          Nouveau World Cup
        </button>
      )}
    </div>
  );
}

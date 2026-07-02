import { KNOCKOUT_ROUND_LABELS, KNOCKOUT_ROUND_ORDER, type KnockoutRound } from "../../../shared/lib/world-cup/knockout";
import { Icon } from "../../settings";
import type { Match } from "../../match-tracker/types/match.types";
import type { WorldCupFixture } from "../types/world-cup.types";
import type { WorldCupMatchInput } from "../stores/world-cup.store.types";
import { WorldCupFixtureRow } from "./WorldCupFixtureRow";

interface WorldCupBracketProps {
  fixtures: WorldCupFixture[];
  matchesById: Record<string, Match>;
  currentRound: KnockoutRound | null;
  champion: string | null;
  isAdvancing: boolean;
  onRecordSide: (fixtureId: string, side: "a" | "b", input: WorldCupMatchInput) => Promise<void>;
  onManualTiebreak: (fixtureId: string, side: "a" | "b") => void;
  onAdvanceRound: () => void;
}

export function WorldCupBracket({
  fixtures,
  matchesById,
  currentRound,
  champion,
  isAdvancing,
  onRecordSide,
  onManualTiebreak,
  onAdvanceRound,
}: WorldCupBracketProps) {
  if (champion) {
    return (
      <div className="world-cup-champion">
        <Icon category="Characters" name={champion} alt={champion} size={170} />
        <h2>{champion}</h2>
        <p>Champion du World Cup !</p>
      </div>
    );
  }

  const roundsPlayed = KNOCKOUT_ROUND_ORDER.filter((round) => fixtures.some((f) => f.round === round));
  const currentFixtures = currentRound ? fixtures.filter((f) => f.round === currentRound) : [];
  const allResolved = currentFixtures.length > 0 && currentFixtures.every((f) => f.winner !== null);

  return (
    <div className="world-cup-bracket">
      <div className="world-cup-bracket-rounds-nav">
        {roundsPlayed.map((round) => (
          <span key={round} className={round === currentRound ? "is-current" : "is-past"}>
            {KNOCKOUT_ROUND_LABELS[round]}
          </span>
        ))}
      </div>

      {currentRound && (
        <>
          <h3>{KNOCKOUT_ROUND_LABELS[currentRound]}</h3>
          <div className="world-cup-fixture-list">
            {currentFixtures.map((fixture) => (
              <WorldCupFixtureRow
                key={fixture.id}
                fixture={fixture}
                matchesById={matchesById}
                onRecordSide={(side, input) => onRecordSide(fixture.id, side, input)}
                onManualTiebreak={(side) => onManualTiebreak(fixture.id, side)}
              />
            ))}
          </div>

          <button type="button" onClick={onAdvanceRound} disabled={!allResolved || isAdvancing}>
            {isAdvancing
              ? "Un instant..."
              : currentRound === "final"
                ? "Désigner le champion"
                : `Passer au tour suivant (${KNOCKOUT_ROUND_LABELS[
                    KNOCKOUT_ROUND_ORDER[KNOCKOUT_ROUND_ORDER.indexOf(currentRound) + 1]
                  ]})`}
          </button>
        </>
      )}
    </div>
  );
}

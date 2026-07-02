import { useState } from "react";
import { Icon } from "../../settings";
import type { Match } from "../../match-tracker/types/match.types";
import type { WorldCupFixture } from "../types/world-cup.types";
import type { WorldCupMatchInput } from "../stores/world-cup.store.types";
import { WorldCupFixtureMatchForm } from "./WorldCupFixtureMatchForm";

interface WorldCupFixtureRowProps {
  fixture: WorldCupFixture;
  matchesById: Record<string, Match>;
  onRecordSide: (side: "a" | "b", input: WorldCupMatchInput) => Promise<void>;
  onManualTiebreak: (side: "a" | "b") => void;
}

function hooksOf(match: Match | undefined): number | null {
  if (!match || match.role !== "killer") return null;
  return match.hooks;
}

export function WorldCupFixtureRow({ fixture, matchesById, onRecordSide, onManualTiebreak }: WorldCupFixtureRowProps) {
  const [recordingSide, setRecordingSide] = useState<"a" | "b" | null>(null);

  const matchA = fixture.killerAMatchId ? matchesById[fixture.killerAMatchId] : undefined;
  const matchB = fixture.killerBMatchId ? matchesById[fixture.killerBMatchId] : undefined;
  const hooksA = hooksOf(matchA);
  const hooksB = hooksOf(matchB);

  const needsManualTiebreak =
    fixture.round !== "group" && Boolean(fixture.killerAMatchId) && Boolean(fixture.killerBMatchId) && !fixture.winner;

  async function handleSubmit(side: "a" | "b", input: WorldCupMatchInput) {
    await onRecordSide(side, input);
    setRecordingSide(null);
  }

  function renderSide(side: "a" | "b") {
    const killerName = side === "a" ? fixture.killerA : fixture.killerB;
    const hooks = side === "a" ? hooksA : hooksB;
    const hasPlayed = hooks !== null;
    const isWinner = fixture.winner === side;

    return (
      <div className={`world-cup-fixture-side${isWinner ? " is-winner" : ""}`}>
        <Icon category="Characters" name={killerName} alt={killerName} size={56} />
        <span className="world-cup-fixture-killer-name">{killerName}</span>
        {hasPlayed ? (
          <span className="world-cup-fixture-hooks">{hooks} crochets</span>
        ) : (
          <button type="button" onClick={() => setRecordingSide(side)} disabled={recordingSide !== null}>
            Enregistrer
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="world-cup-fixture">
      <div className="world-cup-fixture-matchup">
        {renderSide("a")}
        <span className="world-cup-fixture-vs">
          {fixture.winner === "draw" ? "Égalité" : "vs"}
        </span>
        {renderSide("b")}
      </div>

      {needsManualTiebreak && (
        <div className="world-cup-fixture-tiebreak">
          <p>Égalité totale (crochets, sacrifices et points de sang) : désignez le vainqueur.</p>
          <button type="button" onClick={() => onManualTiebreak("a")}>
            {fixture.killerA} gagne
          </button>
          <button type="button" onClick={() => onManualTiebreak("b")}>
            {fixture.killerB} gagne
          </button>
        </div>
      )}

      {recordingSide && (
        <WorldCupFixtureMatchForm
          characterName={recordingSide === "a" ? fixture.killerA : fixture.killerB}
          onSubmit={(input) => handleSubmit(recordingSide, input)}
          onCancel={() => setRecordingSide(null)}
        />
      )}
    </div>
  );
}

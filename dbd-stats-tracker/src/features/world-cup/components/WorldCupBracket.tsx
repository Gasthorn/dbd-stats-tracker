import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KNOCKOUT_ROUND_LABEL_KEYS, KNOCKOUT_ROUND_ORDER, type KnockoutRound } from "../../../shared/lib/world-cup/knockout";
import { Icon, useGameNames } from "../../settings";
import type { Match } from "../../match-tracker/types/match.types";
import type { WorldCupFixture } from "../types/world-cup.types";
import type { WorldCupMatchInput } from "../stores/world-cup.store.types";
import { WorldCupFixtureModal } from "./WorldCupFixtureModal";

interface WorldCupBracketProps {
  fixtures: WorldCupFixture[];
  matchesById: Record<string, Match>;
  currentRound: KnockoutRound | null;
  champion: string | null;
  isAdvancing: boolean;
  onRecordSide: (fixtureId: string, side: "a" | "b", input: WorldCupMatchInput) => Promise<void>;
  onManualTiebreak: (fixtureId: string, side: "a" | "b") => void;
}

/** Fixed knockout field size (32), so every round's match count is known upfront even before that round's fixtures exist. */
const ROUND_SIZES: Record<KnockoutRound, number> = {
  round_of_32: 16,
  round_of_16: 8,
  quarterfinal: 4,
  semifinal: 2,
  final: 1,
};

const ROUNDS_BEFORE_FINAL = KNOCKOUT_ROUND_ORDER.filter((round) => round !== "final");

type BracketSlot = {
  key: string;
  fixture: WorldCupFixture | null;
  /** For a not-yet-drawn slot, the killer(s) already known to be advancing into it (from resolved earlier fixtures). */
  projectedA?: string | null;
  projectedB?: string | null;
};

function winnerOf(fixture: WorldCupFixture | null): string | null {
  if (!fixture || fixture.winner === null || fixture.winner === "draw") return null;
  return fixture.winner === "a" ? fixture.killerA : fixture.killerB;
}

/**
 * Real fixtures once the round has been drawn. Otherwise, a "?" placeholder per slot - unless one
 * or both of its feeder matches (adjacent slots in the previous round) are already resolved, in
 * which case that winner's icon shows early as "advancing" even though the fixture itself won't
 * be created until the whole previous round is done.
 */
function roundSlots(round: KnockoutRound, fixtures: readonly WorldCupFixture[]): BracketSlot[] {
  const roundFixtures = fixtures.filter((f) => f.round === round).sort((a, b) => a.slotIndex - b.slotIndex);
  if (roundFixtures.length > 0) {
    return roundFixtures.map((fixture) => ({ key: fixture.id, fixture }));
  }

  const roundIndex = KNOCKOUT_ROUND_ORDER.indexOf(round);
  const previousRound = roundIndex > 0 ? KNOCKOUT_ROUND_ORDER[roundIndex - 1] : null;
  const previousSlots = previousRound ? roundSlots(previousRound, fixtures) : [];

  return Array.from({ length: ROUND_SIZES[round] }, (_, i) => ({
    key: `${round}-${i}`,
    fixture: null,
    projectedA: winnerOf(previousSlots[2 * i]?.fixture ?? null),
    projectedB: winnerOf(previousSlots[2 * i + 1]?.fixture ?? null),
  }));
}

/** Bracket slots halve at every round (adjacent slots merge), so the first/second half of a sorted round's slots stay on the same side of the tree all the way to the final. */
function splitHalves<T>(slots: T[]): { left: T[]; right: T[] } {
  const half = Math.ceil(slots.length / 2);
  return { left: slots.slice(0, half), right: slots.slice(half) };
}

function hooksOf(match: Match | undefined): number | null {
  return match && match.role === "killer" ? match.hooks : null;
}

interface BracketPlaceholderCardProps {
  projectedA?: string | null;
  projectedB?: string | null;
}

function BracketPlaceholderCard({ projectedA, projectedB }: BracketPlaceholderCardProps) {
  return (
    <div className="bracket-match-card is-placeholder">
      <span className="bracket-match-side">
        {projectedA ? (
          <Icon category="Characters" name={projectedA} alt={projectedA} size={40} />
        ) : (
          <span className="bracket-match-placeholder-icon">?</span>
        )}
      </span>
      <span className="bracket-match-side">
        {projectedB ? (
          <Icon category="Characters" name={projectedB} alt={projectedB} size={40} />
        ) : (
          <span className="bracket-match-placeholder-icon">?</span>
        )}
      </span>
    </div>
  );
}

interface BracketMatchCardProps {
  fixture: WorldCupFixture;
  matchesById: Record<string, Match>;
  onSelect: () => void;
}

function BracketMatchCard({ fixture, matchesById, onSelect }: BracketMatchCardProps) {
  const tGameName = useGameNames();
  const matchA = fixture.killerAMatchId ? matchesById[fixture.killerAMatchId] : undefined;
  const matchB = fixture.killerBMatchId ? matchesById[fixture.killerBMatchId] : undefined;

  return (
    <button type="button" className="bracket-match-card" onClick={onSelect} title={`${tGameName(fixture.killerA)} vs ${tGameName(fixture.killerB)}`}>
      <span className={`bracket-match-side${fixture.winner === "a" ? " is-winner" : ""}`}>
        <Icon category="Characters" name={fixture.killerA} alt={fixture.killerA} size={40} />
        <span className="bracket-match-score">{hooksOf(matchA) ?? "-"}</span>
      </span>
      <span className={`bracket-match-side${fixture.winner === "b" ? " is-winner" : ""}`}>
        <Icon category="Characters" name={fixture.killerB} alt={fixture.killerB} size={40} />
        <span className="bracket-match-score">{hooksOf(matchB) ?? "-"}</span>
      </span>
    </button>
  );
}

interface BracketSlotCardProps {
  slot: BracketSlot;
  matchesById: Record<string, Match>;
  onSelect: (fixtureId: string) => void;
}

function BracketSlotCard({ slot, matchesById, onSelect }: BracketSlotCardProps) {
  if (!slot.fixture) return <BracketPlaceholderCard projectedA={slot.projectedA} projectedB={slot.projectedB} />;
  return <BracketMatchCard fixture={slot.fixture} matchesById={matchesById} onSelect={() => onSelect(slot.fixture!.id)} />;
}

export function WorldCupBracket({
  fixtures,
  matchesById,
  currentRound,
  champion,
  isAdvancing,
  onRecordSide,
  onManualTiebreak,
}: WorldCupBracketProps) {
  const { t } = useTranslation();
  const tGameName = useGameNames();
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);

  if (champion) {
    return (
      <div className="world-cup-champion">
        <Icon category="Characters" name={champion} alt={champion} size={170} />
        <h2>{tGameName(champion)}</h2>
        <p>{t("worldCup.champion")}</p>
      </div>
    );
  }

  const finalSlots = roundSlots("final", fixtures);
  const selectedFixture = fixtures.find((f) => f.id === selectedFixtureId) ?? null;

  return (
    <div className="world-cup-bracket">
      {currentRound && <h3>{t(KNOCKOUT_ROUND_LABEL_KEYS[currentRound])}</h3>}

      <div className="world-cup-bracket-tree">
        <div className="bracket-half is-left">
          {ROUNDS_BEFORE_FINAL.map((round) => (
            <div key={round} className="bracket-round-col">
              {splitHalves(roundSlots(round, fixtures)).left.map((slot) => (
                <BracketSlotCard key={slot.key} slot={slot} matchesById={matchesById} onSelect={setSelectedFixtureId} />
              ))}
            </div>
          ))}
        </div>

        <div className="bracket-final-col">
          <BracketSlotCard slot={finalSlots[0]} matchesById={matchesById} onSelect={setSelectedFixtureId} />
        </div>

        <div className="bracket-half is-right">
          {[...ROUNDS_BEFORE_FINAL].reverse().map((round) => (
            <div key={round} className="bracket-round-col">
              {splitHalves(roundSlots(round, fixtures)).right.map((slot) => (
                <BracketSlotCard key={slot.key} slot={slot} matchesById={matchesById} onSelect={setSelectedFixtureId} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {isAdvancing && <p className="world-cup-bracket-advancing">{t("worldCup.advancing")}</p>}

      {selectedFixture && (
        <WorldCupFixtureModal
          fixture={selectedFixture}
          matchesById={matchesById}
          onRecordSide={(side, input) => onRecordSide(selectedFixture.id, side, input)}
          onManualTiebreak={(side) => onManualTiebreak(selectedFixture.id, side)}
          onClose={() => setSelectedFixtureId(null)}
        />
      )}
    </div>
  );
}

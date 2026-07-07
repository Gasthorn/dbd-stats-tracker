import { useMemo } from "react";
import { KNOCKOUT_ROUND_LABELS } from "../../../shared/lib/world-cup/knockout";
import { groupLetter } from "../../../shared/lib/world-cup/groups";
import { Icon } from "../../settings";
import type { Match } from "../../match-tracker/types/match.types";
import { getKillerFixtures } from "../lib/deriveState";
import type { WorldCupFixture, WorldCupGroup, WorldCupRound } from "../types/world-cup.types";

const ROUND_ORDER: Record<WorldCupRound, number> = {
  group: 0,
  round_of_32: 1,
  round_of_16: 2,
  quarterfinal: 3,
  semifinal: 4,
  final: 5,
};

type KillerFixtureOutcome = "win" | "loss" | "draw" | "pending";

const OUTCOME_LABELS: Record<KillerFixtureOutcome, string> = {
  win: "Victoire",
  loss: "Défaite",
  draw: "Égalité",
  pending: "À venir",
};

function roundLabel(fixture: WorldCupFixture, groups: readonly WorldCupGroup[]): string {
  if (fixture.round === "group") {
    const group = groups.find((g) => g.id === fixture.groupId);
    return group ? `Poule ${groupLetter(group.groupIndex)}` : "Poule";
  }
  return KNOCKOUT_ROUND_LABELS[fixture.round];
}

function hooksLabel(match: Match | undefined): string {
  return match && match.role === "killer" && match.hooks !== null ? String(match.hooks) : "-";
}

interface WorldCupKillerHistoryModalProps {
  killerName: string;
  fixtures: readonly WorldCupFixture[];
  matchesById: Record<string, Match>;
  groups: readonly WorldCupGroup[];
  onClose: () => void;
}

export function WorldCupKillerHistoryModal({
  killerName,
  fixtures,
  matchesById,
  groups,
  onClose,
}: WorldCupKillerHistoryModalProps) {
  const rows = useMemo(() => {
    return getKillerFixtures(killerName, fixtures)
      .map((fixture) => {
        const side: "a" | "b" = fixture.killerA === killerName ? "a" : "b";
        const opponent = side === "a" ? fixture.killerB : fixture.killerA;
        const ownMatchId = side === "a" ? fixture.killerAMatchId : fixture.killerBMatchId;
        const opponentMatchId = side === "a" ? fixture.killerBMatchId : fixture.killerAMatchId;
        const ownMatch = ownMatchId ? matchesById[ownMatchId] : undefined;
        const opponentMatch = opponentMatchId ? matchesById[opponentMatchId] : undefined;
        const outcome: KillerFixtureOutcome =
          fixture.winner === null ? "pending" : fixture.winner === "draw" ? "draw" : fixture.winner === side ? "win" : "loss";
        return { fixture, opponent, ownMatch, opponentMatch, outcome };
      })
      .sort((a, b) => {
        const roundDiff = ROUND_ORDER[a.fixture.round] - ROUND_ORDER[b.fixture.round];
        return roundDiff !== 0 ? roundDiff : a.fixture.slotIndex - b.fixture.slotIndex;
      });
  }, [killerName, fixtures, matchesById]);

  const wins = rows.filter((row) => row.outcome === "win").length;
  const draws = rows.filter((row) => row.outcome === "draw").length;
  const losses = rows.filter((row) => row.outcome === "loss").length;

  return (
    <div className="world-cup-killer-modal-overlay" onClick={onClose}>
      <div className="world-cup-killer-modal" onClick={(event) => event.stopPropagation()}>
        <div className="world-cup-killer-modal-header">
          <Icon category="Characters" name={killerName} alt={killerName} size={56} />
          <div className="world-cup-killer-modal-title">
            <h3>{killerName}</h3>
            <p className="world-cup-killer-modal-record">
              {wins}V - {draws}N - {losses}D
            </p>
          </div>
          <button type="button" className="world-cup-killer-modal-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        {rows.length === 0 ? (
          <p className="statistics-empty">Aucun match pour ce tueur pour le moment.</p>
        ) : (
          <ul className="world-cup-killer-modal-list">
            {rows.map(({ fixture, opponent, ownMatch, opponentMatch, outcome }) => (
              <li key={fixture.id} className="world-cup-killer-modal-row">
                <span className={`world-cup-result-dot is-${outcome}`} title={OUTCOME_LABELS[outcome]} />
                <span className="world-cup-killer-modal-round">{roundLabel(fixture, groups)}</span>
                <span className="world-cup-killer-modal-opponent">
                  <Icon category="Characters" name={opponent} alt={opponent} size={28} />
                  vs {opponent}
                </span>
                <span className="world-cup-killer-modal-score">
                  {hooksLabel(ownMatch)} / {hooksLabel(opponentMatch)}
                </span>
                <span className="world-cup-killer-modal-outcome">{OUTCOME_LABELS[outcome]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

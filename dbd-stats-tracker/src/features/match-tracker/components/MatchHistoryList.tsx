import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../../auth/stores/auth.store";
import { Icon } from "../../settings";
import { worldCupService } from "../../world-cup/services/world-cup.service";
import type { Match, MatchMode } from "../types/match.types";

const MODE_LABELS: Record<MatchMode, string> = {
  normal: "Normal",
  hardcore: "Hardcore",
  gauntlet: "Gauntlet",
  world_cup: "World Cup",
};

type MatchOutcome = "win" | "loss" | "draw" | "pending";

const OUTCOME_LABELS: Record<MatchOutcome, string> = {
  win: "Victoire",
  loss: "Défaite",
  draw: "Égalité",
  pending: "Confrontation non terminée",
};

interface WorldCupDuelInfo {
  opponent: string;
  outcome: MatchOutcome;
}

function summarize(match: Match): string {
  if (match.role === "killer") {
    return `${match.kills} sacrifice(s)`;
  }
  const labels: Record<NonNullable<Match["escapeResult"]>, string> = {
    escaped_door: "Évadé (porte)",
    escaped_hatch: "Évadé (trappe)",
    sacrificed: "Sacrifié",
    killed: "Tué",
    disconnected: "Déconnecté",
  };
  return labels[match.escapeResult];
}

/** Survivor win = escaped; killer win = 3+ sacrifices. */
function isWin(match: Match): boolean {
  if (match.role === "killer") return match.kills >= 3;
  return match.escapeResult === "escaped_door" || match.escapeResult === "escaped_hatch";
}

function fixtureOutcome(winner: "a" | "b" | "draw" | null, side: "a" | "b"): MatchOutcome {
  if (winner === null) return "pending";
  if (winner === "draw") return "draw";
  return winner === side ? "win" : "loss";
}

interface MatchHistoryListProps {
  matches: Match[];
  onEdit?: (match: Match) => void;
  onDelete?: (match: Match) => void;
}

export function MatchHistoryList({ matches, onEdit, onDelete }: MatchHistoryListProps) {
  const userId = useAuthStore((state) => state.user?.id);
  const [worldCupDuelByMatchId, setWorldCupDuelByMatchId] = useState<Map<string, WorldCupDuelInfo>>(new Map());
  const hasWorldCupMatches = useMemo(() => matches.some((match) => match.mode === "world_cup"), [matches]);

  useEffect(() => {
    if (!userId || !hasWorldCupMatches) return;
    let cancelled = false;
    worldCupService.listFixturesForUser(userId).then((fixtures) => {
      if (cancelled) return;
      const map = new Map<string, WorldCupDuelInfo>();
      for (const fixture of fixtures) {
        if (fixture.killerAMatchId) {
          map.set(fixture.killerAMatchId, {
            opponent: fixture.killerB,
            outcome: fixtureOutcome(fixture.winner, "a"),
          });
        }
        if (fixture.killerBMatchId) {
          map.set(fixture.killerBMatchId, {
            opponent: fixture.killerA,
            outcome: fixtureOutcome(fixture.winner, "b"),
          });
        }
      }
      setWorldCupDuelByMatchId(map);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, hasWorldCupMatches]);

  if (matches.length === 0) {
    return <p>Aucune partie enregistrée pour le moment.</p>;
  }

  return (
    <ul className="match-history-list">
      {matches.map((match) => {
        const duel = match.mode === "world_cup" ? worldCupDuelByMatchId.get(match.id) : undefined;
        return (
          <li key={match.id} className="match-history-item">
            <span className="match-history-tags">
              <span
                className={`match-result-dot ${isWin(match) ? "is-win" : "is-loss"}`}
                title={isWin(match) ? "Victoire" : "Défaite"}
              />
              <span className={`match-mode-badge match-mode-badge--${match.mode}`}>{MODE_LABELS[match.mode]}</span>
            </span>
            <span className="match-field-with-icon">
              <Icon category="Characters" name={match.characterName} alt={match.characterName} size={32} />
              [{match.role === "killer" ? "Tueur" : "Survivant"}] {match.characterName}
              {duel && (
                <>
                  {" "}
                  (vs {duel.opponent})
                  <span
                    className={`match-result-dot is-${duel.outcome}`}
                    title={`Issue du versus : ${OUTCOME_LABELS[duel.outcome]}`}
                  />
                </>
              )}
            </span>
            {match.role === "survivor" && match.opponentName && (
              <span className="match-field-with-icon">
                <Icon category="Characters" name={match.opponentName} alt={match.opponentName} size={32} />
                vs {match.opponentName}
              </span>
            )}
            <span>{summarize(match)}</span>
            <span>{match.bloodpoints} PS</span>
            <span>{new Date(match.playedAt).toLocaleString()}</span>
            {(onEdit || onDelete) && (
              <span className="match-history-actions">
                {onEdit && (
                  <button type="button" onClick={() => onEdit(match)}>
                    Modifier
                  </button>
                )}
                {onDelete && (
                  <button type="button" onClick={() => onDelete(match)}>
                    Supprimer
                  </button>
                )}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

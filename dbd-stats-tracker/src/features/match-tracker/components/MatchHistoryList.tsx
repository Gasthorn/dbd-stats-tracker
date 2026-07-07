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

interface MatchHistoryListProps {
  matches: Match[];
  onEdit?: (match: Match) => void;
  onDelete?: (match: Match) => void;
}

export function MatchHistoryList({ matches, onEdit, onDelete }: MatchHistoryListProps) {
  const userId = useAuthStore((state) => state.user?.id);
  const [worldCupOpponentByMatchId, setWorldCupOpponentByMatchId] = useState<Map<string, string>>(new Map());
  const hasWorldCupMatches = useMemo(() => matches.some((match) => match.mode === "world_cup"), [matches]);

  useEffect(() => {
    if (!userId || !hasWorldCupMatches) return;
    let cancelled = false;
    worldCupService.listFixturesForUser(userId).then((fixtures) => {
      if (cancelled) return;
      const map = new Map<string, string>();
      for (const fixture of fixtures) {
        if (fixture.killerAMatchId) map.set(fixture.killerAMatchId, fixture.killerB);
        if (fixture.killerBMatchId) map.set(fixture.killerBMatchId, fixture.killerA);
      }
      setWorldCupOpponentByMatchId(map);
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
        const duelOpponent = match.mode === "world_cup" ? worldCupOpponentByMatchId.get(match.id) : undefined;
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
              {duelOpponent ? ` (vs ${duelOpponent})` : ""}
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

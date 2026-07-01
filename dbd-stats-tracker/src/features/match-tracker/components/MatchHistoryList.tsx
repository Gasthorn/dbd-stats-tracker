import type { Match } from "../types/match.types";

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

interface MatchHistoryListProps {
  matches: Match[];
  onEdit?: (match: Match) => void;
  onDelete?: (match: Match) => void;
}

export function MatchHistoryList({ matches, onEdit, onDelete }: MatchHistoryListProps) {
  if (matches.length === 0) {
    return <p>Aucune partie enregistrée pour le moment.</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {matches.map((match) => (
        <li key={match.id} className="match-history-item">
          <span>
            [{match.role === "killer" ? "Tueur" : "Survivant"}] {match.characterName}
          </span>
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
      ))}
    </ul>
  );
}

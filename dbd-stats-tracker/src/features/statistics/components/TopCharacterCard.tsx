import { Icon, useGameNames } from "../../settings";
import type { TopCharacterStat } from "../types/statistics.types";

interface TopCharacterCardProps {
  label: string;
  stat: TopCharacterStat | null;
}

export function TopCharacterCard({ label, stat }: TopCharacterCardProps) {
  const tGameName = useGameNames();
  return (
    <div className="top-stat-card">
      <p>{label}</p>
      {stat ? (
        <>
          <Icon category="Characters" name={stat.characterName} alt={stat.characterName} size={72} />
          <b>{tGameName(stat.characterName)}</b> <span className="top-stat-count">({stat.count})</span>
        </>
      ) : (
        <b className="top-stat-empty">-</b>
      )}
    </div>
  );
}

import { Icon } from "../../settings";
import type { TopBuildStat } from "../types/statistics.types";

interface TopBuildCardProps {
  label: string;
  stat: TopBuildStat | null;
}

export function TopBuildCard({ label, stat }: TopBuildCardProps) {
  return (
    <div className="top-stat-card">
      <p>{label}</p>
      {stat ? (
        <>
          <div className="top-build-icons">
            {stat.perks.map((perk, i) => (
              <div key={`${perk}-${i}`} className="top-build-perk-slot">
                <Icon category="Perks" name={perk} alt={perk} size={40} />
              </div>
            ))}
          </div>
          <span className="top-stat-count">({stat.count})</span>
        </>
      ) : (
        <b className="top-stat-empty">-</b>
      )}
    </div>
  );
}

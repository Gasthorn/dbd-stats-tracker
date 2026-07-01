import { getGauntletTierInfo } from "../../../shared/lib/gauntlet/tier";
import type { MatchRole } from "../../match-tracker/types/match.types";

interface GauntletTierProgressProps {
  role: MatchRole;
  completedCount: number;
  totalUnlocked: number;
}

export function GauntletTierProgress({ role, completedCount, totalUnlocked }: GauntletTierProgressProps) {
  const total = Math.max(1, totalUnlocked);
  const tier = getGauntletTierInfo(completedCount, total);
  const percent = (completedCount / total) * 100;

  return (
    <div className="gauntlet-progress-container">
      <h3 className="gauntlet-tier-name">
        Tier {tier.tier}: {tier.name}
      </h3>
      <div className="gauntlet-perk-restriction">Restriction : {tier.perksLabel}</div>
      <div className="gauntlet-progress-bar">
        <div className="gauntlet-progress-fill" style={{ width: `${percent}%` }} />
        <div className="gauntlet-markers">
          {[20, 40, 60, 80].map((position) => (
            <div key={position} className="gauntlet-marker" style={{ left: `${position}%` }} />
          ))}
        </div>
      </div>
      <div className="gauntlet-count">
        {completedCount} / {total} {role === "killer" ? "Tueurs" : "Survivants"}
      </div>
    </div>
  );
}

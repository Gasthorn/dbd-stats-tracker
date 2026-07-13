import { getGauntletTierInfo } from "../../../shared/lib/gauntlet/tier";
import { useTranslation } from "react-i18next";
import type { MatchRole } from "../../match-tracker/types/match.types";

interface GauntletTierProgressProps {
  role: MatchRole;
  completedCount: number;
  totalUnlocked: number;
}

export function GauntletTierProgress({ role, completedCount, totalUnlocked }: GauntletTierProgressProps) {
  const { t } = useTranslation();
  const total = Math.max(1, totalUnlocked);
  const tier = getGauntletTierInfo(completedCount, total);
  const percent = (completedCount / total) * 100;

  return (
    <div className="gauntlet-progress-container">
      <h3 className="gauntlet-tier-name">
        Tier {tier.tier}: {tier.name}
      </h3>
      <div className="gauntlet-perk-restriction">{t("gauntlet.restriction", { label: tier.perksLabel })}</div>
      <div className="gauntlet-progress-bar">
        <div className="gauntlet-progress-fill" style={{ width: `${percent}%` }} />
        <div className="gauntlet-markers">
          {[20, 40, 60, 80].map((position) => (
            <div key={position} className="gauntlet-marker" style={{ left: `${position}%` }} />
          ))}
        </div>
      </div>
      <div className="gauntlet-count">
        {role === "killer" ? t("gauntlet.countKillers", { completed: completedCount, total }) : t("gauntlet.countSurvivors", { completed: completedCount, total })}
      </div>
    </div>
  );
}

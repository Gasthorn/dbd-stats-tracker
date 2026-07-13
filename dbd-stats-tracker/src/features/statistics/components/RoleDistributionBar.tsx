import { useTranslation } from "react-i18next";
interface RoleDistributionBarProps {
  killerMatches: number;
  survivorMatches: number;
}

/** Part-to-whole role split, rendered as a single 100%-stacked bar rather than a pie chart. */
export function RoleDistributionBar({ killerMatches, survivorMatches }: RoleDistributionBarProps) {
  const { t } = useTranslation();
  const total = killerMatches + survivorMatches;
  const killerPercent = total > 0 ? (killerMatches / total) * 100 : 0;
  const survivorPercent = total > 0 ? (survivorMatches / total) * 100 : 0;

  return (
    <div className="role-distribution">
      <div className="role-distribution-bar">
        {killerMatches > 0 && (
          <div
            className="role-distribution-segment is-killer"
            style={{ width: `${killerPercent}%` }}
            title={t("stats.roleTooltip", { role: t("common.killer"), count: killerMatches })}
          >
            {killerPercent >= 15 && <span>{Math.round(killerPercent)}%</span>}
          </div>
        )}
        {survivorMatches > 0 && (
          <div
            className="role-distribution-segment is-survivor"
            style={{ width: `${survivorPercent}%` }}
            title={t("stats.roleTooltip", { role: t("common.survivor"), count: survivorMatches })}
          >
            {survivorPercent >= 15 && <span>{Math.round(survivorPercent)}%</span>}
          </div>
        )}
      </div>
      <ul className="role-distribution-legend">
        <li>
          <span className="role-distribution-swatch is-killer" /> Tueur ({killerMatches})
        </li>
        <li>
          <span className="role-distribution-swatch is-survivor" /> Survivant ({survivorMatches})
        </li>
      </ul>
    </div>
  );
}

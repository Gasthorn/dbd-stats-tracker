import { useTranslation } from "react-i18next";
import type { SurvivorOutcomeCounts } from "../types/statistics.types";

interface SurvivorOutcomeBarProps {
  outcomes: SurvivorOutcomeCounts;
}

/**
 * Part-to-whole breakdown of how survivor matches ended (door/hatch escape, hook
 * sacrifice, mori, disconnect), as a single 100%-stacked bar with a legend.
 */
export function SurvivorOutcomeBar({ outcomes }: SurvivorOutcomeBarProps) {
  const { t } = useTranslation();

  // Wins first (door, hatch, killer DC), then deaths - the bar reads as win-share left to right.
  const segments = [
    { className: "is-outcome-door", label: t("stats.outcomeDoor"), count: outcomes.escapedDoor },
    { className: "is-outcome-hatch", label: t("stats.outcomeHatch"), count: outcomes.escapedHatch },
    { className: "is-outcome-disconnected", label: t("stats.outcomeDisconnected"), count: outcomes.disconnected },
    { className: "is-outcome-sacrificed", label: t("stats.outcomeSacrificed"), count: outcomes.sacrificed },
    { className: "is-outcome-killed", label: t("stats.outcomeKilled"), count: outcomes.killed },
  ];

  if (outcomes.total === 0) {
    return <p className="statistics-empty">{t("stats.noSurvivorMatches")}</p>;
  }

  return (
    <div className="role-distribution">
      <div className="role-distribution-bar">
        {segments.map(
          (segment) =>
            segment.count > 0 && (
              <div
                key={segment.className}
                className={`role-distribution-segment ${segment.className}`}
                style={{ width: `${(segment.count / outcomes.total) * 100}%` }}
                title={`${segment.label} — ${segment.count}`}
              >
                {segment.count / outcomes.total >= 0.12 && (
                  <span>{Math.round((segment.count / outcomes.total) * 100)}%</span>
                )}
              </div>
            ),
        )}
      </div>
      <ul className="role-distribution-legend outcome-legend">
        {segments.map((segment) => (
          <li key={segment.className}>
            <span className={`role-distribution-swatch ${segment.className}`} /> {segment.label} ({segment.count})
          </li>
        ))}
      </ul>
    </div>
  );
}

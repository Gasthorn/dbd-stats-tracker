import { useMemo, useState } from "react";
import type { IconCategory } from "../../../shared/lib/icons/iconPath";
import { Icon } from "../../settings";
import type { KeyedPerformanceStat } from "../types/statistics.types";

interface EntityPerformanceTableProps {
  title: string;
  entityColumnLabel: string;
  secondaryColumnLabel: string;
  rateColumnLabel: string;
  stats: KeyedPerformanceStat[];
  seriesClassName: "is-survivor" | "is-killer";
  iconCategory?: IconCategory;
  diamondIcon?: boolean;
  emptyMessage: string;
}

const TOP_N_OPTIONS = [3, 5] as const;

/** A "top N" leaderboard (by matches played) for any keyed performance stat - opponents faced, perks played, or saved builds used. */
export function EntityPerformanceTable({
  title,
  entityColumnLabel,
  secondaryColumnLabel,
  rateColumnLabel,
  stats,
  seriesClassName,
  iconCategory,
  diamondIcon = false,
  emptyMessage,
}: EntityPerformanceTableProps) {
  const [topN, setTopN] = useState<(typeof TOP_N_OPTIONS)[number]>(3);

  const topEntities = useMemo(
    () => [...stats].sort((a, b) => b.matches - a.matches || b.ratePercent - a.ratePercent).slice(0, topN),
    [stats, topN],
  );

  return (
    <div className="entity-performance-table-wrapper">
      <div className="entity-performance-header">
        <h3>{title}</h3>
        <div className="entity-performance-topn-toggle">
          {TOP_N_OPTIONS.map((n) => (
            <button key={n} type="button" className={topN === n ? "is-active" : ""} onClick={() => setTopN(n)}>
              Top {n}
            </button>
          ))}
        </div>
      </div>

      {topEntities.length === 0 ? (
        <p className="statistics-empty">{emptyMessage}</p>
      ) : (
        <table className="entity-performance-table">
          <thead>
            <tr>
              <th>{entityColumnLabel}</th>
              <th>Matchs</th>
              <th>{secondaryColumnLabel}</th>
              <th>{rateColumnLabel}</th>
            </tr>
          </thead>
          <tbody>
            {topEntities.map((entity) => (
              <tr key={entity.key}>
                <td className="entity-performance-key">
                  {iconCategory && (
                    <span className={diamondIcon ? "entity-performance-icon is-diamond" : "entity-performance-icon"}>
                      <Icon category={iconCategory} name={entity.key} alt={entity.key} size={diamondIcon ? 30 : 40} />
                    </span>
                  )}
                  {entity.key}
                </td>
                <td>{entity.matches}</td>
                <td>{entity.secondaryCount}</td>
                <td>
                  <b className={`top-stat-value ${seriesClassName}`}>{entity.ratePercent}%</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

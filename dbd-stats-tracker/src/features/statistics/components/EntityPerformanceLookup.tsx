import { useMemo, useState } from "react";
import type { IconCategory } from "../../../shared/lib/icons/iconPath";
import { Icon } from "../../settings";
import type { KeyedPerformanceStat } from "../types/statistics.types";

interface EntityPerformanceLookupProps {
  title: string;
  selectLabel: string;
  stats: KeyedPerformanceStat[];
  options: readonly string[];
  matchesLabel: string;
  secondaryLabel: string;
  rateLabel: string;
  seriesClassName: "is-survivor" | "is-killer";
  iconCategory?: IconCategory;
  iconSize?: number;
  emptyOptionsMessage: string;
}

const EMPTY_STAT: KeyedPerformanceStat = { key: "", matches: 0, secondaryCount: 0, ratePercent: 0 };

/** Pick any single entity (a killer, a perk, or a saved build) and see the record against/with it. */
export function EntityPerformanceLookup({
  title,
  selectLabel,
  stats,
  options,
  matchesLabel,
  secondaryLabel,
  rateLabel,
  seriesClassName,
  iconCategory,
  iconSize = 72,
  emptyOptionsMessage,
}: EntityPerformanceLookupProps) {
  const statsByKey = useMemo(() => new Map(stats.map((stat) => [stat.key, stat])), [stats]);
  const mostPlayed = useMemo(() => [...stats].sort((a, b) => b.matches - a.matches)[0]?.key ?? "", [stats]);
  const [selected, setSelected] = useState(mostPlayed);

  const selectedStat = selected ? (statsByKey.get(selected) ?? { ...EMPTY_STAT, key: selected }) : null;

  return (
    <div className="entity-performance-lookup">
      <h3>{title}</h3>

      {options.length === 0 ? (
        <p className="statistics-empty">{emptyOptionsMessage}</p>
      ) : (
        <>
          <label htmlFor={`entity-lookup-${title}`}>{selectLabel}</label>
          <select id={`entity-lookup-${title}`} value={selected} onChange={(e) => setSelected(e.target.value)}>
            <option value="">-- Sélectionner --</option>
            {options.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          {selected && selectedStat && (
            <div className="entity-performance-lookup-result">
              {iconCategory && <Icon category={iconCategory} name={selected} alt={selected} size={iconSize} />}
              <div className="entity-performance-lookup-stats">
                <div className="top-stat-card">
                  <p>{matchesLabel}</p>
                  <b className="top-stat-value">{selectedStat.matches}</b>
                </div>
                <div className="top-stat-card">
                  <p>{secondaryLabel}</p>
                  <b className={`top-stat-value ${seriesClassName}`}>{selectedStat.secondaryCount}</b>
                </div>
                <div className="top-stat-card">
                  <p>{rateLabel}</p>
                  <b className={`top-stat-value ${seriesClassName}`}>{selectedStat.ratePercent}%</b>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

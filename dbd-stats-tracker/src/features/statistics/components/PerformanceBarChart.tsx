import { useTranslation } from "react-i18next";
interface PerformanceBarChartProps {
  title: string;
  labels: string[];
  values: (number | null)[];
  seriesClassName: string;
}

function formatDayLabel(isoDay: string): string {
  const [, month, day] = isoDay.split("-");
  return `${day}/${month}`;
}

/** Thin vertical bars, 0-100%, with a value tooltip; null days render as an empty gap, not a zero bar. */
export function PerformanceBarChart({ title, labels, values, seriesClassName }: PerformanceBarChartProps) {
  const { t } = useTranslation();
  if (labels.length === 0) {
    return (
      <div className="performance-chart">
        <h3>{title}</h3>
        <p className="performance-chart-empty">{t("stats.noDataYet")}</p>
      </div>
    );
  }

  return (
    <div className="performance-chart">
      <h3>{title}</h3>
      <div className="performance-chart-plot">
        <div className="performance-chart-gridlines">
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>
        <div className="performance-chart-bars">
          {labels.map((label, i) => {
            const value = values[i];
            return (
              <div
                key={label}
                className="performance-chart-bar-slot"
                title={value === null ? `${formatDayLabel(label)} : pas de partie` : `${formatDayLabel(label)} : ${value}%`}
              >
                {value !== null && (
                  <div
                    className={`performance-chart-bar ${seriesClassName}`}
                    style={{ height: `${Math.max(value, 2)}%` }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

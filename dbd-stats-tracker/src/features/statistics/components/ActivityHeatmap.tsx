import { useTranslation } from "react-i18next";
import { getDateLocale } from "../../../shared/i18n";
import type { ActivityHeatmapDay } from "../types/statistics.types";

interface ActivityHeatmapProps {
  days: ActivityHeatmapDay[];
  month: number;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

function countClass(count: number): string {
  if (count === 0) return "count-0";
  if (count <= 1) return "count-1";
  if (count <= 3) return "count-3";
  if (count <= 5) return "count-5";
  return "count-max";
}

export function ActivityHeatmap({ days, month, year, onPrevMonth, onNextMonth, onToday }: ActivityHeatmapProps) {
  const { t } = useTranslation();
  const monthLabel = new Intl.DateTimeFormat(getDateLocale(), { month: "long", year: "numeric" }).format(
    new Date(year, month, 1),
  );

  return (
    <div>
      <div className="heatmap-header">
        <h2>{t("stats.activity")}</h2>
        <div>
          <button type="button" onClick={onPrevMonth}>
            ◀
          </button>
          <button type="button" onClick={onToday}>
            {t("stats.today")}
          </button>
          <span className="heatmap-month-label">
            {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
          </span>
          <button type="button" onClick={onNextMonth}>
            ▶
          </button>
        </div>
      </div>
      <div className="activity-heatmap">
        {days.map((day) => (
          <div key={day.day} className="heatmap-day">
            <div
              className={`heatmap-day-cell ${countClass(day.count)}`}
              title={t("stats.heatmapDayTooltip", { day: day.day, count: day.count })}
            />
            <span>{day.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

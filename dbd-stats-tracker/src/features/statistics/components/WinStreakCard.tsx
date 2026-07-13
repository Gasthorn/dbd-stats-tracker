import { useTranslation } from "react-i18next";
import type { WinStreakStat } from "../types/statistics.types";

interface WinStreakCardProps {
  label: string;
  streak: WinStreakStat;
  seriesClassName: "is-survivor" | "is-killer";
}

export function WinStreakCard({ label, streak, seriesClassName }: WinStreakCardProps) {
  const { t } = useTranslation();
  return (
    <div className="top-stat-card">
      <p>{label}</p>
      <b className={`top-stat-value ${seriesClassName}`}>{streak.current}</b>{" "}
      <span className="top-stat-count">{t("stats.streakRecord", { count: streak.best })}</span>
    </div>
  );
}

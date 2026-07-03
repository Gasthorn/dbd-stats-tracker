import type { WinStreakStat } from "../types/statistics.types";

interface WinStreakCardProps {
  label: string;
  streak: WinStreakStat;
  seriesClassName: "is-survivor" | "is-killer";
}

export function WinStreakCard({ label, streak, seriesClassName }: WinStreakCardProps) {
  return (
    <div className="top-stat-card">
      <p>{label}</p>
      <b className={`top-stat-value ${seriesClassName}`}>{streak.current}</b>{" "}
      <span className="top-stat-count">(record : {streak.best})</span>
    </div>
  );
}

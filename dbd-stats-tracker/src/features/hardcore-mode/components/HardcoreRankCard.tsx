import { calculateHardcoreRank } from "../../../shared/lib/hardcore/rank";

interface HardcoreRankCardProps {
  title: string;
  pips: number;
}

export function HardcoreRankCard({ title, pips }: HardcoreRankCardProps) {
  const rank = calculateHardcoreRank(pips);
  const progressPercent = rank.needed === null ? 100 : (rank.current / rank.needed) * 100;

  return (
    <div className="hardcore-rank-card">
      <h3>{title}</h3>
      <div className="hardcore-rank-name" style={{ color: rank.color, textShadow: `0 0 10px ${rank.color}80` }}>
        {rank.name}
      </div>
      <div className="hardcore-pip-count">
        {rank.current} / {rank.needed ?? "∞"} Pips
      </div>
      <div className="hardcore-rank-progress-bar">
        <div
          className="hardcore-rank-progress-fill"
          style={{ width: `${progressPercent}%`, backgroundColor: rank.color, boxShadow: `0 0 8px ${rank.color}CC` }}
        />
      </div>
    </div>
  );
}

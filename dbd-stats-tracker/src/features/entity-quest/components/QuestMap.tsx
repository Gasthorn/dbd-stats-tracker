import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getAvailableNodes, getNextFloor } from "../../../shared/lib/entity-quest/map";
import { getObjective } from "../../../shared/lib/entity-quest/objectives";
import type { EntityQuestRun, QuestMapNode, QuestMission, QuestNodeType } from "../types/entity-quest.types";
import { objectiveLabel } from "./objectiveLabel";

const ROW_HEIGHT = 76;

const NODE_GLYPHS: Record<QuestNodeType, string> = {
  trial: "⚔",
  hard_trial: "☠",
  event: "?",
  shop: "◆",
  chest: "✦",
  boss: "♛",
};

/** Corner badge marking a trial whose mission isn't the standard kills/escape one. */
const MISSION_BADGES: Record<Exclude<QuestMission, "standard">, string> = {
  generators: "⚙",
  bloodpoints: "BP",
};

/** Horizontal center of a node, as a percentage of the map width. */
function nodeX(node: QuestMapNode, floorSize: number): number {
  return ((node.index + 0.5) / floorSize) * 100;
}

interface QuestMapProps {
  run: EntityQuestRun;
  disabled: boolean;
  onSelect: (nodeId: string) => void;
}

/** The run's branching map, boss on top, drawn as rows of nodes over an SVG of their links. */
export function QuestMap({ run, disabled, onSelect }: QuestMapProps) {
  const { t } = useTranslation();
  const { map, visitedNodeIds, currentNodeId } = run.state;
  const floors = map.length;
  const containerRef = useRef<HTMLDivElement>(null);

  const available = useMemo(() => new Set(getAvailableNodes(run.state).map((node) => node.id)), [run.state]);
  const visited = useMemo(() => new Set(visitedNodeIds), [visitedNodeIds]);

  /** Rows are rendered top-down, so floor f sits at row (floors - 1 - f). */
  const rowY = (floor: number) => (floors - 1 - floor) * ROW_HEIGHT + ROW_HEIGHT / 2;

  // Keep the next playable floor in view as the run climbs (scrolls the map box only, not the page).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const nextFloor = Math.min(floors - 1, getNextFloor(run.state));
    container.scrollTo({ top: rowY(nextFloor) - container.clientHeight / 2, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNodeId]);

  function nodeState(node: QuestMapNode): string {
    if (node.id === currentNodeId) return "is-current";
    if (visited.has(node.id)) return "is-visited";
    if (available.has(node.id)) return "is-available";
    return "is-locked";
  }

  function nodeTitle(node: QuestMapNode): string {
    const label = t(`entityQuest.nodeTypes.${node.type}`);
    if (node.type === "trial" || node.type === "hard_trial" || node.type === "boss") {
      return `${label} — ${objectiveLabel(t, getObjective(run.difficulty, run.role, node))}`;
    }
    return label;
  }

  return (
    <div className="quest-map-scroll" ref={containerRef}>
      <div className="quest-map" style={{ height: floors * ROW_HEIGHT }}>
        <svg className="quest-map-links" width="100%" height={floors * ROW_HEIGHT} aria-hidden="true">
          {map.flatMap((floorNodes, floor) =>
            floorNodes.flatMap((node) =>
              node.connections.map((targetId) => {
                const target = map[floor + 1]?.find((candidate) => candidate.id === targetId);
                if (!target) return null;
                const travelled = visited.has(node.id) && visited.has(target.id);
                const open = node.id === currentNodeId && available.has(target.id);
                return (
                  <line
                    key={`${node.id}-${target.id}`}
                    x1={`${nodeX(node, floorNodes.length)}%`}
                    y1={rowY(floor)}
                    x2={`${nodeX(target, map[floor + 1].length)}%`}
                    y2={rowY(floor + 1)}
                    className={travelled ? "is-travelled" : open ? "is-open" : ""}
                  />
                );
              }),
            ),
          )}
        </svg>

        {[...map].reverse().map((floorNodes) => (
          <div key={floorNodes[0].floor} className="quest-map-row" style={{ height: ROW_HEIGHT }}>
            <span className="quest-map-floor-label">{floorNodes[0].floor + 1}</span>
            {floorNodes.map((node) => {
              const state = nodeState(node);
              return (
                <button
                  key={node.id}
                  type="button"
                  className={`quest-node quest-node-${node.type} ${state}`}
                  style={{ left: `${nodeX(node, floorNodes.length)}%` }}
                  title={nodeTitle(node)}
                  aria-label={nodeTitle(node)}
                  disabled={disabled || state !== "is-available"}
                  onClick={() => onSelect(node.id)}
                >
                  {NODE_GLYPHS[node.type]}
                  {node.mission && node.mission !== "standard" && (
                    <span className={`quest-node-mission is-${node.mission}`}>{MISSION_BADGES[node.mission]}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

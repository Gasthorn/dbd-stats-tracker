import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAvailableNodes, getNextFloor } from "../../../shared/lib/entity-quest/map";
import { getObjective } from "../../../shared/lib/entity-quest/objectives";
import type { EntityQuestRun, QuestMapNode, QuestMission, QuestNodeType } from "../types/entity-quest.types";
import { objectiveLabel } from "./objectiveLabel";

const ROW_HEIGHT = 84;

const NODE_GLYPHS: Record<QuestNodeType, string> = {
  trial: "⚔",
  hard_trial: "☠",
  event: "?",
  shop: "◆",
  chest: "✦",
  boss: "♛",
};

const LEGEND_TYPES: readonly QuestNodeType[] = ["trial", "hard_trial", "event", "shop", "chest", "boss"];

/** Corner badge marking a trial whose mission isn't the standard kills/escape one. */
const MISSION_BADGES: Record<Exclude<QuestMission, "standard">, string> = {
  generators: "⚙",
  bloodpoints: "BP",
  hooks: "⚓",
  unhooks: "⛓",
  heals: "✚",
};

/** Missions a role can roll (and thus show in the legend). */
const ROLE_MISSIONS: Record<EntityQuestRun["role"], readonly Exclude<QuestMission, "standard">[]> = {
  killer: ["generators", "bloodpoints", "hooks"],
  survivor: ["generators", "bloodpoints", "unhooks", "heals"],
};

/** Horizontal center of a node, as a percentage of the map width. */
function nodeX(node: QuestMapNode, floorSize: number): number {
  return ((node.index + 0.5) / floorSize) * 100;
}

/**
 * A vertical S-curve between two node centers (pixels), like a vein of the Bloodweb. A small
 * per-link sway, derived from the node id so it stays stable across renders, keeps parallel
 * veins from looking ruled.
 */
function veinPath(fromId: string, x1: number, y1: number, x2: number, y2: number): string {
  let hash = 0;
  for (const char of fromId) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  const sway = ((Math.abs(hash) % 7) - 3) * 5;
  const midY = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1 + sway} ${midY}, ${x2 - sway} ${midY}, ${x2} ${y2}`;
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
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapWidth, setMapWidth] = useState(0);

  // Links are drawn in real pixels (undistorted curves), so track the map's width: measured
  // synchronously before the first paint, then kept up to date on resize.
  useLayoutEffect(() => {
    const element = mapRef.current;
    if (!element) return;
    const measure = () => setMapWidth(element.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const available = useMemo(() => new Set(getAvailableNodes(run.state).map((node) => node.id)), [run.state]);
  const visited = useMemo(() => new Set(visitedNodeIds), [visitedNodeIds]);

  /** Rows are rendered top-down, so floor f sits at row (floors - 1 - f). */
  const rowY = (floor: number) => (floors - 1 - floor) * ROW_HEIGHT + ROW_HEIGHT / 2;
  const pixelX = (node: QuestMapNode) => (nodeX(node, map[node.floor].length) / 100) * mapWidth;

  // Keep the next playable floor in view as the run climbs (scrolls the map box only, not the page).
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const nextFloor = Math.min(floors - 1, getNextFloor(run.state));
    container.scrollTo({ top: rowY(nextFloor) - container.clientHeight / 2, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNodeId]);

  const nextFloor = getNextFloor(run.state);

  function nodeState(node: QuestMapNode): string {
    if (node.id === currentNodeId) return "is-current";
    if (visited.has(node.id)) return "is-visited";
    if (available.has(node.id)) return "is-available";
    // Below the player and never entered: a branch left behind.
    if (node.floor < nextFloor) return "is-skipped";
    return "is-locked";
  }

  /** Travelled, flowing toward the next choices, cut off (a branch left behind), or simply ahead. */
  function linkState(from: QuestMapNode, to: QuestMapNode): string {
    if (visited.has(from.id) && visited.has(to.id)) return "is-travelled";
    if (from.id === currentNodeId && available.has(to.id)) return "is-open";
    // Any other link starting below the player's next floor can no longer be taken.
    return from.floor < nextFloor ? "is-dead" : "";
  }

  function nodeTitle(node: QuestMapNode): string {
    const label = t(`entityQuest.nodeTypes.${node.type}`);
    if (node.type === "trial" || node.type === "hard_trial" || node.type === "boss") {
      return `${label} — ${objectiveLabel(t, getObjective(run.difficulty, run.role, node))}`;
    }
    return label;
  }

  return (
    <div className="quest-map-panel">
      <div className="quest-map-scroll" ref={containerRef}>
        <div className="quest-map" ref={mapRef} style={{ height: floors * ROW_HEIGHT }}>
          <svg className="quest-map-links" width={mapWidth} height={floors * ROW_HEIGHT} aria-hidden="true">
            {mapWidth > 0 &&
              map.flatMap((floorNodes, floor) =>
                floorNodes.flatMap((node) =>
                  node.connections.map((targetId) => {
                    const target = map[floor + 1]?.find((candidate) => candidate.id === targetId);
                    if (!target) return null;
                    const d = veinPath(node.id, pixelX(node), rowY(floor), pixelX(target), rowY(floor + 1));
                    return (
                      <g key={`${node.id}-${target.id}`} className={`quest-vein ${linkState(node, target)}`}>
                        <path className="quest-vein-wall" d={d} />
                        <path className="quest-vein-core" d={d} />
                      </g>
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
                    <span className="quest-node-hex">
                      <span className="quest-node-core">{NODE_GLYPHS[node.type]}</span>
                    </span>
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

      <ul className="quest-map-legend">
        {LEGEND_TYPES.map((type) => (
          <li key={type}>
            <span className={`quest-legend-node quest-node-${type}`}>
              <span className="quest-node-hex">
                <span className="quest-node-core">{NODE_GLYPHS[type]}</span>
              </span>
            </span>
            {t(`entityQuest.nodeTypes.${type}`)}
          </li>
        ))}
        {ROLE_MISSIONS[run.role].map((mission) => (
          <li key={mission}>
            <span className={`quest-node-mission is-${mission} is-static`}>{MISSION_BADGES[mission]}</span>
            {t(`entityQuest.missions.${mission}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}

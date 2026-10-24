import {
  MAX_NODES_PER_FLOOR,
  MIN_NODES_PER_FLOOR,
  MISSION_WEIGHTS,
  NODE_TYPE_WEIGHTS,
  QUEST_BOSS_FLOOR,
  QUEST_CHEST_FLOOR,
  QUEST_FLOORS,
  SAME_FLOOR_MISSION_PENALTY,
  SAME_FLOOR_TYPE_PENALTY,
} from "./constants";
import { randomInt, weightedChoice } from "./random";
import type { QuestMap, QuestMapNode, QuestMission, QuestNodeType, QuestRole, QuestRunState, Rng } from "./types";

/** Weights with every option already used on this floor damped by `penalty` per occurrence. */
function dampRepeats<K extends string>(
  weights: Partial<Record<K, number>>,
  used: readonly K[],
  penalty: number,
): Record<K, number> {
  const damped = { ...weights } as Record<K, number>;
  for (const key of used) {
    if (damped[key] !== undefined) damped[key] *= penalty;
  }
  return damped;
}

function rollNodeType(rng: Rng, floor: number, floorTypes: readonly QuestNodeType[]): QuestNodeType {
  if (floor === 0) return "trial";
  if (floor === QUEST_CHEST_FLOOR) return "chest";
  return weightedChoice(rng, dampRepeats<QuestNodeType>(NODE_TYPE_WEIGHTS, floorTypes, SAME_FLOOR_TYPE_PENALTY));
}

function rollMission(
  rng: Rng,
  role: QuestRole,
  type: QuestNodeType,
  floorMissions: readonly QuestMission[],
): QuestMission | undefined {
  if (type !== "trial" && type !== "hard_trial") return undefined;
  return weightedChoice(rng, dampRepeats(MISSION_WEIGHTS[role], floorMissions, SAME_FLOOR_MISSION_PENALTY));
}

/** Horizontal position of a node in [0, 1], used to link nodes to their nearest neighbours above. */
function lane(index: number, count: number): number {
  return count === 1 ? 0.5 : index / (count - 1);
}

function nearestIndex(position: number, count: number): number {
  let best = 0;
  for (let i = 1; i < count; i++) {
    if (Math.abs(lane(i, count) - position) < Math.abs(lane(best, count) - position)) best = i;
  }
  return best;
}

/**
 * Slay-the-Spire-like map: 13 floors of 2-4 nodes, all trials on the first floor, chests on
 * floor 7, a single boss on top; trials get their mission (kills/escape, generators,
 * bloodpoints, hooks) here. Types and missions avoid repeating within a floor. Each node links to the nearest node(s) on the next floor, so paths
 * rarely cross, and every node is guaranteed both reachable and leading somewhere.
 */
export function generateMap(rng: Rng, role: QuestRole): QuestMap {
  const map: QuestMap = [];
  for (let floor = 0; floor < QUEST_FLOORS; floor++) {
    const count = floor === QUEST_BOSS_FLOOR ? 1 : randomInt(rng, MIN_NODES_PER_FLOOR, MAX_NODES_PER_FLOOR);
    const nodes: QuestMapNode[] = [];
    for (let index = 0; index < count; index++) {
      const type =
        floor === QUEST_BOSS_FLOOR ? "boss" : rollNodeType(rng, floor, nodes.map((node) => node.type));
      const floorMissions = nodes.flatMap((node) => (node.mission ? [node.mission] : []));
      const mission = rollMission(rng, role, type, floorMissions);
      nodes.push({
        id: `${floor}-${index}`,
        floor,
        index,
        type,
        ...(mission ? { mission } : {}),
        connections: [],
      });
    }
    map.push(nodes);
  }

  for (let floor = 0; floor < QUEST_BOSS_FLOOR; floor++) {
    const sources = map[floor];
    const targets = map[floor + 1];
    const link = (source: QuestMapNode, targetIndex: number) => {
      const id = targets[targetIndex].id;
      if (!source.connections.includes(id)) source.connections.push(id);
    };

    for (const source of sources) {
      const nearest = nearestIndex(lane(source.index, sources.length), targets.length);
      link(source, nearest);
      // Sometimes branch to a neighbouring lane too, for route choices.
      if (rng() < 0.45) {
        const side = rng() < 0.5 ? -1 : 1;
        const neighbour = nearest + side;
        if (neighbour >= 0 && neighbour < targets.length) link(source, neighbour);
      }
    }

    // Any node left unreachable gets a link from the source closest to its lane.
    targets.forEach((target, targetIndex) => {
      const reached = sources.some((source) => source.connections.includes(target.id));
      if (!reached) link(sources[nearestIndex(lane(targetIndex, targets.length), sources.length)], targetIndex);
    });

    for (const source of sources) {
      source.connections.sort();
    }
  }

  return map;
}

export function findNode(map: QuestMap, nodeId: string): QuestMapNode | undefined {
  for (const floor of map) {
    const node = floor.find((candidate) => candidate.id === nodeId);
    if (node) return node;
  }
  return undefined;
}

/** Nodes the player may enter next: the first floor at the start, then whatever the current node links to. */
export function getAvailableNodes(state: Pick<QuestRunState, "map" | "currentNodeId">): QuestMapNode[] {
  if (state.currentNodeId === null) return state.map[0];
  const current = findNode(state.map, state.currentNodeId);
  if (!current) return [];
  return current.connections
    .map((id) => findNode(state.map, id))
    .filter((node): node is QuestMapNode => node !== undefined);
}

/** The floor the player is about to play (0-based). */
export function getNextFloor(state: Pick<QuestRunState, "map" | "currentNodeId">): number {
  if (state.currentNodeId === null) return 0;
  const current = findNode(state.map, state.currentNodeId);
  return current ? current.floor + 1 : 0;
}

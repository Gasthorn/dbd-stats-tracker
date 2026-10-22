import { DIFFICULTY_SETTINGS } from "./constants";
import type { QuestDifficulty, QuestMapNode, QuestMatchResult, QuestObjective, QuestRole } from "./types";

/**
 * Crown Quest asks for a race placement that tightens floor after floor; here each trial
 * carries a mission (kills/escape, generators or bloodpoints) whose bar rises every 4 floors
 * and with the difficulty. Hard trials ask for one notch more. The boss is always standard.
 */
type ByAct<T> = readonly [T, T, T];

const KILLER_KILLS_BY_ACT: Record<QuestDifficulty, ByAct<number>> = {
  easy: [1, 2, 2],
  medium: [1, 2, 3],
  impossible: [2, 3, 3],
};

const SURVIVOR_LEVEL_BY_ACT: Record<QuestDifficulty, ByAct<1 | 2 | 3>> = {
  easy: [1, 1, 2],
  medium: [1, 2, 2],
  impossible: [2, 3, 3],
};

/** Generators needed for the survivor's "gens or hatch" level-1 objective. */
const SURVIVOR_LEVEL1_GENS: Record<QuestDifficulty, number> = { easy: 2, medium: 3, impossible: 4 };

/** Generator missions: survivors must repair at least this many... */
const SURVIVOR_GENS_BY_ACT: Record<QuestDifficulty, ByAct<number>> = {
  easy: [2, 3, 3],
  medium: [3, 3, 4],
  impossible: [3, 4, 5],
};

/** ...killers must let at most this many be completed. */
const KILLER_MAX_GENS_BY_ACT: Record<QuestDifficulty, ByAct<number>> = {
  easy: [4, 3, 3],
  medium: [3, 3, 2],
  impossible: [3, 2, 1],
};

/** Bloodpoint missions (match total, as entered in the form). */
const BLOODPOINTS_BY_ACT: Record<QuestRole, Record<QuestDifficulty, ByAct<number>>> = {
  killer: {
    easy: [12000, 15000, 18000],
    medium: [15000, 18000, 22000],
    impossible: [18000, 22000, 26000],
  },
  survivor: {
    easy: [8000, 10000, 13000],
    medium: [10000, 13000, 16000],
    impossible: [13000, 16000, 20000],
  },
};
const HARD_TRIAL_BLOODPOINTS_BONUS: Record<QuestRole, number> = { killer: 4000, survivor: 3000 };

const BOSS_KILLS: Record<QuestDifficulty, number> = { easy: 3, medium: 4, impossible: 4 };
const BOSS_SURVIVOR_LEVEL: Record<QuestDifficulty, 1 | 2 | 3> = { easy: 2, medium: 3, impossible: 3 };

/** Floors 1-4 are act 0, 5-8 act 1, 9-12 act 2. */
function actOf(floor: number): 0 | 1 | 2 {
  return Math.min(2, Math.floor(floor / 4)) as 0 | 1 | 2;
}

export function getObjective(
  difficulty: QuestDifficulty,
  role: QuestRole,
  node: Pick<QuestMapNode, "floor" | "type" | "mission">,
): QuestObjective {
  const hard = node.type === "hard_trial";
  const bump = hard ? 1 : 0;
  const act = actOf(node.floor);
  const mission = node.type === "boss" ? "standard" : (node.mission ?? "standard");

  if (mission === "bloodpoints") {
    const minBloodpoints = BLOODPOINTS_BY_ACT[role][difficulty][act] + (hard ? HARD_TRIAL_BLOODPOINTS_BONUS[role] : 0);
    return { role, kind: "bloodpoints", minBloodpoints };
  }

  if (role === "killer") {
    if (mission === "generators") {
      return { role, kind: "generators", maxGens: Math.max(0, KILLER_MAX_GENS_BY_ACT[difficulty][act] - bump) };
    }
    const minKills = node.type === "boss" ? BOSS_KILLS[difficulty] : KILLER_KILLS_BY_ACT[difficulty][act];
    return { role, kind: "kills", minKills: Math.min(4, minKills + bump) };
  }

  if (mission === "generators") {
    return { role, kind: "generators", minGens: Math.min(5, SURVIVOR_GENS_BY_ACT[difficulty][act] + bump) };
  }
  const level = node.type === "boss" ? BOSS_SURVIVOR_LEVEL[difficulty] : SURVIVOR_LEVEL_BY_ACT[difficulty][act];
  return {
    role,
    kind: "escape",
    level: Math.min(3, level + bump) as 1 | 2 | 3,
    minGens: SURVIVOR_LEVEL1_GENS[difficulty],
  };
}

/** A killer disconnect counts as a survivor win everywhere in the app, so it passes every escape level. */
function escaped(result: Extract<QuestMatchResult, { role: "survivor" }>): boolean {
  return result.escapeResult === "escaped_door" || result.escapeResult === "escaped_hatch" || result.escapeResult === "disconnected";
}

export function isObjectiveMet(objective: QuestObjective, result: QuestMatchResult): boolean {
  if (objective.role !== result.role) return false;

  switch (objective.kind) {
    case "bloodpoints":
      return result.bloodpoints >= objective.minBloodpoints;
    case "kills":
      return result.role === "killer" && result.kills >= objective.minKills;
    case "generators":
      return objective.role === "killer"
        ? result.generatorsCompleted <= objective.maxGens
        : result.generatorsCompleted >= objective.minGens;
    case "escape": {
      if (result.role !== "survivor") return false;
      switch (objective.level) {
        case 1:
          // Gates escapes need the gens powered anyway; the hatch is the real alternative here.
          return escaped(result) || result.generatorsCompleted >= objective.minGens;
        case 2:
          return escaped(result);
        case 3:
          return result.escapeResult === "escaped_door" || result.escapeResult === "disconnected";
      }
    }
  }
}

/** Shards earned for a successful trial (Crown Quest pays coins by placement; here by match performance). */
export function computeTrialShards(
  difficulty: QuestDifficulty,
  node: Pick<QuestMapNode, "type">,
  result: QuestMatchResult,
): number {
  const base =
    result.role === "killer"
      ? 10 + 5 * result.kills
      : 10 + 4 * result.generatorsCompleted + (escaped(result) ? 15 : 0);
  const scaled = base * DIFFICULTY_SETTINGS[difficulty].shardMultiplier;
  return node.type === "hard_trial" ? Math.round(scaled * 1.5) : Math.ceil(scaled);
}

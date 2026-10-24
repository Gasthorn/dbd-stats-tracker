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

/** Generator missions: survivors must repair at least this many (by floor tier)... */
const SURVIVOR_GENS_BY_TIER: Record<QuestDifficulty, ByAct<number>> = {
  easy: [1, 2, 3],
  medium: [2, 3, 4],
  impossible: [3, 4, 5],
};

/** ...killers must let at most this many be completed. */
const KILLER_MAX_GENS_BY_TIER: Record<QuestDifficulty, ByAct<number>> = {
  easy: [5, 4, 3],
  medium: [4, 3, 2],
  impossible: [3, 2, 1],
};

/** Floor tiers shared by the killer generator, hook and bloodpoint missions: floors 1-5, 6-9, 10-12. */
function floorTier(floor: number): 0 | 1 | 2 {
  if (floor < 5) return 0;
  if (floor < 9) return 1;
  return 2;
}

/**
 * Hook missions (killer only): hooks landed in the match. The bar steps up by floor - 3 on
 * floors 1-5, 6 on floors 6-9, 9 on floors 10-12 - and each difficulty above Easy adds one.
 */
const BASE_HOOKS_BY_TIER: ByAct<number> = [3, 6, 9];
/**
 * Survivor unhook / heal missions: same shape as hooks - a bar per floor tier, +1 per
 * difficulty above Easy, +1 on hard trials - scaled to what a survivor can do in one match.
 */
const BASE_UNHOOKS_BY_TIER: ByAct<number> = [1, 2, 3];
const BASE_HEALS_BY_TIER: ByAct<number> = [1, 2, 3];
const SURVIVOR_ASSIST_DIFFICULTY_BONUS: Record<QuestDifficulty, number> = { easy: 0, medium: 1, impossible: 2 };
const MAX_UNHOOKS = 6;
const MAX_HEALS = 8;

const HOOKS_DIFFICULTY_BONUS: Record<QuestDifficulty, number> = { easy: 0, medium: 1, impossible: 2 };
const HARD_TRIAL_HOOKS_BONUS = 2;
const MAX_HOOKS = 12;

/**
 * Bloodpoint missions (match total, as entered in the form), same for both roles. The bar
 * steps up on the same floor tiers as hooks - 18k on floors 1-5, 25k on 6-9, 32k on 10-12 in
 * Medium - and Easy/Impossible shift it by 3k. Hard trials don't raise it: 32k+ is already a
 * full match.
 */
const BASE_BLOODPOINTS_BY_TIER: ByAct<number> = [18000, 25000, 32000];
const BLOODPOINTS_DIFFICULTY_OFFSET: Record<QuestDifficulty, number> = { easy: -3000, medium: 0, impossible: 3000 };

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
    const minBloodpoints = BASE_BLOODPOINTS_BY_TIER[floorTier(node.floor)] + BLOODPOINTS_DIFFICULTY_OFFSET[difficulty];
    return { role, kind: "bloodpoints", minBloodpoints };
  }

  if (role === "killer") {
    if (mission === "hooks") {
      const minHooks =
        BASE_HOOKS_BY_TIER[floorTier(node.floor)] + HOOKS_DIFFICULTY_BONUS[difficulty] + (hard ? HARD_TRIAL_HOOKS_BONUS : 0);
      return { role, kind: "hooks", minHooks: Math.min(MAX_HOOKS, minHooks) };
    }
    if (mission === "generators") {
      return {
        role,
        kind: "generators",
        maxGens: Math.max(0, KILLER_MAX_GENS_BY_TIER[difficulty][floorTier(node.floor)] - bump),
      };
    }
    const minKills = node.type === "boss" ? BOSS_KILLS[difficulty] : KILLER_KILLS_BY_ACT[difficulty][act];
    return { role, kind: "kills", minKills: Math.min(4, minKills + bump) };
  }

  const tier = floorTier(node.floor);
  if (mission === "generators") {
    return { role, kind: "generators", minGens: Math.min(5, SURVIVOR_GENS_BY_TIER[difficulty][tier] + bump) };
  }
  if (mission === "unhooks") {
    const minUnhooks = BASE_UNHOOKS_BY_TIER[tier] + SURVIVOR_ASSIST_DIFFICULTY_BONUS[difficulty] + bump;
    return { role, kind: "unhooks", minUnhooks: Math.min(MAX_UNHOOKS, minUnhooks) };
  }
  if (mission === "heals") {
    const minHeals = BASE_HEALS_BY_TIER[tier] + SURVIVOR_ASSIST_DIFFICULTY_BONUS[difficulty] + bump;
    return { role, kind: "heals", minHeals: Math.min(MAX_HEALS, minHeals) };
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
    case "hooks":
      return result.role === "killer" && result.hooks >= objective.minHooks;
    case "unhooks":
      return result.role === "survivor" && result.unhooks >= objective.minUnhooks;
    case "heals":
      return result.role === "survivor" && result.heals >= objective.minHeals;
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

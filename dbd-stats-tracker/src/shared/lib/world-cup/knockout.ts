export type KnockoutRound = "round_of_32" | "round_of_16" | "quarterfinal" | "semifinal" | "final";

export const KNOCKOUT_ROUND_ORDER: readonly KnockoutRound[] = [
  "round_of_32",
  "round_of_16",
  "quarterfinal",
  "semifinal",
  "final",
];

/**
 * Round labels live in the i18n resources (worldCup.rounds.*); resolve with
 * t(KNOCKOUT_ROUND_LABEL_KEYS[round]). French names rounds by their match
 * count (32 competitors → 16 matches → "seizièmes"), not competitor count.
 */
export const KNOCKOUT_ROUND_LABEL_KEYS: Record<KnockoutRound, string> = {
  round_of_32: "worldCup.rounds.round_of_32",
  round_of_16: "worldCup.rounds.round_of_16",
  quarterfinal: "worldCup.rounds.quarterfinal",
  semifinal: "worldCup.rounds.semifinal",
  final: "worldCup.rounds.final",
};

export function nextKnockoutRound(round: KnockoutRound): KnockoutRound | null {
  const index = KNOCKOUT_ROUND_ORDER.indexOf(round);
  return index >= 0 && index < KNOCKOUT_ROUND_ORDER.length - 1 ? KNOCKOUT_ROUND_ORDER[index + 1] : null;
}

export interface KnockoutPairing {
  killerA: string;
  killerB: string;
  slotIndex: number;
}

export interface RankedQualifier {
  killer: string;
  /** The group this qualifier came from - used to keep group-mates apart in the draw. */
  groupIndex: number;
}

/**
 * Splits a ranked list in half and pairs position-for-position (seed i vs seed half+i), same as a
 * standard bracket, then - mirroring the real World Cup draw rule that two teams from the same
 * group can never meet before the final they could otherwise reach - swaps bottom-half entries
 * around whenever a pairing would put two killers from the same group against each other.
 */
function pairWithGroupAvoidance(rankedQualifiers: readonly RankedQualifier[]): KnockoutPairing[] {
  const half = Math.floor(rankedQualifiers.length / 2);
  const groupOf = new Map(rankedQualifiers.map((q) => [q.killer, q.groupIndex]));
  const topHalf = rankedQualifiers.slice(0, half).map((q) => q.killer);
  const bottomHalf = rankedQualifiers.slice(half, half * 2).map((q) => q.killer);

  for (let i = 0; i < half; i++) {
    if (groupOf.get(topHalf[i]) !== groupOf.get(bottomHalf[i])) continue;
    for (let j = 0; j < bottomHalf.length; j++) {
      if (j === i) continue;
      const swapFixesI = groupOf.get(topHalf[i]) !== groupOf.get(bottomHalf[j]);
      const swapKeepsJSafe = groupOf.get(topHalf[j]) !== groupOf.get(bottomHalf[i]);
      if (swapFixesI && swapKeepsJSafe) {
        [bottomHalf[i], bottomHalf[j]] = [bottomHalf[j], bottomHalf[i]];
        break;
      }
    }
  }

  return topHalf.map((killerA, i) => ({ killerA, killerB: bottomHalf[i], slotIndex: i }));
}

type BracketQuarter = "top_left" | "top_right" | "bottom_right" | "bottom_left";

/** Where each quarter's 4 Round-of-32 matches land in slotIndex terms - must match the bracket tree's slot layout (top-left = 0-3, bottom-left = 4-7, top-right = 8-11, bottom-right = 12-15). */
const QUARTER_SLOT_START: Record<BracketQuarter, number> = {
  top_left: 0,
  bottom_left: 4,
  top_right: 8,
  bottom_right: 12,
};

/** The order the top 4 seeds claim quarters in, and the snake order every following wave of 4 qualifiers follows to keep the four quarters balanced. */
const QUARTER_SEED_ORDER: readonly BracketQuarter[] = ["top_left", "top_right", "bottom_right", "bottom_left"];

/**
 * FIFA-style Round of 32 draw with protected top seeds: the 4 strongest qualifiers overall are
 * placed in 4 different bracket quarters - top-left, top-right, bottom-right, bottom-left, in
 * that order - so they can only meet each other from the semifinal onward. Every following group
 * of 4 ranked qualifiers snakes through the same 4 quarters to keep them balanced, and within
 * each quarter, any pairing that would put two killers from the same group-stage group against
 * each other is swapped away.
 */
export function generateFifaStyleSeeding(rankedQualifiers: readonly RankedQualifier[]): KnockoutPairing[] {
  const quarters: Record<BracketQuarter, RankedQualifier[]> = {
    top_left: [],
    top_right: [],
    bottom_right: [],
    bottom_left: [],
  };

  rankedQualifiers.forEach((qualifier, index) => {
    const wave = Math.floor(index / QUARTER_SEED_ORDER.length);
    const positionInWave = index % QUARTER_SEED_ORDER.length;
    const order = wave % 2 === 0 ? QUARTER_SEED_ORDER : [...QUARTER_SEED_ORDER].reverse();
    quarters[order[positionInWave]].push(qualifier);
  });

  return (Object.keys(quarters) as BracketQuarter[]).flatMap((quarter) => {
    const slotStart = QUARTER_SLOT_START[quarter];
    return pairWithGroupAvoidance(quarters[quarter]).map((pairing) => ({
      ...pairing,
      slotIndex: slotStart + pairing.slotIndex,
    }));
  });
}

export interface RoundWinner {
  slotIndex: number;
  winner: string;
}

/** Standard single-elimination advancement: the winners of adjacent slots (0&1, 2&3, ...) meet next round. */
export function generateNextRoundPairings(winners: readonly RoundWinner[]): KnockoutPairing[] {
  const sorted = [...winners].sort((a, b) => a.slotIndex - b.slotIndex);
  const pairings: KnockoutPairing[] = [];
  for (let i = 0; i < sorted.length; i += 2) {
    pairings.push({ killerA: sorted[i].winner, killerB: sorted[i + 1].winner, slotIndex: pairings.length });
  }
  return pairings;
}

export interface FixtureSideResult {
  hooks: number | null;
  kills: number;
  generatorsCompleted: number;
  bloodpoints: number;
}

export type FixtureOutcome =
  | { status: "pending" }
  | { status: "partial" }
  | { status: "completed"; winner: "a" | "b" | "draw" };

/** Group-stage outcome: hooks decide, draws are allowed. */
export function resolveFixtureOutcome(
  sideA: FixtureSideResult | null,
  sideB: FixtureSideResult | null,
): FixtureOutcome {
  if (!sideA && !sideB) return { status: "pending" };
  if (!sideA || !sideB || sideA.hooks === null || sideB.hooks === null) return { status: "partial" };
  if (sideA.hooks > sideB.hooks) return { status: "completed", winner: "a" };
  if (sideB.hooks > sideA.hooks) return { status: "completed", winner: "b" };
  return { status: "completed", winner: "draw" };
}

export type KnockoutFixtureOutcome =
  | { status: "pending" }
  | { status: "partial" }
  | { status: "completed"; winner: "a" | "b" }
  | { status: "needs_manual_tiebreak" };

/**
 * Knockout outcome: hooks decide; a tie falls back to kills, then fewer generators completed
 * (the killer who let fewer gens get done played the stronger match), then bloodpoints, then a
 * manual pick.
 */
export function resolveKnockoutOutcome(
  sideA: FixtureSideResult | null,
  sideB: FixtureSideResult | null,
): KnockoutFixtureOutcome {
  const base = resolveFixtureOutcome(sideA, sideB);
  if (base.status !== "completed") return base;
  if (base.winner !== "draw") return { status: "completed", winner: base.winner };

  const a = sideA as FixtureSideResult;
  const b = sideB as FixtureSideResult;
  if (a.kills !== b.kills) return { status: "completed", winner: a.kills > b.kills ? "a" : "b" };
  if (a.generatorsCompleted !== b.generatorsCompleted) {
    return { status: "completed", winner: a.generatorsCompleted < b.generatorsCompleted ? "a" : "b" };
  }
  if (a.bloodpoints !== b.bloodpoints) {
    return { status: "completed", winner: a.bloodpoints > b.bloodpoints ? "a" : "b" };
  }
  return { status: "needs_manual_tiebreak" };
}

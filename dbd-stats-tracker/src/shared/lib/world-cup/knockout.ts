export type KnockoutRound = "round_of_32" | "round_of_16" | "quarterfinal" | "semifinal" | "final";

export const KNOCKOUT_ROUND_ORDER: readonly KnockoutRound[] = [
  "round_of_32",
  "round_of_16",
  "quarterfinal",
  "semifinal",
  "final",
];

export const KNOCKOUT_ROUND_LABELS: Record<KnockoutRound, string> = {
  round_of_32: "32èmes de finale",
  round_of_16: "16èmes de finale",
  quarterfinal: "Quarts de finale",
  semifinal: "Demi-finales",
  final: "Finale",
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

/** Snake-seeds a ranked field into its first knockout round: seed 1 vs seed (n/2 + 1), seed 2 vs seed (n/2 + 2), etc. */
export function generateSnakeSeeding(rankedKillers: readonly string[]): KnockoutPairing[] {
  const half = Math.floor(rankedKillers.length / 2);
  const pairings: KnockoutPairing[] = [];
  for (let i = 0; i < half; i++) {
    pairings.push({ killerA: rankedKillers[i], killerB: rankedKillers[i + half], slotIndex: i });
  }
  return pairings;
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

/** Knockout outcome: hooks decide; a tie falls back to kills, then bloodpoints, then a manual pick. */
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
  if (a.bloodpoints !== b.bloodpoints) {
    return { status: "completed", winner: a.bloodpoints > b.bloodpoints ? "a" : "b" };
  }
  return { status: "needs_manual_tiebreak" };
}

export interface RoundRobinPairing {
  killerA: string;
  killerB: string;
  slotIndex: number;
}

/**
 * Schedules every unique pairing within a group (C(n,2) pairings; 15 for a 6-killer pool) into
 * "matchdays" using the round-robin circle method: each matchday has n/2 matches and every killer
 * plays exactly once, mirroring how a real World Cup group stage is played out (matchday 1 for
 * every group before matchday 2 starts). Pairings are returned matchday-by-matchday, so slotIndex
 * order already encodes the schedule - matchday `m` (1-indexed) is slots
 * [(m-1) * n/2, m * n/2).
 */
export function generateRoundRobinPairings(killers: readonly string[]): RoundRobinPairing[] {
  const n = killers.length;
  const matchesPerMatchday = Math.floor(n / 2);
  const pairings: RoundRobinPairing[] = [];

  let seats = [...killers];
  const totalMatchdays = n % 2 === 0 ? n - 1 : n;
  for (let matchday = 0; matchday < totalMatchdays; matchday++) {
    for (let i = 0; i < matchesPerMatchday; i++) {
      const killerA = seats[i];
      const killerB = seats[n - 1 - i];
      if (killerA !== killerB) {
        pairings.push({ killerA, killerB, slotIndex: pairings.length });
      }
    }
    const fixed = seats[0];
    const rest = seats.slice(1);
    rest.unshift(rest.pop() as string);
    seats = [fixed, ...rest];
  }
  return pairings;
}

/** The 1-indexed matchday a group fixture belongs to, derived from its slotIndex. */
export function matchdayOfSlot(slotIndex: number, groupSize: number): number {
  return Math.floor(slotIndex / Math.floor(groupSize / 2)) + 1;
}

export function totalMatchdays(groupSize: number): number {
  return groupSize % 2 === 0 ? groupSize - 1 : groupSize;
}

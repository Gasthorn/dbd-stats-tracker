import { useEffect, useState } from "react";

/**
 * Tries each candidate image src in order, advancing to the next whenever the current one fails
 * to load (e.g. the player's custom Icons folder is missing that file but the bundled default
 * has it). Resets back to the first candidate whenever any of `resetDeps` changes.
 */
export function useIconCandidateSrc(
  candidates: string[],
  resetDeps: readonly unknown[],
): { src: string | null; index: number; onError: () => void } {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  return {
    src: candidates[index] ?? null,
    index,
    onError: () => setIndex((current) => current + 1),
  };
}

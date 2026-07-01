import { create } from "zustand";
import { drawNextGauntletCharacter, getGauntletTierInfo } from "../../../shared/lib/gauntlet/tier";
import { useAuthStore } from "../../auth/stores/auth.store";
import { useCharactersStore } from "../../characters/stores/characters.store";
import { useMatchTrackerStore } from "../../match-tracker/stores/match-tracker.store";
import type { CreateMatchInput, MatchRole } from "../../match-tracker/types/match.types";
import { gauntletService } from "../services/gauntlet.service";
import type { GauntletProgress } from "../types/gauntlet.types";
import type { GauntletStore, RecordGauntletMatchInput } from "./gauntlet.store.types";

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Une erreur inattendue est survenue.";
}

function requireUserId(): string {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) throw new Error("Utilisateur non connecté.");
  return userId;
}

function unlockedFor(role: MatchRole): string[] {
  const characters = useCharactersStore.getState();
  return role === "killer" ? characters.unlockedKillers : characters.unlockedSurvivors;
}

export const useGauntletStore = create<GauntletStore>((set, get) => ({
  progress: {},
  status: "idle",
  error: null,

  loadRole: async (role) => {
    set({ status: "loading", error: null });
    try {
      const progress = await gauntletService.getOrCreateProgress(requireUserId(), role);
      set({ progress: { ...get().progress, [role]: progress }, status: "success" });
      if (!progress.currentCharacter) {
        await get().rollNext(role);
      }
    } catch (err) {
      set({ status: "error", error: toErrorMessage(err) });
    }
  },

  rollNext: async (role) => {
    const current = get().progress[role];
    if (!current || current.currentCharacter) return;

    const unlocked = unlockedFor(role);
    const { next, queue } = drawNextGauntletCharacter(
      current.characterQueue,
      current.completedCharacters,
      unlocked,
    );
    if (next === null) return;

    try {
      const updated = await gauntletService.updateProgress({
        id: current.id,
        currentCharacter: next,
        characterQueue: queue,
      });
      set({ progress: { ...get().progress, [role]: updated } });
    } catch (err) {
      set({ error: toErrorMessage(err) });
    }
  },

  recordMatch: async ({ role, match, win, ignoreChallenge }: RecordGauntletMatchInput) => {
    const createMatch = useMatchTrackerStore.getState().createMatch;
    const matchInput: CreateMatchInput = { ...match, mode: "gauntlet", ignoreChallenge };
    await createMatch(matchInput);

    if (ignoreChallenge) return;

    const current = get().progress[role];
    if (!current) return;
    const unlocked = unlockedFor(role);

    let updated: GauntletProgress;
    if (win) {
      updated = await gauntletService.updateProgress({
        id: current.id,
        completedCharacters: [...current.completedCharacters, current.currentCharacter as string],
        currentCharacter: null,
      });
    } else {
      const tier = getGauntletTierInfo(current.completedCharacters.length, unlocked.length);
      updated = await gauntletService.updateProgress({
        id: current.id,
        completedCharacters: current.completedCharacters.slice(0, tier.checkpoint),
        currentCharacter: null,
        characterQueue: [],
      });
    }

    set({ progress: { ...get().progress, [role]: updated } });

    if (updated.completedCharacters.length < unlocked.length) {
      await get().rollNext(role);
    }
  },

  refreshQueue: async (role) => {
    const current = get().progress[role];
    if (!current) return;
    const unlocked = unlockedFor(role);

    const stillUnlocked = current.currentCharacter && unlocked.includes(current.currentCharacter);
    const updated = await gauntletService.updateProgress({
      id: current.id,
      currentCharacter: stillUnlocked ? current.currentCharacter : null,
      characterQueue: [],
    });
    set({ progress: { ...get().progress, [role]: updated } });

    if (!updated.currentCharacter) {
      await get().rollNext(role);
    }
  },

  resetRole: async (role) => {
    const current = get().progress[role];
    if (!current) return;
    set({ status: "loading", error: null });
    try {
      await gauntletService.resetProgress(current.id);
      const fresh = await gauntletService.getOrCreateProgress(requireUserId(), role);
      set({ progress: { ...get().progress, [role]: fresh }, status: "success" });
      await get().rollNext(role);
    } catch (err) {
      set({ status: "error", error: toErrorMessage(err) });
    }
  },
}));

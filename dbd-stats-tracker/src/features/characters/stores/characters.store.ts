import { create } from "zustand";
import { i18n } from "../../../shared/i18n";
import {
  DEFAULT_UNLOCKED_KILLERS,
  DEFAULT_UNLOCKED_SURVIVORS,
  KILLERS,
  SURVIVORS,
} from "../../../shared/data/characters";
import { useAuthStore } from "../../auth/stores/auth.store";
import { charactersService } from "../services/characters.service";
import type { CharactersStore } from "./characters.store.types";

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : i18n.t("common.unexpectedError");
}

function requireUserId(): string {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) throw new Error(i18n.t("common.notLoggedIn"));
  return userId;
}

export const useCharactersStore = create<CharactersStore>((set, get) => ({
  unlockedKillers: [],
  unlockedSurvivors: [],
  status: "idle",
  error: null,

  fetch: async () => {
    set({ status: "loading", error: null });
    try {
      const userId = requireUserId();
      const unlocked = await charactersService.getUnlockedCharacters(userId);

      // A brand-new account has never had its roster configured: seed it with
      // the free base-game roster (every player owns at least this).
      const isUnconfigured = unlocked.killers.length === 0 && unlocked.survivors.length === 0;
      const resolved = isUnconfigured
        ? { killers: [...DEFAULT_UNLOCKED_KILLERS], survivors: [...DEFAULT_UNLOCKED_SURVIVORS] }
        : unlocked;

      set({
        unlockedKillers: resolved.killers,
        unlockedSurvivors: resolved.survivors,
        status: "success",
      });

      if (isUnconfigured) {
        await charactersService.updateUnlockedCharacters(userId, resolved);
      }
    } catch (err) {
      set({ status: "error", error: toErrorMessage(err) });
    }
  },

  toggleKiller: async (name) => {
    const previous = get().unlockedKillers;
    const next = previous.includes(name)
      ? previous.filter((killer) => killer !== name)
      : [...previous, name];
    set({ unlockedKillers: next, error: null });
    try {
      await charactersService.updateUnlockedCharacters(requireUserId(), {
        killers: next,
        survivors: get().unlockedSurvivors,
      });
    } catch (err) {
      set({ unlockedKillers: previous, error: toErrorMessage(err) });
    }
  },

  toggleSurvivor: async (name) => {
    const previous = get().unlockedSurvivors;
    const next = previous.includes(name)
      ? previous.filter((survivor) => survivor !== name)
      : [...previous, name];
    set({ unlockedSurvivors: next, error: null });
    try {
      await charactersService.updateUnlockedCharacters(requireUserId(), {
        killers: get().unlockedKillers,
        survivors: next,
      });
    } catch (err) {
      set({ unlockedSurvivors: previous, error: toErrorMessage(err) });
    }
  },

  unlockAll: async (role) => {
    const previous = {
      killers: get().unlockedKillers,
      survivors: get().unlockedSurvivors,
    };
    const next =
      role === "killer"
        ? { ...previous, killers: [...KILLERS] }
        : { ...previous, survivors: [...SURVIVORS] };
    set({ unlockedKillers: next.killers, unlockedSurvivors: next.survivors, error: null });
    try {
      await charactersService.updateUnlockedCharacters(requireUserId(), next);
    } catch (err) {
      set({
        unlockedKillers: previous.killers,
        unlockedSurvivors: previous.survivors,
        error: toErrorMessage(err),
      });
    }
  },

  resetToDefault: async (role) => {
    const previous = {
      killers: get().unlockedKillers,
      survivors: get().unlockedSurvivors,
    };
    const next =
      role === "killer"
        ? { ...previous, killers: [...DEFAULT_UNLOCKED_KILLERS] }
        : { ...previous, survivors: [...DEFAULT_UNLOCKED_SURVIVORS] };
    set({ unlockedKillers: next.killers, unlockedSurvivors: next.survivors, error: null });
    try {
      await charactersService.updateUnlockedCharacters(requireUserId(), next);
    } catch (err) {
      set({
        unlockedKillers: previous.killers,
        unlockedSurvivors: previous.survivors,
        error: toErrorMessage(err),
      });
    }
  },
}));

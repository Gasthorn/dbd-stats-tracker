import { create } from "zustand";
import type { AsyncStatus } from "../../../shared/types/common.types";
import { useAuthStore } from "../../auth/stores/auth.store";
import { getDefaultIconsFolder } from "../lib/getDefaultIconsFolder";
import { settingsService } from "../services/settings.service";

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Une erreur inattendue est survenue.";
}

function requireUserId(): string {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) throw new Error("Utilisateur non connecté.");
  return userId;
}

export interface SettingsState {
  /** Absolute path to the local "Icons" folder (CharPortraits/Perks/ItemAddons/Items) the player explicitly picked, persisted per account. Null until they choose one. */
  iconsFolderPath: string | null;
  /** Fallback Icons folder bundled with the project, used whenever `iconsFolderPath` is null. */
  defaultIconsFolderPath: string | null;
  status: AsyncStatus;
  error: string | null;
}

export interface SettingsActions {
  loadIconsFolderPath: () => Promise<void>;
  loadDefaultIconsFolderPath: () => Promise<void>;
  setIconsFolderPath: (path: string | null) => Promise<void>;
}

export type SettingsStore = SettingsState & SettingsActions;

/** The Icons folder actually in effect: the player's explicit pick, or the bundled default. */
export function selectEffectiveIconsFolderPath(state: SettingsState): string | null {
  return state.iconsFolderPath ?? state.defaultIconsFolderPath;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  iconsFolderPath: null,
  defaultIconsFolderPath: null,
  status: "idle",
  error: null,

  loadIconsFolderPath: async () => {
    set({ status: "loading", error: null });
    try {
      const path = await settingsService.getIconsFolderPath(requireUserId());
      set({ iconsFolderPath: path, status: "success" });
    } catch (err) {
      set({ status: "error", error: toErrorMessage(err) });
    }
  },

  loadDefaultIconsFolderPath: async () => {
    const defaultIconsFolderPath = await getDefaultIconsFolder();
    set({ defaultIconsFolderPath });
  },

  setIconsFolderPath: async (path) => {
    const previous = get().iconsFolderPath;
    set({ iconsFolderPath: path, error: null });
    try {
      await settingsService.updateIconsFolderPath(requireUserId(), path);
    } catch (err) {
      set({ iconsFolderPath: previous, error: toErrorMessage(err) });
    }
  },
}));

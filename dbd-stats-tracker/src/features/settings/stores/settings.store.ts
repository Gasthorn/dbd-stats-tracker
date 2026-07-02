import { create } from "zustand";
import type { AsyncStatus } from "../../../shared/types/common.types";
import { useAuthStore } from "../../auth/stores/auth.store";
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
  /** Absolute path to the local "Icons" folder (CharPortraits/Perks/ItemAddons/Items), persisted per account. */
  iconsFolderPath: string | null;
  status: AsyncStatus;
  error: string | null;
}

export interface SettingsActions {
  loadIconsFolderPath: () => Promise<void>;
  setIconsFolderPath: (path: string | null) => Promise<void>;
}

export type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  iconsFolderPath: null,
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

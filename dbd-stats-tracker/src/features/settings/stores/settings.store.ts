import { create } from "zustand";

const ICONS_FOLDER_STORAGE_KEY = "dbd_settings_icons_folder_path";

function readStoredIconsFolderPath(): string | null {
  try {
    return localStorage.getItem(ICONS_FOLDER_STORAGE_KEY);
  } catch {
    return null;
  }
}

export interface SettingsState {
  /** Absolute path to the local "Icons" folder (CharPortraits/Perks/ItemAddons/Items), device-specific. */
  iconsFolderPath: string | null;
}

export interface SettingsActions {
  setIconsFolderPath: (path: string | null) => void;
}

export type SettingsStore = SettingsState & SettingsActions;

export const useSettingsStore = create<SettingsStore>((set) => ({
  iconsFolderPath: readStoredIconsFolderPath(),

  setIconsFolderPath: (path) => {
    try {
      if (path) {
        localStorage.setItem(ICONS_FOLDER_STORAGE_KEY, path);
      } else {
        localStorage.removeItem(ICONS_FOLDER_STORAGE_KEY);
      }
    } catch {
      // localStorage unavailable (e.g. private browsing) - state still updates for this session.
    }
    set({ iconsFolderPath: path });
  },
}));

import { invoke } from "@tauri-apps/api/core";

/**
 * Absolute path to the repo-root `Icons` folder bundled alongside the project, used as the
 * fallback icons source until the player picks their own. Returns null outside the Tauri
 * runtime (e.g. a plain browser during dev) or if that folder doesn't exist on disk.
 */
export async function getDefaultIconsFolder(): Promise<string | null> {
  try {
    return await invoke<string | null>("default_icons_folder");
  } catch {
    return null;
  }
}

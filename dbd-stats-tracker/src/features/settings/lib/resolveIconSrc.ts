import { convertFileSrc } from "@tauri-apps/api/core";
import { emptyIconPath, getIconRelativePath, type IconCategory } from "../../../shared/lib/icons/iconPath";
import { useSettingsStore } from "../stores/settings.store";

function toSrc(folder: string, relativePath: string): string | null {
  const separator = folder.includes("\\") ? "\\" : "/";
  const normalizedRelativePath = relativePath.split("/").join(separator);
  const fullPath = folder.endsWith(separator)
    ? `${folder}${normalizedRelativePath}`
    : `${folder}${separator}${normalizedRelativePath}`;

  try {
    return convertFileSrc(fullPath);
  } catch {
    // convertFileSrc requires the Tauri runtime (window.__TAURI_INTERNALS__);
    // outside of it (e.g. a plain browser during dev) just render no icon.
    return null;
  }
}

/** The player's explicit folder (if set), then the bundled default, deduped and without nulls. */
function candidateFolders(): string[] {
  const state = useSettingsStore.getState();
  const seen = new Set<string>();
  const folders: string[] = [];
  for (const folder of [state.iconsFolderPath, state.defaultIconsFolderPath]) {
    if (folder && !seen.has(folder)) {
      seen.add(folder);
      folders.push(folder);
    }
  }
  return folders;
}

/**
 * Every src worth trying for this icon, in priority order: the player's explicitly-chosen
 * folder first (if set), then the bundled default folder - so an icon missing from their
 * custom folder (e.g. a DLC not yet present in their own game files) still resolves instead
 * of rendering blank.
 */
export function resolveIconSrcCandidates(
  category: IconCategory,
  name: string | null | undefined,
  manualOwner: string | null = null,
): string[] {
  const relativePath = getIconRelativePath(category, name, manualOwner);
  return candidateFolders()
    .map((folder) => toSrc(folder, relativePath))
    .filter((src): src is string => src !== null);
}

/** Same priority order as resolveIconSrcCandidates, for the category's "empty.png" placeholder. */
export function resolveEmptyIconSrcCandidates(category: IconCategory): string[] {
  const relativePath = emptyIconPath(category);
  return candidateFolders()
    .map((folder) => toSrc(folder, relativePath))
    .filter((src): src is string => src !== null);
}

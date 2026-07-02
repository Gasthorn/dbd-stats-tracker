import { convertFileSrc } from "@tauri-apps/api/core";
import { emptyIconPath, getIconRelativePath, type IconCategory } from "../../../shared/lib/icons/iconPath";
import { selectEffectiveIconsFolderPath, useSettingsStore } from "../stores/settings.store";

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

/** Joins the configured Icons folder root with a relative icon path, then converts it to a webview-loadable src. */
export function resolveIconSrc(
  category: IconCategory,
  name: string | null | undefined,
  manualOwner: string | null = null,
): string | null {
  const folder = selectEffectiveIconsFolderPath(useSettingsStore.getState());
  if (!folder) return null;
  return toSrc(folder, getIconRelativePath(category, name, manualOwner));
}

/** Src for the category's "empty.png" placeholder, used as the onError fallback (mirrors legacy behavior). */
export function resolveEmptyIconSrc(category: IconCategory): string | null {
  const folder = selectEffectiveIconsFolderPath(useSettingsStore.getState());
  if (!folder) return null;
  return toSrc(folder, emptyIconPath(category));
}

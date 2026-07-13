import { open } from "@tauri-apps/plugin-dialog";
import { i18n } from "../../../shared/i18n";

/** Opens the native folder picker. Returns null if the user cancelled. */
export async function pickIconsFolder(): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false,
    title: i18n.t("errors.pickIconsFolderTitle"),
  });
  return typeof selected === "string" ? selected : null;
}

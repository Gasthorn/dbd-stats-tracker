import { open } from "@tauri-apps/plugin-dialog";

/** Opens the native folder picker. Returns null if the user cancelled. */
export async function pickIconsFolder(): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false,
    title: "Sélectionner le dossier Icons",
  });
  return typeof selected === "string" ? selected : null;
}

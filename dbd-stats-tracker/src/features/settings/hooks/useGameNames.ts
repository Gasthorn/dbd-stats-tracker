import { useCallback } from "react";
import { translateGameName } from "../../../shared/i18n/gameNames";
import { useSettingsStore } from "../stores/settings.store";

/**
 * Returns a translate function for game-entity display names (killers etc.),
 * bound to the "game names language" setting. Canonical English names remain
 * the storage/icon-lookup values - only what the user SEES changes.
 */
export function useGameNames(): (name: string) => string {
  const gameNameLanguage = useSettingsStore((state) => state.gameNameLanguage);
  return useCallback((name: string) => translateGameName(name, gameNameLanguage), [gameNameLanguage]);
}

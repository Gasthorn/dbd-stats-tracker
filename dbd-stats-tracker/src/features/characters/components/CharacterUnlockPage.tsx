import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { KILLERS, SURVIVORS } from "../../../shared/data/characters";
import { useCharactersStore } from "../stores/characters.store";
import { CharacterSection } from "./CharacterSection";
import "./characters.css";

export function CharacterUnlockPage() {
  const { t } = useTranslation();
  const unlockedKillers = useCharactersStore((state) => state.unlockedKillers);
  const unlockedSurvivors = useCharactersStore((state) => state.unlockedSurvivors);
  const status = useCharactersStore((state) => state.status);
  const error = useCharactersStore((state) => state.error);
  const fetchUnlocked = useCharactersStore((state) => state.fetch);
  const toggleKiller = useCharactersStore((state) => state.toggleKiller);
  const toggleSurvivor = useCharactersStore((state) => state.toggleSurvivor);
  const unlockAll = useCharactersStore((state) => state.unlockAll);
  const resetToDefault = useCharactersStore((state) => state.resetToDefault);

  useEffect(() => {
    fetchUnlocked();
  }, [fetchUnlocked]);

  const isLoadingInitial = status === "loading" || status === "idle";

  return (
    <div className="characters-page">
      <h1>{t("characters.title")}</h1>
      {error && <p className="characters-error">{error}</p>}

      {isLoadingInitial ? (
        <LoadingSpinner />
      ) : (
        <>
          <CharacterSection
            title={t("characters.killers")}
            allNames={KILLERS}
            unlockedNames={unlockedKillers}
            onToggle={toggleKiller}
            onUnlockAll={() => unlockAll("killer")}
            onReset={() => resetToDefault("killer")}
            disabled={false}
          />

          <CharacterSection
            title={t("characters.survivors")}
            allNames={SURVIVORS}
            unlockedNames={unlockedSurvivors}
            onToggle={toggleSurvivor}
            onUnlockAll={() => unlockAll("survivor")}
            onReset={() => resetToDefault("survivor")}
            disabled={false}
          />
        </>
      )}
    </div>
  );
}

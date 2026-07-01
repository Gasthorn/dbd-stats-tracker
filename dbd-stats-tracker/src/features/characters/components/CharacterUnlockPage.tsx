import { useEffect } from "react";
import { KILLERS, SURVIVORS } from "../../../shared/data/characters";
import { useCharactersStore } from "../stores/characters.store";
import { CharacterSection } from "./CharacterSection";
import "./characters.css";

export function CharacterUnlockPage() {
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
      <h1>Personnages débloqués</h1>
      {error && <p className="characters-error">{error}</p>}

      {isLoadingInitial ? (
        <p>Chargement...</p>
      ) : (
        <>
          <CharacterSection
            title="Tueurs"
            allNames={KILLERS}
            unlockedNames={unlockedKillers}
            onToggle={toggleKiller}
            onUnlockAll={() => unlockAll("killer")}
            onReset={() => resetToDefault("killer")}
            disabled={false}
          />

          <CharacterSection
            title="Survivants"
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

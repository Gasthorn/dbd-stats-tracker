import { useEffect, useState } from "react";
import { useCharactersStore } from "../../characters/stores/characters.store";
import type { MatchRole } from "../../match-tracker/types/match.types";
import { useGauntletStore } from "../stores/gauntlet.store";
import { GauntletCharacterCard } from "./GauntletCharacterCard";
import { GauntletCompletedGrid } from "./GauntletCompletedGrid";
import { GauntletMatchForm } from "./GauntletMatchForm";
import { GauntletTierProgress } from "./GauntletTierProgress";
import "./gauntlet.css";

export function GauntletPage() {
  const charactersStatus = useCharactersStore((state) => state.status);
  const fetchCharacters = useCharactersStore((state) => state.fetch);
  const unlockedKillers = useCharactersStore((state) => state.unlockedKillers);
  const unlockedSurvivors = useCharactersStore((state) => state.unlockedSurvivors);

  const progress = useGauntletStore((state) => state.progress);
  const error = useGauntletStore((state) => state.error);
  const loadRole = useGauntletStore((state) => state.loadRole);
  const refreshQueue = useGauntletStore((state) => state.refreshQueue);
  const resetRole = useGauntletStore((state) => state.resetRole);

  const [role, setRole] = useState<MatchRole | null>(null);

  useEffect(() => {
    if (charactersStatus === "idle") fetchCharacters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchRole(nextRole: MatchRole) {
    setRole(nextRole);
    if (!progress[nextRole]) {
      loadRole(nextRole);
    }
  }

  async function handleRefresh() {
    if (!role) return;
    await refreshQueue(role);
    alert("La liste du Gauntlet a été actualisée en fonction de vos personnages débloqués !");
  }

  async function handleReset() {
    if (!role) return;
    if (!confirm("Voulez-vous réinitialiser complètement le Gauntlet ? Toute votre progression sera perdue.")) {
      return;
    }
    await resetRole(role);
  }

  const unlockedCharacters = role === "killer" ? unlockedKillers : unlockedSurvivors;
  const roleProgress = role ? progress[role] : undefined;
  const isComplete = Boolean(roleProgress) && roleProgress!.completedCharacters.length >= unlockedCharacters.length;

  return (
    <div className="gauntlet-page">
      <div className="gauntlet-header">
        {role && (
          <>
            <button type="button" onClick={handleRefresh}>
              Actualiser Liste
            </button>
            <button type="button" onClick={handleReset}>
              Réinitialiser
            </button>
          </>
        )}
      </div>

      <h1>{role ? (role === "killer" ? "Killer Gauntlet" : "Survivor Gauntlet") : "Gauntlet Challenge"}</h1>

      <div className="gauntlet-rules">
        <h3>Règles Gauntlet</h3>
        <ul>
          <li>
            <strong>Objectif :</strong> Réussir une partie avec chaque personnage de votre collection.
          </li>
          <li>
            <strong>Difficulté :</strong> 5 Tiers de restriction (de 4 perks à "No Perks").
          </li>
          <li>
            <strong>Échec :</strong> En cas de défaite, vous retournez au checkpoint du Tier actuel.
          </li>
          <li>
            <strong>Validation :</strong> Évasion (Survivant) ou 3+ Sacrifices (Tueur).
          </li>
        </ul>
      </div>

      {error && <p className="match-error">{error}</p>}

      <div className="match-role-toggle" style={{ justifyContent: "center" }}>
        <button type="button" className={role === "killer" ? "is-active" : ""} onClick={() => switchRole("killer")}>
          Tueur
        </button>
        <button
          type="button"
          className={role === "survivor" ? "is-active" : ""}
          onClick={() => switchRole("survivor")}
        >
          Survivant
        </button>
      </div>

      {role && roleProgress && (
        <>
          <GauntletTierProgress
            role={role}
            completedCount={roleProgress.completedCharacters.length}
            totalUnlocked={unlockedCharacters.length}
          />

          {isComplete ? (
            <p className="gauntlet-complete-message">
              GAUNTLET {role.toUpperCase()} TERMINÉ ! Vous êtes une légende.
            </p>
          ) : roleProgress.currentCharacter ? (
            <div className="gauntlet-roll-zone">
              <GauntletCharacterCard role={role} characterName={roleProgress.currentCharacter} />
              <GauntletMatchForm
                role={role}
                characterName={roleProgress.currentCharacter}
                unlockedCharacters={unlockedCharacters}
                totalUnlocked={unlockedCharacters.length}
                completedCount={roleProgress.completedCharacters.length}
                onDone={() => {}}
                onCancel={() => {}}
              />
            </div>
          ) : (
            <p>Tirage en cours...</p>
          )}

          <GauntletCompletedGrid characters={roleProgress.completedCharacters} />
        </>
      )}
    </div>
  );
}

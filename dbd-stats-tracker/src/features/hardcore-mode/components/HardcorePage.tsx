import { useEffect, useState } from "react";
import { getHardcoreSeasonId } from "../../../shared/lib/hardcore/rank";
import { useCharactersStore } from "../../characters/stores/characters.store";
import { Icon } from "../../settings";
import type { MatchRole } from "../../match-tracker/types/match.types";
import { useHardcoreStore } from "../stores/hardcore.store";
import { HardcoreCharacterGrid } from "./HardcoreCharacterGrid";
import { HardcoreMatchForm } from "./HardcoreMatchForm";
import { HardcoreRankCard } from "./HardcoreRankCard";
import "./hardcore-mode.css";

export function HardcorePage() {
  const charactersStatus = useCharactersStore((state) => state.status);
  const fetchCharacters = useCharactersStore((state) => state.fetch);
  const unlockedKillers = useCharactersStore((state) => state.unlockedKillers);
  const unlockedSurvivors = useCharactersStore((state) => state.unlockedSurvivors);

  const currentRun = useHardcoreStore((state) => state.currentRun);
  const status = useHardcoreStore((state) => state.status);
  const error = useHardcoreStore((state) => state.error);
  const initialize = useHardcoreStore((state) => state.initialize);
  const resetSeason = useHardcoreStore((state) => state.resetSeason);

  const [role, setRole] = useState<MatchRole | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

  useEffect(() => {
    if (charactersStatus === "idle") fetchCharacters();
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleReset() {
    if (!confirm("Voulez-vous réinitialiser votre progression Hardcore pour cette saison (Pips et personnages morts) ?")) {
      return;
    }
    await resetSeason();
    setRole(null);
    setSelectedCharacter(null);
  }

  function switchRole(nextRole: MatchRole) {
    setRole(nextRole);
    setSelectedCharacter(null);
  }

  const unlockedCharacters = role === "killer" ? unlockedKillers : unlockedSurvivors;
  const deadCharacters = role === "killer" ? (currentRun?.deadKillers ?? []) : (currentRun?.deadSurvivors ?? []);

  return (
    <div className="hardcore-page">
      <div className="hardcore-header">
        <div className="hardcore-season-info">{currentRun?.seasonId ?? getHardcoreSeasonId()}</div>
        <button type="button" onClick={handleReset}>
          Réinitialiser Mode
        </button>
      </div>

      <h1>Mode Hardcore - Saison</h1>

      <div className="hardcore-rules">
        <h3>Règles Hardcore</h3>
        <ul>
          <li>
            <strong>Progression :</strong> Gagnez des Pips pour monter de grade (Cendre à Iridescent).
          </li>
          <li>
            <strong>Mort permanente :</strong> Si un personnage meurt (ou évasion totale vs Tueur), il est éliminé
            pour la saison.
          </li>
          <li>
            <strong>Restrictions :</strong> Les compétences des personnages éliminés sont bloquées pour le reste de
            l'équipe.
          </li>
        </ul>
      </div>

      {error && <p className="match-error">{error}</p>}
      {status === "loading" && !currentRun && <p>Chargement...</p>}

      <div className="hardcore-rank-row">
        <HardcoreRankCard title="Rang Tueur" pips={currentRun?.killerPips ?? 0} />
        <HardcoreRankCard title="Rang Survivant" pips={currentRun?.survivorPips ?? 0} />
      </div>

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

      {role && !selectedCharacter && (
        <>
          <p className="hardcore-selected-char">Aucun personnage sélectionné</p>
          <HardcoreCharacterGrid
            characters={unlockedCharacters}
            deadCharacters={deadCharacters}
            selected={selectedCharacter}
            onSelect={setSelectedCharacter}
          />
        </>
      )}

      {role && selectedCharacter && currentRun && (
        <>
          <div className="hardcore-selected-character-bar">
            <Icon category="Characters" name={selectedCharacter} alt={selectedCharacter} size={56} />
            <span>{selectedCharacter}</span>
            <button type="button" onClick={() => setSelectedCharacter(null)}>
              Changer de personnage
            </button>
          </div>
          <HardcoreMatchForm
            role={role}
            characterName={selectedCharacter}
            unlockedCharacters={unlockedCharacters}
            deadCharacters={deadCharacters}
            onDone={() => setSelectedCharacter(null)}
            onCancel={() => setSelectedCharacter(null)}
          />
        </>
      )}
    </div>
  );
}

import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getHardcoreSeasonId } from "../../../shared/lib/hardcore/rank";
import { useCharactersStore } from "../../characters/stores/characters.store";
import { HardcoreTeamPanel, useHardcoreTeamStore } from "../../hardcore-teams";
import { Icon, useGameNames } from "../../settings";
import type { MatchRole } from "../../match-tracker/types/match.types";
import { useHardcoreStore } from "../stores/hardcore.store";
import { HardcoreCharacterGrid } from "./HardcoreCharacterGrid";
import { HardcoreMatchForm } from "./HardcoreMatchForm";
import { HardcoreRankCard } from "./HardcoreRankCard";
import "./hardcore-mode.css";

export function HardcorePage() {
  const { t } = useTranslation();
  const tGameName = useGameNames();
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
    if (!confirm(t("hardcore.resetConfirm"))) {
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

  const teamMembers = useHardcoreTeamStore((state) => state.members);
  const teamDeadSurvivors = useMemo(() => {
    const myMembership = teamMembers.find((m) => m.isSelf && m.status === "accepted");
    return myMembership?.teamDeadSurvivors ?? [];
  }, [teamMembers]);

  const unlockedCharacters = role === "killer" ? unlockedKillers : unlockedSurvivors;
  const deadCharacters =
    role === "killer"
      ? (currentRun?.deadKillers ?? [])
      : Array.from(new Set([...(currentRun?.deadSurvivors ?? []), ...teamDeadSurvivors]));

  return (
    <div className="hardcore-page">
      <div className="hardcore-header">
        <div className="hardcore-season-info">{currentRun?.seasonId ?? getHardcoreSeasonId()}</div>
        <button type="button" className="btn-danger" onClick={handleReset}>
          {t("hardcore.resetMode")}
        </button>
      </div>

      <h1>{t("hardcore.title")}</h1>

      <details className="hardcore-rules">
        <summary>{t("hardcore.rulesTitle")}</summary>
        <ul>
          <li>
            <strong>{t("hardcore.ruleProgressionLabel")}</strong> {t("hardcore.ruleProgression")}
          </li>
          <li>
            <strong>{t("hardcore.rulePermadeathLabel")}</strong> {t("hardcore.rulePermadeath")}
          </li>
          <li>
            <strong>{t("hardcore.ruleRestrictionsLabel")}</strong> {t("hardcore.ruleRestrictions")}
          </li>
        </ul>
      </details>

      {error && <p className="match-error">{error}</p>}
      {status === "loading" && !currentRun && <LoadingSpinner />}

      <div className="hardcore-rank-row">
        <HardcoreRankCard title={t("hardcore.killerRank")} pips={currentRun?.killerPips ?? 0} />
        <HardcoreRankCard title={t("hardcore.survivorRank")} pips={currentRun?.survivorPips ?? 0} />
      </div>

      <div className="match-role-toggle" style={{ justifyContent: "center" }}>
        <button type="button" className={role === "killer" ? "is-active" : ""} onClick={() => switchRole("killer")}>
          {t("common.killer")}
        </button>
        <button
          type="button"
          className={role === "survivor" ? "is-active" : ""}
          onClick={() => switchRole("survivor")}
        >
          {t("common.survivor")}
        </button>
      </div>

      {role === "survivor" && <HardcoreTeamPanel />}

      {role && !selectedCharacter && (
        <>
          <p className="hardcore-selected-char">{t("hardcore.noCharacterSelected")}</p>
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
            <Icon category="Characters" name={selectedCharacter} alt={selectedCharacter} size={64} />
            <span>{tGameName(selectedCharacter)}</span>
            <button type="button" onClick={() => setSelectedCharacter(null)}>
              {t("hardcore.changeCharacter")}
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

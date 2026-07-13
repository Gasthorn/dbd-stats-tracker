import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCharactersStore } from "../../characters/stores/characters.store";
import type { MatchRole } from "../../match-tracker/types/match.types";
import { useGauntletStore } from "../stores/gauntlet.store";
import { GauntletCharacterCard } from "./GauntletCharacterCard";
import { GauntletCompletedGrid } from "./GauntletCompletedGrid";
import { GauntletMatchForm } from "./GauntletMatchForm";
import { GauntletTierProgress } from "./GauntletTierProgress";
import "./gauntlet.css";

export function GauntletPage() {
  const { t } = useTranslation();
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
    alert(t("gauntlet.refreshDone"));
  }

  async function handleReset() {
    if (!role) return;
    if (!confirm(t("gauntlet.resetConfirm"))) {
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
              {t("gauntlet.refreshList")}
            </button>
            <button type="button" className="btn-danger" onClick={handleReset}>
              {t("common.reset")}
            </button>
          </>
        )}
      </div>

      <h1>{role ? (role === "killer" ? t("gauntlet.titleKiller") : t("gauntlet.titleSurvivor")) : t("gauntlet.titleDefault")}</h1>

      <details className="gauntlet-rules">
        <summary>{t("gauntlet.rulesTitle")}</summary>
        <ul>
          <li>
            <strong>{t("gauntlet.ruleGoalLabel")}</strong> {t("gauntlet.ruleGoal")}
          </li>
          <li>
            <strong>{t("gauntlet.ruleDifficultyLabel")}</strong> {t("gauntlet.ruleDifficulty")}
          </li>
          <li>
            <strong>{t("gauntlet.ruleFailureLabel")}</strong> {t("gauntlet.ruleFailure")}
          </li>
          <li>
            <strong>{t("gauntlet.ruleValidationLabel")}</strong> {t("gauntlet.ruleValidation")}
          </li>
        </ul>
      </details>

      {error && <p className="match-error">{error}</p>}

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

      {role && roleProgress && (
        <>
          <GauntletTierProgress
            role={role}
            completedCount={roleProgress.completedCharacters.length}
            totalUnlocked={unlockedCharacters.length}
          />

          {isComplete ? (
            <p className="gauntlet-complete-message">
              {t("gauntlet.completeMessage", { role: role.toUpperCase() })}
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
            <p>{t("gauntlet.rolling")}</p>
          )}

          <GauntletCompletedGrid characters={roleProgress.completedCharacters} />
        </>
      )}
    </div>
  );
}

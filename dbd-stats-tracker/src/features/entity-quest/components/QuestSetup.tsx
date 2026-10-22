import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DIFFICULTY_SETTINGS, QUEST_DIFFICULTIES } from "../../../shared/lib/entity-quest/constants";
import type { QuestDifficulty, QuestRole } from "../types/entity-quest.types";

interface QuestSetupProps {
  role: QuestRole;
  onStart: (difficulty: QuestDifficulty) => Promise<void>;
}

export function QuestSetup({ role, onStart }: QuestSetupProps) {
  const { t } = useTranslation();
  const [difficulty, setDifficulty] = useState<QuestDifficulty>("medium");
  const [isStarting, setIsStarting] = useState(false);

  async function handleStart() {
    setIsStarting(true);
    try {
      await onStart(difficulty);
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <section className="quest-setup">
      <h2>{t("entityQuest.setupTitle", { role: t(`common.${role}`) })}</h2>
      <p className="quest-muted">{t("entityQuest.setupIntro")}</p>

      <div className="quest-difficulty-grid">
        {QUEST_DIFFICULTIES.map((option) => (
          <button
            key={option}
            type="button"
            className={difficulty === option ? "quest-difficulty-card is-active" : "quest-difficulty-card"}
            onClick={() => setDifficulty(option)}
          >
            <strong>{t(`entityQuest.difficulties.${option}.name`)}</strong>
            <span className="quest-difficulty-lives">
              {"♥".repeat(DIFFICULTY_SETTINGS[option].lives)}
            </span>
            <span>{t(`entityQuest.difficulties.${option}.description`)}</span>
          </button>
        ))}
      </div>

      <button type="button" className="quest-primary-button" disabled={isStarting} onClick={handleStart}>
        {isStarting ? t("entityQuest.starting") : t("entityQuest.startRun")}
      </button>
    </section>
  );
}

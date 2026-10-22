import { useTranslation } from "react-i18next";
import { QUEST_FLOORS } from "../../../shared/lib/entity-quest/constants";
import { getNextFloor } from "../../../shared/lib/entity-quest/map";
import type { EntityQuestRun } from "../types/entity-quest.types";

interface QuestHudProps {
  run: EntityQuestRun;
}

export function QuestHud({ run }: QuestHudProps) {
  const { t } = useTranslation();
  const floor = Math.min(QUEST_FLOORS, getNextFloor(run.state) + 1);
  const questId = run.state.activeQuestId;

  return (
    <div className="quest-hud">
      <div className="quest-hud-stat" aria-label={t("entityQuest.hud.lives")}>
        {Array.from({ length: run.maxLives }, (_, index) => (
          <span key={index} className={index < run.lives ? "quest-heart" : "quest-heart is-empty"}>
            ♥
          </span>
        ))}
      </div>
      <div className="quest-hud-stat">
        <span className="quest-shard-icon">◆</span>
        <strong>{run.shards}</strong>
        <span className="quest-hud-label">{t("entityQuest.hud.shards")}</span>
      </div>
      <div className="quest-hud-stat">
        <span className="quest-hud-label">{t("entityQuest.hud.floor", { floor, total: QUEST_FLOORS })}</span>
      </div>
      <div className="quest-hud-stat">
        <span className="quest-hud-label">{t(`entityQuest.difficulties.${run.difficulty}.name`)}</span>
      </div>
      {questId && (
        <div className="quest-hud-quest">
          <span className="quest-hud-label">{t("entityQuest.hud.activeQuest")}</span>
          <strong>{t(`entityQuest.quests.${run.role}.${questId}.title`)}</strong>
          <span>{t(`entityQuest.quests.${run.role}.${questId}.description`)}</span>
        </div>
      )}
    </div>
  );
}

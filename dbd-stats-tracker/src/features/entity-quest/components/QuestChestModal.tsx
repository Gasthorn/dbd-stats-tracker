import { useTranslation } from "react-i18next";
import type { QuestRole } from "../types/entity-quest.types";
import { QuestModal } from "./QuestModal";

interface QuestChestModalProps {
  role: QuestRole;
  questOptions: string[];
  busy: boolean;
  onPick: (questId: string) => void;
}

export function QuestChestModal({ role, questOptions, busy, onPick }: QuestChestModalProps) {
  const { t } = useTranslation();

  return (
    <QuestModal title={t("entityQuest.chest.title")}>
      <p className="quest-muted">{t("entityQuest.chest.intro")}</p>
      <div className="quest-chest-options">
        {questOptions.map((questId) => (
          <button key={questId} type="button" className="quest-chest-option" disabled={busy} onClick={() => onPick(questId)}>
            <strong>{t(`entityQuest.quests.${role}.${questId}.title`)}</strong>
            <span>{t(`entityQuest.quests.${role}.${questId}.description`)}</span>
          </button>
        ))}
      </div>
    </QuestModal>
  );
}

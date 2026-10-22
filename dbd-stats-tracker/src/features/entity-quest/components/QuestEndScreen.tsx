import { useTranslation } from "react-i18next";
import type { EntityQuestRun } from "../types/entity-quest.types";
import { QuestCollection } from "./QuestCollection";

interface QuestEndScreenProps {
  run: EntityQuestRun;
  onNewRun: () => void;
}

export function QuestEndScreen({ run, onNewRun }: QuestEndScreenProps) {
  const { t } = useTranslation();
  const won = run.status === "won";

  return (
    <section className={won ? "quest-end is-victory" : "quest-end is-defeat"}>
      <h2>{won ? t("entityQuest.victory.title") : t("entityQuest.gameOver.title")}</h2>
      <p>{won ? t("entityQuest.victory.text") : t("entityQuest.gameOver.text")}</p>
      <p className="quest-muted">
        {t("entityQuest.endSummary", {
          floor: run.state.visitedNodeIds.length,
          matches: run.state.matchIds.length,
          unlocks: run.state.collection.length - run.state.startingCombo.length,
        })}
      </p>
      <button type="button" className="quest-primary-button" onClick={onNewRun}>
        {t("entityQuest.newRun")}
      </button>
      <QuestCollection role={run.role} collection={run.state.collection} />
    </section>
  );
}

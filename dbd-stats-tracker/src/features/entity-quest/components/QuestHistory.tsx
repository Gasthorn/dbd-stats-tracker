import { useTranslation } from "react-i18next";
import { getDateLocale } from "../../../shared/i18n";
import type { EntityQuestRun } from "../types/entity-quest.types";

interface QuestHistoryProps {
  runs: EntityQuestRun[];
}

export function QuestHistory({ runs }: QuestHistoryProps) {
  const { t } = useTranslation();

  return (
    <section className="quest-history">
      <h2>{t("entityQuest.history.title")}</h2>
      {runs.length === 0 ? (
        <p className="quest-muted">{t("entityQuest.history.empty")}</p>
      ) : (
        <table className="quest-history-table">
          <thead>
            <tr>
              <th>{t("entityQuest.history.date")}</th>
              <th>{t("entityQuest.history.role")}</th>
              <th>{t("entityQuest.history.difficulty")}</th>
              <th>{t("entityQuest.history.result")}</th>
              <th>{t("entityQuest.history.floors")}</th>
              <th>{t("entityQuest.history.unlocks")}</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id}>
                <td>{new Date(run.startedAt).toLocaleDateString(getDateLocale())}</td>
                <td>{t(`common.${run.role}`)}</td>
                <td>{t(`entityQuest.difficulties.${run.difficulty}.name`)}</td>
                <td className={run.status === "won" ? "quest-history-won" : "quest-history-lost"}>
                  {run.status === "won" ? t("entityQuest.history.won") : t("entityQuest.history.lost")}
                </td>
                <td>{run.state.visitedNodeIds.length}</td>
                <td>{run.state.collection.length - run.state.startingCombo.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

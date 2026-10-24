import type { TFunction } from "i18next";
import { getDateLocale } from "../../../shared/i18n";
import type { QuestObjective } from "../types/entity-quest.types";

export function objectiveLabel(t: TFunction, objective: QuestObjective): string {
  switch (objective.kind) {
    case "kills":
      return t("entityQuest.objective.killerKills", { count: objective.minKills });
    case "hooks":
      return t("entityQuest.objective.killerHooks", { count: objective.minHooks });
    case "unhooks":
      return t("entityQuest.objective.survivorUnhooks", { count: objective.minUnhooks });
    case "heals":
      return t("entityQuest.objective.survivorHeals", { count: objective.minHeals });
    case "generators":
      return objective.role === "killer"
        ? t("entityQuest.objective.killerGens", { count: objective.maxGens })
        : t("entityQuest.objective.survivorGens", { count: objective.minGens });
    case "bloodpoints":
      return t("entityQuest.objective.bloodpoints", {
        amount: objective.minBloodpoints.toLocaleString(getDateLocale()),
      });
    case "escape":
      return objective.level === 1
        ? t("entityQuest.objective.survivorLevel1", { count: objective.minGens })
        : t(`entityQuest.objective.survivorLevel${objective.level}`);
  }
}

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useGameNames } from "../../settings";
import type { EntityQuestOutcome } from "../stores/entity-quest.store.types";
import { CollectibleCard } from "./CollectibleCard";
import { QuestModal } from "./QuestModal";

interface QuestOutcomeModalProps {
  outcome: EntityQuestOutcome;
  onClose: () => void;
}

/** One-shot result of the last action: starting combo, event, trial won/lost. */
export function QuestOutcomeModal({ outcome, onClose }: QuestOutcomeModalProps) {
  const { t } = useTranslation();
  const tGameName = useGameNames();

  let title: string;
  let body: ReactNode;

  switch (outcome.kind) {
    case "start":
      title = t("entityQuest.startingComboTitle");
      body = (
        <>
          <p>{t("entityQuest.startingComboText")}</p>
          <div className="quest-collectible-grid is-centered">
            {outcome.combo.map((item) => (
              <CollectibleCard key={item.name} item={item} size={72} />
            ))}
          </div>
        </>
      );
      break;

    case "event": {
      const { event, variant, choicePending } = outcome;
      title = t(`entityQuest.events.${event.type}.title`);
      const message =
        event.type === "shards_small" && event.alreadyHealthy
          ? t("entityQuest.events.shards_small.alreadyHealthy")
          : event.type === "unlock" && choicePending
            ? t("entityQuest.events.unlock.choice")
            : t(`entityQuest.events.${event.type}.v${variant}`, {
              name: "unlock" in event && event.unlock ? tGameName(event.unlock.name) : "",
              from: event.type === "reroll" ? tGameName(event.from.name) : "",
              to: event.type === "reroll" ? tGameName(event.to.name) : "",
            });
      // A pending choice means the rolled unlock is just one of the options: don't reveal it here.
      const granted = choicePending ? null : event.type === "unlock" || event.type === "jackpot" ? event.unlock : null;
      const unlock = event.type === "reroll" ? event.to : granted;
      const shards = "shards" in event ? event.shards : 0;
      body = (
        <>
          <p>{message}</p>
          {shards > 0 && <p className="quest-reward-shards">{t("entityQuest.results.shardsWon", { count: shards })}</p>}
          {event.type === "heal" && <p className="quest-reward-heal">♥ {t("entityQuest.results.lifeRestored")}</p>}
          {unlock && (
            <div className="quest-collectible-grid is-centered">
              <CollectibleCard item={unlock} size={72} />
            </div>
          )}
          {choicePending && <p className="quest-legendary-text">{t("entityQuest.results.choicePending")}</p>}
        </>
      );
      break;
    }

    case "trial_success":
      title = t("entityQuest.results.successTitle");
      body = (
        <>
          <p className="quest-reward-shards">{t("entityQuest.results.shardsWon", { count: outcome.shards })}</p>
          {outcome.questCompleted && <p className="quest-legendary-text">{t("entityQuest.results.questReward")}</p>}
          {outcome.choicePending ? (
            <p className="quest-legendary-text">{t("entityQuest.results.choicePending")}</p>
          ) : outcome.unlock ? (
            <>
              <p>{t("entityQuest.results.newUnlock")}</p>
              <div className="quest-collectible-grid is-centered">
                <CollectibleCard item={outcome.unlock} size={72} />
              </div>
            </>
          ) : (
            <p className="quest-muted">{t("entityQuest.results.poolExhausted")}</p>
          )}
        </>
      );
      break;

    case "trial_failed":
      title = t("entityQuest.results.failTitle");
      body = <p>{t("entityQuest.results.lifeLost", { count: outcome.livesLeft })}</p>;
      break;
  }

  return (
    <QuestModal title={title} onClose={onClose}>
      {body}
      <div className="quest-modal-actions">
        <button type="button" className="quest-primary-button" onClick={onClose}>
          {t("entityQuest.results.continue")}
        </button>
      </div>
    </QuestModal>
  );
}

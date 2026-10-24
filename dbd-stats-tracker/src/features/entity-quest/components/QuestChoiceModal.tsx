import { useTranslation } from "react-i18next";
import type { Collectible } from "../types/entity-quest.types";
import { CollectibleCard } from "./CollectibleCard";
import { QuestModal } from "./QuestModal";

interface QuestChoiceModalProps {
  options: Collectible[];
  busy: boolean;
  onPick: (name: string) => void;
}

/** Mandatory pick among same-rarity unlock options (perks, killers); the run waits for it. */
export function QuestChoiceModal({ options, busy, onPick }: QuestChoiceModalProps) {
  const { t } = useTranslation();
  const kind = options[0]?.kind ?? "perk";

  return (
    <QuestModal title={t(`entityQuest.choice.title.${kind}`)} wide>
      <p className="quest-muted">{t("entityQuest.choice.intro", { count: options.length })}</p>
      <div className="quest-choice-grid">
        {options.map((option) => (
          <button
            key={option.name}
            type="button"
            className="quest-choice-option"
            disabled={busy}
            onClick={() => onPick(option.name)}
          >
            <CollectibleCard item={option} size={80} />
          </button>
        ))}
      </div>
    </QuestModal>
  );
}

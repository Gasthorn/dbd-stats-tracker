import { useTranslation } from "react-i18next";
import { ROLE_KINDS } from "../../../shared/lib/entity-quest/pools";
import type { Collectible, QuestRole } from "../types/entity-quest.types";
import { CollectibleCard } from "./CollectibleCard";

interface QuestCollectionProps {
  role: QuestRole;
  collection: readonly Collectible[];
}

/** Everything unlocked during the run, split by kind - the only things the player may use. */
export function QuestCollection({ role, collection }: QuestCollectionProps) {
  const { t } = useTranslation();

  return (
    <section className="quest-collection">
      <h2>{t("entityQuest.collectionTitle")}</h2>
      {ROLE_KINDS[role].map((kind) => {
        const items = collection.filter((item) => item.kind === kind);
        return (
          <div key={kind} className="quest-collection-group">
            <h3>
              {t(`entityQuest.collectionKinds.${kind}`)} <span className="quest-count">({items.length})</span>
            </h3>
            {items.length === 0 ? (
              <p className="quest-muted">{t("entityQuest.collectionEmpty")}</p>
            ) : (
              <div className="quest-collectible-grid">
                {items.map((item) => (
                  <CollectibleCard key={item.name} item={item} size={48} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

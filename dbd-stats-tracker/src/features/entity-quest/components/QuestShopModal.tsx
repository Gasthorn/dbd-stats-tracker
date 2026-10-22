import { useTranslation } from "react-i18next";
import type { QuestShopState } from "../../../shared/lib/entity-quest/types";
import { CollectibleCard } from "./CollectibleCard";
import { QuestModal } from "./QuestModal";

interface QuestShopModalProps {
  shop: QuestShopState;
  shards: number;
  busy: boolean;
  onBuy: (offerIndex: number) => void;
  onReroll: () => void;
  onLeave: () => void;
}

/** Mandatory while standing in a shop: leaving it is what clears the node. */
export function QuestShopModal({ shop, shards, busy, onBuy, onReroll, onLeave }: QuestShopModalProps) {
  const { t } = useTranslation();

  return (
    <QuestModal title={t("entityQuest.shop.title")} wide>
      <p className="quest-muted">{t("entityQuest.shop.intro")}</p>
      <p className="quest-shop-balance">
        <span className="quest-shard-icon">◆</span> <strong>{shards}</strong> {t("entityQuest.hud.shards")}
      </p>

      {shop.offers.length === 0 ? (
        <p>{t("entityQuest.shop.empty")}</p>
      ) : (
        <div className="quest-shop-grid">
          {shop.offers.map((offer, index) => {
            const affordable = shards >= offer.cost;
            return (
              <CollectibleCard
                key={offer.item.name}
                item={offer.item}
                className={offer.purchased ? "is-purchased" : ""}
                footer={
                  <button
                    type="button"
                    disabled={busy || offer.purchased || !affordable}
                    onClick={() => onBuy(index)}
                    title={!affordable && !offer.purchased ? t("entityQuest.shop.notEnough") : undefined}
                  >
                    {offer.purchased ? t("entityQuest.shop.purchased") : t("entityQuest.shop.buy", { cost: offer.cost })}
                  </button>
                }
              />
            );
          })}
        </div>
      )}

      <div className="quest-modal-actions">
        <button type="button" disabled={busy || shards < shop.rerollCost} onClick={onReroll}>
          {t("entityQuest.shop.reroll", { cost: shop.rerollCost })}
        </button>
        <button type="button" className="quest-primary-button" disabled={busy} onClick={onLeave}>
          {t("entityQuest.shop.leave")}
        </button>
      </div>
    </QuestModal>
  );
}

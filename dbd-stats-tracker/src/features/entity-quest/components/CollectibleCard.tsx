import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { getAddonItem } from "../../../shared/lib/entity-quest/pools";
import type { IconCategory } from "../../../shared/lib/icons/iconPath";
import { Icon, useGameNames } from "../../settings";
import type { Collectible } from "../types/entity-quest.types";

export function collectibleIconCategory(item: Pick<Collectible, "kind" | "name">): IconCategory {
  switch (item.kind) {
    case "character":
      return "Characters";
    case "perk":
      return "Perks";
    case "equipment":
      return getAddonItem(item.name) ? "Addons" : "Items";
  }
}

interface CollectibleCardProps {
  item: Collectible;
  size?: number;
  /** Extra line under the name (e.g. a price). */
  footer?: ReactNode;
  className?: string;
}

/** A collected (or offered) item: icon, translated name, rarity color. */
export function CollectibleCard({ item, size = 56, footer, className = "" }: CollectibleCardProps) {
  const { t } = useTranslation();
  const tGameName = useGameNames();
  const category = collectibleIconCategory(item);

  return (
    <div className={`quest-collectible quest-rarity-${item.rarity} ${className}`} title={t(`entityQuest.rarities.${item.rarity}`)}>
      <span className={category === "Perks" ? "quest-collectible-icon is-diamond" : "quest-collectible-icon"}>
        <Icon category={category} name={item.name} alt={item.name} size={size} />
      </span>
      <span className="quest-collectible-name">{tGameName(item.name)}</span>
      <span className="quest-collectible-rarity">{t(`entityQuest.rarities.${item.rarity}`)}</span>
      {footer}
    </div>
  );
}

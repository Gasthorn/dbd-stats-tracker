import { useEffect, useState } from "react";
import type { IconCategory } from "../../../shared/lib/icons/iconPath";
import { getKillerAddonRarity, rarityClassName } from "../../../shared/lib/icons/rarity";
import "../../../shared/styles/rarity.css";
import { resolveEmptyIconSrc, resolveIconSrc } from "../lib/resolveIconSrc";
import { useSettingsStore } from "../stores/settings.store";

interface IconIndexTileProps {
  category: IconCategory;
  name: string;
  manualOwner?: string | null;
}

/** A single icon-index cell: shows the icon (in a diamond slot for perks, matching the legacy
 *  prototype), falls back to the category's empty.png on load failure, and flags itself visually
 *  when that happens so broken icon resolutions are easy to spot in a large grid. Killer addons
 *  also get their rarity-colored border, like the legacy prototype's selection slots. */
export function IconIndexTile({ category, name, manualOwner = null }: IconIndexTileProps) {
  const iconsFolderPath = useSettingsStore((state) => state.iconsFolderPath);
  const [isBroken, setIsBroken] = useState(false);

  const primarySrc = iconsFolderPath ? resolveIconSrc(category, name, manualOwner) : null;
  const fallbackSrc = iconsFolderPath ? resolveEmptyIconSrc(category) : null;

  useEffect(() => {
    setIsBroken(false);
  }, [primarySrc]);

  const src = isBroken ? fallbackSrc : primarySrc;
  // Don't tint a broken icon with its rarity color - the broken flag should stay unambiguous.
  const rarity = !isBroken && category === "Addons" ? getKillerAddonRarity(manualOwner, name) : null;

  const boxClassName = [
    "icon-index-icon-box",
    category === "Perks" ? "is-diamond" : "",
    isBroken ? "is-broken" : "",
    rarityClassName(rarity),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="icon-index-tile" title={name}>
      <div className={boxClassName}>
        {src && (
          <img
            src={src}
            alt={name}
            width={60}
            height={60}
            style={{ objectFit: "contain" }}
            onError={() => setIsBroken(true)}
          />
        )}
      </div>
      <span className="icon-index-tile-name">{name}</span>
    </div>
  );
}

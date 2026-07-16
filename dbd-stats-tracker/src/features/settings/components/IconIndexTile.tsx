import { useEffect, useState } from "react";
import { useGameNames } from "../hooks/useGameNames";
import type { IconCategory } from "../../../shared/lib/icons/iconPath";
import { getKillerAddonRarity, rarityClassName } from "../../../shared/lib/icons/rarity";
import "../../../shared/styles/rarity.css";
import { resolveEmptyIconSrcCandidates, resolveIconSrcCandidates } from "../lib/resolveIconSrc";
import { useSettingsStore } from "../stores/settings.store";

interface IconIndexTileProps {
  category: IconCategory;
  name: string;
  manualOwner?: string | null;
}

/** A single icon-index cell: shows the icon (in a diamond slot for perks, matching the legacy
 *  prototype), trying the player's custom folder then the bundled default before falling back to
 *  the category's empty.png and flagging itself visually, so broken icon resolutions (missing
 *  from *both* folders) are easy to spot in a large grid. Killer addons also get their
 *  rarity-colored border, like the legacy prototype's selection slots. */
export function IconIndexTile({ category, name, manualOwner = null }: IconIndexTileProps) {
  const tGameName = useGameNames();
  const iconsFolderPath = useSettingsStore((state) => state.iconsFolderPath);
  const defaultIconsFolderPath = useSettingsStore((state) => state.defaultIconsFolderPath);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [emptyIndex, setEmptyIndex] = useState(0);

  const primaryCandidates = resolveIconSrcCandidates(category, name, manualOwner);
  const emptyCandidates = resolveEmptyIconSrcCandidates(category);

  useEffect(() => {
    setPrimaryIndex(0);
    setEmptyIndex(0);
  }, [category, name, manualOwner, iconsFolderPath, defaultIconsFolderPath]);

  const isBroken = primaryIndex >= primaryCandidates.length;
  const src = isBroken ? (emptyCandidates[emptyIndex] ?? null) : primaryCandidates[primaryIndex];
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
    <div className="icon-index-tile" title={tGameName(name)}>
      <div className={boxClassName}>
        {src && (
          <img
            src={src}
            alt={name}
            width={60}
            height={60}
            style={{ objectFit: "contain" }}
            onError={() => (isBroken ? setEmptyIndex((i) => i + 1) : setPrimaryIndex((i) => i + 1))}
          />
        )}
      </div>
      <span className="icon-index-tile-name">{tGameName(name)}</span>
    </div>
  );
}

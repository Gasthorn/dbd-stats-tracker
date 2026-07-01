import { useEffect, useState } from "react";
import type { IconCategory } from "../../../shared/lib/icons/iconPath";
import { resolveEmptyIconSrc, resolveIconSrc } from "../lib/resolveIconSrc";
import { useSettingsStore } from "../stores/settings.store";

interface IconIndexTileProps {
  category: IconCategory;
  name: string;
  manualOwner?: string | null;
}

/** A single icon-index cell: shows the icon, falls back to the category's empty.png on load
 *  failure (mirroring the legacy prototype), and flags itself visually when that happens so
 *  broken icon resolutions are easy to spot in a large grid. */
export function IconIndexTile({ category, name, manualOwner = null }: IconIndexTileProps) {
  const iconsFolderPath = useSettingsStore((state) => state.iconsFolderPath);
  const [isBroken, setIsBroken] = useState(false);

  const primarySrc = iconsFolderPath ? resolveIconSrc(category, name, manualOwner) : null;
  const fallbackSrc = iconsFolderPath ? resolveEmptyIconSrc(category) : null;

  useEffect(() => {
    setIsBroken(false);
  }, [primarySrc]);

  const src = isBroken ? fallbackSrc : primarySrc;

  return (
    <div className={`icon-index-tile${isBroken ? " is-broken" : ""}`} title={name}>
      {src && (
        <img
          src={src}
          alt={name}
          width={48}
          height={48}
          style={{ objectFit: "contain" }}
          onError={() => setIsBroken(true)}
        />
      )}
      <span className="icon-index-tile-name">{name}</span>
    </div>
  );
}

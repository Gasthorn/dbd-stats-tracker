import type { IconCategory } from "../../../shared/lib/icons/iconPath";
import { resolveIconSrcCandidates } from "../lib/resolveIconSrc";
import { useIconCandidateSrc } from "../lib/useIconCandidateSrc";
import { useSettingsStore } from "../stores/settings.store";

interface IconProps {
  category: IconCategory;
  name: string | null | undefined;
  manualOwner?: string | null;
  alt: string;
  className?: string;
  size?: number;
}

/**
 * Renders a game icon. Tries the player's custom Icons folder first, then falls back to the
 * bundled default folder if that specific file is missing there; renders nothing if no folder
 * is configured at all or the icon can't be found in either.
 */
export function Icon({ category, name, manualOwner = null, alt, className, size = 40 }: IconProps) {
  const iconsFolderPath = useSettingsStore((state) => state.iconsFolderPath);
  const defaultIconsFolderPath = useSettingsStore((state) => state.defaultIconsFolderPath);

  const candidates = resolveIconSrcCandidates(category, name, manualOwner);
  const { src, onError } = useIconCandidateSrc(candidates, [
    category,
    name,
    manualOwner,
    iconsFolderPath,
    defaultIconsFolderPath,
  ]);

  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
      onError={onError}
    />
  );
}

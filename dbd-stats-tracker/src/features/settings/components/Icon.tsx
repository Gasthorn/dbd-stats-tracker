import { useEffect, useState } from "react";
import type { IconCategory } from "../../../shared/lib/icons/iconPath";
import { resolveIconSrc } from "../lib/resolveIconSrc";
import { useSettingsStore } from "../stores/settings.store";

interface IconProps {
  category: IconCategory;
  name: string | null | undefined;
  manualOwner?: string | null;
  alt: string;
  className?: string;
  size?: number;
}

/** Renders a game icon from the configured Icons folder. Renders nothing if no folder is set or the file fails to load. */
export function Icon({ category, name, manualOwner = null, alt, className, size = 32 }: IconProps) {
  const iconsFolderPath = useSettingsStore((state) => state.iconsFolderPath);
  const [failed, setFailed] = useState(false);

  const src = iconsFolderPath ? resolveIconSrc(category, name, manualOwner) : null;

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={size}
      height={size}
      style={{ objectFit: "contain" }}
      onError={() => setFailed(true)}
    />
  );
}

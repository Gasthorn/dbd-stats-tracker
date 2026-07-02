import { useEffect, useState, type ReactNode } from "react";
import type { IconCategory } from "../../../shared/lib/icons/iconPath";
import { resolveIconSrc } from "../lib/resolveIconSrc";
import { selectEffectiveIconsFolderPath, useSettingsStore } from "../stores/settings.store";
import "./icon-selection-slot.css";

interface BaseProps {
  id?: string;
  category: IconCategory;
  value: string;
  onChange: (value: string) => void;
  manualOwner?: string | null;
  /** Diamond shape for perks, like the legacy prototype's perk slots. */
  diamond?: boolean;
  size?: number;
  className?: string;
}

interface InputSlotProps extends BaseProps {
  as?: "input";
  placeholder?: string;
  listId?: string;
}

interface SelectSlotProps extends BaseProps {
  as: "select";
  children: ReactNode;
}

type IconSelectionSlotProps = InputSlotProps | SelectSlotProps;

/**
 * A form control (text input or select) with its resolved icon shown behind it, filling the
 * whole box. While the value isn't focused, the text is hidden so the icon reads as the primary
 * visual (matching legacy-web-prototype's ".selection-slot" pattern); focusing it to edit reveals
 * the text again. Falls back to showing the text when no icon resolves (no folder configured,
 * empty value, or the icon fails to load) so the field never looks blank.
 */
export function IconSelectionSlot(props: IconSelectionSlotProps) {
  const iconsFolderPath = useSettingsStore(selectEffectiveIconsFolderPath);
  const [isFocused, setIsFocused] = useState(false);
  const [isBroken, setIsBroken] = useState(false);

  const src =
    iconsFolderPath && props.value && !isBroken
      ? resolveIconSrc(props.category, props.value, props.manualOwner ?? null)
      : null;

  useEffect(() => {
    setIsBroken(false);
  }, [src]);

  const hasIcon = Boolean(src);
  const size = props.size ?? 80;

  const boxClassName = [
    "icon-selection-slot",
    props.diamond ? "is-diamond" : "",
    hasIcon && !isFocused ? "hide-value" : "",
    props.className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={boxClassName} style={{ width: size, height: size }}>
      {src && <img src={src} alt={props.value} onError={() => setIsBroken(true)} />}
      {props.as === "select" ? (
        <select
          id={props.id}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          {props.children}
        </select>
      ) : (
        <input
          id={props.id}
          value={props.value}
          list={props.listId}
          placeholder={props.placeholder}
          onChange={(e) => props.onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      )}
    </div>
  );
}

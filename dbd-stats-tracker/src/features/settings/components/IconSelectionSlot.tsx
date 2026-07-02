import { useState, type ReactNode } from "react";
import type { IconCategory } from "../../../shared/lib/icons/iconPath";
import { resolveIconSrcCandidates } from "../lib/resolveIconSrc";
import { useIconCandidateSrc } from "../lib/useIconCandidateSrc";
import { useSettingsStore } from "../stores/settings.store";
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
 * empty value, or the icon fails to load in both the player's custom folder and the bundled
 * default) so the field never looks blank.
 */
export function IconSelectionSlot(props: IconSelectionSlotProps) {
  const iconsFolderPath = useSettingsStore((state) => state.iconsFolderPath);
  const defaultIconsFolderPath = useSettingsStore((state) => state.defaultIconsFolderPath);
  const [isFocused, setIsFocused] = useState(false);

  const candidates = props.value
    ? resolveIconSrcCandidates(props.category, props.value, props.manualOwner ?? null)
    : [];
  const { src, onError } = useIconCandidateSrc(candidates, [
    props.category,
    props.value,
    props.manualOwner,
    iconsFolderPath,
    defaultIconsFolderPath,
  ]);

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
      {src && <img src={src} alt={props.value} onError={onError} />}
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

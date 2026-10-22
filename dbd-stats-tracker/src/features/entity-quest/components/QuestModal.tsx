import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface QuestModalProps {
  title: string;
  children: ReactNode;
  /** Omit to make the modal mandatory (no close button, no backdrop dismiss). */
  onClose?: () => void;
  wide?: boolean;
}

export function QuestModal({ title, children, onClose, wide = false }: QuestModalProps) {
  const { t } = useTranslation();

  return (
    <div className="quest-modal-overlay" onClick={onClose}>
      <div className={wide ? "quest-modal is-wide" : "quest-modal"} onClick={(event) => event.stopPropagation()}>
        <div className="quest-modal-header">
          <h3>{title}</h3>
          {onClose && (
            <button type="button" className="quest-modal-close" onClick={onClose} aria-label={t("common.close")}>
              ✕
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

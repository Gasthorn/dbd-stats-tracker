import { Icon, useGameNames } from "../../settings";
import { useTranslation } from "react-i18next";

interface CharacterSectionProps {
  title: string;
  allNames: readonly string[];
  unlockedNames: string[];
  onToggle: (name: string) => void;
  onUnlockAll: () => void;
  onReset: () => void;
  disabled: boolean;
}

export function CharacterSection({
  title,
  allNames,
  unlockedNames,
  onToggle,
  onUnlockAll,
  onReset,
  disabled,
}: CharacterSectionProps) {
  const { t } = useTranslation();
  const tGameName = useGameNames();
  return (
    <section className="characters-section">
      <div className="characters-section-header">
        <h2>{title}</h2>
        <span className="characters-count">{t("characters.unlockedCount", { unlocked: unlockedNames.length, total: allNames.length })}</span>
        <div className="characters-section-actions">
          <button type="button" onClick={onUnlockAll} disabled={disabled}>
            {t("characters.unlockAll")}
          </button>
          <button type="button" onClick={onReset} disabled={disabled}>
            {t("common.reset")}
          </button>
        </div>
      </div>

      <div className="characters-grid">
        {allNames.map((name) => {
          const isUnlocked = unlockedNames.includes(name);
          return (
            <button
              type="button"
              key={name}
              className={`character-chip${isUnlocked ? " is-unlocked" : ""}`}
              aria-pressed={isUnlocked}
              disabled={disabled}
              onClick={() => onToggle(name)}
            >
              <Icon category="Characters" name={name} alt={name} size={56} />
              <span>{tGameName(name)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

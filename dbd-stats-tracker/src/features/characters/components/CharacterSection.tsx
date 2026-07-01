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
  return (
    <section className="characters-section">
      <div className="characters-section-header">
        <h2>{title}</h2>
        <span className="characters-count">
          {unlockedNames.length} / {allNames.length} débloqués
        </span>
        <div className="characters-section-actions">
          <button type="button" onClick={onUnlockAll} disabled={disabled}>
            Tout débloquer
          </button>
          <button type="button" onClick={onReset} disabled={disabled}>
            Réinitialiser
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
              {name}
            </button>
          );
        })}
      </div>
    </section>
  );
}

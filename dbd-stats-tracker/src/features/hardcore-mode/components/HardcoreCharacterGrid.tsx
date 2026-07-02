import { Icon } from "../../settings";

interface HardcoreCharacterGridProps {
  characters: readonly string[];
  deadCharacters: readonly string[];
  selected: string | null;
  onSelect: (name: string) => void;
}

export function HardcoreCharacterGrid({
  characters,
  deadCharacters,
  selected,
  onSelect,
}: HardcoreCharacterGridProps) {
  return (
    <div className="hardcore-char-grid">
      {characters.map((name) => {
        const isDead = deadCharacters.includes(name);
        return (
          <button
            type="button"
            key={name}
            className={`hardcore-char-item${isDead ? " is-blocked" : ""}${selected === name ? " is-selected" : ""}`}
            disabled={isDead}
            title={isDead ? `${name} (éliminé cette saison)` : name}
            onClick={() => onSelect(name)}
          >
            <Icon category="Characters" name={name} alt={name} size={80} />
            <span>{name}</span>
          </button>
        );
      })}
    </div>
  );
}

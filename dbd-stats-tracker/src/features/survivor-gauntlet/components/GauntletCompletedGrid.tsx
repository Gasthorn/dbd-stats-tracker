import { Icon } from "../../settings";

interface GauntletCompletedGridProps {
  characters: readonly string[];
}

export function GauntletCompletedGrid({ characters }: GauntletCompletedGridProps) {
  return (
    <div className="gauntlet-completed-section">
      <h3>Progression de la Collection</h3>
      <div className="gauntlet-completed-list">
        {characters.length === 0 ? (
          <p className="gauntlet-completed-empty">Aucun personnage validé pour le moment.</p>
        ) : (
          characters.map((name) => (
            <div key={name} className="gauntlet-completed-item" title={name}>
              <Icon category="Characters" name={name} alt={name} size={48} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import { Icon, useGameNames } from "../../settings";
import { useTranslation } from "react-i18next";

interface GauntletCompletedGridProps {
  characters: readonly string[];
}

export function GauntletCompletedGrid({ characters }: GauntletCompletedGridProps) {
  const { t } = useTranslation();
  const tGameName = useGameNames();
  return (
    <div className="gauntlet-completed-section">
      <h3>{t("gauntlet.collectionProgress")}</h3>
      <div className="gauntlet-completed-list">
        {characters.length === 0 ? (
          <p className="gauntlet-completed-empty">{t("gauntlet.noCompletedYet")}</p>
        ) : (
          characters.map((name) => (
            <div key={name} className="gauntlet-completed-item" title={tGameName(name)}>
              <Icon category="Characters" name={name} alt={name} size={64} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

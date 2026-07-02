import { useState } from "react";
import { pickIconsFolder } from "../lib/pickIconsFolder";
import { selectEffectiveIconsFolderPath, useSettingsStore } from "../stores/settings.store";
import { Icon } from "./Icon";
import "./settings.css";

export function IconsFolderSetting() {
  const iconsFolderPath = useSettingsStore((state) => state.iconsFolderPath);
  const defaultIconsFolderPath = useSettingsStore((state) => state.defaultIconsFolderPath);
  const effectivePath = useSettingsStore(selectEffectiveIconsFolderPath);
  const isUsingDefault = !iconsFolderPath && Boolean(defaultIconsFolderPath);
  const storeError = useSettingsStore((state) => state.error);
  const setIconsFolderPath = useSettingsStore((state) => state.setIconsFolderPath);
  const [error, setError] = useState<string | null>(null);

  async function handlePick() {
    setError(null);
    try {
      const path = await pickIconsFolder();
      if (path) await setIconsFolderPath(path);
    } catch {
      setError(
        "Sélection de dossier indisponible : cette fonctionnalité nécessite l'application de bureau.",
      );
    }
  }

  return (
    <div className="icons-folder-setting">
      <h3>Dossier d'icônes</h3>
      <p>
        Indique le dossier <code>Icons</code> (contenant <code>CharPortraits</code>,{" "}
        <code>Perks</code>, <code>ItemAddons</code>, <code>Items</code>) pour afficher les icônes
        des tueurs, survivants, perks et objets dans toute l'application.
      </p>

      {effectivePath ? (
        <p className="icons-folder-path">
          {isUsingDefault && <span className="icons-folder-path-badge">Par défaut</span>}
          {effectivePath}
        </p>
      ) : (
        <p className="icons-folder-path icons-folder-path-empty">Aucun dossier sélectionné</p>
      )}

      <div className="icons-folder-actions">
        <button type="button" onClick={handlePick}>
          {effectivePath ? "Changer de dossier" : "Choisir un dossier"}
        </button>
        {iconsFolderPath && (
          <button type="button" onClick={() => setIconsFolderPath(null)}>
            {defaultIconsFolderPath ? "Revenir au dossier par défaut" : "Effacer"}
          </button>
        )}
      </div>

      {error && <p className="match-error">{error}</p>}
      {storeError && <p className="match-error">{storeError}</p>}

      {effectivePath && (
        <div className="icons-folder-preview">
          <Icon category="Characters" name="The Trapper" alt="The Trapper" size={64} />
          <Icon category="Perks" name="Agitation" alt="Agitation" size={64} />
          <Icon category="Characters" name="Dwight Fairfield" alt="Dwight Fairfield" size={64} />
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { pickIconsFolder } from "../lib/pickIconsFolder";
import { selectEffectiveIconsFolderPath, useSettingsStore } from "../stores/settings.store";
import { Icon } from "./Icon";
import "./settings.css";

export function IconsFolderSetting() {
  const { t } = useTranslation();
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
      setError(t("settings.iconsFolder.pickerUnavailable"));
    }
  }

  return (
    <div className="icons-folder-setting">
      <h3>{t("settings.iconsFolder.title")}</h3>
      <p>{t("settings.iconsFolder.explanation")}</p>

      {effectivePath ? (
        <p className="icons-folder-path">
          {isUsingDefault && (
            <span className="icons-folder-path-badge">{t("settings.iconsFolder.defaultBadge")}</span>
          )}
          {effectivePath}
        </p>
      ) : (
        <p className="icons-folder-path icons-folder-path-empty">{t("settings.iconsFolder.noFolder")}</p>
      )}

      <div className="icons-folder-actions">
        <button type="button" onClick={handlePick}>
          {effectivePath ? t("settings.iconsFolder.changeFolder") : t("settings.iconsFolder.chooseFolder")}
        </button>
        {iconsFolderPath && (
          <button type="button" onClick={() => setIconsFolderPath(null)}>
            {defaultIconsFolderPath
              ? t("settings.iconsFolder.revertToDefault")
              : t("settings.iconsFolder.clear")}
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

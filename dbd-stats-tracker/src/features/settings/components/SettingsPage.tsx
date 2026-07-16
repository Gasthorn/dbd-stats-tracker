import { useTranslation } from "react-i18next";
import type { AppLanguage } from "../../../shared/i18n";
import type { GameNameLanguage } from "../../../shared/i18n/gameNames";
import { useSettingsStore } from "../stores/settings.store";
import { IconsFolderSetting } from "./IconsFolderSetting";
import "./settings.css";

/** Each language is labeled in itself (standard practice), so it stays findable whatever the current language. */
const LANGUAGE_OPTIONS: { value: AppLanguage; label: string }[] = [
  { value: "fr", label: "🇫🇷 Français" },
  { value: "en", label: "🇬🇧 English" },
  { value: "de", label: "🇩🇪 Deutsch" },
  { value: "it", label: "🇮🇹 Italiano" },
  { value: "es", label: "🇪🇸 Español" },
];

/** "en" shows the original names (also the storage/icon keys); labels use the app-language resources. */
const GAME_NAME_OPTIONS: { value: GameNameLanguage; label: string | null }[] = [
  { value: "en", label: null },
  { value: "fr", label: "🇫🇷 Français" },
  { value: "de", label: "🇩🇪 Deutsch" },
  { value: "it", label: "🇮🇹 Italiano" },
  { value: "es", label: "🇪🇸 Español" },
];

export function SettingsPage() {
  const { t } = useTranslation();
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const gameNameLanguage = useSettingsStore((state) => state.gameNameLanguage);
  const setGameNameLanguage = useSettingsStore((state) => state.setGameNameLanguage);

  return (
    <div className="page">
      <h1>{t("settings.title")}</h1>

      <section>
        <h2>{t("settings.appearance")}</h2>
        <div className="match-role-toggle">
          <button
            type="button"
            className={theme === "dark" ? "is-active" : ""}
            onClick={() => setTheme("dark")}
          >
            {t("settings.themeDark")}
          </button>
          <button
            type="button"
            className={theme === "light" ? "is-active" : ""}
            onClick={() => setTheme("light")}
          >
            {t("settings.themeLight")}
          </button>
        </div>
      </section>

      <section>
        <h2>{t("settings.language")}</h2>
        <div className="match-role-toggle">
          {LANGUAGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={language === option.value ? "is-active" : ""}
              onClick={() => setLanguage(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>{t("settings.gameNames")}</h2>
        <p className="settings-hint">{t("settings.gameNamesHint")}</p>
        <div className="match-role-toggle">
          {GAME_NAME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={gameNameLanguage === option.value ? "is-active" : ""}
              onClick={() => setGameNameLanguage(option.value)}
            >
              {option.label ?? t("settings.gameNamesOriginal")}
            </button>
          ))}
        </div>
      </section>

      <section>
        <IconsFolderSetting />
      </section>
    </div>
  );
}

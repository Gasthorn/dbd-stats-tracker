import { useSettingsStore } from "../stores/settings.store";
import { IconsFolderSetting } from "./IconsFolderSetting";
import "./settings.css";

export function SettingsPage() {
  const theme = useSettingsStore((state) => state.theme);
  const setTheme = useSettingsStore((state) => state.setTheme);

  return (
    <div className="page">
      <h1>Paramètres</h1>

      <section>
        <h2>Apparence</h2>
        <div className="match-role-toggle">
          <button
            type="button"
            className={theme === "dark" ? "is-active" : ""}
            onClick={() => setTheme("dark")}
          >
            🌙 Sombre
          </button>
          <button
            type="button"
            className={theme === "light" ? "is-active" : ""}
            onClick={() => setTheme("light")}
          >
            ☀️ Clair
          </button>
        </div>
      </section>

      <section>
        <IconsFolderSetting />
      </section>
    </div>
  );
}

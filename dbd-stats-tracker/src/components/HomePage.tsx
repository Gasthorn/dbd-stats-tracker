import { useTranslation } from "react-i18next";
import type { DashboardView } from "../App";
import "./HomePage.css";

/** Module cards mirror the nav tabs; each entry's key points into home.modules.* resources. */
const MODULES: { view: DashboardView; key: string }[] = [
  { view: "matches", key: "matches" },
  { view: "history", key: "history" },
  { view: "statistics", key: "statistics" },
  { view: "hardcore", key: "hardcore" },
  { view: "gauntlet", key: "gauntlet" },
  { view: "world-cup", key: "worldCup" },
  { view: "teams", key: "teams" },
  { view: "friends", key: "friends" },
  { view: "characters", key: "characters" },
  { view: "settings", key: "settings" },
];

interface HomePageProps {
  onNavigate: (view: DashboardView) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { t } = useTranslation();

  return (
    <div className="home-page">
      <h1>DbD Stats Tracker</h1>
      <p className="home-tagline">{t("home.tagline")}</p>

      <section className="home-modules">
        <h2>{t("home.modulesTitle")}</h2>
        <ul className="home-modules-list">
          {MODULES.map((module) => (
            <li key={module.view}>
              <button type="button" className="home-module-card" onClick={() => onNavigate(module.view)}>
                <strong>{t(`home.modules.${module.key}.title`)}</strong>
                <span>{t(`home.modules.${module.key}.description`)}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

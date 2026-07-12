import type { DashboardView } from "../App";
import { IconsFolderSetting } from "../features/settings";
import "./HomePage.css";

const MODULES: { view: DashboardView; title: string; description: string }[] = [
  {
    view: "matches",
    title: "Parties",
    description: "Enregistre chaque partie jouée : tueur ou survivant, perks, équipement, résultat.",
  },
  {
    view: "history",
    title: "Historique",
    description: "Consulte, modifie ou supprime les parties déjà enregistrées.",
  },
  {
    view: "statistics",
    title: "Statistiques",
    description: "Analyse tes performances globales, par tueur et par survivant.",
  },
  {
    view: "hardcore",
    title: "Hardcore Mode",
    description: "Suivi d'une saison à la mort permanente par personnage : pips, rangs, éliminations.",
  },
  {
    view: "gauntlet",
    title: "Survivor Gauntlet",
    description: "Défi consistant à gagner une partie avec chaque personnage débloqué, tueur ou survivant.",
  },
  {
    view: "world-cup",
    title: "World Cup",
    description:
      "Tournoi entre tueurs : poules façon Coupe du Monde départagées aux crochets, puis phase finale à élimination directe.",
  },
  {
    view: "teams",
    title: "Équipes",
    description: "Enregistre tes groupes Survive With Friends pour taguer tes parties survivant.",
  },
  {
    view: "friends",
    title: "Amis",
    description: "Ajoute d'autres joueurs de l'app, vois qui est en ligne et forme des équipes Hardcore.",
  },
  {
    view: "characters",
    title: "Personnages",
    description: "Gère la liste des tueurs et survivants que tu possèdes, pour filtrer le reste de l'app.",
  },
];

interface HomePageProps {
  onNavigate: (view: DashboardView) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="home-page">
      <h1>DbD Stats Tracker</h1>
      <p className="home-tagline">
        Application de suivi de statistiques pour Dead by Daylight : parties, builds, défis,
        tournois et progression, le tout enregistré dans ton compte.
      </p>

      <section className="home-modules">
        <h2>Modules</h2>
        <ul className="home-modules-list">
          {MODULES.map((module) => (
            <li key={module.view}>
              <button type="button" className="home-module-card" onClick={() => onNavigate(module.view)}>
                <strong>{module.title}</strong>
                <span>{module.description}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <IconsFolderSetting />
      </section>
    </div>
  );
}

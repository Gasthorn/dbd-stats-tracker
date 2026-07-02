import { IconsFolderSetting } from "../features/settings";
import "./HomePage.css";

const MODULES: { title: string; description: string }[] = [
  {
    title: "Parties",
    description: "Enregistre chaque partie jouée : tueur ou survivant, perks, équipement, résultat.",
  },
  {
    title: "Historique",
    description: "Consulte, modifie ou supprime les parties déjà enregistrées.",
  },
  {
    title: "Statistiques",
    description: "Analyse tes performances globales, par tueur et par survivant.",
  },
  {
    title: "Hardcore Mode",
    description: "Suivi d'une saison à la mort permanente par personnage : pips, rangs, éliminations.",
  },
  {
    title: "Survivor Gauntlet",
    description: "Défi consistant à gagner une partie avec chaque personnage débloqué, tueur ou survivant.",
  },
  {
    title: "World Cup",
    description:
      "Tournoi entre tueurs : poules façon Coupe du Monde départagées aux crochets, puis phase finale à élimination directe.",
  },
  {
    title: "Builds",
    description: "Sauvegarde tes loadouts favoris (perks et équipement) pour les réappliquer rapidement.",
  },
  {
    title: "Personnages",
    description: "Gère la liste des tueurs et survivants que tu possèdes, pour filtrer le reste de l'app.",
  },
];

export function HomePage() {
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
            <li key={module.title}>
              <strong>{module.title}</strong>
              <span>{module.description}</span>
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

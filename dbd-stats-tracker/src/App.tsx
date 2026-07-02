import { useEffect, useState } from "react";
import { AuthGate, useAuthStore } from "./features/auth";
import { CharacterUnlockPage } from "./features/characters";
import { MatchHistoryPage, MatchTrackerPage } from "./features/match-tracker";
import { IconsIndexPage, useSettingsStore } from "./features/settings";
import { HardcorePage } from "./features/hardcore-mode";
import { GauntletPage } from "./features/survivor-gauntlet";
import { StatisticsPage } from "./features/statistics";
import { WorldCupPage } from "./features/world-cup";
import { HomePage } from "./components/HomePage";
import "./App.css";

function App() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  );
}

type DashboardView =
  | "home"
  | "matches"
  | "history"
  | "statistics"
  | "hardcore"
  | "gauntlet"
  | "world-cup"
  | "characters"
  | "icons-index";

const TABS: { view: DashboardView; label: string }[] = [
  { view: "home", label: "Accueil" },
  { view: "matches", label: "Parties" },
  { view: "history", label: "Historique" },
  { view: "statistics", label: "Statistiques" },
  { view: "hardcore", label: "Hardcore" },
  { view: "gauntlet", label: "Gauntlet" },
  { view: "world-cup", label: "World Cup" },
  { view: "characters", label: "Personnages" },
  { view: "icons-index", label: "Index des icônes" },
];

function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const [view, setView] = useState<DashboardView>("home");

  useEffect(() => {
    useSettingsStore.getState().loadIconsFolderPath();
  }, []);

  return (
    <>
      <header className="app-header">
        <nav className="app-nav">
          {TABS.map((tab) => (
            <button
              key={tab.view}
              type="button"
              className={view === tab.view ? "is-active" : ""}
              onClick={() => setView(tab.view)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="app-user">
          <span>Connecté en tant que {user?.username}</span>
          <button type="button" onClick={() => signOut()}>
            Se déconnecter
          </button>
        </div>
      </header>

      <main className="app-content">
        {view === "characters" && <CharacterUnlockPage />}
        {view === "matches" && <MatchTrackerPage />}
        {view === "history" && <MatchHistoryPage />}
        {view === "statistics" && <StatisticsPage />}
        {view === "icons-index" && <IconsIndexPage />}
        {view === "hardcore" && <HardcorePage />}
        {view === "gauntlet" && <GauntletPage />}
        {view === "world-cup" && <WorldCupPage />}
        {view === "home" && <HomePage />}
      </main>
    </>
  );
}

export default App;

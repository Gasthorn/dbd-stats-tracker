import { useEffect, useState } from "react";
import { AuthGate, useAuthStore } from "./features/auth";
import { CharacterUnlockPage } from "./features/characters";
import { MatchHistoryPage, MatchTrackerPage } from "./features/match-tracker";
import { IconsIndexPage, SettingsPage, useSettingsStore } from "./features/settings";
import { HardcorePage } from "./features/hardcore-mode";
import { FriendRequestPopup, FriendsPage, useFriendsStore } from "./features/friends";
import { GauntletPage } from "./features/survivor-gauntlet";
import { StatisticsPage } from "./features/statistics";
import { TeamsPage } from "./features/teams";
import { WorldCupPage } from "./features/world-cup";
import { UpdateBanner } from "./features/updater";
import { HomePage } from "./components/HomePage";
import "./App.css";

function App() {
  return (
    <>
      <UpdateBanner />
      <AuthGate>
        <Dashboard />
      </AuthGate>
    </>
  );
}

export type DashboardView =
  | "home"
  | "matches"
  | "history"
  | "statistics"
  | "teams"
  | "friends"
  | "hardcore"
  | "gauntlet"
  | "world-cup"
  | "characters"
  | "icons-index"
  | "settings";

/** Nav tabs, split into logical groups rendered with a thin separator between them. */
const TAB_GROUPS: { view: DashboardView; label: string }[][] = [
  [
    { view: "home", label: "Accueil" },
    { view: "matches", label: "Parties" },
    { view: "history", label: "Historique" },
    { view: "statistics", label: "Statistiques" },
  ],
  [
    { view: "hardcore", label: "Hardcore" },
    { view: "gauntlet", label: "Gauntlet" },
    { view: "world-cup", label: "World Cup" },
  ],
  [
    { view: "teams", label: "Équipes" },
    { view: "friends", label: "Amis" },
  ],
  [
    { view: "characters", label: "Personnages" },
    { view: "icons-index", label: "Index des icônes" },
    { view: "settings", label: "Paramètres" },
  ],
];

const ALL_VIEWS = TAB_GROUPS.flat().map((tab) => tab.view);
const VIEW_STORAGE_KEY = "dashboard-view";

function loadInitialView(): DashboardView {
  const stored = localStorage.getItem(VIEW_STORAGE_KEY);
  return ALL_VIEWS.includes(stored as DashboardView) ? (stored as DashboardView) : "home";
}

function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const [view, setView] = useState<DashboardView>(loadInitialView);

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  useEffect(() => {
    useSettingsStore.getState().loadIconsFolderPath();
    useSettingsStore.getState().loadDefaultIconsFolderPath();
  }, []);

  useEffect(() => {
    useFriendsStore.getState().sendHeartbeat();
    const interval = setInterval(() => useFriendsStore.getState().sendHeartbeat(), 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <FriendRequestPopup />
      <header className="app-header">
        <nav className="app-nav">
          {TAB_GROUPS.map((group, groupIndex) => (
            <div key={groupIndex} className="app-nav-group">
              {groupIndex > 0 && <span className="app-nav-separator" aria-hidden="true" />}
              {group.map((tab) => (
                <button
                  key={tab.view}
                  type="button"
                  className={view === tab.view ? "is-active" : ""}
                  onClick={() => setView(tab.view)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="app-user">
          <span title={`Connecté en tant que ${user?.username}`}>{user?.username}</span>
          <button type="button" className="app-user-signout" onClick={() => signOut()}>
            Se déconnecter
          </button>
        </div>
      </header>

      <main className="app-content">
        {view === "characters" && <CharacterUnlockPage />}
        {view === "matches" && <MatchTrackerPage />}
        {view === "history" && <MatchHistoryPage />}
        {view === "statistics" && <StatisticsPage />}
        {view === "teams" && <TeamsPage />}
        {view === "friends" && <FriendsPage />}
        {view === "icons-index" && <IconsIndexPage />}
        {view === "settings" && <SettingsPage />}
        {view === "hardcore" && <HardcorePage />}
        {view === "gauntlet" && <GauntletPage />}
        {view === "world-cup" && <WorldCupPage />}
        {view === "home" && <HomePage onNavigate={setView} />}
      </main>
    </>
  );
}

export default App;

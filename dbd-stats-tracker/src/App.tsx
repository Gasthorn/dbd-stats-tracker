import { useState } from "react";
import { AuthGate, useAuthStore } from "./features/auth";
import { CharacterUnlockPage } from "./features/characters";
import { MatchHistoryPage, MatchTrackerPage } from "./features/match-tracker";
import { HomePage } from "./components/HomePage";
import "./App.css";

function App() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  );
}

type DashboardView = "home" | "characters" | "matches" | "history";

function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const [view, setView] = useState<DashboardView>("home");

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <nav style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" onClick={() => setView("home")}>
            Accueil
          </button>
          <button type="button" onClick={() => setView("matches")}>
            Parties
          </button>
          <button type="button" onClick={() => setView("history")}>
            Historique
          </button>
          <button type="button" onClick={() => setView("characters")}>
            Personnages
          </button>
        </nav>
        <p>Connecté en tant que {user?.username}</p>
        <button type="button" onClick={() => signOut()}>
          Se déconnecter
        </button>
      </div>

      {view === "characters" && <CharacterUnlockPage />}
      {view === "matches" && <MatchTrackerPage />}
      {view === "history" && <MatchHistoryPage />}
      {view === "home" && <HomePage />}
    </main>
  );
}

export default App;

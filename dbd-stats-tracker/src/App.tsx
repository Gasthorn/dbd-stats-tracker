import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { AuthGate, useAuthStore } from "./features/auth";
import { CharacterUnlockPage } from "./features/characters";
import { MatchHistoryPage, MatchTrackerPage } from "./features/match-tracker";
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
      {view === "home" && <Home />}
    </main>
  );
}

function Home() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <>
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vite.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </>
  );
}

export default App;

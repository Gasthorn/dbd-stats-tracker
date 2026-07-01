import { useEffect } from "react";
import { useCharactersStore } from "../../characters/stores/characters.store";
import { useMatchTrackerStore } from "../stores/match-tracker.store";
import { AddMatchForm } from "./AddMatchForm";
import { MatchHistoryList } from "./MatchHistoryList";
import "./match-tracker.css";

export function MatchTrackerPage() {
  const charactersStatus = useCharactersStore((state) => state.status);
  const fetchCharacters = useCharactersStore((state) => state.fetch);
  const matches = useMatchTrackerStore((state) => state.matches);
  const fetchMatches = useMatchTrackerStore((state) => state.fetchMatches);

  useEffect(() => {
    if (charactersStatus === "idle") {
      fetchCharacters();
    }
    fetchMatches();
  }, [charactersStatus, fetchCharacters, fetchMatches]);

  return (
    <div className="match-tracker-page">
      <AddMatchForm />

      <div className="match-history">
        <h2>Historique récent</h2>
        <MatchHistoryList matches={matches} />
      </div>
    </div>
  );
}

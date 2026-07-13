import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useCharactersStore } from "../../characters/stores/characters.store";
import { useMatchTrackerStore } from "../stores/match-tracker.store";
import { MatchForm } from "./MatchForm";
import { MatchHistoryList } from "./MatchHistoryList";
import "./match-tracker.css";

export function MatchTrackerPage() {
  const { t } = useTranslation();
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
      <MatchForm />

      <div className="match-history">
        <h2>{t("history.recentTitle")}</h2>
        <MatchHistoryList matches={matches} />
      </div>
    </div>
  );
}

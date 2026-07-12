import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useEffect, useRef, useState } from "react";
import { useCharactersStore } from "../../characters/stores/characters.store";
import { useMatchTrackerStore } from "../stores/match-tracker.store";
import type { Match, MatchRole } from "../types/match.types";
import { MatchForm } from "./MatchForm";
import { MatchHistoryList } from "./MatchHistoryList";
import "./match-tracker.css";

type RoleFilter = MatchRole | "all";

export function MatchHistoryPage() {
  const charactersStatus = useCharactersStore((state) => state.status);
  const fetchCharacters = useCharactersStore((state) => state.fetch);
  const matches = useMatchTrackerStore((state) => state.matches);
  const status = useMatchTrackerStore((state) => state.status);
  const error = useMatchTrackerStore((state) => state.error);
  const fetchMatches = useMatchTrackerStore((state) => state.fetchMatches);
  const deleteMatch = useMatchTrackerStore((state) => state.deleteMatch);

  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const editFormRef = useRef<HTMLDivElement | null>(null);

  function handleEdit(match: Match) {
    setEditingMatch(match);
    // The edit form lives at the top of the page; bring the user to it.
    requestAnimationFrame(() => {
      editFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  useEffect(() => {
    if (charactersStatus === "idle") {
      fetchCharacters();
    }
  }, [charactersStatus, fetchCharacters]);

  useEffect(() => {
    fetchMatches(roleFilter === "all" ? {} : { role: roleFilter });
  }, [roleFilter, fetchMatches]);

  async function handleDelete(match: Match) {
    if (!confirm(`Supprimer la partie "${match.characterName}" du ${new Date(match.playedAt).toLocaleString()} ?`)) {
      return;
    }
    setDeleteError(null);
    setDeletingId(match.id);
    try {
      await deleteMatch(match.id);
      if (editingMatch?.id === match.id) {
        setEditingMatch(null);
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Impossible de supprimer la partie.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="match-history-page">
      <h1>Historique des parties</h1>

      {editingMatch && (
        <div ref={editFormRef}>
          <MatchForm
            key={editingMatch.id}
            match={editingMatch}
            onSuccess={() => setEditingMatch(null)}
            onCancel={() => setEditingMatch(null)}
          />
        </div>
      )}

      <label htmlFor="match-history-role-filter" className="match-history-filter">
        Filtrer par rôle :{" "}
        <select
          id="match-history-role-filter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
        >
          <option value="all">Tous</option>
          <option value="killer">Tueur</option>
          <option value="survivor">Survivant</option>
        </select>
      </label>

      {error && <p className="match-error">{error}</p>}
      {deleteError && <p className="match-error">{deleteError}</p>}
      {status === "loading" && <LoadingSpinner />}

      <MatchHistoryList matches={matches} onEdit={handleEdit} onDelete={handleDelete} />
      {deletingId && <p>Suppression en cours...</p>}
    </div>
  );
}

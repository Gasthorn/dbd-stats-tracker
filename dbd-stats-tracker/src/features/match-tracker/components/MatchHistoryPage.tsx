import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "../../../shared/i18n";
import { useCharactersStore } from "../../characters/stores/characters.store";
import { useMatchTrackerStore } from "../stores/match-tracker.store";
import type { Match, MatchRole } from "../types/match.types";
import { MatchForm } from "./MatchForm";
import { MatchHistoryList } from "./MatchHistoryList";
import "./match-tracker.css";

type RoleFilter = MatchRole | "all";

export function MatchHistoryPage() {
  const { t } = useTranslation();
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
    if (!confirm(t("history.deleteConfirm", { character: match.characterName, date: new Date(match.playedAt).toLocaleString(getDateLocale()) }))) {
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
      setDeleteError(err instanceof Error ? err.message : t("history.deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="match-history-page">
      <h1>{t("history.title")}</h1>

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
        {t("history.filterByRole")}{" "}
        <select
          id="match-history-role-filter"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
        >
          <option value="all">{t("history.allRoles")}</option>
          <option value="killer">{t("common.killer")}</option>
          <option value="survivor">{t("common.survivor")}</option>
        </select>
      </label>

      {error && <p className="match-error">{error}</p>}
      {deleteError && <p className="match-error">{deleteError}</p>}
      {status === "loading" && <LoadingSpinner />}

      <MatchHistoryList matches={matches} onEdit={handleEdit} onDelete={handleDelete} />
      {deletingId && <p>{t("history.deleting")}</p>}
    </div>
  );
}

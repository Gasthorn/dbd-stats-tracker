import { LoadingSpinner } from "../../../shared/components/LoadingSpinner";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFriendsStore } from "../../friends";
import { useTeamsStore } from "../stores/teams.store";
import type { Team } from "../types/team.types";
import "./teams.css";

const EMPTY_MEMBERS: [string, string, string] = ["", "", ""];

export function TeamsPage() {
  const { t } = useTranslation();
  const teams = useTeamsStore((state) => state.teams);
  const status = useTeamsStore((state) => state.status);
  const storeError = useTeamsStore((state) => state.error);
  const fetchTeams = useTeamsStore((state) => state.fetchTeams);
  const saveTeamAction = useTeamsStore((state) => state.saveTeam);
  const deleteTeamAction = useTeamsStore((state) => state.deleteTeam);

  const friendships = useFriendsStore((state) => state.friendships);
  const fetchFriendships = useFriendsStore((state) => state.fetchFriendships);

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [members, setMembers] = useState<[string, string, string]>(EMPTY_MEMBERS);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (status === "idle") fetchTeams();
  }, [status, fetchTeams]);

  useEffect(() => {
    // Always refetch (not idle-gated): the shared friends store may already be
    // "success" from the app-wide request popup, but stale relative to any
    // friendship accepted since then - this list needs to be current.
    fetchFriendships();
  }, [fetchFriendships]);

  const friendUsernames = useMemo(
    () => friendships.filter((f) => f.status === "accepted").map((f) => f.friendUsername),
    [friendships],
  );

  function updateMember(index: number, value: string) {
    setMembers((prev) => {
      const next = [...prev] as [string, string, string];
      next[index] = value;
      return next;
    });
  }

  function handleReset() {
    setEditingTeamId(null);
    setName("");
    setMembers(EMPTY_MEMBERS);
    setFormError(null);
    setSuccessMessage(null);
  }

  function handleEdit(team: Team) {
    setEditingTeamId(team.id);
    setName(team.name);
    const padded = [...team.memberNames, "", "", ""].slice(0, 3);
    setMembers(padded as [string, string, string]);
    setFormError(null);
    setSuccessMessage(null);
    // The edit form lives at the top of the page; bring the user to it.
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function handleSave() {
    setFormError(null);
    setSuccessMessage(null);
    if (!name.trim()) {
      setFormError(t("teams.nameRequired"));
      return;
    }

    setIsSaving(true);
    try {
      const team = await saveTeamAction({
        name: name.trim(),
        memberNames: members.map((member) => member.trim()).filter((member) => member !== ""),
      });
      setEditingTeamId(team.id);
      setSuccessMessage(t("teams.saved", { name: team.name }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("teams.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(team: Team) {
    if (!confirm(t("teams.deleteConfirm", { name: team.name }))) return;
    setFormError(null);
    try {
      await deleteTeamAction(team.id);
      setSuccessMessage(t("teams.deleted", { name: team.name }));
      if (editingTeamId === team.id) handleReset();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("teams.deleteFailed"));
    }
  }

  return (
    <div className="teams-page">
      <h1>{t("teams.title")}</h1>
      <p className="teams-hint">{t("teams.hint")}</p>

      <div className="teams-form" ref={formRef}>
        <h3>{editingTeamId ? t("teams.editTitle") : t("teams.newTitle")}</h3>

        <label htmlFor="team-name">{t("teams.nameLabel")}</label>
        <input
          id="team-name"
          type="text"
          placeholder={t("teams.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="teams-members-grid">
          {members.map((member, index) => (
            <div key={index}>
              <label htmlFor={`team-member-${index}`}>{t("teams.memberLabel", { index: index + 1 })}</label>
              <input
                id={`team-member-${index}`}
                type="text"
                placeholder={t("teams.memberPlaceholder")}
                list="team-member-options"
                value={member}
                onChange={(e) => updateMember(index, e.target.value)}
              />
            </div>
          ))}
        </div>
        <datalist id="team-member-options">
          {friendUsernames.map((username) => (
            <option key={username} value={username} />
          ))}
        </datalist>

        <div className="teams-form-actions">
          <button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? t("teams.savePending") : editingTeamId ? t("teams.update") : t("teams.save")}
          </button>
          <button type="button" onClick={handleReset}>
            {editingTeamId ? t("common.cancel") : t("common.reset")}
          </button>
        </div>

        {formError && <p className="match-error">{formError}</p>}
        {storeError && <p className="match-error">{storeError}</p>}
        {successMessage && <p className="match-success">{successMessage}</p>}
      </div>

      {status === "loading" && teams.length === 0 && <LoadingSpinner />}
      {status !== "loading" && teams.length === 0 && (
        <p className="statistics-empty">{t("teams.empty")}</p>
      )}

      {teams.length > 0 && (
        <div className="teams-list">
          {teams.map((team) => (
            <div key={team.id} className="teams-card">
              <h4>{team.name}</h4>
              {team.memberNames.length > 0 ? (
                <ul className="teams-member-list">
                  {team.memberNames.map((member) => (
                    <li key={member}>{member}</li>
                  ))}
                </ul>
              ) : (
                <p className="teams-no-members">{t("teams.noMembers")}</p>
              )}
              <div className="teams-card-actions">
                <button type="button" onClick={() => handleEdit(team)}>
                  {t("common.edit")}
                </button>
                <button type="button" className="btn-danger" onClick={() => handleDelete(team)}>
                  {t("common.delete")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useTeamsStore } from "../stores/teams.store";
import type { Team } from "../types/team.types";
import "./teams.css";

const EMPTY_MEMBERS: [string, string, string] = ["", "", ""];

export function TeamsPage() {
  const teams = useTeamsStore((state) => state.teams);
  const status = useTeamsStore((state) => state.status);
  const storeError = useTeamsStore((state) => state.error);
  const fetchTeams = useTeamsStore((state) => state.fetchTeams);
  const saveTeamAction = useTeamsStore((state) => state.saveTeam);
  const deleteTeamAction = useTeamsStore((state) => state.deleteTeam);

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [members, setMembers] = useState<[string, string, string]>(EMPTY_MEMBERS);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "idle") fetchTeams();
  }, [status, fetchTeams]);

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
  }

  async function handleSave() {
    setFormError(null);
    setSuccessMessage(null);
    if (!name.trim()) {
      setFormError("Veuillez donner un nom à l'équipe.");
      return;
    }

    setIsSaving(true);
    try {
      const team = await saveTeamAction({
        name: name.trim(),
        memberNames: members.map((member) => member.trim()).filter((member) => member !== ""),
      });
      setEditingTeamId(team.id);
      setSuccessMessage(`Équipe "${team.name}" enregistrée !`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Impossible d'enregistrer l'équipe.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(team: Team) {
    if (!confirm(`Voulez-vous vraiment supprimer l'équipe "${team.name}" ?`)) return;
    setFormError(null);
    try {
      await deleteTeamAction(team.id);
      setSuccessMessage(`Équipe "${team.name}" supprimée.`);
      if (editingTeamId === team.id) handleReset();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Impossible de supprimer l'équipe.");
    }
  }

  return (
    <div className="teams-page">
      <h1>Équipes</h1>
      <p className="teams-hint">
        Enregistre tes groupes Survive With Friends (jusqu'à 3 coéquipiers par équipe) pour les retrouver
        rapidement.
      </p>

      <div className="teams-form">
        <h3>{editingTeamId ? "Modifier l'équipe" : "Nouvelle équipe"}</h3>

        <label htmlFor="team-name">Nom de l'équipe</label>
        <input
          id="team-name"
          type="text"
          placeholder="Ex: Squad du dimanche"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="teams-members-grid">
          {members.map((member, index) => (
            <div key={index}>
              <label htmlFor={`team-member-${index}`}>Coéquipier {index + 1}</label>
              <input
                id={`team-member-${index}`}
                type="text"
                placeholder="Pseudo (optionnel)"
                value={member}
                onChange={(e) => updateMember(index, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="teams-form-actions">
          <button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Enregistrement..." : editingTeamId ? "Mettre à jour" : "Enregistrer cette équipe"}
          </button>
          <button type="button" onClick={handleReset}>
            {editingTeamId ? "Annuler" : "Réinitialiser"}
          </button>
        </div>

        {formError && <p className="match-error">{formError}</p>}
        {storeError && <p className="match-error">{storeError}</p>}
        {successMessage && <p className="match-success">{successMessage}</p>}
      </div>

      {status === "loading" && teams.length === 0 && <p>Chargement...</p>}
      {status !== "loading" && teams.length === 0 && (
        <p className="statistics-empty">Aucune équipe enregistrée pour le moment.</p>
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
                <p className="teams-no-members">Aucun coéquipier renseigné.</p>
              )}
              <div className="teams-card-actions">
                <button type="button" onClick={() => handleEdit(team)}>
                  Modifier
                </button>
                <button type="button" className="btn-secondary" onClick={() => handleDelete(team)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

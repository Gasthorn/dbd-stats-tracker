import { useEffect, useMemo, useState } from "react";
import { useBuildsStore } from "../stores/builds.store";
import type { Build } from "../types/build.types";
import type { MatchRole } from "../../match-tracker/types/match.types";
import "./build-manager-panel.css";

interface BuildManagerPanelProps {
  idPrefix: string;
  role: MatchRole;
  characterName: string;
  perks: string[];
  equipment: string[];
  /** Applies a loaded build's perks/equipment (and character, except in Gauntlet mode where it's fixed by the draw) to the parent form. */
  onApply: (build: Build) => void;
  /** Clears the parent form's perks/equipment back to empty. */
  onReset: () => void;
}

export function BuildManagerPanel({
  idPrefix,
  role,
  characterName,
  perks,
  equipment,
  onApply,
  onReset,
}: BuildManagerPanelProps) {
  const builds = useBuildsStore((state) => state.builds);
  const status = useBuildsStore((state) => state.status);
  const storeError = useBuildsStore((state) => state.error);
  const fetchBuilds = useBuildsStore((state) => state.fetchBuilds);
  const saveBuildAction = useBuildsStore((state) => state.saveBuild);
  const deleteBuildAction = useBuildsStore((state) => state.deleteBuild);

  const [name, setName] = useState("");
  const [selectedBuildId, setSelectedBuildId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "idle") fetchBuilds();
  }, [status, fetchBuilds]);

  const availableBuilds = useMemo(() => builds.filter((b) => b.role === role), [builds, role]);

  async function handleSave() {
    setFormError(null);
    setSuccessMessage(null);
    if (!name.trim()) {
      setFormError("Veuillez donner un nom à votre build.");
      return;
    }
    if (!characterName) {
      setFormError("Sélectionnez un personnage avant d'enregistrer un build.");
      return;
    }

    setIsSaving(true);
    try {
      const build = await saveBuildAction({
        name: name.trim(),
        role,
        characterName,
        perks: perks.filter((perk) => perk !== ""),
        equipment: equipment.filter((item) => item !== ""),
      });
      setSelectedBuildId(build.id);
      setSuccessMessage(`Build "${build.name}" enregistré !`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Impossible d'enregistrer le build.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleLoad(buildId: string) {
    setSelectedBuildId(buildId);
    setFormError(null);
    setSuccessMessage(null);
    if (!buildId) return;
    const build = availableBuilds.find((b) => b.id === buildId);
    if (build) {
      setName(build.name);
      onApply(build);
    }
  }

  async function handleDelete() {
    if (!selectedBuildId) {
      setFormError("Veuillez sélectionner un build à supprimer.");
      return;
    }
    const build = availableBuilds.find((b) => b.id === selectedBuildId);
    if (!build) return;
    if (!confirm(`Voulez-vous vraiment supprimer le build "${build.name}" ?`)) return;

    setFormError(null);
    try {
      await deleteBuildAction(build.id);
      setSuccessMessage(`Build "${build.name}" supprimé.`);
      setName("");
      setSelectedBuildId("");
      onReset();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Impossible de supprimer le build.");
    }
  }

  function handleReset() {
    setName("");
    setSelectedBuildId("");
    setFormError(null);
    setSuccessMessage(null);
    onReset();
  }

  return (
    <div className="build-manager-panel">
      <h3>Gestion du Build</h3>

      <div className="build-manager-row">
        <input
          id={`${idPrefix}-build-name`}
          type="text"
          placeholder="Nom du build (ex: Genrush, Anti-Loop)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Enregistrement..." : "Enregistrer ce build"}
        </button>
        <button type="button" onClick={handleReset}>
          Réinitialiser le build
        </button>
        <button type="button" className="btn-secondary" onClick={handleDelete}>
          Supprimer le build
        </button>
      </div>

      <label htmlFor={`${idPrefix}-load-build-select`}>Charger un build :</label>
      <select
        id={`${idPrefix}-load-build-select`}
        value={selectedBuildId}
        onChange={(e) => handleLoad(e.target.value)}
      >
        <option value="">-- Sélectionner --</option>
        {availableBuilds.map((build) => (
          <option key={build.id} value={build.id}>
            {build.name}
          </option>
        ))}
      </select>

      {formError && <p className="match-error">{formError}</p>}
      {storeError && <p className="match-error">{storeError}</p>}
      {successMessage && <p className="match-success">{successMessage}</p>}
    </div>
  );
}

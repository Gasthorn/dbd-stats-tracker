import { useMemo, useState, type FormEvent } from "react";
import { KILLERS } from "../../../shared/data/characters";
import { KILLER_ADDONS, SURVIVOR_ADDONS, SURVIVOR_ITEMS } from "../../../shared/data/equipment";
import { KILLER_PERKS, SURVIVOR_PERKS } from "../../../shared/data/perks";
import { useCharactersStore } from "../../characters/stores/characters.store";
import { IconSelectionSlot } from "../../settings";
import { getKillerAddonRarity, rarityClassName } from "../../../shared/lib/icons/rarity";
import "../../../shared/styles/rarity.css";
import { BuildManagerPanel } from "../../builds";
import type { Build } from "../../builds";
import { useMatchTrackerStore } from "../stores/match-tracker.store";
import type { CreateMatchInput, EscapeResult, Match, MatchRole } from "../types/match.types";

const ESCAPE_RESULT_OPTIONS: { value: EscapeResult; label: string }[] = [
  { value: "escaped_door", label: "Évadé par la porte" },
  { value: "escaped_hatch", label: "Évadé par la trappe" },
  { value: "sacrificed", label: "Sacrifié" },
  { value: "killed", label: "Tué" },
  { value: "disconnected", label: "Déconnecté" },
];

const EMPTY_PERKS: [string, string, string, string] = ["", "", "", ""];

function emptyEquipment(role: MatchRole): string[] {
  return role === "killer" ? ["", ""] : ["", "", ""];
}

function toPerksTuple(perks: string[]): [string, string, string, string] {
  const padded = [...perks, "", "", "", ""].slice(0, 4);
  return padded as [string, string, string, string];
}

function toEquipmentArray(equipment: string[], role: MatchRole): string[] {
  const size = role === "killer" ? 2 : 3;
  const padded = [...equipment, "", "", ""].slice(0, size);
  return padded;
}

interface MatchFormProps {
  /** When provided, the form edits this match instead of creating a new one. */
  match?: Match;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MatchForm({ match, onSuccess, onCancel }: MatchFormProps) {
  const isEditing = match !== undefined;
  const unlockedKillers = useCharactersStore((state) => state.unlockedKillers);
  const unlockedSurvivors = useCharactersStore((state) => state.unlockedSurvivors);
  const createMatch = useMatchTrackerStore((state) => state.createMatch);
  const updateMatch = useMatchTrackerStore((state) => state.updateMatch);

  const [role, setRole] = useState<MatchRole>(match?.role ?? "killer");
  const [characterName, setCharacterName] = useState(match?.characterName ?? "");
  const [opponentName, setOpponentName] = useState(match?.opponentName ?? "");
  const [perks, setPerks] = useState<[string, string, string, string]>(
    match ? toPerksTuple(match.perks) : EMPTY_PERKS,
  );
  const [equipment, setEquipment] = useState<string[]>(
    match ? toEquipmentArray(match.equipment, match.role) : emptyEquipment("killer"),
  );
  const [bloodpoints, setBloodpoints] = useState(match ? String(match.bloodpoints) : "");
  const [kills, setKills] = useState(match?.kills !== undefined && match?.kills !== null ? String(match.kills) : "0");
  const [hooks, setHooks] = useState(
    match?.role === "killer" && match.hooks !== null ? String(match.hooks) : "",
  );
  const [generatorsCompleted, setGeneratorsCompleted] = useState(
    match ? String(match.generatorsCompleted) : "0",
  );
  const [escapeResult, setEscapeResult] = useState<EscapeResult>(
    match?.escapeResult ?? "escaped_door",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const unlockedCharacters = role === "killer" ? unlockedKillers : unlockedSurvivors;

  const availablePerks = useMemo(() => {
    const catalog = role === "killer" ? KILLER_PERKS : SURVIVOR_PERKS;
    return catalog.filter(
      (perk) => perk.owner === "Base Kit" || unlockedCharacters.includes(perk.owner),
    );
  }, [role, unlockedCharacters]);

  const killerAddonOptions = useMemo(
    () => (role === "killer" ? (KILLER_ADDONS[characterName] ?? []) : []),
    [role, characterName],
  );

  const survivorAddonOptions = useMemo(() => {
    if (role !== "survivor") return [];
    const group = SURVIVOR_ADDONS.find((entry) => entry.itemType === equipment[0]);
    return group ? group.addons : [];
  }, [role, equipment]);

  function switchRole(nextRole: MatchRole) {
    setRole(nextRole);
    setCharacterName("");
    setPerks(EMPTY_PERKS);
    setEquipment(emptyEquipment(nextRole));
    setFormError(null);
    setSuccessMessage(null);
  }

  function updatePerk(index: number, value: string) {
    setPerks((prev) => {
      const next = [...prev] as [string, string, string, string];
      next[index] = value;
      return next;
    });
  }

  function updateEquipment(index: number, value: string) {
    setEquipment((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleApplyBuild(build: Build) {
    setCharacterName(build.characterName);
    setPerks(toPerksTuple(build.perks));
    setEquipment(toEquipmentArray(build.equipment, role));
  }

  function handleResetBuild() {
    setPerks(EMPTY_PERKS);
    setEquipment(emptyEquipment(role));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!characterName) {
      setFormError("Sélectionnez un personnage.");
      return;
    }
    if (role === "survivor" && !opponentName) {
      setFormError("Sélectionnez le tueur adverse.");
      return;
    }

    const cleanedPerks = perks.filter((perk) => perk !== "");
    const cleanedEquipment = equipment.filter((item) => item !== "");

    const input: CreateMatchInput =
      role === "killer"
        ? {
            role: "killer",
            mode: "normal",
            hardcoreRunId: null,
            characterName,
            opponentName: null,
            perks: cleanedPerks,
            equipment: cleanedEquipment,
            bloodpoints: Number(bloodpoints) || 0,
            kills: Number(kills),
            hooks: hooks === "" ? null : Number(hooks),
            generatorsCompleted: Number(generatorsCompleted),
            escapeResult: null,
            hardcorePips: null,
            hardcoreDied: null,
            ignoreChallenge: false,
          }
        : {
            role: "survivor",
            mode: "normal",
            hardcoreRunId: null,
            characterName,
            opponentName,
            perks: cleanedPerks,
            equipment: cleanedEquipment,
            bloodpoints: Number(bloodpoints) || 0,
            kills: null,
            hooks: null,
            generatorsCompleted: Number(generatorsCompleted),
            escapeResult,
            hardcorePips: null,
            hardcoreDied: null,
            ignoreChallenge: false,
          };

    setIsSubmitting(true);
    try {
      if (isEditing && match) {
        await updateMatch({ ...input, id: match.id });
        onSuccess?.();
      } else {
        await createMatch(input);
        setSuccessMessage("Partie enregistrée !");
        setCharacterName("");
        setOpponentName("");
        setPerks(EMPTY_PERKS);
        setEquipment(emptyEquipment(role));
        setBloodpoints("");
        setKills("0");
        setHooks("");
        setGeneratorsCompleted("0");
        setEscapeResult("escaped_door");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Impossible d'enregistrer la partie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="match-form" onSubmit={handleSubmit}>
      <h2>{isEditing ? "Modifier la partie" : "Ajouter une partie"}</h2>

      {isEditing ? (
        <p className="match-role-label">{role === "killer" ? "Tueur" : "Survivant"}</p>
      ) : (
        <div className="match-role-toggle">
          <button
            type="button"
            className={role === "killer" ? "is-active" : ""}
            onClick={() => switchRole("killer")}
          >
            Tueur
          </button>
          <button
            type="button"
            className={role === "survivor" ? "is-active" : ""}
            onClick={() => switchRole("survivor")}
          >
            Survivant
          </button>
        </div>
      )}

      <BuildManagerPanel
        idPrefix="match"
        role={role}
        characterName={characterName}
        perks={perks}
        equipment={equipment}
        onApply={handleApplyBuild}
        onReset={handleResetBuild}
      />

      <label htmlFor="match-character">Personnage</label>
      <IconSelectionSlot
        as="select"
        id="match-character"
        category="Characters"
        value={characterName}
        onChange={setCharacterName}
        size={96}
      >
        <option value="">-- Sélectionner --</option>
        {unlockedCharacters.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </IconSelectionSlot>

      {role === "survivor" && (
        <>
          <label htmlFor="match-opponent">Tueur adverse</label>
          <IconSelectionSlot
            as="select"
            id="match-opponent"
            category="Characters"
            value={opponentName}
            onChange={setOpponentName}
            size={96}
          >
            <option value="">-- Sélectionner --</option>
            {KILLERS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </IconSelectionSlot>
        </>
      )}

      <label>Perks</label>
      <div className="match-perks-grid">
        {perks.map((perk, index) => (
          <IconSelectionSlot
            key={index}
            category="Perks"
            value={perk}
            onChange={(value) => updatePerk(index, value)}
            listId={`match-perks-options-${index}`}
            placeholder={`Perk ${index + 1}`}
            diamond
            size={68}
          />
        ))}
      </div>
      {perks.map((_, index) => (
        <datalist id={`match-perks-options-${index}`} key={index}>
          {availablePerks.map((perk) => (
            <option key={perk.name} value={perk.name} />
          ))}
        </datalist>
      ))}

      <label>Équipement</label>
      {role === "survivor" ? (
        <>
          <IconSelectionSlot
            as="select"
            category="Items"
            value={equipment[0]}
            onChange={(value) => updateEquipment(0, value)}
            size={84}
          >
            <option value="">-- Objet --</option>
            {SURVIVOR_ITEMS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </IconSelectionSlot>
          <div className="match-form-row">
            <IconSelectionSlot
              category="Addons"
              value={equipment[1]}
              onChange={(value) => updateEquipment(1, value)}
              listId="match-survivor-addon-options"
              placeholder="Accessoire 1"
              size={84}
            />
            <IconSelectionSlot
              category="Addons"
              value={equipment[2]}
              onChange={(value) => updateEquipment(2, value)}
              listId="match-survivor-addon-options"
              placeholder="Accessoire 2"
              size={84}
            />
          </div>
          <datalist id="match-survivor-addon-options">
            {survivorAddonOptions.map((addon) => (
              <option key={addon} value={addon} />
            ))}
          </datalist>
        </>
      ) : (
        <div className="match-form-row">
          <IconSelectionSlot
            category="Addons"
            value={equipment[0]}
            onChange={(value) => updateEquipment(0, value)}
            manualOwner={characterName}
            listId="match-killer-addon-options"
            placeholder="Accessoire 1"
            size={84}
            className={rarityClassName(getKillerAddonRarity(characterName, equipment[0]))}
          />
          <IconSelectionSlot
            category="Addons"
            value={equipment[1]}
            onChange={(value) => updateEquipment(1, value)}
            manualOwner={characterName}
            listId="match-killer-addon-options"
            placeholder="Accessoire 2"
            size={84}
            className={rarityClassName(getKillerAddonRarity(characterName, equipment[1]))}
          />
          <datalist id="match-killer-addon-options">
            {killerAddonOptions.map((addon) => (
              <option key={addon} value={addon} />
            ))}
          </datalist>
        </div>
      )}

      <label htmlFor="match-bloodpoints">Points de sang</label>
      <input
        id="match-bloodpoints"
        type="number"
        min={0}
        value={bloodpoints}
        onChange={(e) => setBloodpoints(e.target.value)}
      />

      <label htmlFor="match-gens">Générateurs terminés ({generatorsCompleted})</label>
      <input
        id="match-gens"
        type="range"
        min={0}
        max={5}
        value={generatorsCompleted}
        onChange={(e) => setGeneratorsCompleted(e.target.value)}
      />

      {role === "killer" ? (
        <>
          <label htmlFor="match-kills">Survivants sacrifiés (0-4)</label>
          <input
            id="match-kills"
            type="number"
            min={0}
            max={4}
            value={kills}
            onChange={(e) => setKills(e.target.value)}
          />

          <label htmlFor="match-hooks">Crochets (optionnel)</label>
          <input
            id="match-hooks"
            type="number"
            min={0}
            value={hooks}
            onChange={(e) => setHooks(e.target.value)}
          />
        </>
      ) : (
        <>
          <label htmlFor="match-escape-result">Issue du match</label>
          <select
            id="match-escape-result"
            value={escapeResult}
            onChange={(e) => setEscapeResult(e.target.value as EscapeResult)}
          >
            {ESCAPE_RESULT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </>
      )}

      {formError && <p className="match-error">{formError}</p>}
      {successMessage && <p className="match-success">{successMessage}</p>}

      <div className="match-form-row">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Enregistrement..."
            : isEditing
              ? "Enregistrer les modifications"
              : "Enregistrer la partie"}
        </button>
        {isEditing && (
          <button type="button" onClick={onCancel} disabled={isSubmitting}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}

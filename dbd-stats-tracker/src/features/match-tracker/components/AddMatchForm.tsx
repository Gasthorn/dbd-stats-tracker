import { useMemo, useState, type FormEvent } from "react";
import { KILLERS } from "../../../shared/data/characters";
import { KILLER_ADDONS, SURVIVOR_ADDONS, SURVIVOR_ITEMS } from "../../../shared/data/equipment";
import { KILLER_PERKS, SURVIVOR_PERKS } from "../../../shared/data/perks";
import { useCharactersStore } from "../../characters/stores/characters.store";
import { useMatchTrackerStore } from "../stores/match-tracker.store";
import type { CreateMatchInput, EscapeResult, MatchRole } from "../types/match.types";

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

export function AddMatchForm() {
  const unlockedKillers = useCharactersStore((state) => state.unlockedKillers);
  const unlockedSurvivors = useCharactersStore((state) => state.unlockedSurvivors);
  const createMatch = useMatchTrackerStore((state) => state.createMatch);

  const [role, setRole] = useState<MatchRole>("killer");
  const [characterName, setCharacterName] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [perks, setPerks] = useState<[string, string, string, string]>(EMPTY_PERKS);
  const [equipment, setEquipment] = useState<string[]>(emptyEquipment("killer"));
  const [bloodpoints, setBloodpoints] = useState("");
  const [kills, setKills] = useState("0");
  const [generatorsCompleted, setGeneratorsCompleted] = useState("0");
  const [escapeResult, setEscapeResult] = useState<EscapeResult>("escaped_door");
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
            generatorsCompleted: Number(generatorsCompleted),
            escapeResult,
            hardcorePips: null,
            hardcoreDied: null,
            ignoreChallenge: false,
          };

    setIsSubmitting(true);
    try {
      await createMatch(input);
      setSuccessMessage("Partie enregistrée !");
      setCharacterName("");
      setOpponentName("");
      setPerks(EMPTY_PERKS);
      setEquipment(emptyEquipment(role));
      setBloodpoints("");
      setKills("0");
      setGeneratorsCompleted("0");
      setEscapeResult("escaped_door");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Impossible d'enregistrer la partie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="match-form" onSubmit={handleSubmit}>
      <h2>Ajouter une partie</h2>

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

      <label htmlFor="match-character">Personnage</label>
      <select
        id="match-character"
        value={characterName}
        onChange={(e) => setCharacterName(e.target.value)}
      >
        <option value="">-- Sélectionner --</option>
        {unlockedCharacters.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      {role === "survivor" && (
        <>
          <label htmlFor="match-opponent">Tueur adverse</label>
          <select
            id="match-opponent"
            value={opponentName}
            onChange={(e) => setOpponentName(e.target.value)}
          >
            <option value="">-- Sélectionner --</option>
            {KILLERS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </>
      )}

      <label>Perks</label>
      <div className="match-perks-grid">
        {perks.map((perk, index) => (
          <input
            key={index}
            list={`match-perks-options-${index}`}
            value={perk}
            placeholder={`Perk ${index + 1}`}
            onChange={(e) => updatePerk(index, e.target.value)}
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
          <select value={equipment[0]} onChange={(e) => updateEquipment(0, e.target.value)}>
            <option value="">-- Objet --</option>
            {SURVIVOR_ITEMS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <div className="match-form-row">
            <input
              list="match-survivor-addon-options"
              value={equipment[1]}
              placeholder="Accessoire 1"
              onChange={(e) => updateEquipment(1, e.target.value)}
            />
            <input
              list="match-survivor-addon-options"
              value={equipment[2]}
              placeholder="Accessoire 2"
              onChange={(e) => updateEquipment(2, e.target.value)}
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
          <input
            list="match-killer-addon-options"
            value={equipment[0]}
            placeholder="Accessoire 1"
            onChange={(e) => updateEquipment(0, e.target.value)}
          />
          <input
            list="match-killer-addon-options"
            value={equipment[1]}
            placeholder="Accessoire 2"
            onChange={(e) => updateEquipment(1, e.target.value)}
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

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement..." : "Enregistrer la partie"}
      </button>
    </form>
  );
}

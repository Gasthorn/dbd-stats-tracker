import { useMemo, useState, type FormEvent } from "react";
import { KILLERS } from "../../../shared/data/characters";
import { KILLER_ADDONS, SURVIVOR_ADDONS, SURVIVOR_ITEMS } from "../../../shared/data/equipment";
import { KILLER_PERKS, SURVIVOR_PERKS } from "../../../shared/data/perks";
import { getAvailableHardcorePerks } from "../../../shared/lib/hardcore/rank";
import { getKillerAddonRarity, rarityClassName } from "../../../shared/lib/icons/rarity";
import "../../../shared/styles/rarity.css";
import { BuildManagerPanel } from "../../builds";
import type { Build } from "../../builds";
import { IconSelectionSlot } from "../../settings";
import type { MatchRole } from "../../match-tracker/types/match.types";
import { useHardcoreStore } from "../stores/hardcore.store";

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

interface HardcoreMatchFormProps {
  role: MatchRole;
  characterName: string;
  unlockedCharacters: readonly string[];
  deadCharacters: readonly string[];
  onDone: () => void;
  onCancel: () => void;
}

export function HardcoreMatchForm({
  role,
  characterName,
  unlockedCharacters,
  deadCharacters,
  onDone,
  onCancel,
}: HardcoreMatchFormProps) {
  const recordMatch = useHardcoreStore((state) => state.recordMatch);

  const [opponentName, setOpponentName] = useState("");
  const [perks, setPerks] = useState<[string, string, string, string]>(EMPTY_PERKS);
  const [equipment, setEquipment] = useState<string[]>(emptyEquipment(role));
  const [bloodpoints, setBloodpoints] = useState("");
  const [generatorsCompleted, setGeneratorsCompleted] = useState("0");
  const [pips, setPips] = useState("0");
  const [died, setDied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const availablePerks = useMemo(() => {
    const catalog = role === "killer" ? KILLER_PERKS : SURVIVOR_PERKS;
    return getAvailableHardcorePerks(catalog, unlockedCharacters, deadCharacters, characterName);
  }, [role, unlockedCharacters, deadCharacters, characterName]);

  const killerAddonOptions = role === "killer" ? (KILLER_ADDONS[characterName] ?? []) : [];
  const survivorAddonOptions = useMemo(() => {
    if (role !== "survivor") return [];
    const group = SURVIVOR_ADDONS.find((entry) => entry.itemType === equipment[0]);
    return group ? group.addons : [];
  }, [role, equipment]);

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
    setPerks(toPerksTuple(build.perks));
    setEquipment(toEquipmentArray(build.equipment, role));
  }

  function handleResetBuild() {
    setPerks(EMPTY_PERKS);
    setEquipment(emptyEquipment(role));
  }

  async function submit(ignoreChallenge: boolean, event?: FormEvent) {
    event?.preventDefault();
    if (role === "survivor" && !opponentName) {
      setFormError("Sélectionnez le tueur adverse.");
      return;
    }
    setFormError(null);
    setIsSubmitting(true);

    const cleanedPerks = perks.filter((perk) => perk !== "");
    const cleanedEquipment = equipment.filter((item) => item !== "");

    try {
      await recordMatch({
        match:
          role === "killer"
            ? {
                role: "killer",
                characterName,
                opponentName: null,
                teamId: null,
                perks: cleanedPerks,
                equipment: cleanedEquipment,
                bloodpoints: Number(bloodpoints) || 0,
                kills: 0,
                hooks: null,
                generatorsCompleted: Number(generatorsCompleted),
                escapeResult: null,
              }
            : {
                role: "survivor",
                characterName,
                opponentName,
                teamId: null,
                perks: cleanedPerks,
                equipment: cleanedEquipment,
                bloodpoints: Number(bloodpoints) || 0,
                kills: null,
                hooks: null,
                generatorsCompleted: Number(generatorsCompleted),
                escapeResult: died ? "sacrificed" : "escaped_door",
              },
        pips: Number(pips),
        died,
        ignoreChallenge,
      });
      onDone();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Impossible d'enregistrer le match.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const deathLabel = role === "killer" ? "Évasion par la porte ?" : "Mort en partie ?";

  return (
    <form className="match-form hardcore-match-form" onSubmit={(e) => submit(false, e)}>
      <h3>{characterName}</h3>

      <BuildManagerPanel
        idPrefix="hc"
        role={role}
        characterName={characterName}
        perks={perks}
        equipment={equipment}
        onApply={handleApplyBuild}
        onReset={handleResetBuild}
      />

      {role === "survivor" && (
        <>
          <label htmlFor="hc-opponent">Tueur affronté</label>
          <IconSelectionSlot
            as="select"
            id="hc-opponent"
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
            listId={`hc-perks-options-${index}`}
            placeholder={`Perk ${index + 1}`}
            diamond
            size={68}
          />
        ))}
      </div>
      {perks.map((_, index) => (
        <datalist id={`hc-perks-options-${index}`} key={index}>
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
              listId="hc-survivor-addon-options"
              placeholder="Accessoire 1"
              size={84}
            />
            <IconSelectionSlot
              category="Addons"
              value={equipment[2]}
              onChange={(value) => updateEquipment(2, value)}
              listId="hc-survivor-addon-options"
              placeholder="Accessoire 2"
              size={84}
            />
          </div>
          <datalist id="hc-survivor-addon-options">
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
            listId="hc-killer-addon-options"
            placeholder="Accessoire 1"
            size={84}
            className={rarityClassName(getKillerAddonRarity(characterName, equipment[0]))}
          />
          <IconSelectionSlot
            category="Addons"
            value={equipment[1]}
            onChange={(value) => updateEquipment(1, value)}
            manualOwner={characterName}
            listId="hc-killer-addon-options"
            placeholder="Accessoire 2"
            size={84}
            className={rarityClassName(getKillerAddonRarity(characterName, equipment[1]))}
          />
          <datalist id="hc-killer-addon-options">
            {killerAddonOptions.map((addon) => (
              <option key={addon} value={addon} />
            ))}
          </datalist>
        </div>
      )}

      <label htmlFor="hc-bloodpoints">Points de sang</label>
      <input
        id="hc-bloodpoints"
        type="number"
        min={0}
        value={bloodpoints}
        onChange={(e) => setBloodpoints(e.target.value)}
      />

      <label htmlFor="hc-gens">Générateurs terminés ({generatorsCompleted})</label>
      <input
        id="hc-gens"
        type="range"
        min={0}
        max={5}
        value={generatorsCompleted}
        onChange={(e) => setGeneratorsCompleted(e.target.value)}
      />

      <div className="match-form-row">
        <div>
          <label htmlFor="hc-pips">Pips gagnés</label>
          <select id="hc-pips" value={pips} onChange={(e) => setPips(e.target.value)}>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </div>
        <label htmlFor="hc-died" style={{ marginTop: "1.5rem" }}>
          {deathLabel}
          <input
            id="hc-died"
            type="checkbox"
            checked={died}
            onChange={(e) => setDied(e.target.checked)}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>

      {formError && <p className="match-error">{formError}</p>}

      <div className="match-form-row">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Valider le résultat"}
        </button>
        <button type="button" disabled={isSubmitting} onClick={() => submit(true)} title="Enregistre dans l'historique mais ignore pour le défi">
          Enregistrer & ignorer défi
        </button>
        <button type="button" disabled={isSubmitting} onClick={onCancel}>
          Annuler
        </button>
      </div>
    </form>
  );
}

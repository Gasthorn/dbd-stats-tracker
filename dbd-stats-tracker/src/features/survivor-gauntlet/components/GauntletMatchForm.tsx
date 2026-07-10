import { useMemo, useState, type FormEvent } from "react";
import { KILLERS } from "../../../shared/data/characters";
import { KILLER_ADDONS, SURVIVOR_ADDONS, SURVIVOR_ITEMS } from "../../../shared/data/equipment";
import { KILLER_PERKS, SURVIVOR_PERKS } from "../../../shared/data/perks";
import {
  getCharacterUniquePerkNames,
  getGauntletTierInfo,
  isGauntletBuildValid,
} from "../../../shared/lib/gauntlet/tier";
import { getKillerAddonRarity, rarityClassName } from "../../../shared/lib/icons/rarity";
import "../../../shared/styles/rarity.css";
import { BuildManagerPanel } from "../../builds";
import type { Build } from "../../builds";
import { IconSelectionSlot } from "../../settings";
import type { EscapeResult, MatchRole } from "../../match-tracker/types/match.types";
import { useGauntletStore } from "../stores/gauntlet.store";

const KILLS_OPTIONS = [0, 1, 2, 3, 4];
const ESCAPE_OPTIONS: { value: "died" | "escaped_hatch" | "escaped_door"; label: string }[] = [
  { value: "died", label: "Mort" },
  { value: "escaped_hatch", label: "Trappe" },
  { value: "escaped_door", label: "Porte" },
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

interface GauntletMatchFormProps {
  role: MatchRole;
  characterName: string;
  unlockedCharacters: readonly string[];
  totalUnlocked: number;
  completedCount: number;
  onDone: () => void;
  onCancel: () => void;
}

export function GauntletMatchForm({
  role,
  characterName,
  unlockedCharacters,
  totalUnlocked,
  completedCount,
  onDone,
  onCancel,
}: GauntletMatchFormProps) {
  const recordMatch = useGauntletStore((state) => state.recordMatch);

  const [opponentName, setOpponentName] = useState("");
  const [perks, setPerks] = useState<[string, string, string, string]>(EMPTY_PERKS);
  const [equipment, setEquipment] = useState<string[]>(emptyEquipment(role));
  const [bloodpoints, setBloodpoints] = useState("");
  const [generatorsCompleted, setGeneratorsCompleted] = useState("0");
  const [kills, setKills] = useState("0");
  const [outcome, setOutcome] = useState<"died" | "escaped_hatch" | "escaped_door">("died");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const tier = getGauntletTierInfo(completedCount, totalUnlocked);

  const uniquePerkNames = useMemo(
    () => getCharacterUniquePerkNames(role === "killer" ? KILLER_PERKS : SURVIVOR_PERKS, characterName),
    [role, characterName],
  );

  const availablePerks = useMemo(() => {
    const catalog = role === "killer" ? KILLER_PERKS : SURVIVOR_PERKS;
    return catalog.filter(
      (perk) => perk.owner === "Base Kit" || unlockedCharacters.includes(perk.owner),
    );
  }, [role, unlockedCharacters]);

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
    setFormError(null);

    if (!bloodpoints) {
      setFormError("Veuillez saisir les points de sang.");
      return;
    }
    if (role === "survivor" && !opponentName) {
      setFormError("Sélectionnez le tueur adverse.");
      return;
    }
    if (!ignoreChallenge && !isGauntletBuildValid(perks, uniquePerkNames, tier)) {
      setFormError(`Votre build ne respecte pas les restrictions du Gauntlet (${tier.perksLabel}).`);
      return;
    }

    setIsSubmitting(true);
    const cleanedPerks = perks.filter((perk) => perk !== "");
    const cleanedEquipment = equipment.filter((item) => item !== "");
    const win = role === "killer" ? Number(kills) >= 3 : outcome !== "died";
    const escapeResult: EscapeResult =
      outcome === "died" ? "sacrificed" : outcome === "escaped_hatch" ? "escaped_hatch" : "escaped_door";

    try {
      await recordMatch({
        role,
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
                kills: Number(kills),
                hooks: null,
                generatorsCompleted: Number(generatorsCompleted),
                escapeResult: null,
                hardcoreRunId: null,
                hardcoreTeamId: null,
                hardcorePips: null,
                hardcoreDied: null,
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
                escapeResult,
                hardcoreRunId: null,
                hardcoreTeamId: null,
                hardcorePips: null,
                hardcoreDied: null,
              },
        win,
        ignoreChallenge,
      });
      onDone();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Impossible d'enregistrer le match.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="match-form gauntlet-match-form" onSubmit={(e) => submit(false, e)}>
      <h4>Enregistrer le résultat</h4>

      <BuildManagerPanel
        idPrefix="gauntlet"
        role={role}
        characterName={characterName}
        perks={perks}
        equipment={equipment}
        onApply={handleApplyBuild}
        onReset={handleResetBuild}
      />

      {role === "survivor" && (
        <>
          <label htmlFor="gauntlet-opponent">Tueur affronté</label>
          <IconSelectionSlot
            as="select"
            id="gauntlet-opponent"
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
            listId={index === 0 ? "gauntlet-unique-perks-options" : "gauntlet-perks-options"}
            placeholder={`Perk ${index + 1}`}
            diamond
            size={68}
          />
        ))}
      </div>
      <datalist id="gauntlet-unique-perks-options">
        {uniquePerkNames.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <datalist id="gauntlet-perks-options">
        {availablePerks.map((perk) => (
          <option key={perk.name} value={perk.name} />
        ))}
      </datalist>

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
              listId="gauntlet-survivor-addon-options"
              placeholder="Accessoire 1"
              size={84}
            />
            <IconSelectionSlot
              category="Addons"
              value={equipment[2]}
              onChange={(value) => updateEquipment(2, value)}
              listId="gauntlet-survivor-addon-options"
              placeholder="Accessoire 2"
              size={84}
            />
          </div>
          <datalist id="gauntlet-survivor-addon-options">
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
            listId="gauntlet-killer-addon-options"
            placeholder="Accessoire 1"
            size={84}
            className={rarityClassName(getKillerAddonRarity(characterName, equipment[0]))}
          />
          <IconSelectionSlot
            category="Addons"
            value={equipment[1]}
            onChange={(value) => updateEquipment(1, value)}
            manualOwner={characterName}
            listId="gauntlet-killer-addon-options"
            placeholder="Accessoire 2"
            size={84}
            className={rarityClassName(getKillerAddonRarity(characterName, equipment[1]))}
          />
          <datalist id="gauntlet-killer-addon-options">
            {killerAddonOptions.map((addon) => (
              <option key={addon} value={addon} />
            ))}
          </datalist>
        </div>
      )}

      <label htmlFor="gauntlet-bloodpoints">Points de sang</label>
      <input
        id="gauntlet-bloodpoints"
        type="number"
        min={0}
        value={bloodpoints}
        onChange={(e) => setBloodpoints(e.target.value)}
      />

      <label htmlFor="gauntlet-gens">Générateurs terminés ({generatorsCompleted})</label>
      <input
        id="gauntlet-gens"
        type="range"
        min={0}
        max={5}
        value={generatorsCompleted}
        onChange={(e) => setGeneratorsCompleted(e.target.value)}
      />

      {role === "killer" ? (
        <>
          <label htmlFor="gauntlet-kills">Survivants éliminés (0-4)</label>
          <select id="gauntlet-kills" value={kills} onChange={(e) => setKills(e.target.value)}>
            {KILLS_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </>
      ) : (
        <>
          <label htmlFor="gauntlet-outcome">Issue</label>
          <select
            id="gauntlet-outcome"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as typeof outcome)}
          >
            {ESCAPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </>
      )}

      {formError && <p className="match-error">{formError}</p>}

      <div className="match-form-row">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Valider Match"}
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => submit(true)}
          title="Enregistre dans l'historique mais ignore pour le défi"
        >
          Enregistrer & ignorer défi
        </button>
        <button type="button" disabled={isSubmitting} onClick={onCancel}>
          Annuler
        </button>
      </div>
    </form>
  );
}

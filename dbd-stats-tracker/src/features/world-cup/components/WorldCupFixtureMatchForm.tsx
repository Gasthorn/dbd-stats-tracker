import { useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { KILLER_ADDONS } from "../../../shared/data/equipment";
import { KILLER_PERKS } from "../../../shared/data/perks";
import { getCharacterUniquePerkNames } from "../../../shared/lib/gauntlet/tier";
import { getKillerAddonRarity, rarityClassName } from "../../../shared/lib/icons/rarity";
import "../../../shared/styles/rarity.css";
import { BuildManagerPanel } from "../../builds";
import type { Build } from "../../builds";
import { useCharactersStore } from "../../characters/stores/characters.store";
import { IconSelectionSlot } from "../../settings";
import type { WorldCupMatchInput } from "../stores/world-cup.store.types";

const EMPTY_PERKS: [string, string, string, string] = ["", "", "", ""];
const MIN_OWNED_PERKS = 2;

function toPerksTuple(perks: string[]): [string, string, string, string] {
  const padded = [...perks, "", "", "", ""].slice(0, 4);
  return padded as [string, string, string, string];
}

function toEquipmentPair(equipment: string[]): string[] {
  const padded = [...equipment, "", ""].slice(0, 2);
  return padded;
}

interface WorldCupFixtureMatchFormProps {
  characterName: string;
  onSubmit: (input: WorldCupMatchInput) => Promise<void>;
  onCancel: () => void;
}

export function WorldCupFixtureMatchForm({ characterName, onSubmit, onCancel }: WorldCupFixtureMatchFormProps) {
  const { t } = useTranslation();
  const unlockedKillers = useCharactersStore((state) => state.unlockedKillers);

  const [perks, setPerks] = useState<[string, string, string, string]>(EMPTY_PERKS);
  const [equipment, setEquipment] = useState<string[]>(["", ""]);
  const [bloodpoints, setBloodpoints] = useState("");
  const [kills, setKills] = useState("0");
  const [hooks, setHooks] = useState("");
  const [generatorsCompleted, setGeneratorsCompleted] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const availablePerks = useMemo(
    () => KILLER_PERKS.filter((perk) => perk.owner === "Base Kit" || unlockedKillers.includes(perk.owner)),
    [unlockedKillers],
  );
  const uniquePerkNames = useMemo(() => getCharacterUniquePerkNames(KILLER_PERKS, characterName), [characterName]);
  const killerAddonOptions = KILLER_ADDONS[characterName] ?? [];

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
    setEquipment(toEquipmentPair(build.equipment));
  }

  function handleResetBuild() {
    setPerks(EMPTY_PERKS);
    setEquipment(["", ""]);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (hooks === "") {
      setFormError(t("worldCup.hooksRequired"));
      return;
    }

    const cleanedPerks = perks.filter((perk) => perk !== "");
    const ownedPerkCount = cleanedPerks.filter((perk) => uniquePerkNames.includes(perk)).length;
    if (ownedPerkCount < MIN_OWNED_PERKS) {
      setFormError(t("worldCup.buildNeedsOwnPerks", { count: MIN_OWNED_PERKS, name: characterName }));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        characterName,
        perks: cleanedPerks,
        equipment: equipment.filter((item) => item !== ""),
        bloodpoints: Number(bloodpoints) || 0,
        kills: Number(kills),
        hooks: Number(hooks),
        generatorsCompleted: Number(generatorsCompleted),
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("matchForm.saveFailed"));
      setIsSubmitting(false);
    }
  }

  return (
    <form className="match-form world-cup-fixture-form" onSubmit={handleSubmit}>
      <BuildManagerPanel
        idPrefix="world-cup"
        role="killer"
        characterName={characterName}
        perks={perks}
        equipment={equipment}
        onApply={handleApplyBuild}
        onReset={handleResetBuild}
      />

      <label>{t("matchForm.perks")}</label>
      <div className="match-perks-grid">
        {perks.map((perk, index) => (
          <IconSelectionSlot
            key={index}
            category="Perks"
            value={perk}
            onChange={(value) => updatePerk(index, value)}
            listId={`world-cup-perks-options-${index}`}
            placeholder={t("matchForm.perkPlaceholder", { index: index + 1 })}
            diamond
            size={68}
          />
        ))}
      </div>
      {perks.map((_, index) => (
        <datalist id={`world-cup-perks-options-${index}`} key={index}>
          {availablePerks.map((perk) => (
            <option key={perk.name} value={perk.name} />
          ))}
        </datalist>
      ))}

      <label>{t("worldCup.accessories")}</label>
      <div className="match-form-row">
        <IconSelectionSlot
          category="Addons"
          value={equipment[0]}
          onChange={(value) => updateEquipment(0, value)}
          manualOwner={characterName}
          listId="world-cup-killer-addon-options"
          placeholder={t("matchForm.addonPlaceholder", { index: 1 })}
          size={84}
          className={rarityClassName(getKillerAddonRarity(characterName, equipment[0]))}
        />
        <IconSelectionSlot
          category="Addons"
          value={equipment[1]}
          onChange={(value) => updateEquipment(1, value)}
          manualOwner={characterName}
          listId="world-cup-killer-addon-options"
          placeholder={t("matchForm.addonPlaceholder", { index: 2 })}
          size={84}
          className={rarityClassName(getKillerAddonRarity(characterName, equipment[1]))}
        />
        <datalist id="world-cup-killer-addon-options">
          {killerAddonOptions.map((addon) => (
            <option key={addon} value={addon} />
          ))}
        </datalist>
      </div>

      <label htmlFor="world-cup-hooks">{t("worldCup.hooksLabel")}</label>
      <input
        id="world-cup-hooks"
        type="number"
        min={0}
        value={hooks}
        onChange={(e) => setHooks(e.target.value)}
        required
      />

      <label htmlFor="world-cup-kills">{t("matchForm.kills")}</label>
      <input
        id="world-cup-kills"
        type="number"
        min={0}
        max={4}
        value={kills}
        onChange={(e) => setKills(e.target.value)}
      />

      <label htmlFor="world-cup-bloodpoints">{t("matchForm.bloodpoints")}</label>
      <input
        id="world-cup-bloodpoints"
        type="number"
        min={0}
        value={bloodpoints}
        onChange={(e) => setBloodpoints(e.target.value)}
      />

      <label htmlFor="world-cup-gens">{t("matchForm.generatorsCompleted", { count: Number(generatorsCompleted) })}</label>
      <input
        id="world-cup-gens"
        type="range"
        min={0}
        max={5}
        value={generatorsCompleted}
        onChange={(e) => setGeneratorsCompleted(e.target.value)}
      />

      {formError && <p className="match-error">{formError}</p>}

      <div className="match-form-row">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("matchForm.submitPending") : t("worldCup.submitMatch")}
        </button>
        <button type="button" onClick={onCancel} disabled={isSubmitting}>
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}

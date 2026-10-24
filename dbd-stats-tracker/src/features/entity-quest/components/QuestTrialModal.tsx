import { useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { KILLERS } from "../../../shared/data/characters";
import { KILLER_ADDONS } from "../../../shared/data/equipment";
import { getObjective } from "../../../shared/lib/entity-quest/objectives";
import { collectionNames, getAddonItem } from "../../../shared/lib/entity-quest/pools";
import { getKillerAddonRarity, rarityClassName } from "../../../shared/lib/icons/rarity";
import "../../../shared/styles/rarity.css";
import { IconSelectionSlot, useGameNames } from "../../settings";
import type { EscapeResult } from "../../match-tracker/types/match.types";
import { useEntityQuestStore } from "../stores/entity-quest.store";
import type { EntityQuestRun, QuestMapNode } from "../types/entity-quest.types";
import { objectiveLabel } from "./objectiveLabel";
import { QuestModal } from "./QuestModal";

const KILLS_OPTIONS = [0, 1, 2, 3, 4];
const HOOKS_OPTIONS = Array.from({ length: 13 }, (_, hooks) => hooks);
const ASSIST_OPTIONS = Array.from({ length: 11 }, (_, count) => count);
type SurvivorOutcome = "died" | "escaped_hatch" | "escaped_door";
const OUTCOME_OPTIONS: { value: SurvivorOutcome; labelKey: string }[] = [
  { value: "died", labelKey: "entityQuest.form.outcomeDied" },
  { value: "escaped_hatch", labelKey: "entityQuest.form.outcomeHatch" },
  { value: "escaped_door", labelKey: "entityQuest.form.outcomeDoor" },
];

interface QuestTrialModalProps {
  run: EntityQuestRun;
  node: QuestMapNode;
  /** Survivors the player owns in-game (survivor runs pick freely among them). */
  ownedSurvivors: readonly string[];
  onClose: () => void;
}

/**
 * Records the match played for a trial. Loadout choices are restricted to the run's
 * collection - that restriction IS the roguelike: you can only play what you unlocked.
 */
export function QuestTrialModal({ run, node, ownedSurvivors, onClose }: QuestTrialModalProps) {
  const { t } = useTranslation();
  const tGameName = useGameNames();
  const recordTrial = useEntityQuestStore((state) => state.recordTrial);
  const { role, state } = run;
  const objective = getObjective(run.difficulty, role, node);
  const questId = state.activeQuestId;

  const collectedCharacters = collectionNames(state.collection, "character");
  const collectedPerks = collectionNames(state.collection, "perk");
  const collectedEquipment = collectionNames(state.collection, "equipment");
  const characterOptions = role === "killer" ? collectedCharacters : ownedSurvivors;

  const [characterName, setCharacterName] = useState(characterOptions.length === 1 ? characterOptions[0] : "");
  const [opponentName, setOpponentName] = useState("");
  const [perks, setPerks] = useState<string[]>(["", "", "", ""]);
  const [item, setItem] = useState("");
  const [addons, setAddons] = useState<string[]>(["", ""]);
  const [bloodpoints, setBloodpoints] = useState("");
  const [generatorsCompleted, setGeneratorsCompleted] = useState("0");
  const [kills, setKills] = useState("0");
  const [hooks, setHooks] = useState("0");
  const [unhooks, setUnhooks] = useState("0");
  const [heals, setHeals] = useState("0");
  const [outcome, setOutcome] = useState<SurvivorOutcome>("died");
  const [questCompleted, setQuestCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const ownedItems = collectedEquipment.filter((name) => getAddonItem(name) === null);
  const addonOptions = useMemo(
    () =>
      role === "killer"
        ? [...(KILLER_ADDONS[characterName] ?? [])]
        : collectedEquipment.filter((name) => item !== "" && getAddonItem(name) === item),
    [role, characterName, item, collectedEquipment],
  );

  function updateAt(setter: (update: (prev: string[]) => string[]) => void, index: number, value: string) {
    setter((prev) => prev.map((entry, i) => (i === index ? value : entry)));
  }

  function changeCharacter(value: string) {
    setCharacterName(value);
    if (role === "killer") setAddons(["", ""]);
  }

  function changeItem(value: string) {
    setItem(value);
    setAddons(["", ""]);
  }

  async function submit(ignoreChallenge: boolean, event?: FormEvent) {
    event?.preventDefault();
    setFormError(null);

    if (!characterName) {
      setFormError(t("entityQuest.form.characterRequired"));
      return;
    }
    if (role === "survivor" && !opponentName) {
      setFormError(t("matchForm.selectOpponent"));
      return;
    }
    if (!bloodpoints) {
      setFormError(t("entityQuest.form.bloodpointsRequired"));
      return;
    }

    setIsSubmitting(true);
    const cleanedPerks = perks.filter((perk) => perk !== "");
    const cleanedAddons = addons.filter((addon) => addon !== "");
    const escapeResult: EscapeResult =
      outcome === "died" ? "sacrificed" : outcome === "escaped_hatch" ? "escaped_hatch" : "escaped_door";

    try {
      await recordTrial({
        role,
        questCompleted,
        ignoreChallenge,
        match:
          role === "killer"
            ? {
                role: "killer",
                characterName,
                opponentName: null,
                teamId: null,
                perks: cleanedPerks,
                equipment: cleanedAddons,
                bloodpoints: Number(bloodpoints) || 0,
                kills: Number(kills),
                hooks: Number(hooks),
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
                equipment: item ? [item, ...cleanedAddons] : [],
                bloodpoints: Number(bloodpoints) || 0,
                kills: null,
                hooks: null,
                generatorsCompleted: Number(generatorsCompleted),
                escapeResult,
                unhooks: Number(unhooks),
                heals: Number(heals),
                hardcoreRunId: null,
                hardcoreTeamId: null,
                hardcorePips: null,
                hardcoreDied: null,
              },
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("entityQuest.form.saveFailed"));
      setIsSubmitting(false);
    }
  }

  const title =
    node.type === "boss"
      ? t("entityQuest.trialBossTitle")
      : t("entityQuest.trialTitle", { type: t(`entityQuest.nodeTypes.${node.type}`), floor: node.floor + 1 });

  return (
    <QuestModal title={title} onClose={isSubmitting ? undefined : onClose} wide>
      <form className="match-form quest-trial-form" onSubmit={(e) => submit(false, e)}>
        <div className="quest-objective">
          <span className="quest-hud-label">{t("entityQuest.objective.title")}</span>
          <strong>{objectiveLabel(t, objective)}</strong>
        </div>

        <label htmlFor="quest-character">
          {role === "killer" ? t("entityQuest.form.killer") : t("entityQuest.form.survivor")}
        </label>
        <IconSelectionSlot
          as="select"
          id="quest-character"
          category="Characters"
          value={characterName}
          onChange={changeCharacter}
          size={96}
        >
          <option value="">{t("common.select")}</option>
          {characterOptions.map((name) => (
            <option key={name} value={name}>
              {tGameName(name)}
            </option>
          ))}
        </IconSelectionSlot>

        {role === "survivor" && (
          <>
            <label htmlFor="quest-opponent">{t("entityQuest.form.opponent")}</label>
            <IconSelectionSlot
              as="select"
              id="quest-opponent"
              category="Characters"
              value={opponentName}
              onChange={setOpponentName}
              size={96}
            >
              <option value="">{t("common.select")}</option>
              {KILLERS.map((name) => (
                <option key={name} value={name}>
                  {tGameName(name)}
                </option>
              ))}
            </IconSelectionSlot>
          </>
        )}

        <label>{t("matchForm.perks")}</label>
        <div className="match-perks-grid">
          {perks.map((perk, index) => (
            <IconSelectionSlot
              key={index}
              as="select"
              category="Perks"
              value={perk}
              onChange={(value) => updateAt(setPerks, index, value)}
              diamond
              size={68}
            >
              <option value="">{t("matchForm.perkPlaceholder", { index: index + 1 })}</option>
              {collectedPerks
                .filter((name) => name === perk || !perks.includes(name))
                .map((name) => (
                  <option key={name} value={name}>
                    {tGameName(name)}
                  </option>
                ))}
            </IconSelectionSlot>
          ))}
        </div>

        <label>{t("matchForm.equipment")}</label>
        {role === "survivor" && (
          <IconSelectionSlot as="select" category="Items" value={item} onChange={changeItem} size={84}>
            <option value="">{t("entityQuest.form.noItem")}</option>
            {ownedItems.map((name) => (
              <option key={name} value={name}>
                {tGameName(name)}
              </option>
            ))}
          </IconSelectionSlot>
        )}
        <div className="match-form-row">
          {addons.map((addon, index) => (
            <IconSelectionSlot
              key={index}
              as="select"
              category="Addons"
              value={addon}
              onChange={(value) => updateAt(setAddons, index, value)}
              manualOwner={role === "killer" ? characterName : null}
              size={84}
              className={role === "killer" ? rarityClassName(getKillerAddonRarity(characterName, addon)) : ""}
            >
              <option value="">{t("matchForm.addonPlaceholder", { index: index + 1 })}</option>
              {addonOptions
                .filter((name) => name === addon || !addons.includes(name))
                .map((name) => (
                  <option key={name} value={name}>
                    {tGameName(name)}
                  </option>
                ))}
            </IconSelectionSlot>
          ))}
        </div>

        <label htmlFor="quest-bloodpoints">{t("matchForm.bloodpoints")}</label>
        <input
          id="quest-bloodpoints"
          type="number"
          min={0}
          value={bloodpoints}
          onChange={(e) => setBloodpoints(e.target.value)}
        />

        <label htmlFor="quest-gens">{t("matchForm.generatorsCompleted", { count: Number(generatorsCompleted) })}</label>
        <input
          id="quest-gens"
          type="range"
          min={0}
          max={5}
          value={generatorsCompleted}
          onChange={(e) => setGeneratorsCompleted(e.target.value)}
        />

        {role === "killer" ? (
          <>
            <label htmlFor="quest-kills">{t("entityQuest.form.kills")}</label>
            <select id="quest-kills" value={kills} onChange={(e) => setKills(e.target.value)}>
              {KILLS_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <label htmlFor="quest-hooks">{t("entityQuest.form.hooks")}</label>
            <select id="quest-hooks" value={hooks} onChange={(e) => setHooks(e.target.value)}>
              {HOOKS_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <label htmlFor="quest-outcome">{t("entityQuest.form.outcome")}</label>
            <select id="quest-outcome" value={outcome} onChange={(e) => setOutcome(e.target.value as SurvivorOutcome)}>
              {OUTCOME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>

            <label htmlFor="quest-unhooks">{t("entityQuest.form.unhooks")}</label>
            <select id="quest-unhooks" value={unhooks} onChange={(e) => setUnhooks(e.target.value)}>
              {ASSIST_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>

            <label htmlFor="quest-heals">{t("entityQuest.form.heals")}</label>
            <select id="quest-heals" value={heals} onChange={(e) => setHeals(e.target.value)}>
              {ASSIST_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </>
        )}

        {questId && node.type !== "boss" && (
          <label className="quest-quest-check">
            <input type="checkbox" checked={questCompleted} onChange={(e) => setQuestCompleted(e.target.checked)} />
            {t("entityQuest.form.questCompleted", { title: t(`entityQuest.quests.${role}.${questId}.title`) })}
          </label>
        )}

        {formError && <p className="match-error">{formError}</p>}

        <div className="match-form-row">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("matchForm.submitPending") : t("entityQuest.form.submit")}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => submit(true)}
            title={t("entityQuest.form.ignoreChallengeTooltip")}
          >
            {t("hardcore.ignoreChallenge")}
          </button>
          <button type="button" disabled={isSubmitting} onClick={onClose}>
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </QuestModal>
  );
}

import { KILLER_PERKS, SURVIVOR_PERKS } from "../../../shared/data/perks";
import { useTranslation } from "react-i18next";
import { getCharacterUniquePerkNames } from "../../../shared/lib/gauntlet/tier";
import { Icon, useGameNames } from "../../settings";
import type { MatchRole } from "../../match-tracker/types/match.types";

interface GauntletCharacterCardProps {
  role: MatchRole;
  characterName: string;
}

export function GauntletCharacterCard({ role, characterName }: GauntletCharacterCardProps) {
  const { t } = useTranslation();
  const tGameName = useGameNames();
  const catalog = role === "killer" ? KILLER_PERKS : SURVIVOR_PERKS;
  const uniquePerkNames = getCharacterUniquePerkNames(catalog, characterName);
  const winCondition = role === "killer" ? t("gauntlet.winConditionKiller") : t("gauntlet.winConditionSurvivor");

  return (
    <div className="gauntlet-rolled-char">
      <div className="gauntlet-rolled-portrait">
        <Icon category="Characters" name={characterName} alt={characterName} size={170} />
      </div>
      <h3 className="gauntlet-rolled-name">{tGameName(characterName)}</h3>

      <div className="gauntlet-rolled-perks">
        {uniquePerkNames.map((perkName) => (
          <div key={perkName} className="gauntlet-rolled-perk">
            <Icon category="Perks" name={perkName} alt={perkName} size={68} />
            <span>{tGameName(perkName)}</span>
          </div>
        ))}
      </div>

      <div className="gauntlet-instructions">
        <p className="gauntlet-instructions-title">
          {role === "killer" ? t("gauntlet.howToValidateKiller") : t("gauntlet.howToValidateSurvivor")}
        </p>
        <p>{t("gauntlet.step1", { name: tGameName(characterName) })}</p>
        <p>{t("gauntlet.step2")}</p>
        <p className="gauntlet-win-condition">{winCondition}</p>
      </div>
    </div>
  );
}

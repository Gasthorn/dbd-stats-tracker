import { KILLER_PERKS, SURVIVOR_PERKS } from "../../../shared/data/perks";
import { getCharacterUniquePerkNames } from "../../../shared/lib/gauntlet/tier";
import { Icon } from "../../settings";
import type { MatchRole } from "../../match-tracker/types/match.types";

interface GauntletCharacterCardProps {
  role: MatchRole;
  characterName: string;
}

export function GauntletCharacterCard({ role, characterName }: GauntletCharacterCardProps) {
  const catalog = role === "killer" ? KILLER_PERKS : SURVIVOR_PERKS;
  const uniquePerkNames = getCharacterUniquePerkNames(catalog, characterName);
  const winCondition =
    role === "killer" ? "Condition : Au moins 3 sacrifices." : "Condition : Évadez-vous de la partie.";

  return (
    <div className="gauntlet-rolled-char">
      <div className="gauntlet-rolled-portrait">
        <Icon category="Characters" name={characterName} alt={characterName} size={170} />
      </div>
      <h3 className="gauntlet-rolled-name">{characterName}</h3>

      <div className="gauntlet-rolled-perks">
        {uniquePerkNames.map((perkName) => (
          <div key={perkName} className="gauntlet-rolled-perk">
            <Icon category="Perks" name={perkName} alt={perkName} size={68} />
            <span>{perkName}</span>
          </div>
        ))}
      </div>

      <div className="gauntlet-instructions">
        <p className="gauntlet-instructions-title">
          Comment valider ce {role === "killer" ? "tueur" : "survivant"} ?
        </p>
        <p>
          1. Jouez <strong>{characterName}</strong> avec les restrictions de perks indiquées ci-dessus.
        </p>
        <p>2. Enregistrez le résultat ci-dessous : le Gauntlet se met à jour automatiquement.</p>
        <p className="gauntlet-win-condition">{winCondition}</p>
      </div>
    </div>
  );
}

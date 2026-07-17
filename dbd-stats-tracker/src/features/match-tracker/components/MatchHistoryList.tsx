import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getDateLocale } from "../../../shared/i18n";
import { useAuthStore } from "../../auth/stores/auth.store";
import { Icon, useGameNames } from "../../settings";
import { useTeamsStore } from "../../teams";
import { worldCupService } from "../../world-cup/services/world-cup.service";
import type { Match, MatchMode } from "../types/match.types";

const MODE_LABEL_KEYS: Record<MatchMode, string> = {
  normal: "history.modeNormal",
  hardcore: "history.modeHardcore",
  gauntlet: "history.modeGauntlet",
  world_cup: "history.modeWorldCup",
};

type MatchOutcome = "win" | "loss" | "draw" | "pending";

const OUTCOME_LABEL_KEYS: Record<MatchOutcome, string> = {
  win: "history.win",
  loss: "history.loss",
  draw: "history.draw",
  pending: "history.pending",
};

interface WorldCupDuelInfo {
  opponent: string;
  outcome: MatchOutcome;
}

const ESCAPE_SUMMARY_KEYS: Record<NonNullable<Match["escapeResult"]>, string> = {
  escaped_door: "history.escapedDoorShort",
  escaped_hatch: "history.escapedHatchShort",
  sacrificed: "matchForm.sacrificed",
  killed: "matchForm.killed",
  disconnected: "matchForm.disconnected",
};

/** Survivor win = escaped or killer disconnected; killer win = 3+ sacrifices. */
function isWin(match: Match): boolean {
  if (match.role === "killer") return match.kills >= 3;
  return (
    match.escapeResult === "escaped_door" ||
    match.escapeResult === "escaped_hatch" ||
    match.escapeResult === "disconnected"
  );
}

function fixtureOutcome(winner: "a" | "b" | "draw" | null, side: "a" | "b"): MatchOutcome {
  if (winner === null) return "pending";
  if (winner === "draw") return "draw";
  return winner === side ? "win" : "loss";
}

interface MatchHistoryListProps {
  matches: Match[];
  onEdit?: (match: Match) => void;
  onDelete?: (match: Match) => void;
}

export function MatchHistoryList({ matches, onEdit, onDelete }: MatchHistoryListProps) {
  const { t } = useTranslation();
  const tGameName = useGameNames();
  const userId = useAuthStore((state) => state.user?.id);
  const [worldCupDuelByMatchId, setWorldCupDuelByMatchId] = useState<Map<string, WorldCupDuelInfo>>(new Map());
  const hasWorldCupMatches = useMemo(() => matches.some((match) => match.mode === "world_cup"), [matches]);

  const teams = useTeamsStore((state) => state.teams);
  const teamsStatus = useTeamsStore((state) => state.status);
  const fetchTeams = useTeamsStore((state) => state.fetchTeams);
  useEffect(() => {
    if (teamsStatus === "idle") fetchTeams();
  }, [teamsStatus, fetchTeams]);
  const teamNameById = useMemo(() => new Map(teams.map((team) => [team.id, team.name])), [teams]);

  useEffect(() => {
    if (!userId || !hasWorldCupMatches) return;
    let cancelled = false;
    worldCupService.listFixturesForUser(userId).then((fixtures) => {
      if (cancelled) return;
      const map = new Map<string, WorldCupDuelInfo>();
      for (const fixture of fixtures) {
        if (fixture.killerAMatchId) {
          map.set(fixture.killerAMatchId, {
            opponent: fixture.killerB,
            outcome: fixtureOutcome(fixture.winner, "a"),
          });
        }
        if (fixture.killerBMatchId) {
          map.set(fixture.killerBMatchId, {
            opponent: fixture.killerA,
            outcome: fixtureOutcome(fixture.winner, "b"),
          });
        }
      }
      setWorldCupDuelByMatchId(map);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, hasWorldCupMatches]);

  if (matches.length === 0) {
    return <p>{t("history.empty")}</p>;
  }

  return (
    <ul className="match-history-list">
      {matches.map((match) => {
        const duel = match.mode === "world_cup" ? worldCupDuelByMatchId.get(match.id) : undefined;
        return (
          <li key={match.id} className="match-history-item">
            <span className="match-history-tags">
              <span
                className={`match-result-dot ${isWin(match) ? "is-win" : "is-loss"}`}
                title={isWin(match) ? t("history.win") : t("history.loss")}
              />
              <span className={`match-mode-badge match-mode-badge--${match.mode}`}>{t(MODE_LABEL_KEYS[match.mode])}</span>
            </span>
            <span className="match-field-with-icon">
              <Icon category="Characters" name={match.characterName} alt={match.characterName} size={32} />
              {match.role === "killer" ? t("history.killerTag") : t("history.survivorTag")} {tGameName(match.characterName)}
              {duel && (
                <>
                  {" "}
                  (vs {tGameName(duel.opponent)})
                  <span
                    className={`match-result-dot is-${duel.outcome}`}
                    title={t("history.duelOutcomeTooltip", { outcome: t(OUTCOME_LABEL_KEYS[duel.outcome]) })}
                  />
                </>
              )}
            </span>
            {match.role === "survivor" && match.opponentName && (
              <span className="match-field-with-icon">
                <Icon category="Characters" name={match.opponentName} alt={match.opponentName} size={32} />
                vs {tGameName(match.opponentName)}
              </span>
            )}
            {match.role === "survivor" && match.teamId && teamNameById.get(match.teamId) && (
              <span className="match-team-badge">{t("history.teamLabel", { name: teamNameById.get(match.teamId) })}</span>
            )}
            <span>{match.role === "killer" ? t("history.kills", { count: match.kills }) : t(ESCAPE_SUMMARY_KEYS[match.escapeResult])}</span>
            <span>{match.bloodpoints} {t("history.bloodpointsUnit")}</span>
            <span>{new Date(match.playedAt).toLocaleString(getDateLocale())}</span>
            {(onEdit || onDelete) && (
              <span className="match-history-actions">
                {onEdit && (
                  <button type="button" onClick={() => onEdit(match)}>
                    {t("common.edit")}
                  </button>
                )}
                {onDelete && (
                  <button type="button" className="btn-danger" onClick={() => onDelete(match)}>
                    {t("common.delete")}
                  </button>
                )}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

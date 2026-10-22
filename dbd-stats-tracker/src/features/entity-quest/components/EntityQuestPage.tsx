import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { findNode } from "../../../shared/lib/entity-quest/map";
import { useCharactersStore } from "../../characters/stores/characters.store";
import { useEntityQuestStore } from "../stores/entity-quest.store";
import type { QuestRole } from "../types/entity-quest.types";
import { QuestChestModal } from "./QuestChestModal";
import { QuestCollection } from "./QuestCollection";
import { QuestEndScreen } from "./QuestEndScreen";
import { QuestHistory } from "./QuestHistory";
import { QuestHud } from "./QuestHud";
import { QuestMap } from "./QuestMap";
import { QuestOutcomeModal } from "./QuestOutcomeModal";
import { QuestSetup } from "./QuestSetup";
import { QuestShopModal } from "./QuestShopModal";
import { QuestTrialModal } from "./QuestTrialModal";
import "../../../shared/styles/rarity.css";
import "./entity-quest.css";

const RULE_KEYS = ["goal", "map", "trials", "collection", "events", "shop", "chest", "lives"] as const;

export function EntityQuestPage() {
  const { t } = useTranslation();
  const charactersStatus = useCharactersStore((state) => state.status);
  const fetchCharacters = useCharactersStore((state) => state.fetch);
  const unlockedSurvivors = useCharactersStore((state) => state.unlockedSurvivors);

  const runs = useEntityQuestStore((state) => state.runs);
  const finishedRuns = useEntityQuestStore((state) => state.finishedRuns);
  const error = useEntityQuestStore((state) => state.error);
  const pendingTrialNodeId = useEntityQuestStore((state) => state.pendingTrialNodeId);
  const outcome = useEntityQuestStore((state) => state.outcome);
  const {
    loadRole,
    loadFinishedRuns,
    startRun,
    selectNode,
    cancelTrial,
    buyOffer,
    rerollShop,
    leaveShop,
    pickQuest,
    abandonRun,
    clearFinishedRun,
    dismissOutcome,
  } = useEntityQuestStore.getState();

  const [role, setRole] = useState<QuestRole | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (charactersStatus === "idle") fetchCharacters();
    loadFinishedRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchRole(nextRole: QuestRole) {
    setRole(nextRole);
    if (runs[nextRole] === undefined) loadRole(nextRole);
  }

  /** Serializes clicks: every run action is a read-modify-write of the whole run document. */
  async function act(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  async function handleAbandon() {
    if (!role || !confirm(t("entityQuest.abandonConfirm"))) return;
    await act(() => abandonRun(role));
  }

  const run = role ? runs[role] : undefined;
  const inProgress = run?.status === "in_progress";
  const trialNode = run && pendingTrialNodeId ? findNode(run.state.map, pendingTrialNodeId) : undefined;
  const charactersReady = charactersStatus === "success";

  return (
    <div className="entity-quest-page">
      <div className="quest-header">
        {role && inProgress && (
          <button type="button" className="btn-danger" disabled={busy} onClick={handleAbandon}>
            {t("entityQuest.abandon")}
          </button>
        )}
      </div>

      <h1>{t("entityQuest.title")}</h1>
      <p className="quest-subtitle">{t("entityQuest.subtitle")}</p>

      <details className="quest-rules">
        <summary>{t("entityQuest.rulesTitle")}</summary>
        <ul>
          {RULE_KEYS.map((key) => (
            <li key={key}>
              <strong>{t(`entityQuest.rules.${key}Label`)}</strong> {t(`entityQuest.rules.${key}`)}
            </li>
          ))}
        </ul>
      </details>

      {error && <p className="match-error">{error}</p>}

      <div className="match-role-toggle" style={{ justifyContent: "center" }}>
        <button type="button" className={role === "killer" ? "is-active" : ""} onClick={() => switchRole("killer")}>
          {t("common.killer")}
        </button>
        <button type="button" className={role === "survivor" ? "is-active" : ""} onClick={() => switchRole("survivor")}>
          {t("common.survivor")}
        </button>
      </div>

      {role && (run === undefined || !charactersReady) && <p>{t("common.loading")}</p>}

      {role && charactersReady && run === null && (
        <QuestSetup role={role} onStart={(difficulty) => act(() => startRun(role, difficulty))} />
      )}

      {role && charactersReady && run && !inProgress && (
        <QuestEndScreen run={run} onNewRun={() => clearFinishedRun(role)} />
      )}

      {role && charactersReady && run && inProgress && (
        <>
          <QuestHud run={run} />
          <p className="quest-muted quest-map-hint">{t("entityQuest.mapHint")}</p>
          <div className="quest-board">
            <QuestMap run={run} disabled={busy} onSelect={(nodeId) => act(() => selectNode(role, nodeId))} />
            <QuestCollection role={role} collection={run.state.collection} />
          </div>

          {run.state.shop && (
            <QuestShopModal
              shop={run.state.shop}
              shards={run.shards}
              busy={busy}
              onBuy={(index) => act(() => buyOffer(role, index))}
              onReroll={() => act(() => rerollShop(role))}
              onLeave={() => act(() => leaveShop(role))}
            />
          )}

          {run.state.chest && (
            <QuestChestModal
              role={role}
              questOptions={run.state.chest.questOptions}
              busy={busy}
              onPick={(questId) => act(() => pickQuest(role, questId))}
            />
          )}

          {trialNode && (
            <QuestTrialModal run={run} node={trialNode} ownedSurvivors={unlockedSurvivors} onClose={cancelTrial} />
          )}
        </>
      )}

      {outcome && <QuestOutcomeModal outcome={outcome} onClose={dismissOutcome} />}

      <QuestHistory runs={finishedRuns} />
    </div>
  );
}

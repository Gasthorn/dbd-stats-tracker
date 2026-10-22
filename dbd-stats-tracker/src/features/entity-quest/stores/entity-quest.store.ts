import { create } from "zustand";
import { i18n } from "../../../shared/i18n";
import {
  DIFFICULTY_SETTINGS,
  EVENT_MESSAGE_VARIANTS,
  buildQuestPools,
  buildShopOffers,
  computeTrialShards,
  createInitialRunState,
  findNode,
  getAvailableNodes,
  getObjective,
  isObjectiveMet,
  rollChestQuests,
  rollEvent,
  rollLegendaryUnlock,
  rollUnlock,
  SHOP_REROLL_COST_STEP,
} from "../../../shared/lib/entity-quest";
import type { QuestMatchResult, QuestPools, QuestRole, QuestRunState } from "../../../shared/lib/entity-quest/types";
import { useAuthStore } from "../../auth/stores/auth.store";
import { useCharactersStore } from "../../characters/stores/characters.store";
import { useMatchTrackerStore } from "../../match-tracker/stores/match-tracker.store";
import type { CreateMatchInput } from "../../match-tracker/types/match.types";
import { entityQuestService } from "../services/entity-quest.service";
import type { EntityQuestRun, UpdateEntityQuestRunInput } from "../types/entity-quest.types";
import type { EntityQuestStore } from "./entity-quest.store.types";

const rng = Math.random;

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : i18n.t("common.unexpectedError");
}

function requireUserId(): string {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) throw new Error(i18n.t("common.notLoggedIn"));
  return userId;
}

function poolsFor(role: QuestRole): QuestPools {
  const characters = useCharactersStore.getState();
  return buildQuestPools(role, role === "killer" ? characters.unlockedKillers : characters.unlockedSurvivors);
}

/** Marks a node as cleared: the player now stands on it and picks among its connections next. */
function completeNode(state: QuestRunState, nodeId: string): QuestRunState {
  return { ...state, visitedNodeIds: [...state.visitedNodeIds, nodeId], currentNodeId: nodeId };
}

function toQuestResult(match: CreateMatchInput): QuestMatchResult {
  const base = { generatorsCompleted: match.generatorsCompleted, bloodpoints: match.bloodpoints };
  return match.role === "killer"
    ? { ...base, role: "killer", kills: match.kills }
    : { ...base, role: "survivor", escapeResult: match.escapeResult };
}

export const useEntityQuestStore = create<EntityQuestStore>((set, get) => {
  function activeRun(role: QuestRole): EntityQuestRun {
    const run = get().runs[role];
    if (!run || run.status !== "in_progress") throw new Error(i18n.t("entityQuest.errors.noActiveRun"));
    return run;
  }

  function setRun(role: QuestRole, run: EntityQuestRun | null) {
    set({ runs: { ...get().runs, [role]: run } });
  }

  async function persist(role: QuestRole, input: UpdateEntityQuestRunInput): Promise<EntityQuestRun> {
    const updated = await entityQuestService.updateRun(input);
    setRun(role, updated);
    if (updated.status !== "in_progress") {
      // Keep the finished-runs list in sync without a refetch.
      set({ finishedRuns: [updated, ...get().finishedRuns.filter((run) => run.id !== updated.id)] });
    }
    return updated;
  }

  /** Runs an action, surfacing any failure in `error` instead of throwing into the UI. */
  async function guarded(action: () => Promise<void>) {
    set({ error: null });
    try {
      await action();
    } catch (err) {
      set({ error: toErrorMessage(err) });
    }
  }

  return {
    runs: {},
    finishedRuns: [],
    status: "idle",
    error: null,
    pendingTrialNodeId: null,
    outcome: null,

    loadRole: async (role) => {
      set({ status: "loading", error: null });
      try {
        const run = await entityQuestService.getActiveRun(requireUserId(), role);
        set({ runs: { ...get().runs, [role]: run }, status: "success" });
      } catch (err) {
        set({ status: "error", error: toErrorMessage(err) });
      }
    },

    loadFinishedRuns: () =>
      guarded(async () => {
        set({ finishedRuns: await entityQuestService.listFinishedRuns(requireUserId()) });
      }),

    startRun: (role, difficulty) =>
      guarded(async () => {
        const { lives } = DIFFICULTY_SETTINGS[difficulty];
        const state = createInitialRunState(rng, role, poolsFor(role));
        const run = await entityQuestService.createRun(requireUserId(), {
          role,
          difficulty,
          lives,
          maxLives: lives,
          state,
        });
        setRun(role, run);
        set({ outcome: { kind: "start", combo: run.state.startingCombo } });
      }),

    selectNode: (role, nodeId) =>
      guarded(async () => {
        const run = activeRun(role);
        const { state } = run;
        const node = getAvailableNodes(state).find((candidate) => candidate.id === nodeId);
        if (!node) return;

        switch (node.type) {
          case "trial":
          case "hard_trial":
          case "boss":
            set({ pendingTrialNodeId: node.id });
            return;

          case "event": {
            const event = rollEvent({
              rng,
              role,
              pools: poolsFor(role),
              collection: state.collection,
              floor: node.floor,
              difficulty: run.difficulty,
              lives: run.lives,
              maxLives: run.maxLives,
            });
            let collection = state.collection;
            let shards = run.shards;
            let lives = run.lives;
            switch (event.type) {
              case "unlock":
                collection = [...collection, event.unlock];
                break;
              case "shards_small":
              case "shards_large":
                shards += event.shards;
                break;
              case "reroll":
                collection = collection.map((item) => (item.name === event.from.name ? event.to : item));
                break;
              case "heal":
                lives = Math.min(run.maxLives, lives + 1);
                break;
              case "jackpot":
                shards += event.shards;
                if (event.unlock) collection = [...collection, event.unlock];
                break;
              case "nothing":
                break;
            }
            await persist(role, { id: run.id, shards, lives, state: completeNode({ ...state, collection }, node.id) });
            set({ outcome: { kind: "event", event, variant: Math.floor(rng() * EVENT_MESSAGE_VARIANTS) } });
            return;
          }

          case "shop": {
            // Re-entering the same shop (e.g. after a reload) keeps its offers.
            if (state.shop?.nodeId === node.id) return;
            const shop = buildShopOffers(
              { rng, role, pools: poolsFor(role), collection: state.collection },
              node.id,
              node.floor,
            );
            await persist(role, { id: run.id, state: { ...state, shop } });
            return;
          }

          case "chest": {
            if (state.chest?.nodeId === node.id) return;
            await persist(role, {
              id: run.id,
              state: { ...state, chest: { nodeId: node.id, questOptions: rollChestQuests(rng, role) } },
            });
            return;
          }
        }
      }),

    cancelTrial: () => set({ pendingTrialNodeId: null }),

    recordTrial: async ({ role, match, questCompleted, ignoreChallenge }) => {
      const run = activeRun(role);
      const nodeId = get().pendingTrialNodeId;
      const node = nodeId ? findNode(run.state.map, nodeId) : undefined;
      if (!node) throw new Error(i18n.t("entityQuest.errors.noActiveRun"));

      const created = await useMatchTrackerStore
        .getState()
        .createMatch({ ...match, mode: "entity_quest", ignoreChallenge } as CreateMatchInput);
      set({ pendingTrialNodeId: null });

      // The match is saved; from here on, failures surface in the page error (the form is gone).
      await guarded(async () => {
        const stateWithMatch: QuestRunState = { ...run.state, matchIds: [...run.state.matchIds, created.id] };
        if (ignoreChallenge) {
          await persist(role, { id: run.id, state: stateWithMatch });
          return;
        }

        const result = toQuestResult(match as CreateMatchInput);
        const objective = getObjective(run.difficulty, role, node);

        if (!isObjectiveMet(objective, result)) {
          const lives = run.lives - 1;
          await persist(role, {
            id: run.id,
            lives,
            state: stateWithMatch,
            ...(lives <= 0 ? { status: "lost" as const, endedAt: new Date().toISOString() } : {}),
          });
          if (lives > 0) set({ outcome: { kind: "trial_failed", livesLeft: lives } });
          return;
        }

        if (node.type === "boss") {
          await persist(role, {
            id: run.id,
            status: "won",
            endedAt: new Date().toISOString(),
            state: completeNode(stateWithMatch, node.id),
          });
          return;
        }

        const ctx = { rng, role, pools: poolsFor(role), collection: run.state.collection };
        const questDone = questCompleted && run.state.activeQuestId !== null;
        const unlock = questDone ? rollLegendaryUnlock(ctx) : rollUnlock(ctx, node.floor, node.type === "hard_trial");
        const shards = computeTrialShards(run.difficulty, node, result);

        await persist(role, {
          id: run.id,
          shards: run.shards + shards,
          state: completeNode(
            {
              ...stateWithMatch,
              collection: unlock ? [...stateWithMatch.collection, unlock] : stateWithMatch.collection,
              activeQuestId: questDone ? null : stateWithMatch.activeQuestId,
            },
            node.id,
          ),
        });
        set({ outcome: { kind: "trial_success", shards, unlock, questCompleted: questDone } });
      });
    },

    buyOffer: (role, offerIndex) =>
      guarded(async () => {
        const run = activeRun(role);
        const shop = run.state.shop;
        const offer = shop?.offers[offerIndex];
        if (!shop || !offer || offer.purchased || run.shards < offer.cost) return;

        const offers = shop.offers.map((entry, index) => (index === offerIndex ? { ...entry, purchased: true } : entry));
        await persist(role, {
          id: run.id,
          shards: run.shards - offer.cost,
          state: { ...run.state, collection: [...run.state.collection, offer.item], shop: { ...shop, offers } },
        });
      }),

    rerollShop: (role) =>
      guarded(async () => {
        const run = activeRun(role);
        const shop = run.state.shop;
        if (!shop || run.shards < shop.rerollCost) return;
        const node = findNode(run.state.map, shop.nodeId);
        if (!node) return;

        const rerolled = buildShopOffers(
          { rng, role, pools: poolsFor(role), collection: run.state.collection },
          shop.nodeId,
          node.floor,
        );
        await persist(role, {
          id: run.id,
          shards: run.shards - shop.rerollCost,
          state: { ...run.state, shop: { ...rerolled, rerollCost: shop.rerollCost + SHOP_REROLL_COST_STEP } },
        });
      }),

    leaveShop: (role) =>
      guarded(async () => {
        const run = activeRun(role);
        const shop = run.state.shop;
        if (!shop) return;
        await persist(role, { id: run.id, state: completeNode({ ...run.state, shop: null }, shop.nodeId) });
      }),

    pickQuest: (role, questId) =>
      guarded(async () => {
        const run = activeRun(role);
        const chest = run.state.chest;
        if (!chest || !chest.questOptions.includes(questId)) return;
        await persist(role, {
          id: run.id,
          state: completeNode({ ...run.state, chest: null, activeQuestId: questId }, chest.nodeId),
        });
      }),

    abandonRun: (role) =>
      guarded(async () => {
        const run = activeRun(role);
        await persist(role, { id: run.id, status: "lost", endedAt: new Date().toISOString() });
        set({ pendingTrialNodeId: null, outcome: null });
      }),

    clearFinishedRun: (role) => {
      if (get().runs[role]?.status !== "in_progress") setRun(role, null);
    },

    dismissOutcome: () => set({ outcome: null }),
  };
});

import { create } from "zustand";
import { getHardcoreSeasonId } from "../../../shared/lib/hardcore/rank";
import { useAuthStore } from "../../auth/stores/auth.store";
import { useHardcoreTeamStore } from "../../hardcore-teams";
import { useMatchTrackerStore } from "../../match-tracker/stores/match-tracker.store";
import { hardcoreService } from "../services/hardcore.service";
import type { CreateMatchInput } from "../../match-tracker/types/match.types";
import type { HardcoreStore, RecordHardcoreMatchInput } from "./hardcore.store.types";

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Une erreur inattendue est survenue.";
}

function requireUserId(): string {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) throw new Error("Utilisateur non connecté.");
  return userId;
}

export const useHardcoreStore = create<HardcoreStore>((set, get) => ({
  currentRun: null,
  status: "idle",
  error: null,

  initialize: async () => {
    set({ status: "loading", error: null });
    try {
      const run = await hardcoreService.getOrCreateRun(requireUserId(), getHardcoreSeasonId());
      set({ currentRun: run, status: "success" });
    } catch (err) {
      set({ status: "error", error: toErrorMessage(err) });
    }
  },

  recordMatch: async ({ match, pips, died, ignoreChallenge }: RecordHardcoreMatchInput) => {
    const run = get().currentRun;
    if (!run) throw new Error("Aucune saison Hardcore active.");

    const activeTeamMembership = useHardcoreTeamStore
      .getState()
      .members.find((m) => m.isSelf && m.status === "accepted");

    const createMatch = useMatchTrackerStore.getState().createMatch;
    const matchInput: CreateMatchInput = {
      ...match,
      mode: "hardcore",
      hardcoreRunId: run.id,
      hardcoreTeamId: match.role === "survivor" ? (activeTeamMembership?.teamId ?? null) : null,
      hardcorePips: pips,
      hardcoreDied: died,
      ignoreChallenge,
    };
    await createMatch(matchInput);

    if (ignoreChallenge) return;

    const isKiller = match.role === "killer";
    const nextDeadKillers = isKiller && died ? [...run.deadKillers, match.characterName] : run.deadKillers;
    const nextDeadSurvivors =
      !isKiller && died ? [...run.deadSurvivors, match.characterName] : run.deadSurvivors;

    const updatedRun = await hardcoreService.updateRun({
      id: run.id,
      killerPips: isKiller ? run.killerPips + pips : run.killerPips,
      survivorPips: !isKiller ? run.survivorPips + pips : run.survivorPips,
      deadKillers: nextDeadKillers,
      deadSurvivors: nextDeadSurvivors,
    });
    set({ currentRun: updatedRun });

    if (!isKiller && died && activeTeamMembership) {
      await useHardcoreTeamStore.getState().recordDeath(match.characterName, run.seasonId);
    }
  },

  resetSeason: async () => {
    const run = get().currentRun;
    if (!run) return;
    set({ status: "loading", error: null });
    try {
      await hardcoreService.resetRun(run.id);
      const fresh = await hardcoreService.getOrCreateRun(requireUserId(), getHardcoreSeasonId());
      set({ currentRun: fresh, status: "success" });
    } catch (err) {
      set({ status: "error", error: toErrorMessage(err) });
    }
  },
}));

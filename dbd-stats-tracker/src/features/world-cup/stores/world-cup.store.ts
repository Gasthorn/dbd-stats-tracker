import { create } from "zustand";
import {
  computeGroupStandings,
  isGroupComplete,
  rankOverallStandings,
} from "../../../shared/lib/world-cup/standings";
import {
  generateNextRoundPairings,
  generateSnakeSeeding,
  nextKnockoutRound,
  resolveFixtureOutcome,
  resolveKnockoutOutcome,
  type KnockoutRound,
} from "../../../shared/lib/world-cup/knockout";
import { computeSeedingFromHistory, computePreviousTournamentRanking, drawGroupsFromSeeding, drawRandomSeedOrder } from "../../../shared/lib/world-cup/seeding";
import { useAuthStore } from "../../auth/stores/auth.store";
import { useCharactersStore } from "../../characters/stores/characters.store";
import { matchService } from "../../match-tracker";
import { useMatchTrackerStore } from "../../match-tracker/stores/match-tracker.store";
import type { CreateMatchInput } from "../../match-tracker/types/match.types";
import { toFixtureSideResult, toStandingsFixture } from "../lib/deriveState";
import { worldCupService } from "../services/world-cup.service";
import type { WorldCupStore } from "./world-cup.store.types";

const GROUP_SIZE = 6;
const KNOCKOUT_FIELD_SIZE = 32;

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Une erreur inattendue est survenue.";
}

function requireUserId(): string {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) throw new Error("Utilisateur non connecté.");
  return userId;
}

export const useWorldCupStore = create<WorldCupStore>((set, get) => ({
  run: null,
  groups: [],
  fixtures: [],
  matchesById: {},
  hasHistory: false,
  status: "idle",
  error: null,

  initialize: async () => {
    set({ status: "loading", error: null });
    try {
      const userId = requireUserId();
      const [run, lastCompleted] = await Promise.all([
        worldCupService.getActiveRun(userId),
        worldCupService.getLastCompletedRun(userId),
      ]);

      if (!run) {
        set({
          run: null,
          groups: [],
          fixtures: [],
          matchesById: {},
          hasHistory: Boolean(lastCompleted),
          status: "success",
        });
        return;
      }

      const [groups, fixtures, matches] = await Promise.all([
        worldCupService.listGroups(run.id),
        worldCupService.listFixtures(run.id),
        matchService.listMatches({ mode: "world_cup" }),
      ]);
      const matchesById = Object.fromEntries(matches.items.map((m) => [m.id, m]));
      set({ run, groups, fixtures, matchesById, hasHistory: Boolean(lastCompleted), status: "success" });
    } catch (err) {
      set({ status: "error", error: toErrorMessage(err) });
    }
  },

  startRun: async (options) => {
    set({ status: "loading", error: null });
    try {
      const userId = requireUserId();
      const unlockedKillers = useCharactersStore.getState().unlockedKillers;

      let seedOrder: string[];
      if (options?.manualSeedOrder) {
        seedOrder = options.manualSeedOrder;
      } else {
        const lastCompleted = await worldCupService.getLastCompletedRun(userId);
        if (lastCompleted) {
          const [groups, fixtures, matches] = await Promise.all([
            worldCupService.listGroups(lastCompleted.id),
            worldCupService.listFixtures(lastCompleted.id),
            matchService.listMatches({ mode: "world_cup" }),
          ]);
          const matchesById = Object.fromEntries(matches.items.map((m) => [m.id, m]));
          const groupsWithFixtures = groups.map((group) => ({
            killers: group.killers,
            fixtures: fixtures
              .filter((fixture) => fixture.groupId === group.id)
              .map((fixture) => toStandingsFixture(fixture, matchesById)),
          }));
          const knockoutFixtures = fixtures
            .filter(
              (fixture): fixture is typeof fixture & { round: KnockoutRound; winner: "a" | "b" } =>
                fixture.round !== "group" && (fixture.winner === "a" || fixture.winner === "b"),
            )
            .map((fixture) => ({
              round: fixture.round,
              killerA: fixture.killerA,
              killerB: fixture.killerB,
              winner: fixture.winner,
            }));
          const previousRanking = computePreviousTournamentRanking(groupsWithFixtures, knockoutFixtures);
          seedOrder = computeSeedingFromHistory(unlockedKillers, previousRanking);
        } else {
          seedOrder = drawRandomSeedOrder(unlockedKillers);
        }
      }

      const drawnGroups = drawGroupsFromSeeding(seedOrder, GROUP_SIZE);
      if (drawnGroups.length === 0) {
        set({
          status: "error",
          error: `Il faut au moins ${GROUP_SIZE * 6} tueurs débloqués pour lancer un World Cup (poules de ${GROUP_SIZE}, tableau final de ${KNOCKOUT_FIELD_SIZE}).`,
        });
        return;
      }

      const { run, groups, fixtures } = await worldCupService.createRun({ userId, groups: drawnGroups });
      set({ run, groups, fixtures, matchesById: {}, status: "success" });
    } catch (err) {
      set({ status: "error", error: toErrorMessage(err) });
    }
  },

  recordFixtureMatch: async (fixtureId, side, matchInput) => {
    const fixture = get().fixtures.find((f) => f.id === fixtureId);
    if (!fixture) throw new Error("Affrontement introuvable.");

    const createMatch = useMatchTrackerStore.getState().createMatch;
    const fullInput: CreateMatchInput = {
      role: "killer",
      mode: "world_cup",
      hardcoreRunId: null,
      opponentName: null,
      escapeResult: null,
      hardcorePips: null,
      hardcoreDied: null,
      ignoreChallenge: false,
      ...matchInput,
    };
    const match = await createMatch(fullInput);

    const updatedFixture = await worldCupService.recordFixtureSide(fixtureId, side, match.id);
    const matchesById = { ...get().matchesById, [match.id]: match };
    let fixtures = get().fixtures.map((f) => (f.id === fixtureId ? updatedFixture : f));

    const sideA = toFixtureSideResult(
      updatedFixture.killerAMatchId ? matchesById[updatedFixture.killerAMatchId] : undefined,
    );
    const sideB = toFixtureSideResult(
      updatedFixture.killerBMatchId ? matchesById[updatedFixture.killerBMatchId] : undefined,
    );
    if (sideA && sideB) {
      const outcome =
        updatedFixture.round === "group" ? resolveFixtureOutcome(sideA, sideB) : resolveKnockoutOutcome(sideA, sideB);
      if (outcome.status === "completed") {
        const persisted = await worldCupService.setFixtureWinner(fixtureId, outcome.winner);
        fixtures = fixtures.map((f) => (f.id === fixtureId ? persisted : f));
      }
    }

    set({ fixtures, matchesById });
  },

  resolveManualTiebreak: async (fixtureId, winner) => {
    const updated = await worldCupService.setFixtureWinner(fixtureId, winner);
    set({ fixtures: get().fixtures.map((f) => (f.id === fixtureId ? updated : f)) });
  },

  advanceToKnockout: async () => {
    const run = get().run;
    if (!run || run.status !== "group_stage") return;
    set({ status: "loading", error: null });
    try {
      const { groups, fixtures, matchesById } = get();
      const groupsWithFixtures = groups.map((group) => ({
        killers: group.killers,
        fixtures: fixtures
          .filter((fixture) => fixture.groupId === group.id)
          .map((fixture) => toStandingsFixture(fixture, matchesById)),
      }));

      const allComplete = groupsWithFixtures.every((group) => isGroupComplete(group.killers, group.fixtures));
      if (!allComplete) {
        set({ status: "error", error: "Toutes les poules doivent être terminées avant de lancer la phase finale." });
        return;
      }

      const allStandings = groupsWithFixtures.flatMap((group) =>
        computeGroupStandings(group.killers, group.fixtures),
      );
      const top32 = rankOverallStandings(allStandings)
        .slice(0, KNOCKOUT_FIELD_SIZE)
        .map((standing) => standing.killer);
      if (top32.length < KNOCKOUT_FIELD_SIZE) {
        set({ status: "error", error: "Pas assez de tueurs qualifiés pour former un tableau de 32." });
        return;
      }

      const pairings = generateSnakeSeeding(top32);
      const newFixtures = await worldCupService.createKnockoutFixtures({
        userId: requireUserId(),
        runId: run.id,
        round: "round_of_32",
        pairings,
      });
      const updatedRun = await worldCupService.advanceRunStatus(run.id, "knockout", "round_of_32");
      set({ run: updatedRun, fixtures: [...fixtures, ...newFixtures], status: "success" });
    } catch (err) {
      set({ status: "error", error: toErrorMessage(err) });
    }
  },

  advanceKnockoutRound: async () => {
    const run = get().run;
    if (!run || run.status !== "knockout" || !run.currentRound) return;
    set({ status: "loading", error: null });
    try {
      const currentFixtures = get().fixtures.filter((f) => f.round === run.currentRound);
      const unresolved = currentFixtures.filter((f) => f.winner === null);
      if (unresolved.length > 0) {
        set({ status: "error", error: "Terminez tous les matchs de ce tour avant de continuer." });
        return;
      }

      if (run.currentRound === "final") {
        const updatedRun = await worldCupService.advanceRunStatus(run.id, "completed", null);
        set({ run: updatedRun, status: "success" });
        return;
      }

      const winners = currentFixtures.map((fixture) => ({
        slotIndex: fixture.slotIndex,
        winner: fixture.winner === "a" ? fixture.killerA : fixture.killerB,
      }));
      const next = nextKnockoutRound(run.currentRound);
      if (!next) return;

      const pairings = generateNextRoundPairings(winners);
      const newFixtures = await worldCupService.createKnockoutFixtures({
        userId: requireUserId(),
        runId: run.id,
        round: next,
        pairings,
      });
      const updatedRun = await worldCupService.advanceRunStatus(run.id, "knockout", next);
      set({ run: updatedRun, fixtures: [...get().fixtures, ...newFixtures], status: "success" });
    } catch (err) {
      set({ status: "error", error: toErrorMessage(err) });
    }
  },

  resetActiveRun: async () => {
    const run = get().run;
    if (!run) return;
    set({ status: "loading", error: null });
    try {
      await worldCupService.resetActiveRun(run.id);
      set({ run: null, groups: [], fixtures: [], matchesById: {}, status: "success" });
    } catch (err) {
      set({ status: "error", error: toErrorMessage(err) });
    }
  },
}));

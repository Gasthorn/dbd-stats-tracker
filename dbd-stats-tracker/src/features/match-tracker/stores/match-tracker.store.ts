import { create } from "zustand";
import { matchService } from "../services/match.service";
import type { MatchTrackerStore } from "./match-tracker.store.types";

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Une erreur inattendue est survenue.";
}

export const useMatchTrackerStore = create<MatchTrackerStore>((set, get) => ({
  matches: [],
  selectedMatchId: null,
  filters: {},
  status: "idle",
  error: null,

  fetchMatches: async (filters) => {
    set({ status: "loading", error: null, filters: filters ?? get().filters });
    try {
      const result = await matchService.listMatches(filters ?? get().filters, {
        page: 1,
        pageSize: 50,
      });
      set({ matches: result.items, status: "success" });
    } catch (err) {
      set({ status: "error", error: toErrorMessage(err) });
    }
  },

  createMatch: async (input) => {
    const match = await matchService.createMatch(input);
    set({ matches: [match, ...get().matches] });
    return match;
  },

  updateMatch: async (input) => {
    const match = await matchService.updateMatch(input);
    set({ matches: get().matches.map((m) => (m.id === match.id ? match : m)) });
    return match;
  },

  deleteMatch: async (id) => {
    await matchService.deleteMatch(id);
    set({ matches: get().matches.filter((m) => m.id !== id) });
  },

  selectMatch: (id) => set({ selectedMatchId: id }),
  setFilters: (filters) => set({ filters }),
}));

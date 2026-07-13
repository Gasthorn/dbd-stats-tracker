import { create } from "zustand";
import { i18n } from "../../../shared/i18n";
import { teamsService } from "../services/teams.service";
import type { TeamsStore } from "./teams.store.types";

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : i18n.t("common.unexpectedError");
}

export const useTeamsStore = create<TeamsStore>((set, get) => ({
  teams: [],
  status: "idle",
  error: null,

  fetchTeams: async () => {
    set({ status: "loading", error: null });
    try {
      const teams = await teamsService.listTeams();
      set({ teams, status: "success" });
    } catch (err) {
      set({ status: "error", error: toErrorMessage(err) });
    }
  },

  saveTeam: async (input) => {
    const team = await teamsService.saveTeam(input);
    const existingIndex = get().teams.findIndex((t) => t.id === team.id);
    set({
      teams:
        existingIndex >= 0
          ? get().teams.map((t) => (t.id === team.id ? team : t))
          : [...get().teams, team].sort((a, b) => a.name.localeCompare(b.name)),
    });
    return team;
  },

  deleteTeam: async (id) => {
    await teamsService.deleteTeam(id);
    set({ teams: get().teams.filter((t) => t.id !== id) });
  },
}));

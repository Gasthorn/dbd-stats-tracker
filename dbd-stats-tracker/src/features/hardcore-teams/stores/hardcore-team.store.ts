import { create } from "zustand";
import { hardcoreTeamService } from "../services/hardcore-team.service";
import type { HardcoreTeamStore } from "./hardcore-team.store.types";

function toErrorMessage(err: unknown): string {
  const code = (err as { code?: string } | null)?.code;
  if (code === "23505") {
    return "Vous êtes déjà dans une équipe Hardcore active. Quittez-la avant d'en rejoindre une autre.";
  }
  const message = err instanceof Error ? err.message : (err as { message?: string } | null)?.message;
  if (message?.includes("not_a_friend")) return "Vous devez être ami avec cette personne pour l'inviter.";
  if (message?.includes("not_a_team_member")) return "Vous ne faites plus partie de cette équipe.";
  return message ?? "Une erreur inattendue est survenue.";
}

export const useHardcoreTeamStore = create<HardcoreTeamStore>((set, get) => ({
  members: [],
  status: "idle",
  error: null,

  fetchMyTeam: async (seasonId) => {
    set({ status: "loading", error: null });
    try {
      const members = await hardcoreTeamService.listMyTeamMembers(seasonId);
      set({ members, status: "success" });
    } catch (err) {
      set({ status: "error", error: toErrorMessage(err) });
    }
  },

  createTeam: async (seasonId) => {
    try {
      await hardcoreTeamService.createTeam(seasonId);
      await get().fetchMyTeam(seasonId);
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },

  inviteFriend: async (teamId, friendUserId, seasonId) => {
    try {
      await hardcoreTeamService.inviteFriend(teamId, friendUserId);
      await get().fetchMyTeam(seasonId);
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },

  acceptInvite: async (memberId, seasonId) => {
    try {
      await hardcoreTeamService.acceptInvite(memberId);
      await get().fetchMyTeam(seasonId);
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },

  leaveOrDecline: async (memberId, seasonId) => {
    try {
      await hardcoreTeamService.leaveOrDecline(memberId);
      await get().fetchMyTeam(seasonId);
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },

  recordDeath: async (characterName, seasonId) => {
    await hardcoreTeamService.recordDeath(characterName, seasonId);
    await get().fetchMyTeam(seasonId);
  },
}));

import { create } from "zustand";
import { i18n } from "../../../shared/i18n";
import { hardcoreTeamService } from "../services/hardcore-team.service";
import type { HardcoreTeamStore } from "./hardcore-team.store.types";

function toErrorMessage(err: unknown): string {
  const code = (err as { code?: string } | null)?.code;
  if (code === "23505") {
    return i18n.t("hardcoreTeam.alreadyInTeam");
  }
  const message = err instanceof Error ? err.message : (err as { message?: string } | null)?.message;
  if (message?.includes("not_a_friend")) return i18n.t("hardcoreTeam.notAFriend");
  if (message?.includes("not_a_team_member")) return i18n.t("hardcoreTeam.notAMember");
  return message ?? i18n.t("common.unexpectedError");
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

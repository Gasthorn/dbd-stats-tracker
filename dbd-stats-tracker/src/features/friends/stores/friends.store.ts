import { create } from "zustand";
import { i18n } from "../../../shared/i18n";
import { friendsService } from "../services/friends.service";
import type { FriendsStore } from "./friends.store.types";

function toErrorMessage(err: unknown): string {
  const code = (err as { code?: string } | null)?.code;
  if (code === "23505") return i18n.t("friends.duplicateRequest");
  const message = err instanceof Error ? err.message : (err as { message?: string } | null)?.message;
  return message ?? i18n.t("common.unexpectedError");
}

export const useFriendsStore = create<FriendsStore>((set, get) => ({
  friendships: [],
  status: "idle",
  error: null,

  fetchFriendships: async () => {
    set({ status: "loading", error: null });
    try {
      const friendships = await friendsService.listFriendships();
      set({ friendships, status: "success" });
    } catch (err) {
      set({ status: "error", error: toErrorMessage(err) });
    }
  },

  sendRequestByUsername: async (username) => {
    try {
      const found = await friendsService.findUserByUsername(username);
      if (!found) {
        throw new Error(i18n.t("friends.userNotFound"));
      }

      const existing = get().friendships.find((f) => f.friendId === found.id);
      if (existing?.status === "accepted") {
        throw new Error(i18n.t("friends.alreadyFriends"));
      }
      if (existing?.status === "pending" && existing.isRequester) {
        throw new Error(i18n.t("friends.alreadySent"));
      }
      if (existing?.status === "pending" && !existing.isRequester) {
        await friendsService.acceptRequest(existing.id);
      } else {
        await friendsService.sendFriendRequest(found.id);
      }

      await get().fetchFriendships();
    } catch (err) {
      throw new Error(toErrorMessage(err));
    }
  },

  respondToRequest: async (friendshipId, accept) => {
    if (accept) {
      await friendsService.acceptRequest(friendshipId);
    } else {
      await friendsService.removeFriendship(friendshipId);
    }
    await get().fetchFriendships();
  },

  removeFriendship: async (friendshipId) => {
    await friendsService.removeFriendship(friendshipId);
    await get().fetchFriendships();
  },

  markRequestsSeen: async (friendshipIds) => {
    await friendsService.markRequestsSeen(friendshipIds);
    await get().fetchFriendships();
  },

  sendHeartbeat: async () => {
    await friendsService.sendHeartbeat();
  },
}));

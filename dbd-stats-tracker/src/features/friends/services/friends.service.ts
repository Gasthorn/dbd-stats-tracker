import { supabase } from "../../../shared/lib/supabase/client";
import type { Friendship, UserSearchResult } from "../types/friend.types";
import type { FriendsService } from "./friends.service.types";

function toFriendship(row: {
  id: string;
  status: "pending" | "accepted";
  seen: boolean;
  created_at: string;
  responded_at: string | null;
  is_requester: boolean;
  friend_id: string;
  friend_username: string;
  friend_avatar_url: string | null;
  friend_last_seen_at: string | null;
}): Friendship {
  return {
    id: row.id,
    status: row.status,
    seen: row.seen,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
    isRequester: row.is_requester,
    friendId: row.friend_id,
    friendUsername: row.friend_username,
    friendAvatarUrl: row.friend_avatar_url,
    friendLastSeenAt: row.friend_last_seen_at,
  };
}

export const friendsService: FriendsService = {
  async listFriendships() {
    const { data, error } = await supabase.rpc("list_friendships");
    if (error) throw error;
    return (data ?? []).map(toFriendship);
  },

  async findUserByUsername(username) {
    const { data, error } = await supabase.rpc("find_user_by_username", {
      p_username: username.trim(),
    });
    if (error) throw error;
    const found = data?.[0];
    if (!found) return null;
    const result: UserSearchResult = {
      id: found.id,
      username: found.username,
      avatarUrl: found.avatar_url,
    };
    return result;
  },

  async sendFriendRequest(addresseeId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Utilisateur non connecté.");

    const { error } = await supabase
      .from("friendships")
      .insert({ requester_id: user.id, addressee_id: addresseeId });
    if (error) throw error;
  },

  async acceptRequest(friendshipId) {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("id", friendshipId);
    if (error) throw error;
  },

  async removeFriendship(friendshipId) {
    const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
    if (error) throw error;
  },

  async markRequestsSeen(friendshipIds) {
    if (friendshipIds.length === 0) return;
    const { error } = await supabase.from("friendships").update({ seen: true }).in("id", friendshipIds);
    if (error) throw error;
  },

  async sendHeartbeat() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("user_presence")
      .upsert({ user_id: user.id, last_seen_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) throw error;
  },
};

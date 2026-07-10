import type { AsyncStatus, UUID } from "../../../shared/types/common.types";
import type { Friendship } from "../types/friend.types";

export interface FriendsState {
  friendships: Friendship[];
  status: AsyncStatus;
  error: string | null;
}

export interface FriendsActions {
  fetchFriendships: () => Promise<void>;
  sendRequestByUsername: (username: string) => Promise<void>;
  respondToRequest: (friendshipId: UUID, accept: boolean) => Promise<void>;
  removeFriendship: (friendshipId: UUID) => Promise<void>;
  markRequestsSeen: (friendshipIds: UUID[]) => Promise<void>;
  sendHeartbeat: () => Promise<void>;
}

export type FriendsStore = FriendsState & FriendsActions;

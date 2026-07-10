import type { UUID } from "../../../shared/types/common.types";
import type { Friendship, UserSearchResult } from "../types/friend.types";

export interface FriendsService {
  listFriendships: () => Promise<Friendship[]>;
  findUserByUsername: (username: string) => Promise<UserSearchResult | null>;
  sendFriendRequest: (addresseeId: UUID) => Promise<void>;
  acceptRequest: (friendshipId: UUID) => Promise<void>;
  /** Deletes the friendship row - covers declining an incoming request, cancelling an outgoing one, and unfriending. */
  removeFriendship: (friendshipId: UUID) => Promise<void>;
  markRequestsSeen: (friendshipIds: UUID[]) => Promise<void>;
  sendHeartbeat: () => Promise<void>;
}

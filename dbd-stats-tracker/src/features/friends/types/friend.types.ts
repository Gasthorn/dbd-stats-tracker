import type { ISODateString, UUID } from "../../../shared/types/common.types";

export type FriendshipStatus = "pending" | "accepted";

export interface Friendship {
  id: UUID;
  status: FriendshipStatus;
  /** Whether the addressee has dismissed the incoming-request popup for this row. */
  seen: boolean;
  createdAt: ISODateString;
  respondedAt: ISODateString | null;
  /** true if the current user sent this request, false if they received it. */
  isRequester: boolean;
  friendId: UUID;
  friendUsername: string;
  friendAvatarUrl: string | null;
  friendLastSeenAt: ISODateString | null;
}

export interface UserSearchResult {
  id: UUID;
  username: string;
  avatarUrl: string | null;
}

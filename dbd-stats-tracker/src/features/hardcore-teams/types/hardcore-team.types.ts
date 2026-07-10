import type { ISODateString, UUID } from "../../../shared/types/common.types";

export type HardcoreTeamMemberStatus = "pending" | "accepted";

/** One row per member of a Team Hardcore squad the current user belongs to (pending or accepted). */
export interface HardcoreTeamMember {
  memberId: UUID;
  teamId: UUID;
  /** The squad's shared dead-survivor pool for the current season (already season-adjusted server-side). */
  teamDeadSurvivors: string[];
  memberUserId: UUID;
  memberUsername: string;
  status: HardcoreTeamMemberStatus;
  invitedBy: UUID;
  /** true if this row is the current user's own membership. */
  isSelf: boolean;
  createdAt: ISODateString;
  respondedAt: ISODateString | null;
}

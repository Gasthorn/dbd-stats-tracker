import type { UUID } from "../../../shared/types/common.types";
import type { HardcoreTeamMember } from "../types/hardcore-team.types";

export interface HardcoreTeamService {
  listMyTeamMembers: (seasonId: string) => Promise<HardcoreTeamMember[]>;
  createTeam: (seasonId: string) => Promise<void>;
  inviteFriend: (teamId: UUID, friendUserId: UUID) => Promise<void>;
  acceptInvite: (memberId: UUID) => Promise<void>;
  /** Declines an incoming invite, cancels one sent, or leaves an accepted team - always a delete. */
  leaveOrDecline: (memberId: UUID) => Promise<void>;
  recordDeath: (characterName: string, seasonId: string) => Promise<void>;
}

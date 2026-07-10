import type { AsyncStatus, UUID } from "../../../shared/types/common.types";
import type { HardcoreTeamMember } from "../types/hardcore-team.types";

export interface HardcoreTeamState {
  members: HardcoreTeamMember[];
  status: AsyncStatus;
  error: string | null;
}

export interface HardcoreTeamActions {
  fetchMyTeam: (seasonId: string) => Promise<void>;
  createTeam: (seasonId: string) => Promise<void>;
  inviteFriend: (teamId: UUID, friendUserId: UUID, seasonId: string) => Promise<void>;
  acceptInvite: (memberId: UUID, seasonId: string) => Promise<void>;
  leaveOrDecline: (memberId: UUID, seasonId: string) => Promise<void>;
  recordDeath: (characterName: string, seasonId: string) => Promise<void>;
}

export type HardcoreTeamStore = HardcoreTeamState & HardcoreTeamActions;

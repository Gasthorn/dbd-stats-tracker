import type { AsyncStatus, UUID } from "../../../shared/types/common.types";
import type { CreateTeamInput, Team } from "../types/team.types";

export interface TeamsState {
  teams: Team[];
  status: AsyncStatus;
  error: string | null;
}

export interface TeamsActions {
  fetchTeams: () => Promise<void>;
  saveTeam: (input: CreateTeamInput) => Promise<Team>;
  deleteTeam: (id: UUID) => Promise<void>;
}

export type TeamsStore = TeamsState & TeamsActions;

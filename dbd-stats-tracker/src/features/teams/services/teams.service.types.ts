import type { UUID } from "../../../shared/types/common.types";
import type { CreateTeamInput, Team } from "../types/team.types";

export interface TeamsService {
  listTeams: () => Promise<Team[]>;
  /** Creates the team, or overwrites the existing one with the same name. */
  saveTeam: (input: CreateTeamInput) => Promise<Team>;
  deleteTeam: (id: UUID) => Promise<void>;
}

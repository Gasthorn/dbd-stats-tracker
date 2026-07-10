import { supabase } from "../../../shared/lib/supabase/client";
import type { HardcoreTeamMember } from "../types/hardcore-team.types";
import type { HardcoreTeamService } from "./hardcore-team.service.types";

function toMember(row: {
  member_id: string;
  team_id: string;
  team_dead_survivors: string[];
  member_user_id: string;
  member_username: string;
  status: "pending" | "accepted";
  invited_by: string;
  is_self: boolean;
  created_at: string;
  responded_at: string | null;
}): HardcoreTeamMember {
  return {
    memberId: row.member_id,
    teamId: row.team_id,
    teamDeadSurvivors: row.team_dead_survivors,
    memberUserId: row.member_user_id,
    memberUsername: row.member_username,
    status: row.status,
    invitedBy: row.invited_by,
    isSelf: row.is_self,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
  };
}

export const hardcoreTeamService: HardcoreTeamService = {
  async listMyTeamMembers(seasonId) {
    const { data, error } = await supabase.rpc("list_my_hardcore_team_members", {
      p_season_id: seasonId,
    });
    if (error) throw error;
    return (data ?? []).map(toMember);
  },

  async createTeam(seasonId) {
    const { error } = await supabase.rpc("create_hardcore_team", { p_season_id: seasonId });
    if (error) throw error;
  },

  async inviteFriend(teamId, friendUserId) {
    const { error } = await supabase.rpc("invite_to_hardcore_team", {
      p_team_id: teamId,
      p_friend_user_id: friendUserId,
    });
    if (error) throw error;
  },

  async acceptInvite(memberId) {
    const { error } = await supabase
      .from("hardcore_team_members")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("id", memberId);
    if (error) throw error;
  },

  async leaveOrDecline(memberId) {
    const { error } = await supabase.from("hardcore_team_members").delete().eq("id", memberId);
    if (error) throw error;
  },

  async recordDeath(characterName, seasonId) {
    const { error } = await supabase.rpc("record_team_hardcore_death", {
      p_character_name: characterName,
      p_season_id: seasonId,
    });
    if (error) throw error;
  },
};

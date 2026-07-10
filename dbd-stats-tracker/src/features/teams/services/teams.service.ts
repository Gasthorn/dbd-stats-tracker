import type { TeamRow } from "../../../shared/lib/supabase/database.types";
import { supabase } from "../../../shared/lib/supabase/client";
import type { Team } from "../types/team.types";
import type { TeamsService } from "./teams.service.types";

function toTeam(row: TeamRow): Team {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    memberNames: row.member_names,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const teamsService: TeamsService = {
  async listTeams() {
    const { data, error } = await supabase.from("teams").select("*").order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toTeam);
  },

  async saveTeam(input) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Utilisateur non connecté.");

    const { data, error } = await supabase
      .from("teams")
      .upsert(
        {
          user_id: user.id,
          name: input.name,
          member_names: input.memberNames,
        },
        { onConflict: "user_id,name" },
      )
      .select("*")
      .single();
    if (error) throw error;
    return toTeam(data);
  },

  async deleteTeam(id) {
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) throw error;
  },
};

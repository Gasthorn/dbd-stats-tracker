import type { BuildRow } from "../../../shared/lib/supabase/database.types";
import { supabase } from "../../../shared/lib/supabase/client";
import type { Build } from "../types/build.types";
import type { BuildsService } from "./builds.service.types";

function toBuild(row: BuildRow): Build {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    role: row.role,
    characterName: row.character_name,
    perks: row.perks,
    equipment: row.equipment,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const buildsService: BuildsService = {
  async listBuilds() {
    const { data, error } = await supabase
      .from("builds")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toBuild);
  },

  async saveBuild(input) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Utilisateur non connecté.");

    const { data, error } = await supabase
      .from("builds")
      .upsert(
        {
          user_id: user.id,
          name: input.name,
          role: input.role,
          character_name: input.characterName,
          perks: input.perks,
          equipment: input.equipment,
        },
        { onConflict: "user_id,name" },
      )
      .select("*")
      .single();
    if (error) throw error;
    return toBuild(data);
  },

  async deleteBuild(id) {
    const { error } = await supabase.from("builds").delete().eq("id", id);
    if (error) throw error;
  },
};

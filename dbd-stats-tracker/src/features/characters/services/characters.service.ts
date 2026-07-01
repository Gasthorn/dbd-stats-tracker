import { supabase } from "../../../shared/lib/supabase/client";
import type { CharactersService } from "./characters.service.types";

export const charactersService: CharactersService = {
  async getUnlockedCharacters(userId) {
    const { data, error } = await supabase
      .from("users")
      .select("unlocked_killers, unlocked_survivors")
      .eq("id", userId)
      .single();

    if (error || !data) {
      throw new Error("Impossible de récupérer les personnages débloqués.");
    }

    return {
      killers: data.unlocked_killers,
      survivors: data.unlocked_survivors,
    };
  },

  async updateUnlockedCharacters(userId, unlocked) {
    const { error } = await supabase
      .from("users")
      .update({
        unlocked_killers: unlocked.killers,
        unlocked_survivors: unlocked.survivors,
      })
      .eq("id", userId);

    if (error) throw error;
  },
};

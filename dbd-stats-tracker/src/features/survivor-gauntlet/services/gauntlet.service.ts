import type { GauntletProgressRow } from "../../../shared/lib/supabase/database.types";
import { supabase } from "../../../shared/lib/supabase/client";
import type { GauntletProgress, UpdateGauntletProgressInput } from "../types/gauntlet.types";
import type { GauntletService } from "./gauntlet.service.types";

function toGauntletProgress(row: GauntletProgressRow): GauntletProgress {
  return {
    id: row.id,
    userId: row.user_id,
    role: row.role,
    completedCharacters: row.completed_characters,
    currentCharacter: row.current_character,
    characterQueue: row.character_queue,
    updatedAt: row.updated_at,
  };
}

export const gauntletService: GauntletService = {
  async getOrCreateProgress(userId, role) {
    const { data: existing, error: selectError } = await supabase
      .from("gauntlet_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("role", role)
      .maybeSingle();
    if (selectError) throw selectError;
    if (existing) return toGauntletProgress(existing);

    const { data: created, error: insertError } = await supabase
      .from("gauntlet_progress")
      .insert({ user_id: userId, role })
      .select("*")
      .single();

    if (insertError) {
      // Lost a race to create this row (e.g. concurrent init calls, or React StrictMode's
      // double-invoked effects in dev) - just fetch the winner.
      if (insertError.code === "23505") {
        const { data: raceWinner, error: refetchError } = await supabase
          .from("gauntlet_progress")
          .select("*")
          .eq("user_id", userId)
          .eq("role", role)
          .single();
        if (refetchError) throw refetchError;
        return toGauntletProgress(raceWinner);
      }
      throw insertError;
    }
    return toGauntletProgress(created);
  },

  async updateProgress(input: UpdateGauntletProgressInput) {
    const { id, ...rest } = input;
    const { data, error } = await supabase
      .from("gauntlet_progress")
      .update({
        ...(rest.completedCharacters !== undefined
          ? { completed_characters: rest.completedCharacters }
          : {}),
        ...(rest.currentCharacter !== undefined ? { current_character: rest.currentCharacter } : {}),
        ...(rest.characterQueue !== undefined ? { character_queue: rest.characterQueue } : {}),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return toGauntletProgress(data);
  },

  async resetProgress(id) {
    const { error } = await supabase.from("gauntlet_progress").delete().eq("id", id);
    if (error) throw error;
  },
};

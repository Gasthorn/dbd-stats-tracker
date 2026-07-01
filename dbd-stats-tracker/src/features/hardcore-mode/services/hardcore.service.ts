import type { HardcoreRunRow } from "../../../shared/lib/supabase/database.types";
import { supabase } from "../../../shared/lib/supabase/client";
import type { HardcoreRun, UpdateHardcoreRunInput } from "../types/hardcore.types";
import type { HardcoreService } from "./hardcore.service.types";

function toHardcoreRun(row: HardcoreRunRow): HardcoreRun {
  return {
    id: row.id,
    userId: row.user_id,
    seasonId: row.season_id,
    killerPips: row.killer_pips,
    survivorPips: row.survivor_pips,
    deadKillers: row.dead_killers,
    deadSurvivors: row.dead_survivors,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    updatedAt: row.updated_at,
  };
}

export const hardcoreService: HardcoreService = {
  async getOrCreateRun(userId, seasonId) {
    const { data: existing, error: selectError } = await supabase
      .from("hardcore_runs")
      .select("*")
      .eq("user_id", userId)
      .eq("season_id", seasonId)
      .maybeSingle();
    if (selectError) throw selectError;
    if (existing) return toHardcoreRun(existing);

    const { data: created, error: insertError } = await supabase
      .from("hardcore_runs")
      .insert({ user_id: userId, season_id: seasonId })
      .select("*")
      .single();

    if (insertError) {
      // Lost a race to create this season's run (e.g. two concurrent init calls,
      // or React StrictMode's double-invoked effects in dev) - just fetch the winner.
      if (insertError.code === "23505") {
        const { data: raceWinner, error: refetchError } = await supabase
          .from("hardcore_runs")
          .select("*")
          .eq("user_id", userId)
          .eq("season_id", seasonId)
          .single();
        if (refetchError) throw refetchError;
        return toHardcoreRun(raceWinner);
      }
      throw insertError;
    }
    return toHardcoreRun(created);
  },

  async updateRun(input: UpdateHardcoreRunInput) {
    const { id, ...rest } = input;
    const { data, error } = await supabase
      .from("hardcore_runs")
      .update({
        ...(rest.killerPips !== undefined ? { killer_pips: rest.killerPips } : {}),
        ...(rest.survivorPips !== undefined ? { survivor_pips: rest.survivorPips } : {}),
        ...(rest.deadKillers !== undefined ? { dead_killers: rest.deadKillers } : {}),
        ...(rest.deadSurvivors !== undefined ? { dead_survivors: rest.deadSurvivors } : {}),
        ...(rest.endedAt !== undefined ? { ended_at: rest.endedAt } : {}),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return toHardcoreRun(data);
  },

  async resetRun(id) {
    const { error } = await supabase.from("hardcore_runs").delete().eq("id", id);
    if (error) throw error;
  },
};

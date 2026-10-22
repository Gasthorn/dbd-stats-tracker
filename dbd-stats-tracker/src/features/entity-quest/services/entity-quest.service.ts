import type { EntityQuestRunRow } from "../../../shared/lib/supabase/database.types";
import { supabase } from "../../../shared/lib/supabase/client";
import type { QuestRunState } from "../../../shared/lib/entity-quest/types";
import type { EntityQuestRun, UpdateEntityQuestRunInput } from "../types/entity-quest.types";
import type { EntityQuestService } from "./entity-quest.service.types";

function toEntityQuestRun(row: EntityQuestRunRow): EntityQuestRun {
  return {
    id: row.id,
    userId: row.user_id,
    role: row.role,
    difficulty: row.difficulty,
    status: row.status,
    lives: row.lives,
    maxLives: row.max_lives,
    shards: row.shards,
    state: row.state as QuestRunState,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    updatedAt: row.updated_at,
  };
}

export const entityQuestService: EntityQuestService = {
  async getActiveRun(userId, role) {
    const { data, error } = await supabase
      .from("entity_quest_runs")
      .select("*")
      .eq("user_id", userId)
      .eq("role", role)
      .eq("status", "in_progress")
      .maybeSingle();
    if (error) throw error;
    return data ? toEntityQuestRun(data) : null;
  },

  async listFinishedRuns(userId, limit = 20) {
    const { data, error } = await supabase
      .from("entity_quest_runs")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "in_progress")
      .order("started_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data.map(toEntityQuestRun);
  },

  async createRun(userId, input) {
    const { data, error } = await supabase
      .from("entity_quest_runs")
      .insert({
        user_id: userId,
        role: input.role,
        difficulty: input.difficulty,
        lives: input.lives,
        max_lives: input.maxLives,
        state: input.state,
      })
      .select("*")
      .single();

    if (error) {
      // Another in-progress run for this role already exists (double click, second
      // window...): the partial unique index rejected ours, so resume that one.
      if (error.code === "23505") {
        const existing = await this.getActiveRun(userId, input.role);
        if (existing) return existing;
      }
      throw error;
    }
    return toEntityQuestRun(data);
  },

  async updateRun(input: UpdateEntityQuestRunInput) {
    const { id, ...rest } = input;
    const { data, error } = await supabase
      .from("entity_quest_runs")
      .update({
        ...(rest.status !== undefined ? { status: rest.status } : {}),
        ...(rest.lives !== undefined ? { lives: rest.lives } : {}),
        ...(rest.shards !== undefined ? { shards: rest.shards } : {}),
        ...(rest.state !== undefined ? { state: rest.state } : {}),
        ...(rest.endedAt !== undefined ? { ended_at: rest.endedAt } : {}),
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return toEntityQuestRun(data);
  },
};

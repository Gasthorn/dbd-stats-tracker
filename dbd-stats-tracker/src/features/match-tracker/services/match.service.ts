import type { MatchRow } from "../../../shared/lib/supabase/database.types";
import { supabase } from "../../../shared/lib/supabase/client";
import type { PaginatedResult } from "../../../shared/types/common.types";
import type { CreateMatchInput, Match, UpdateMatchInput } from "../types/match.types";
import type { MatchService } from "./match.service.types";

function toMatch(row: MatchRow): Match {
  const base = {
    id: row.id,
    userId: row.user_id,
    hardcoreRunId: row.hardcore_run_id,
    mode: row.mode,
    characterName: row.character_name,
    perks: row.perks,
    equipment: row.equipment,
    bloodpoints: row.bloodpoints,
    generatorsCompleted: row.generators_completed,
    ignoreChallenge: row.ignore_challenge,
    playedAt: row.played_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (row.role === "killer") {
    return {
      ...base,
      role: "killer",
      opponentName: null,
      kills: row.kills ?? 0,
      escapeResult: null,
      hardcorePips: row.hardcore_pips,
      hardcoreDied: row.hardcore_died,
    };
  }

  return {
    ...base,
    role: "survivor",
    opponentName: row.opponent_name,
    kills: null,
    escapeResult: row.escape_result as Exclude<MatchRow["escape_result"], null>,
    hardcorePips: row.hardcore_pips,
    hardcoreDied: row.hardcore_died,
  };
}

function toInsertRow(userId: string, input: CreateMatchInput) {
  return {
    user_id: userId,
    hardcore_run_id: input.hardcoreRunId,
    role: input.role,
    mode: input.mode,
    character_name: input.characterName,
    opponent_name: input.role === "survivor" ? input.opponentName : null,
    perks: input.perks,
    equipment: input.equipment,
    bloodpoints: input.bloodpoints,
    kills: input.role === "killer" ? input.kills : null,
    generators_completed: input.generatorsCompleted,
    escape_result: input.role === "survivor" ? input.escapeResult : null,
    hardcore_pips: input.hardcorePips,
    hardcore_died: input.hardcoreDied,
    ignore_challenge: input.ignoreChallenge,
    ...(input.playedAt ? { played_at: input.playedAt } : {}),
  };
}

function toUpdateRow(input: UpdateMatchInput) {
  const { id, ...rest } = input;
  void id;
  return {
    ...(rest.hardcoreRunId !== undefined ? { hardcore_run_id: rest.hardcoreRunId } : {}),
    ...(rest.role !== undefined ? { role: rest.role } : {}),
    ...(rest.mode !== undefined ? { mode: rest.mode } : {}),
    ...(rest.characterName !== undefined ? { character_name: rest.characterName } : {}),
    ...(rest.role === "survivor" && rest.opponentName !== undefined
      ? { opponent_name: rest.opponentName }
      : {}),
    ...(rest.perks !== undefined ? { perks: rest.perks } : {}),
    ...(rest.equipment !== undefined ? { equipment: rest.equipment } : {}),
    ...(rest.bloodpoints !== undefined ? { bloodpoints: rest.bloodpoints } : {}),
    ...(rest.role === "killer" && rest.kills !== undefined ? { kills: rest.kills } : {}),
    ...(rest.generatorsCompleted !== undefined
      ? { generators_completed: rest.generatorsCompleted }
      : {}),
    ...(rest.role === "survivor" && rest.escapeResult !== undefined
      ? { escape_result: rest.escapeResult }
      : {}),
    ...(rest.hardcorePips !== undefined ? { hardcore_pips: rest.hardcorePips } : {}),
    ...(rest.hardcoreDied !== undefined ? { hardcore_died: rest.hardcoreDied } : {}),
    ...(rest.ignoreChallenge !== undefined ? { ignore_challenge: rest.ignoreChallenge } : {}),
    ...(rest.playedAt !== undefined ? { played_at: rest.playedAt } : {}),
  };
}

export const matchService: MatchService = {
  async listMatches(filters, pagination) {
    let query = supabase
      .from("matches")
      .select("*", { count: "exact" })
      .order("played_at", { ascending: false });

    if (filters?.role) query = query.eq("role", filters.role);
    if (filters?.mode) query = query.eq("mode", filters.mode);
    if (filters?.characterName) query = query.eq("character_name", filters.characterName);
    if (filters?.dateFrom) query = query.gte("played_at", filters.dateFrom);
    if (filters?.dateTo) query = query.lte("played_at", filters.dateTo);

    if (pagination) {
      const from = (pagination.page - 1) * pagination.pageSize;
      const to = from + pagination.pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const items = (data ?? []).map(toMatch);
    const pageSize = pagination?.pageSize ?? items.length;
    const page = pagination?.page ?? 1;
    const total = count ?? items.length;

    const result: PaginatedResult<Match> = {
      items,
      total,
      page,
      pageSize,
      hasNextPage: page * pageSize < total,
    };
    return result;
  },

  async getMatchById(id) {
    const { data, error } = await supabase.from("matches").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? toMatch(data) : null;
  },

  async createMatch(input) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Utilisateur non connecté.");

    const { data, error } = await supabase
      .from("matches")
      .insert(toInsertRow(user.id, input))
      .select("*")
      .single();
    if (error) throw error;
    return toMatch(data);
  },

  async updateMatch(input) {
    const { data, error } = await supabase
      .from("matches")
      .update(toUpdateRow(input))
      .eq("id", input.id)
      .select("*")
      .single();
    if (error) throw error;
    return toMatch(data);
  },

  async deleteMatch(id) {
    const { error } = await supabase.from("matches").delete().eq("id", id);
    if (error) throw error;
  },
};

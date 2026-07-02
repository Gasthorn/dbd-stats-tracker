import { generateRoundRobinPairings } from "../../../shared/lib/world-cup/roundRobin";
import type {
  WorldCupFixtureRow,
  WorldCupGroupRow,
  WorldCupRunRow,
} from "../../../shared/lib/supabase/database.types";
import { supabase } from "../../../shared/lib/supabase/client";
import type { WorldCupFixture, WorldCupGroup, WorldCupRun } from "../types/world-cup.types";
import type { WorldCupService } from "./world-cup.service.types";

function toRun(row: WorldCupRunRow): WorldCupRun {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    currentRound: row.current_round,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}

function toGroup(row: WorldCupGroupRow): WorldCupGroup {
  return {
    id: row.id,
    runId: row.run_id,
    groupIndex: row.group_index,
    killers: row.killers,
  };
}

function toFixture(row: WorldCupFixtureRow): WorldCupFixture {
  return {
    id: row.id,
    runId: row.run_id,
    groupId: row.group_id,
    round: row.round,
    slotIndex: row.slot_index,
    killerA: row.killer_a,
    killerB: row.killer_b,
    killerAMatchId: row.killer_a_match_id,
    killerBMatchId: row.killer_b_match_id,
    winner: row.winner,
  };
}

export const worldCupService: WorldCupService = {
  async getActiveRun(userId) {
    const { data, error } = await supabase
      .from("world_cup_runs")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "completed")
      .maybeSingle();
    if (error) throw error;
    return data ? toRun(data) : null;
  },

  async getLastCompletedRun(userId) {
    const { data, error } = await supabase
      .from("world_cup_runs")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? toRun(data) : null;
  },

  async createRun({ userId, groups }) {
    const { data: runRow, error: runError } = await supabase
      .from("world_cup_runs")
      .insert({ user_id: userId })
      .select("*")
      .single();
    if (runError) throw runError;
    const run = toRun(runRow);

    const { data: groupRows, error: groupsError } = await supabase
      .from("world_cup_groups")
      .insert(
        groups.map((killers, groupIndex) => ({
          run_id: run.id,
          user_id: userId,
          group_index: groupIndex,
          killers,
        })),
      )
      .select("*");
    if (groupsError) throw groupsError;
    const worldCupGroups = (groupRows ?? []).map(toGroup);

    const fixtureInserts = worldCupGroups.flatMap((group) =>
      generateRoundRobinPairings(group.killers).map((pairing) => ({
        run_id: run.id,
        user_id: userId,
        group_id: group.id,
        round: "group" as const,
        slot_index: pairing.slotIndex,
        killer_a: pairing.killerA,
        killer_b: pairing.killerB,
      })),
    );
    const { data: fixtureRows, error: fixturesError } = await supabase
      .from("world_cup_fixtures")
      .insert(fixtureInserts)
      .select("*");
    if (fixturesError) throw fixturesError;

    return { run, groups: worldCupGroups, fixtures: (fixtureRows ?? []).map(toFixture) };
  },

  async listGroups(runId) {
    const { data, error } = await supabase
      .from("world_cup_groups")
      .select("*")
      .eq("run_id", runId)
      .order("group_index", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toGroup);
  },

  async listFixtures(runId) {
    const { data, error } = await supabase
      .from("world_cup_fixtures")
      .select("*")
      .eq("run_id", runId)
      .order("slot_index", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(toFixture);
  },

  async recordFixtureSide(fixtureId, side, matchId) {
    const { data, error } = await supabase
      .from("world_cup_fixtures")
      .update(side === "a" ? { killer_a_match_id: matchId } : { killer_b_match_id: matchId })
      .eq("id", fixtureId)
      .select("*")
      .single();
    if (error) throw error;
    return toFixture(data);
  },

  async setFixtureWinner(fixtureId, winner) {
    const { data, error } = await supabase
      .from("world_cup_fixtures")
      .update({ winner })
      .eq("id", fixtureId)
      .select("*")
      .single();
    if (error) throw error;
    return toFixture(data);
  },

  async createKnockoutFixtures({ userId, runId, round, pairings }) {
    const { data, error } = await supabase
      .from("world_cup_fixtures")
      .insert(
        pairings.map((pairing) => ({
          run_id: runId,
          user_id: userId,
          group_id: null,
          round,
          slot_index: pairing.slotIndex,
          killer_a: pairing.killerA,
          killer_b: pairing.killerB,
        })),
      )
      .select("*");
    if (error) throw error;
    return (data ?? []).map(toFixture);
  },

  async advanceRunStatus(runId, status, currentRound) {
    const { data, error } = await supabase
      .from("world_cup_runs")
      .update({
        status,
        current_round: currentRound,
        completed_at: status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", runId)
      .select("*")
      .single();
    if (error) throw error;
    return toRun(data);
  },

  async resetActiveRun(runId) {
    const { error } = await supabase.from("world_cup_runs").delete().eq("id", runId);
    if (error) throw error;
  },
};

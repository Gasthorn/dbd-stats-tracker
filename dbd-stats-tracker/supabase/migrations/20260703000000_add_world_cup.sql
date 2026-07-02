-- World Cup mode: killers are split into FIFA-style seeded pools of 6, then
-- the best 32 (by points, hook differential, hooks scored, head-to-head)
-- advance to a snake-seeded single-elimination bracket. This mode has no
-- equivalent in the legacy prototype.
--
-- Each fixture (a face-off between two killers) requires each killer to play
-- their own dedicated match; the fixture stores the two match ids and derives
-- the result (hooks obtained) by reading those matches, so nothing about the
-- outcome is duplicated/denormalized here - except `winner`, which IS stored:
-- a knockout tie that survives every automatic tiebreaker is resolved by a
-- manual pick that only exists in the moment, so it has to be persisted to be
-- reconstructable later (finishing position seeds the player's next World Cup).
--
-- Runs are not a hard singleton: completed runs are kept as history (to seed
-- the next tournament's pools from the previous one's final standings), and
-- only one *unfinished* run per player is allowed at a time.

-- ---------------------------------------------------------------------------
-- matches: add the "hooks obtained" stat (killer-only), and the new mode.
-- ---------------------------------------------------------------------------
alter type public.match_mode add value 'world_cup';

alter table public.matches
  add column hooks smallint check (hooks >= 0);

alter table public.matches
  add constraint matches_hooks_only_for_killer check (role = 'killer' or hooks is null);

comment on column public.matches.hooks is 'Number of hooks the killer landed in this match. Killer-only; the deciding stat for World Cup fixtures, optional elsewhere.';

-- ---------------------------------------------------------------------------
-- Table: world_cup_runs
-- Every World Cup tournament a player has started. Completed ones stay as
-- history to seed the next draw; only one non-completed run is allowed at a
-- time (enforced by the partial unique index below).
-- ---------------------------------------------------------------------------
create table public.world_cup_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  status text not null default 'group_stage' check (status in ('group_stage', 'knockout', 'completed')),
  current_round text check (current_round in ('round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'final')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

comment on table public.world_cup_runs is 'A World Cup tournament (current or historical) for a player: group stage, knockout, or completed.';

create unique index world_cup_runs_one_active_per_user
  on public.world_cup_runs (user_id)
  where status <> 'completed';

create index world_cup_runs_user_completed_idx
  on public.world_cup_runs (user_id, completed_at desc)
  where status = 'completed';

create trigger set_world_cup_runs_updated_at
  before update on public.world_cup_runs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: world_cup_groups
-- The fixed 6-killer roster of each pool, drawn once when the run starts.
-- ---------------------------------------------------------------------------
create table public.world_cup_groups (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.world_cup_runs (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  group_index smallint not null,
  killers text[] not null check (array_length(killers, 1) = 6),
  constraint world_cup_groups_run_index_unique unique (run_id, group_index)
);

comment on table public.world_cup_groups is 'One 6-killer pool of a World Cup run; round-robin fixtures are derived from this roster.';

create index world_cup_groups_run_id_idx on public.world_cup_groups (run_id);

-- ---------------------------------------------------------------------------
-- Table: world_cup_fixtures
-- One face-off between two killers, either a group-stage round-robin game
-- or a knockout-bracket game. Each side is filled in independently as the
-- player records that killer's match.
-- ---------------------------------------------------------------------------
create table public.world_cup_fixtures (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.world_cup_runs (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  group_id uuid references public.world_cup_groups (id) on delete cascade,
  round text not null check (round in ('group', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'final')),
  slot_index smallint not null,
  killer_a text not null,
  killer_b text not null,
  killer_a_match_id uuid references public.matches (id) on delete set null,
  killer_b_match_id uuid references public.matches (id) on delete set null,
  winner text check (winner in ('a', 'b', 'draw')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint world_cup_fixtures_group_required_for_group_round
    check ((round = 'group') = (group_id is not null))
);

comment on table public.world_cup_fixtures is 'A single killer-vs-killer face-off. Hooks (and, for a knockout tie, kills/bloodpoints) are read from the two linked matches to resolve it automatically; `winner` is only written once resolved, so a rare fully-tied knockout duel that needed a manual pick can still be reconstructed later.';

create index world_cup_fixtures_run_id_idx on public.world_cup_fixtures (run_id);
create index world_cup_fixtures_group_id_idx on public.world_cup_fixtures (group_id);

create trigger set_world_cup_fixtures_updated_at
  before update on public.world_cup_fixtures
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.world_cup_runs enable row level security;
alter table public.world_cup_groups enable row level security;
alter table public.world_cup_fixtures enable row level security;

-- world_cup_runs
create policy "world_cup_runs_select_own" on public.world_cup_runs
  for select using (auth.uid() = user_id);

create policy "world_cup_runs_insert_own" on public.world_cup_runs
  for insert with check (auth.uid() = user_id);

create policy "world_cup_runs_update_own" on public.world_cup_runs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "world_cup_runs_delete_own" on public.world_cup_runs
  for delete using (auth.uid() = user_id);

-- world_cup_groups
create policy "world_cup_groups_select_own" on public.world_cup_groups
  for select using (auth.uid() = user_id);

create policy "world_cup_groups_insert_own" on public.world_cup_groups
  for insert with check (auth.uid() = user_id);

create policy "world_cup_groups_delete_own" on public.world_cup_groups
  for delete using (auth.uid() = user_id);

-- world_cup_fixtures
create policy "world_cup_fixtures_select_own" on public.world_cup_fixtures
  for select using (auth.uid() = user_id);

create policy "world_cup_fixtures_insert_own" on public.world_cup_fixtures
  for insert with check (auth.uid() = user_id);

create policy "world_cup_fixtures_update_own" on public.world_cup_fixtures
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "world_cup_fixtures_delete_own" on public.world_cup_fixtures
  for delete using (auth.uid() = user_id);

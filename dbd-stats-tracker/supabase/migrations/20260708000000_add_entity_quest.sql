-- Entity Quest mode: a roguelike run adapted from Crown Quest (a community
-- Mario Kart World challenge). The player climbs a 13-floor branching map of
-- trials (matches), events, shops and a legendary-quest chest, and may only
-- play with the killers/perks/equipment collected during the run.
--
-- The whole run state (map, collection, open shop, active quest...) is a
-- single jsonb document: it is only ever read and written as a whole by its
-- owner, never queried into, and its shape evolves with the game rules.
-- Matches played during a run are regular `matches` rows with
-- mode = 'entity_quest'; their ids are kept in the run state.
--
-- Runs are kept as history once won or lost; only one in-progress run per
-- player and per role is allowed at a time.

alter type public.match_mode add value 'entity_quest';

-- ---------------------------------------------------------------------------
-- Table: entity_quest_runs
-- ---------------------------------------------------------------------------
create table public.entity_quest_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  role public.match_role not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'impossible')),
  status text not null default 'in_progress' check (status in ('in_progress', 'won', 'lost')),
  lives smallint not null check (lives >= 0),
  max_lives smallint not null check (max_lives > 0),
  shards integer not null default 0 check (shards >= 0),
  state jsonb not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  updated_at timestamptz not null default now()
);

comment on table public.entity_quest_runs is 'Entity Quest roguelike runs (current or historical): difficulty, lives, shards and the full run state as jsonb.';

create unique index entity_quest_runs_one_active_per_role
  on public.entity_quest_runs (user_id, role)
  where status = 'in_progress';

create index entity_quest_runs_user_started_idx
  on public.entity_quest_runs (user_id, started_at desc);

create trigger set_entity_quest_runs_updated_at
  before update on public.entity_quest_runs
  for each row execute function public.set_updated_at();

alter table public.entity_quest_runs enable row level security;

create policy "entity_quest_runs_select_own" on public.entity_quest_runs
  for select using (auth.uid() = user_id);

create policy "entity_quest_runs_insert_own" on public.entity_quest_runs
  for insert with check (auth.uid() = user_id);

create policy "entity_quest_runs_update_own" on public.entity_quest_runs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "entity_quest_runs_delete_own" on public.entity_quest_runs
  for delete using (auth.uid() = user_id);

-- DbD Stats Tracker — initial schema
-- Tables: users, matches, builds, gauntlet_progress, hardcore_runs
--
-- Character/killer/perk/item names are stored as plain text rather than
-- foreign keys into a catalog table: the game roster (killers, survivors,
-- perks, addons, offerings, items) is static reference data shipped with
-- the app (see legacy-web-prototype/perks.json and equipment.json), not
-- user-generated content, so it does not need to live in Postgres.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.match_role as enum ('killer', 'survivor');

create type public.match_mode as enum ('normal', 'hardcore', 'gauntlet');

create type public.escape_result as enum (
  'escaped_door',
  'escaped_hatch',
  'sacrificed',
  'killed',
  'disconnected'
);

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at current on every row update
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Table: users
-- One row per authenticated player, keyed on the Supabase auth user id.
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 32),
  avatar_url text,
  unlocked_killers text[] not null default '{}',
  unlocked_survivors text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.users is 'App profile for an authenticated player, 1:1 with auth.users.';

create trigger set_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Table: hardcore_runs
-- One row per player per Hardcore season (season resets pips + dead chars).
-- ---------------------------------------------------------------------------
create table public.hardcore_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  season_id text not null,
  killer_pips integer not null default 0 check (killer_pips >= 0),
  survivor_pips integer not null default 0 check (survivor_pips >= 0),
  dead_killers text[] not null default '{}',
  dead_survivors text[] not null default '{}',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint hardcore_runs_user_season_unique unique (user_id, season_id),
  constraint hardcore_runs_ended_after_started check (ended_at is null or ended_at >= started_at)
);

comment on table public.hardcore_runs is 'Per-season Hardcore mode progress: pips earned and characters eliminated.';

create index hardcore_runs_user_id_idx on public.hardcore_runs (user_id);

create trigger set_hardcore_runs_updated_at
  before update on public.hardcore_runs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: gauntlet_progress
-- One row per player per role (killer/survivor): the Survivor/Killer
-- Gauntlet draw queue and completed roster.
-- ---------------------------------------------------------------------------
create table public.gauntlet_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  role public.match_role not null,
  completed_characters text[] not null default '{}',
  current_character text,
  character_queue text[] not null default '{}',
  updated_at timestamptz not null default now(),
  constraint gauntlet_progress_user_role_unique unique (user_id, role)
);

comment on table public.gauntlet_progress is 'Gauntlet draw state per player and per role: completed roster, current pick, remaining queue.';

create index gauntlet_progress_user_id_idx on public.gauntlet_progress (user_id);

create trigger set_gauntlet_progress_updated_at
  before update on public.gauntlet_progress
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: builds
-- Saved perk/equipment loadouts a player can re-apply to a match form.
-- ---------------------------------------------------------------------------
create table public.builds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  role public.match_role not null,
  character_name text not null,
  perks text[] not null default '{}' check (array_length(perks, 1) is null or array_length(perks, 1) <= 4),
  equipment text[] not null default '{}' check (array_length(equipment, 1) is null or array_length(equipment, 1) <= 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint builds_user_name_unique unique (user_id, name)
);

comment on table public.builds is 'Player-saved perk and equipment loadouts, one role/character each.';

create index builds_user_id_idx on public.builds (user_id);

create trigger set_builds_updated_at
  before update on public.builds
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: matches
-- Every recorded game, whether tracked normally, as part of a Hardcore
-- season, or as part of a Gauntlet run.
-- ---------------------------------------------------------------------------
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  hardcore_run_id uuid references public.hardcore_runs (id) on delete set null,
  role public.match_role not null,
  mode public.match_mode not null default 'normal',
  character_name text not null,
  opponent_name text,
  perks text[] not null default '{}' check (array_length(perks, 1) is null or array_length(perks, 1) <= 4),
  equipment text[] not null default '{}' check (array_length(equipment, 1) is null or array_length(equipment, 1) <= 3),
  bloodpoints integer not null default 0 check (bloodpoints >= 0),
  kills smallint check (kills between 0 and 4),
  generators_completed smallint not null default 0 check (generators_completed >= 0),
  escape_result public.escape_result,
  hardcore_pips smallint,
  hardcore_died boolean,
  ignore_challenge boolean not null default false,
  played_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint matches_opponent_only_for_survivor
    check (role = 'survivor' or opponent_name is null),
  constraint matches_kills_only_for_killer
    check (role = 'killer' or kills is null),
  constraint matches_escape_result_only_for_survivor
    check (role = 'survivor' or escape_result is null),
  constraint matches_hardcore_fields_only_in_hardcore_mode
    check (mode = 'hardcore' or (hardcore_pips is null and hardcore_died is null and hardcore_run_id is null))
);

comment on table public.matches is 'One row per recorded game (normal tracker, Hardcore season, or Gauntlet run).';

create index matches_user_id_idx on public.matches (user_id);
create index matches_user_played_at_idx on public.matches (user_id, played_at desc);
create index matches_mode_idx on public.matches (mode);
create index matches_hardcore_run_id_idx on public.matches (hardcore_run_id);

create trigger set_matches_updated_at
  before update on public.matches
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Every table is scoped to auth.uid(): a player can only see and mutate
-- their own data. service_role (used by trusted backend jobs) bypasses RLS.
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.hardcore_runs enable row level security;
alter table public.gauntlet_progress enable row level security;
alter table public.builds enable row level security;
alter table public.matches enable row level security;

-- users
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- No delete policy: this row anchors the cascade for hardcore_runs,
-- gauntlet_progress, builds and matches. Full account deletion should go
-- through a privileged flow (e.g. an edge function using service_role)
-- that deletes the auth.users row, not a client-side delete of the profile.

-- hardcore_runs
create policy "hardcore_runs_select_own" on public.hardcore_runs
  for select using (auth.uid() = user_id);

create policy "hardcore_runs_insert_own" on public.hardcore_runs
  for insert with check (auth.uid() = user_id);

create policy "hardcore_runs_update_own" on public.hardcore_runs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "hardcore_runs_delete_own" on public.hardcore_runs
  for delete using (auth.uid() = user_id);

-- gauntlet_progress
create policy "gauntlet_progress_select_own" on public.gauntlet_progress
  for select using (auth.uid() = user_id);

create policy "gauntlet_progress_insert_own" on public.gauntlet_progress
  for insert with check (auth.uid() = user_id);

create policy "gauntlet_progress_update_own" on public.gauntlet_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "gauntlet_progress_delete_own" on public.gauntlet_progress
  for delete using (auth.uid() = user_id);

-- builds
create policy "builds_select_own" on public.builds
  for select using (auth.uid() = user_id);

create policy "builds_insert_own" on public.builds
  for insert with check (auth.uid() = user_id);

create policy "builds_update_own" on public.builds
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "builds_delete_own" on public.builds
  for delete using (auth.uid() = user_id);

-- matches
create policy "matches_select_own" on public.matches
  for select using (auth.uid() = user_id);

create policy "matches_insert_own" on public.matches
  for insert with check (auth.uid() = user_id);

create policy "matches_update_own" on public.matches
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "matches_delete_own" on public.matches
  for delete using (auth.uid() = user_id);

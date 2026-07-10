-- Teams: saved Survive-With-Friends groups (a name plus up to 3 teammate
-- pseudos - the player themselves is the 4th squad member implicitly).
-- Purely a player-side address book; teammates are free-text names, not
-- linked accounts, since the app has no concept of other players.

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  member_names text[] not null default '{}' check (array_length(member_names, 1) is null or array_length(member_names, 1) <= 3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teams_user_name_unique unique (user_id, name)
);

comment on table public.teams is 'Player-saved Survive-With-Friends groups: a name plus up to 3 teammate pseudos.';

create index teams_user_id_idx on public.teams (user_id);

create trigger set_teams_updated_at
  before update on public.teams
  for each row execute function public.set_updated_at();

alter table public.teams enable row level security;

create policy "teams_select_own" on public.teams
  for select using (auth.uid() = user_id);

create policy "teams_insert_own" on public.teams
  for insert with check (auth.uid() = user_id);

create policy "teams_update_own" on public.teams
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "teams_delete_own" on public.teams
  for delete using (auth.uid() = user_id);

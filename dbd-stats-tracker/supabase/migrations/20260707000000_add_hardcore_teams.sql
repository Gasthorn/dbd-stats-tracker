-- Team Hardcore Survivor: a squad of real, linked accounts (friends only)
-- sharing one dead-survivor pool. Any teammate's survivor death blocks that
-- character for the whole team, but personal pips/ranking stay untouched -
-- those still come entirely from the existing, unmodified hardcore_runs flow.

-- ---------------------------------------------------------------------------
-- Table: hardcore_teams
-- Roster + current-season shared survivor death pool. Deliberately mutated
-- in place across season boundaries (unlike hardcore_runs); no per-season
-- history is retained for teams.
-- ---------------------------------------------------------------------------
create table public.hardcore_teams (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.users (id) on delete cascade,
  season_id text not null,
  dead_survivors text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.hardcore_teams is 'A Team Hardcore Survivor squad and its current season''s shared dead-survivor pool. Mutated in place each season; no per-season history kept.';

create index hardcore_teams_created_by_idx on public.hardcore_teams (created_by);

create trigger set_hardcore_teams_updated_at
  before update on public.hardcore_teams
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: hardcore_team_members
-- Membership/invite row per user per squad. A user may hold many pending
-- invites but only one accepted membership at a time (partial unique index).
-- ---------------------------------------------------------------------------
create table public.hardcore_team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.hardcore_teams (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  invited_by uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint hardcore_team_members_team_user_unique unique (team_id, user_id)
);

comment on table public.hardcore_team_members is 'Membership/invite row per user per Team Hardcore squad. A user may hold many pending invites but only one accepted membership at a time (see partial unique index below).';

create unique index hardcore_team_members_one_active_per_user
  on public.hardcore_team_members (user_id) where status = 'accepted';

create index hardcore_team_members_team_id_idx on public.hardcore_team_members (team_id);
create index hardcore_team_members_user_id_idx on public.hardcore_team_members (user_id);

-- ---------------------------------------------------------------------------
-- matches: link a survivor Hardcore match to the team active when it was
-- recorded. Audit/traceability only - distinct from matches.team_id (the
-- free-text SWF address book from the "teams" feature).
-- ---------------------------------------------------------------------------
alter table public.matches
  add column hardcore_team_id uuid references public.hardcore_teams (id) on delete set null;

alter table public.matches
  add constraint matches_hardcore_team_id_only_for_survivor check (role = 'survivor' or hardcore_team_id is null);

alter table public.matches
  add constraint matches_hardcore_team_id_only_in_hardcore_mode check (mode = 'hardcore' or hardcore_team_id is null);

comment on column public.matches.hardcore_team_id is 'The Team Hardcore squad (if any) active when this survivor Hardcore match was recorded. Audit/traceability only - distinct from matches.team_id (the free-text SWF address book).';

create index matches_hardcore_team_id_idx on public.matches (hardcore_team_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.hardcore_teams enable row level security;
alter table public.hardcore_team_members enable row level security;

-- hardcore_teams: read-only own-created row for the client; all writes via RPC.
create policy "hardcore_teams_select_own" on public.hardcore_teams
  for select using (created_by = auth.uid());
-- No insert/update/delete policies: creation via create_hardcore_team(),
-- death recording via record_team_hardcore_death(), both security definer.

-- hardcore_team_members: own-row read only; roster reads go through the RPC
-- below (public.users RLS blocks reading teammates' usernames directly anyway).
create policy "hardcore_team_members_select_own" on public.hardcore_team_members
  for select using (user_id = auth.uid());
-- No insert policy: creation via create_hardcore_team()/invite_to_hardcore_team().
create policy "hardcore_team_members_update_own" on public.hardcore_team_members
  for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and status = 'accepted'
    and team_id = (select m.team_id from public.hardcore_team_members m where m.id = hardcore_team_members.id)
  );
create policy "hardcore_team_members_delete_own_or_invited" on public.hardcore_team_members
  for delete using (user_id = auth.uid() or invited_by = auth.uid());

-- ---------------------------------------------------------------------------
-- RPC 1: atomic team creation (team row + creator's own accepted member row).
-- A single plpgsql function body is one implicit transaction, so a
-- unique-index violation on the second insert rolls back the first too
-- (no orphan row possible).
-- ---------------------------------------------------------------------------
create or replace function public.create_hardcore_team(p_season_id text)
returns public.hardcore_teams
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team public.hardcore_teams;
begin
  insert into public.hardcore_teams (created_by, season_id)
  values (auth.uid(), p_season_id)
  returning * into v_team;

  insert into public.hardcore_team_members (team_id, user_id, status, invited_by, responded_at)
  values (v_team.id, auth.uid(), 'accepted', auth.uid(), now());

  return v_team;
end;
$$;

revoke all on function public.create_hardcore_team(text) from public;
grant execute on function public.create_hardcore_team(text) to authenticated;

-- ---------------------------------------------------------------------------
-- RPC 2: invite a friend (validates caller is an accepted member of the team
-- and that the target is an accepted friend of the caller).
-- ---------------------------------------------------------------------------
create or replace function public.invite_to_hardcore_team(p_team_id uuid, p_friend_user_id uuid)
returns public.hardcore_team_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.hardcore_team_members;
begin
  if not exists (
    select 1 from public.hardcore_team_members
    where team_id = p_team_id and user_id = auth.uid() and status = 'accepted'
  ) then
    raise exception 'not_a_team_member';
  end if;

  if not exists (
    select 1 from public.friendships
    where status = 'accepted'
      and ((requester_id = auth.uid() and addressee_id = p_friend_user_id)
        or (addressee_id = auth.uid() and requester_id = p_friend_user_id))
  ) then
    raise exception 'not_a_friend';
  end if;

  insert into public.hardcore_team_members (team_id, user_id, status, invited_by)
  values (p_team_id, p_friend_user_id, 'pending', auth.uid())
  returning * into v_member;

  return v_member;
end;
$$;

revoke all on function public.invite_to_hardcore_team(uuid, uuid) from public;
grant execute on function public.invite_to_hardcore_team(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- RPC 3: joined roster read (own memberships/invites + full roster of those
-- teams). Season-adjusted dead_survivors is computed read-time (pure,
-- side-effect-free); the physical reset only happens lazily inside
-- record_team_hardcore_death.
-- ---------------------------------------------------------------------------
create or replace function public.list_my_hardcore_team_members(p_season_id text)
returns table (
  member_id uuid,
  team_id uuid,
  team_dead_survivors text[],
  member_user_id uuid,
  member_username text,
  status text,
  invited_by uuid,
  is_self boolean,
  created_at timestamptz,
  responded_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.id as member_id,
    t.id as team_id,
    case when t.season_id = p_season_id then t.dead_survivors else '{}'::text[] end as team_dead_survivors,
    m.user_id as member_user_id,
    u.username as member_username,
    m.status,
    m.invited_by,
    (m.user_id = auth.uid()) as is_self,
    m.created_at,
    m.responded_at
  from public.hardcore_team_members my
  join public.hardcore_teams t on t.id = my.team_id
  join public.hardcore_team_members m on m.team_id = t.id
  join public.users u on u.id = m.user_id
  where my.user_id = auth.uid();
$$;

revoke all on function public.list_my_hardcore_team_members(text) from public;
grant execute on function public.list_my_hardcore_team_members(text) to authenticated;

-- ---------------------------------------------------------------------------
-- RPC 4: atomic shared-death write with lazy season rollover + dedup. The
-- one piece of genuinely-concurrent shared mutable state in the app (several
-- different users' clients can call this near-simultaneously) - a single
-- atomic UPDATE relies on Postgres row-level locking to serialize writers,
-- unlike solo Hardcore's client-side read-modify-write (fine there since
-- only one user ever touches their own row).
-- ---------------------------------------------------------------------------
create or replace function public.record_team_hardcore_death(p_character_name text, p_season_id text)
returns public.hardcore_teams
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team_id uuid;
  v_team public.hardcore_teams;
begin
  select team_id into v_team_id
  from public.hardcore_team_members
  where user_id = auth.uid() and status = 'accepted';

  if v_team_id is null then
    return null;
  end if;

  update public.hardcore_teams
  set
    dead_survivors = case
      when season_id <> p_season_id then array[p_character_name]
      when p_character_name = any(dead_survivors) then dead_survivors
      else array_append(dead_survivors, p_character_name)
    end,
    season_id = p_season_id
  where id = v_team_id
  returning * into v_team;

  return v_team;
end;
$$;

revoke all on function public.record_team_hardcore_death(text, text) from public;
grant execute on function public.record_team_hardcore_death(text, text) to authenticated;

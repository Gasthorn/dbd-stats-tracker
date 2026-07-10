-- Friends: friend requests by username lookup, plus a best-effort "last seen"
-- heartbeat for an approximate online indicator (not true realtime presence).

-- ---------------------------------------------------------------------------
-- Table: friendships
-- One row per relationship or pending request between two players. Decline /
-- cancel / unfriend are all modeled as deleting the row - there is no
-- "declined" status, so a friend request can always be re-sent later.
-- ---------------------------------------------------------------------------
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.users (id) on delete cascade,
  addressee_id uuid not null references public.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  seen boolean not null default false,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint friendships_no_self_friend check (requester_id <> addressee_id)
);

comment on table public.friendships is 'A friend relationship or pending request between two players. Decline/cancel/unfriend are all modeled as deleting the row.';
comment on column public.friendships.seen is 'Whether the addressee has dismissed the incoming-request popup for this row. Only meaningful while status = pending.';

-- Prevent duplicate/reverse-duplicate rows between the same two users,
-- regardless of who is requester vs addressee.
create unique index friendships_unique_pair_idx
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

create index friendships_requester_id_idx on public.friendships (requester_id);
create index friendships_addressee_id_idx on public.friendships (addressee_id);

alter table public.friendships enable row level security;

create policy "friendships_select_participant" on public.friendships
  for select using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "friendships_insert_as_requester" on public.friendships
  for insert with check (auth.uid() = requester_id and status = 'pending');

create policy "friendships_update_as_addressee" on public.friendships
  for update using (auth.uid() = addressee_id) with check (auth.uid() = addressee_id);

create policy "friendships_delete_participant" on public.friendships
  for delete using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- ---------------------------------------------------------------------------
-- Table: user_presence
-- Best-effort "last active" heartbeat, updated periodically by the client
-- while the app is open. "Online" is derived client-side as last_seen_at
-- within the last ~100s; this is not true presence/realtime.
-- ---------------------------------------------------------------------------
create table public.user_presence (
  user_id uuid primary key references public.users (id) on delete cascade,
  last_seen_at timestamptz not null default now()
);

comment on table public.user_presence is 'Best-effort heartbeat per player; online status is derived client-side from recency of last_seen_at.';

alter table public.user_presence enable row level security;

create policy "user_presence_select_own" on public.user_presence
  for select using (auth.uid() = user_id);

create policy "user_presence_insert_own" on public.user_presence
  for insert with check (auth.uid() = user_id);

create policy "user_presence_update_own" on public.user_presence
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- No delete policy: same precedent as public.users - cascade on account
-- deletion handles cleanup, no legitimate client-side reason to delete this row.

-- ---------------------------------------------------------------------------
-- Function: find_user_by_username
-- The only way to resolve a username to a user id: users_select_own RLS
-- blocks reading anyone else's row directly. security definer required;
-- search_path stays pinned to public only.
-- ---------------------------------------------------------------------------
create or replace function public.find_user_by_username(p_username text)
returns table (id uuid, username text, avatar_url text)
language sql
stable
security definer
set search_path = public
as $$
  select u.id, u.username, u.avatar_url
  from public.users u
  where lower(u.username) = lower(p_username)
    and u.id <> auth.uid()
  limit 1;
$$;

revoke all on function public.find_user_by_username(text) from public;
grant execute on function public.find_user_by_username(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Function: list_friendships
-- One joined, self-scoped view of the caller's friendships (with the other
-- party's username/avatar/presence). security definer so it can read the
-- OTHER party's users/user_presence rows without ever loosening their own
-- restrictive RLS; the where clause below is the entire access control here,
-- not a courtesy filter.
-- ---------------------------------------------------------------------------
create or replace function public.list_friendships()
returns table (
  id uuid,
  status text,
  seen boolean,
  created_at timestamptz,
  responded_at timestamptz,
  is_requester boolean,
  friend_id uuid,
  friend_username text,
  friend_avatar_url text,
  friend_last_seen_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    f.id,
    f.status,
    f.seen,
    f.created_at,
    f.responded_at,
    (f.requester_id = auth.uid()) as is_requester,
    other.id as friend_id,
    other.username as friend_username,
    other.avatar_url as friend_avatar_url,
    p.last_seen_at as friend_last_seen_at
  from public.friendships f
  join public.users other
    on other.id = case when f.requester_id = auth.uid() then f.addressee_id else f.requester_id end
  left join public.user_presence p on p.user_id = other.id
  where f.requester_id = auth.uid() or f.addressee_id = auth.uid();
$$;

revoke all on function public.list_friendships() from public;
grant execute on function public.list_friendships() to authenticated;

-- Lets a survivor match be tagged with the SWF team it was played with.
alter table public.matches
  add column team_id uuid references public.teams (id) on delete set null;

alter table public.matches
  add constraint matches_team_only_for_survivor check (role = 'survivor' or team_id is null);

comment on column public.matches.team_id is 'The SWF team (if any) this survivor match was played with. Survivor-only.';

create index matches_team_id_idx on public.matches (team_id);

-- Survivor match stats used by Entity Quest's survivor missions (unhook / heal teammates),
-- optional everywhere else - the survivor counterpart of the killer-only `hooks` column.

alter table public.matches
  add column unhooks smallint check (unhooks >= 0),
  add column heals smallint check (heals >= 0);

alter table public.matches
  add constraint matches_unhooks_heals_only_for_survivor
  check (role = 'survivor' or (unhooks is null and heals is null));

comment on column public.matches.unhooks is 'Teammates unhooked by the survivor in this match. Survivor-only, optional.';
comment on column public.matches.heals is 'Full heals performed on teammates in this match. Survivor-only, optional.';

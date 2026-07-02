-- Persist the local DbD "Icons" asset folder path per user, so it doesn't need
-- to be re-selected via the native folder picker on every session/device.
alter table public.users
  add column icons_folder_path text;

comment on column public.users.icons_folder_path is
  'Absolute path to the local Icons folder (CharPortraits/Perks/ItemAddons/Items), used to resolve in-app icon images. Device-specific; no RLS changes needed, already covered by users_select_own/users_update_own.';

-- Phase 2: shareable read-only client link per building.
-- The share page is fetched server-side with the service role key (bypassing
-- RLS entirely) after checking the token matches, so no anon RLS policy is
-- needed here — normal client access to buildings stays org-scoped only.

alter table buildings add column if not exists share_token uuid not null default gen_random_uuid();
create unique index if not exists buildings_share_token_idx on buildings (share_token);

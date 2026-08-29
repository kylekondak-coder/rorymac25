-- Phase 3: scheduled reminder emails.
-- Denormalise the user's email onto profiles (auth.users isn't exposed via
-- PostgREST) so the cron job can look up who to email with a plain select,
-- and log what's been sent so a daily cron run never double-emails.

alter table profiles add column if not exists email text;

update profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  org_name text;
begin
  org_name := coalesce(new.raw_user_meta_data ->> 'organisation_name', 'My Organisation');

  insert into organisations (name) values (org_name)
  returning id into new_org_id;

  insert into profiles (id, organisation_id, full_name, email)
  values (new.id, new_org_id, new.raw_user_meta_data ->> 'full_name', new.email);

  return new;
end;
$$;

create table if not exists reminder_log (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('certificate', 'risk_assessment')),
  item_id uuid not null,
  threshold_days int not null check (threshold_days in (30, 14, 7)),
  sent_at timestamptz not null default now(),
  unique (item_type, item_id, threshold_days)
);

-- Only the cron job (service role, which bypasses RLS) ever touches this.
alter table reminder_log enable row level security;

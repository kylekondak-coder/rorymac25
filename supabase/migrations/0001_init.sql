-- Papertrail — Phase 1 schema
-- Organisation-scoped fire compliance data: buildings, certificates, assets,
-- risk assessments + actions, defects. Status (ok/warning/expired/missing) is
-- derived in the application layer (src/lib/status.ts), not stored here.

create extension if not exists "pgcrypto";

-- One row per Supabase auth user, linking them to their organisation.
create table if not exists organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organisation_id uuid not null references organisations (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists buildings (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references organisations (id) on delete cascade,
  name text not null,
  address text,
  client_contact_email text,
  created_at timestamptz not null default now()
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings (id) on delete cascade,
  type text not null,
  location text,
  installed_date date,
  created_at timestamptz not null default now()
);

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings (id) on delete cascade,
  type text not null,
  issue_date date,
  expiry_date date,
  created_at timestamptz not null default now()
);

create table if not exists risk_assessments (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings (id) on delete cascade,
  assessor text,
  date_conducted date not null default current_date,
  review_due date,
  created_at timestamptz not null default now()
);

create table if not exists actions (
  id uuid primary key default gen_random_uuid(),
  risk_assessment_id uuid not null references risk_assessments (id) on delete cascade,
  description text not null,
  priority text not null check (priority in ('low', 'medium', 'high')),
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists defects (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references buildings (id) on delete cascade,
  description text not null,
  severity text not null check (severity in ('low', 'medium', 'critical')),
  status text not null default 'open' check (status in ('open', 'closed')),
  date_raised date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists buildings_org_idx on buildings (organisation_id);
create index if not exists assets_building_idx on assets (building_id);
create index if not exists certificates_building_idx on certificates (building_id);
create index if not exists risk_assessments_building_idx on risk_assessments (building_id);
create index if not exists actions_risk_assessment_idx on actions (risk_assessment_id);
create index if not exists defects_building_idx on defects (building_id);

-- Helper: the organisation_id of the currently authenticated user.
create or replace function current_organisation_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select organisation_id from profiles where id = auth.uid()
$$;

alter table organisations enable row level security;
alter table profiles enable row level security;
alter table buildings enable row level security;
alter table assets enable row level security;
alter table certificates enable row level security;
alter table risk_assessments enable row level security;
alter table actions enable row level security;
alter table defects enable row level security;

create policy "member can read own organisation" on organisations
  for select using (id = current_organisation_id());

create policy "member can read own profile row and orgmates" on profiles
  for select using (organisation_id = current_organisation_id());

create policy "member can update own profile" on profiles
  for update using (id = auth.uid());

create policy "member can manage buildings in own org" on buildings
  for all using (organisation_id = current_organisation_id())
  with check (organisation_id = current_organisation_id());

create policy "member can manage assets in own org buildings" on assets
  for all using (
    building_id in (select id from buildings where organisation_id = current_organisation_id())
  )
  with check (
    building_id in (select id from buildings where organisation_id = current_organisation_id())
  );

create policy "member can manage certificates in own org buildings" on certificates
  for all using (
    building_id in (select id from buildings where organisation_id = current_organisation_id())
  )
  with check (
    building_id in (select id from buildings where organisation_id = current_organisation_id())
  );

create policy "member can manage risk assessments in own org buildings" on risk_assessments
  for all using (
    building_id in (select id from buildings where organisation_id = current_organisation_id())
  )
  with check (
    building_id in (select id from buildings where organisation_id = current_organisation_id())
  );

create policy "member can manage actions in own org risk assessments" on actions
  for all using (
    risk_assessment_id in (
      select ra.id from risk_assessments ra
      join buildings b on b.id = ra.building_id
      where b.organisation_id = current_organisation_id()
    )
  )
  with check (
    risk_assessment_id in (
      select ra.id from risk_assessments ra
      join buildings b on b.id = ra.building_id
      where b.organisation_id = current_organisation_id()
    )
  );

create policy "member can manage defects in own org buildings" on defects
  for all using (
    building_id in (select id from buildings where organisation_id = current_organisation_id())
  )
  with check (
    building_id in (select id from buildings where organisation_id = current_organisation_id())
  );

-- Sign-up creates one Organisation per user (Phase 1: single-user orgs).
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

  insert into profiles (id, organisation_id, full_name)
  values (new.id, new_org_id, new.raw_user_meta_data ->> 'full_name');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Certificate file uploads: attach the actual PDF/photo the engineer
-- produces to each certificate record. Private bucket, path is
-- "<building_id>/<certificate_id>/<filename>" so storage RLS can scope
-- access the same way the certificates table itself is org-scoped.

alter table certificates add column if not exists file_path text;

insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', false)
on conflict (id) do nothing;

create policy "org members can manage their certificate files"
on storage.objects for all
using (
  bucket_id = 'certificates'
  and (storage.foldername(name))[1]::uuid in (
    select id from buildings where organisation_id = current_organisation_id()
  )
)
with check (
  bucket_id = 'certificates'
  and (storage.foldername(name))[1]::uuid in (
    select id from buildings where organisation_id = current_organisation_id()
  )
);

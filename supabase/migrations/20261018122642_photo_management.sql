begin;
create table public.product_photos (
  product_id uuid primary key references public.products(id),
  storage_path text not null check (storage_path ~ ('^' || product_id::text || '/[a-f0-9-]{36}[.]jpg$')),
  updated_at timestamptz not null default now()
);
alter table public.product_photos enable row level security;
grant select on public.product_photos to anon, authenticated;
grant insert, update, delete on public.product_photos to authenticated;
create policy photo_public_read on public.product_photos for select to anon, authenticated using (true);
create policy photo_editor_write on public.product_photos for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') in ('admin','photo_editor'))
with check ((select auth.jwt()->'app_metadata'->>'role') in ('admin','photo_editor'));
create function public.touch_photo_updated_at() returns trigger language plpgsql security invoker set search_path='' as $$begin new.updated_at=now();return new;end;$$;
create trigger photo_updated_at before update on public.product_photos for each row execute function public.touch_photo_updated_at();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('menu-photos','menu-photos',true,5242880,array['image/jpeg']);
create policy menu_photo_read on storage.objects for select to anon,authenticated using(bucket_id='menu-photos');
create policy menu_photo_insert on storage.objects for insert to authenticated
with check(bucket_id='menu-photos'
and (select auth.jwt()->'app_metadata'->>'role') in ('admin','photo_editor')
and name ~ '^[a-f0-9-]{36}/[a-f0-9-]{36}[.]jpg$'
and exists (select 1 from public.products p where p.id::text=(storage.foldername(objects.name))[1]));
commit;

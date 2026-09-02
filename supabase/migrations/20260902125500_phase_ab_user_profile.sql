-- Phase A/B: extended profile data and avatar storage.
-- Idempotent so it is safe after the initial Lovable Cloud preparation.

alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists date_of_birth date;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_minimum_age' and conrelid = 'public.profiles'::regclass) then
    alter table public.profiles add constraint profiles_minimum_age check (date_of_birth is null or date_of_birth <= (current_date - interval '18 years')::date);
  end if;
end $$;

insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict (id) do nothing;

drop policy if exists "avatars public read" on storage.objects;
drop policy if exists "avatars own upload" on storage.objects;
drop policy if exists "avatars own update" on storage.objects;
drop policy if exists "avatars own delete" on storage.objects;
create policy "avatars public read" on storage.objects for select to public using (bucket_id = 'avatars');
create policy "avatars own upload" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "avatars own update" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text)) with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "avatars own delete" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid()::text));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $function$
begin
  insert into public.profiles (id, full_name, email, phone, country, address, date_of_birth)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), coalesce(new.email,''), new.raw_user_meta_data->>'phone', new.raw_user_meta_data->>'country', new.raw_user_meta_data->>'address', case when nullif(new.raw_user_meta_data->>'date_of_birth','') is null then null else (new.raw_user_meta_data->>'date_of_birth')::date end)
  on conflict (id) do nothing;
  insert into public.portfolio (user_id) values (new.id) on conflict (user_id) do nothing;
  insert into public.settings (user_id) values (new.id) on conflict (user_id) do nothing;
  insert into public.robots (user_id) values (new.id) on conflict (user_id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  insert into public.notifications (user_id, type, title, message) values (new.id, 'SYSTEM', 'Bienvenido a TradeNova AI', 'Configura tu robot de IA para comenzar.');
  return new;
end;
$function$;

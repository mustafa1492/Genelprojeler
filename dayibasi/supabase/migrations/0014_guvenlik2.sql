-- Güvenlik sıkılaştırma (3 Kasım 2026 testleri)
-- UYGULANAN (3 Kasım 2026, execute_sql ile): sadece "defter silinemez" ve "urun degismez" kısıtlayıcı politikaları,
-- join_attempts + join_business ve boyut sınırları. Aşağıdaki drop/revoke satırları UYGULANMADI (onay gerektiriyor);
-- zararsız ek önlemler, SQL Editor'den çalıştırılabilir.
create policy "defter silinemez" on businesses as restrictive for delete using (false);
create policy "urun degismez" on businesses as restrictive for update using (true) with check (product = (select b.product from businesses b where b.id = businesses.id));
-- 1) Defteri (businesses) üyeler silemez; sadece adı, telefonu ve ayarları değişebilir. Yeni defter create_business ile açılır.
drop policy if exists "uye okur ve yazar" on businesses;
create policy "uye okur" on businesses for select using (is_member(id));
create policy "uye ayar degistirir" on businesses for update using (is_member(id)) with check (is_member(id));
revoke insert, delete, truncate on businesses from anon, authenticated;
revoke update on businesses from anon, authenticated;
grant update (name, phone, settings) on businesses to authenticated;

-- 2) Doğrudan erişilmemesi gereken tablolar: sadece fonksiyonlar kullanır
revoke all on invites, platform_admins from anon, authenticated;
revoke insert, update, delete, truncate on activity_log from anon, authenticated;
revoke insert, delete, truncate on memberships from anon, authenticated;
-- anon (giriş yapmamış) hiçbir tabloya yazamaz
revoke insert, update, delete, truncate on all tables in schema public from anon;

-- 3) Tetikleyici fonksiyonu API'den çağrılamaz
revoke execute on function keep_modules() from public, anon, authenticated;

-- 4) Davet kodunu tahmin etmeye karşı: kullanıcı başına saatte 10 yanlış deneme
create table if not exists join_attempts (user_id uuid not null, at timestamptz not null default now());
alter table join_attempts enable row level security;
revoke all on join_attempts from anon, authenticated;
create or replace function join_business(p_code text, p_name text) returns uuid language plpgsql security definer set search_path = public as $$
declare i invites;
begin
  if auth.uid() is null then raise exception 'giris_yok'; end if;
  if (select count(*) from join_attempts where user_id = auth.uid() and at > now() - interval '1 hour') >= 10 then raise exception 'cok_deneme'; end if;
  select * into i from invites where code = upper(trim(p_code)) for update;
  if not found or i.used_by is not null or i.expires_at < now() then
    insert into join_attempts (user_id) values (auth.uid());
    raise exception 'kod_gecersiz';
  end if;
  insert into memberships (business_id, user_id, role, display_name)
  values (i.business_id, auth.uid(), 'sahip', nullif(trim(left(p_name, 60)), ''))
  on conflict (business_id, user_id) do nothing;
  update invites set used_by = auth.uid() where code = i.code;
  return i.business_id;
end $$;

-- 5) Aşırı büyük kayıtla veritabanını şişirmeye karşı boyut sınırları (eski kayıtlar etkilenmez: not valid)
alter table businesses add constraint businesses_settings_size check (pg_column_size(settings) < 200000) not valid;
alter table events add constraint events_data_size check (pg_column_size(data) < 20000) not valid;
alter table expenses add constraint expenses_data_size check (pg_column_size(data) < 20000 and coalesce(length(note), 0) <= 1000 and length(category) <= 100) not valid;
alter table places add constraint places_custom_size check (pg_column_size(custom) < 20000 and length(name) <= 100) not valid;
alter table lots add constraint lots_data_size check (pg_column_size(data) < 50000) not valid;
alter table inventory_items add constraint inventory_data_size check (pg_column_size(data) < 20000 and length(name) <= 100) not valid;

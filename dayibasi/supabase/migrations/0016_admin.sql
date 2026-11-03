-- Web yönetim paneli (Mustafa, 3 Kasım 2026): platform yöneticisi her şeyi görür, ekler, değiştirir, siler.
-- Hepsi is_platform_admin() kontrolüyle, beyaz listedeki tablolarda. Fonksiyonlar tablo sahibi olarak çalışır (RLS'yi aşar).

create or replace function admin_check() returns void language plpgsql stable security definer set search_path = public as $$
begin if not is_platform_admin() then raise exception 'izin_yok'; end if; end $$;

create or replace function admin_table_ok(t text) returns boolean language sql immutable as $$
  select t = any (array['businesses','places','expenses','events','dues','inventory_items','documents','lots','people','ledger_entries','lists','receipt_inbox','invites','activity_log','message_templates']);
$$;

-- Tablonun sütunları (paneldeki form için)
create or replace function admin_columns(p_table text) returns table(name text, type text, nullable boolean, has_default boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  perform admin_check();
  if not admin_table_ok(p_table) then raise exception 'tablo_yok'; end if;
  return query select c.column_name::text, c.data_type::text, c.is_nullable = 'YES', c.column_default is not null
    from information_schema.columns c where c.table_schema = 'public' and c.table_name = p_table order by c.ordinal_position;
end $$;

-- Satırları getir (defter seçilirse sadece o defter). En çok 2000 satır.
create or replace function admin_rows(p_table text, p_business uuid default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare r jsonb; w text := '';
begin
  perform admin_check();
  if not admin_table_ok(p_table) then raise exception 'tablo_yok'; end if;
  if p_business is not null then w := format(' where %s = %L', case when p_table = 'businesses' then 'id' else 'business_id' end, p_business); end if;
  execute format('select coalesce(jsonb_agg(to_jsonb(x)), ''[]''::jsonb) from (select * from %I%s order by 1 limit 2000) x', p_table, w) into r;
  return r;
end $$;

-- Ekle ya da değiştir (id varsa günceller). Sadece gönderilen sütunlar değişir.
create or replace function admin_save(p_table text, p_row jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare cols text; sets text; r jsonb; idv text;
begin
  perform admin_check();
  if not admin_table_ok(p_table) or p_table = 'activity_log' then raise exception 'tablo_yok'; end if;
  select string_agg(format('%I', k), ', '), string_agg(format('%I = excluded.%I', k, k), ', ') filter (where k <> 'id')
    into cols, sets
    from jsonb_object_keys(p_row) k
    where exists (select 1 from information_schema.columns c where c.table_schema = 'public' and c.table_name = p_table and c.column_name = k);
  if cols is null then raise exception 'bos'; end if;
  idv := p_row ->> 'id';
  if idv is null then
    execute format('insert into %I (%s) select %s from jsonb_populate_record(null::%I, $1) returning to_jsonb(%I.*)', p_table, cols, cols, p_table, p_table) using p_row into r;
  else
    execute format('insert into %I (%s) select %s from jsonb_populate_record(null::%I, $1) on conflict (id) do update set %s returning to_jsonb(%I.*)',
      p_table, cols, cols, p_table, coalesce(sets, 'id = excluded.id'), p_table) using p_row into r;
  end if;
  return r;
end $$;

create or replace function admin_delete(p_table text, p_id text) returns text
language plpgsql security definer set search_path = public as $$
begin
  perform admin_check();
  if not admin_table_ok(p_table) or p_table = 'activity_log' then raise exception 'tablo_yok'; end if;
  execute format('delete from %I where id::text = $1', p_table) using p_id;
  return 'tamam';
end $$;

-- Üyelikler (birleşik anahtar)
create or replace function admin_members(p_business uuid) returns table(user_id uuid, email text, display_name text, role text, created_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  perform admin_check();
  return query select m.user_id, u.email::text, m.display_name, m.role, m.created_at from memberships m join auth.users u on u.id = m.user_id where m.business_id = p_business order by m.created_at;
end $$;
create or replace function admin_member_set(p_business uuid, p_user uuid, p_role text, p_name text default null) returns text
language plpgsql security definer set search_path = public as $$
begin
  perform admin_check();
  if p_role = 'cikar' then delete from memberships where business_id = p_business and user_id = p_user; return 'tamam'; end if;
  if p_role not in ('sahip', 'calisan') then raise exception 'rol_yok'; end if;
  insert into memberships (business_id, user_id, role, display_name) values (p_business, p_user, p_role, nullif(trim(p_name), ''))
  on conflict (business_id, user_id) do update set role = excluded.role, display_name = coalesce(excluded.display_name, memberships.display_name);
  return 'tamam';
end $$;

-- Hesap listesi (e-posta, son giriş, defterleri)
create or replace function admin_users() returns table(id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz, is_admin boolean, businesses jsonb)
language plpgsql stable security definer set search_path = public as $$
begin
  perform admin_check();
  return query select u.id, u.email::text, u.created_at, u.last_sign_in_at, exists (select 1 from platform_admins a where a.user_id = u.id),
    coalesce((select jsonb_agg(jsonb_build_object('id', b.id, 'name', b.name, 'product', b.product, 'role', m.role)) from memberships m join businesses b on b.id = m.business_id where m.user_id = u.id), '[]')
    from auth.users u order by u.created_at desc;
end $$;

-- Genel ayarlar (duyuru, yeni defter açılabilir mi, hazır listeler…)
create table if not exists app_config (key text primary key check (length(key) <= 60), value jsonb not null, updated_at timestamptz not null default now());
alter table app_config enable row level security;
create policy "herkes okur" on app_config for select using (true);
grant select on app_config to anon, authenticated;
create or replace function admin_config_set(p_key text, p_value jsonb) returns text language plpgsql security definer set search_path = public as $$
begin
  perform admin_check();
  if p_value is null then delete from app_config where key = p_key; return 'tamam'; end if;
  insert into app_config (key, value) values (p_key, p_value) on conflict (key) do update set value = excluded.value, updated_at = now();
  return 'tamam';
end $$;

-- Yeni defter açma kapatılabilsin
create or replace function create_business(p_name text, p_product text) returns uuid language plpgsql security definer set search_path = public as $$
declare bid uuid;
begin
  if auth.uid() is null then raise exception 'giris_yok'; end if;
  if p_product not in ('dayibasi', 'ciftci') then raise exception 'urun_yok'; end if;
  if coalesce((select value from app_config where key = 'yeni_defter_kapali'), 'false'::jsonb) = 'true'::jsonb and not is_platform_admin() then raise exception 'kapali'; end if;
  if (select count(*) from memberships where user_id = auth.uid() and role = 'sahip') >= 3 then raise exception 'isletme_siniri'; end if;
  insert into businesses (name, product) values (trim(p_name), p_product) returning id into bid;
  insert into memberships (business_id, user_id, role) values (bid, auth.uid(), 'sahip');
  return bid;
end $$;

do $$ declare f text; begin
  foreach f in array array['admin_check()','admin_columns(text)','admin_rows(text,uuid)','admin_save(text,jsonb)','admin_delete(text,text)','admin_members(uuid)','admin_member_set(uuid,uuid,text,text)','admin_users()','admin_config_set(text,jsonb)'] loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

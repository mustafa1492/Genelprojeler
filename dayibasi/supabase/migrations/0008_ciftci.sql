-- Çiftçi defteri + aile kullanımı altyapısı (genel; dayıbaşı da kullanabilir).

-- 1) Kim girdi: her kayda girenin kimliği (istemci göndermezse oturumdaki kullanıcı)
alter table people         add column if not exists created_by uuid default auth.uid() references auth.users(id) on delete set null;
alter table places         add column if not exists created_by uuid default auth.uid() references auth.users(id) on delete set null;
alter table expenses       add column if not exists created_by uuid default auth.uid() references auth.users(id) on delete set null;
alter table ledger_entries add column if not exists created_by uuid default auth.uid() references auth.users(id) on delete set null;
alter table lists          add column if not exists created_by uuid default auth.uid() references auth.users(id) on delete set null;
alter table documents      add column if not exists created_by uuid default auth.uid() references auth.users(id) on delete set null;
alter table events         alter column created_by set default auth.uid();

-- 2) Üyelerin görünen adı (ör. "Abdullah", "Mustafa")
alter table memberships add column if not exists display_name text check (display_name is null or char_length(display_name) <= 40);
create policy "ayni isletmenin uyeleri" on memberships for select using (is_member(business_id));
create policy "kendi adini degistirir" on memberships for update using (user_id = auth.uid()) with check (user_id = auth.uid());
revoke update on memberships from authenticated, anon;
grant update (display_name) on memberships to authenticated;   -- yalnız adını değiştirebilir, rolünü değil

-- 3) Borç ve vadeler (kredi, kooperatif, bayi, tüccar alacağı, çek/senet)
create table dues (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  direction   text not null check (direction in ('borc', 'alacak')),   -- borcum / alacağım
  party       text not null check (char_length(party) between 1 and 80), -- kime / kimden
  kind        text not null default 'diger' check (char_length(kind) <= 30), -- kredi, kooperatif, bayi, cek, senet, diger
  amount      numeric(12,2) not null check (amount > 0 and amount <= 100000000),
  paid_amount numeric(12,2) not null default 0 check (paid_amount >= 0),
  due_on      date,
  note        text check (note is null or char_length(note) <= 300),
  data        jsonb not null default '{}' check (octet_length(data::text) <= 4000),
  created_by  uuid default auth.uid() references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index on dues (business_id, due_on);
alter table dues enable row level security;
create policy "uye" on dues for all using (is_member(business_id)) with check (is_member(business_id));
create trigger log_dues after insert or update or delete on dues for each row execute function log_activity();

-- 4) Depo / envanter (gübre, ilaç, malzeme): adı, birimi, miktarı
create table inventory_items (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 80),
  category    text not null default 'diger' check (char_length(category) <= 30), -- gubre, ilac, diger
  unit        text not null default 'adet' check (char_length(unit) <= 15),
  quantity    numeric(12,2) not null default 0 check (quantity >= -1000000 and quantity <= 100000000),
  note        text check (note is null or char_length(note) <= 300),
  created_by  uuid default auth.uid() references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index on inventory_items (business_id);
alter table inventory_items enable row level security;
create policy "uye" on inventory_items for all using (is_member(business_id)) with check (is_member(business_id));
create trigger log_inventory after insert or update or delete on inventory_items for each row execute function log_activity();

-- 5) Aile daveti: sahip kod üretir, diğeri kodla ortak deftere katılır
create table invites (
  code        text primary key,
  business_id uuid not null references businesses(id) on delete cascade,
  created_by  uuid default auth.uid(),
  expires_at  timestamptz not null default now() + interval '7 days',
  used_by     uuid,
  created_at  timestamptz not null default now()
);
alter table invites enable row level security;   -- doğrudan erişim yok; fonksiyonlar yönetir

create or replace function create_invite(p_business uuid)
returns text language plpgsql security definer set search_path = public as $$
declare c text;
begin
  if not is_member(p_business) then raise exception 'izin_yok'; end if;
  c := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  insert into invites (code, business_id) values (c, p_business);
  return c;
end; $$;

create or replace function join_business(p_code text, p_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare i invites;
begin
  if auth.uid() is null then raise exception 'giris_yok'; end if;
  select * into i from invites where code = upper(trim(p_code)) for update;
  if not found or i.used_by is not null or i.expires_at < now() then raise exception 'kod_gecersiz'; end if;
  insert into memberships (business_id, user_id, role, display_name)
  values (i.business_id, auth.uid(), 'sahip', nullif(trim(p_name), ''))
  on conflict (business_id, user_id) do nothing;
  update invites set used_by = auth.uid() where code = i.code;
  return i.business_id;
end; $$;

-- Üyeler ve adları (kim girdi göstermek için)
create or replace function business_members(p_business uuid)
returns table (user_id uuid, display_name text, role text, email text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_member(p_business) then raise exception 'izin_yok'; end if;
  return query select m.user_id, m.display_name, m.role, split_part(u.email::text, '@', 1)
    from memberships m join auth.users u on u.id = m.user_id where m.business_id = p_business order by m.created_at;
end; $$;

-- 6) İşletme açma: çiftçi ürünü de olur, açan kişinin adı kaydedilir
create or replace function create_business(p_name text, p_product text)
returns uuid language plpgsql security definer set search_path = public as $$
declare bid uuid;
begin
  if auth.uid() is null then raise exception 'giris_yok'; end if;
  if p_product not in ('dayibasi', 'ciftci') then raise exception 'urun_yok'; end if;
  if (select count(*) from memberships where user_id = auth.uid() and role = 'sahip') >= 3 then raise exception 'isletme_siniri'; end if;
  insert into businesses (name, product) values (trim(p_name), p_product) returning id into bid;
  insert into memberships (business_id, user_id, role) values (bid, auth.uid(), 'sahip');
  return bid;
end; $$;

revoke execute on function create_invite(uuid) from public, anon;
revoke execute on function join_business(text, text) from public, anon;
revoke execute on function business_members(uuid) from public, anon;
grant execute on function create_invite(uuid), join_business(text, text), business_members(uuid) to authenticated;

-- 7) Geri alma yeni tabloları da kapsasın
do $$ begin
  execute replace(pg_get_functiondef('public.undo_activity(bigint)'::regprocedure),
    '''lists'',''expenses'')', '''lists'',''expenses'',''dues'',''inventory_items'')');
end $$;

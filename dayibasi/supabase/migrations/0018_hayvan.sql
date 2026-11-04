-- Hayvan ortak iskeleti (Mustafa, 4 Kasım 2026): barınak → sürü → günlük kayıt; tür alanıyla (kanatlı / küçükbaş / büyükbaş).
-- Kanatlı (kümes) oturumu kurdu; küpe kartı ve üreme döngüsü hayvancılık oturumunda eklenecek (ayrı tablo, herds'e bağlanır).
-- Yetki: tek ekran izni 'hayvan'. Yalnız yeni tablo/işlev: geriye uyumlu.
-- UYGULANDI 4 Kasım 2026 (yedek bölümü HARİÇ: canlıda 0013/yedek.al yok; 0013 uygulanınca alttaki bölüm de çalıştırılmalı).

create table barns (                                   -- barınak: kümes, ağıl, ahır
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  species     text not null check (species in ('kanatli', 'kucukbas', 'buyukbas')),
  name        text not null check (char_length(name) between 1 and 60),
  area_m2     numeric check (area_m2 is null or area_m2 between 0 and 1000000),
  capacity    integer check (capacity is null or capacity between 0 and 10000000),
  note        text check (note is null or char_length(note) <= 300),
  data        jsonb not null default '{}' check (pg_column_size(data) < 20000), -- isletme_no, kumes_no…
  created_by  uuid default auth.uid() references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index on barns (business_id);

create table herds (                                   -- sürü / dönem (toplu sayı)
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references businesses(id) on delete cascade,
  barn_id       uuid references barns(id),
  species       text not null check (species in ('kanatli', 'kucukbas', 'buyukbas')),
  kind          text check (kind is null or char_length(kind) <= 30),   -- etlik, yumurtacı, besi…
  name          text not null check (char_length(name) between 1 and 80),
  started_on    date not null,                                         -- giriş günü
  initial_count integer not null default 0 check (initial_count between 0 and 10000000),
  source        text check (source is null or char_length(source) <= 60), -- kuluçkahane, nereden alındı
  status        text not null default 'acik' check (status in ('acik', 'kapandi')),
  closed_on     date,
  note          text check (note is null or char_length(note) <= 300),
  data          jsonb not null default '{}' check (pg_column_size(data) < 20000), -- firma, sozlesme_no, giris_g, bag_kg…
  created_by    uuid default auth.uid() references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index on herds (business_id);
create index on herds (barn_id);

create table herd_days (                               -- günlük kayıt: sürü başına günde bir satır
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references businesses(id) on delete cascade,
  herd_id      uuid not null references herds(id),
  day          date not null,
  dead         integer not null default 0 check (dead between 0 and 10000000),
  culled       integer not null default 0 check (culled between 0 and 10000000),     -- ayıklanan
  feed_bags    numeric not null default 0 check (feed_bags between 0 and 1000000),
  bag_kg       numeric check (bag_kg is null or bag_kg between 0 and 10000),
  avg_weight_g integer check (avg_weight_g is null or avg_weight_g between 0 and 2000000), -- tartım ortalaması
  weighed_n    integer check (weighed_n is null or weighed_n between 0 and 10000000),
  note         text check (note is null or char_length(note) <= 300),
  data         jsonb not null default '{}' check (pg_column_size(data) < 20000),     -- ileride: yumurta, süt…
  created_by   uuid default auth.uid() references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  unique (herd_id, day)
);
create index on herd_days (business_id);

-- Erişim: üye + 'hayvan' ekran izni (görmek 1, değiştirmek 2)
do $$ declare t text; begin
  foreach t in array array['barns', 'herds', 'herd_days'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "uye" on %I for all using (is_member(business_id)) with check (is_member(business_id))', t);
    execute format('create policy "yetki: hayvan" on %I as restrictive for all using (can(business_id, ''hayvan'', 1)) with check (can(business_id, ''hayvan'', 2))', t);
    execute format('create policy "yetki: hayvan yazar" on %I as restrictive for update using (can(business_id, ''hayvan'', 2))', t);
    execute format('create policy "yetki: hayvan siler" on %I as restrictive for delete using (can(business_id, ''hayvan'', 2))', t);
    execute format('create trigger log_%s after insert or update or delete on %I for each row execute function log_activity()', t, t);
  end loop;
end $$;

-- Geri alma bu tabloları da kapsasın
do $$ begin
  execute replace(pg_get_functiondef('public.undo_activity(bigint)'::regprocedure),
    '''lots'')', '''lots'',''barns'',''herds'',''herd_days'')');
end $$;

-- Giriş yapmamış kişi yazamasın / tabloyu boşaltamasın (diğer tablolarla aynı)
revoke insert, update, delete, truncate on barns, herds, herd_days from anon;

-- Yönetim paneli beyaz listesi
create or replace function admin_table_ok(t text) returns boolean language sql immutable as $$
  select t = any (array['businesses','places','expenses','events','dues','inventory_items','documents','lots','people','ledger_entries','lists','receipt_inbox','invites','activity_log','message_templates','barns','herds','herd_days']);
$$;

-- Yetki: 'hayvan' ekranı. Hazır "çalışan" rolü günlük kaydı girebilir (yaz).
create or replace function perm_level(bid uuid, scr text) returns int language plpgsql stable security definer set search_path = public as $$
declare m memberships; p text; e jsonb;
begin
  select * into m from memberships where business_id = bid and user_id = auth.uid();
  if not found then return 0; end if;
  p := coalesce(m.perms ->> 'preset', case when m.role = 'calisan' then 'calisan' else 'yonetici' end);
  if p = 'yonetici' then return 2; end if;
  if p = 'aile' then return case when scr = 'uyeler' then 1 else 2 end; end if;
  if p = 'calisan' then e := '{"tarlalar":"yaz","takvim":"yaz","depo":"yaz","fis":"yaz","belgeler":"gor","uyeler":"gor","hayvan":"yaz"}';
  else e := coalesce(m.perms -> 'ekran', '{}'); end if;
  return case e ->> scr when 'yaz' then 2 when 'gor' then 1 else 0 end;
end $$;
create or replace function my_perms(bid uuid) returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_object_agg(s, perm_level(bid, s)) from unnest(array['tarlalar','masraf','gelir','fidan','hayvan','depo','takvim','rapor','vadeler','belgeler','kayitlar','fis','gecmis','ayarlar','uyeler']) s;
$$;

-- Günlük yedeğe ekle — UYGULANMADI: 0013_yedek canlıda yok. 0013 uygulanınca bunu da çalıştır.
create or replace function yedek.al() returns int language plpgsql security definer set search_path = public as $$
declare n int := 0; b record;
begin
  for b in select * from businesses loop
    insert into yedek.gunluk (business_id, business_name, data) values (b.id, b.name, jsonb_build_object(
      'business', to_jsonb(b),
      'places', coalesce((select jsonb_agg(to_jsonb(x)) from places x where x.business_id = b.id), '[]'),
      'expenses', coalesce((select jsonb_agg(to_jsonb(x)) from expenses x where x.business_id = b.id), '[]'),
      'events', coalesce((select jsonb_agg(to_jsonb(x)) from events x where x.business_id = b.id), '[]'),
      'dues', coalesce((select jsonb_agg(to_jsonb(x)) from dues x where x.business_id = b.id), '[]'),
      'inventory_items', coalesce((select jsonb_agg(to_jsonb(x)) from inventory_items x where x.business_id = b.id), '[]'),
      'documents', coalesce((select jsonb_agg(to_jsonb(x)) from documents x where x.business_id = b.id), '[]'),
      'lots', coalesce((select jsonb_agg(to_jsonb(x)) from lots x where x.business_id = b.id), '[]'),
      'people', coalesce((select jsonb_agg(to_jsonb(x)) from people x where x.business_id = b.id), '[]'),
      'ledger_entries', coalesce((select jsonb_agg(to_jsonb(x)) from ledger_entries x where x.business_id = b.id), '[]'),
      'barns', coalesce((select jsonb_agg(to_jsonb(x)) from barns x where x.business_id = b.id), '[]'),
      'herds', coalesce((select jsonb_agg(to_jsonb(x)) from herds x where x.business_id = b.id), '[]'),
      'herd_days', coalesce((select jsonb_agg(to_jsonb(x)) from herd_days x where x.business_id = b.id), '[]')
    ));
    n := n + 1;
  end loop;
  delete from yedek.gunluk where taken_at < now() - interval '90 days';
  return n;
end $$;
revoke all on function yedek.al() from public, anon, authenticated;

-- 0001_core.sql
-- Ortak çekirdek + dayıbaşı ilk sürümünün ihtiyaç duyduğu tablolar.
-- Tablolar ürünlerden bağımsız adlandırıldı (people, events, ledger…);
-- ürüne özel farklar `kind`, `tags` ve `custom` (jsonb) ile ayarlanır.

create extension if not exists pgcrypto;

-- İşletmeler (her dayıbaşı / esnaf bir işletme)
create table businesses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  product     text not null,                 -- 'dayibasi', 'randevu', 'esnaf', ...
  phone       text,
  settings    jsonb not null default '{}',   -- ör. {"daily_rate": 1600}
  created_at  timestamptz not null default now()
);

-- Kullanıcı ↔ işletme üyeliği
create table memberships (
  business_id uuid not null references businesses(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'sahip' check (role in ('sahip', 'calisan')),
  created_at  timestamptz not null default now(),
  primary key (business_id, user_id)
);

create or replace function is_member(bid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from memberships m
    where m.business_id = bid and m.user_id = auth.uid()
  );
$$;

-- Kişi kartı (işçi, çiftçi, şoför, müşteri, üye...)
create table people (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  kind        text not null,                 -- 'isci', 'ciftci', 'sofor', 'musteri', ...
  full_name   text not null,
  phone       text,
  tags        text[] not null default '{}',  -- ör. {'Zeytin','Budama'}
  custom      jsonb not null default '{}',   -- ürüne özel alanlar (köy, ÇKS no...)
  notes       text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);
create index on people (business_id, kind);

-- Yer kartı (tarla, adres, şube...)
create table places (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references businesses(id) on delete cascade,
  owner_person_id uuid references people(id) on delete set null, -- tarlanın sahibi çiftçi
  name            text not null,
  address         text,
  lat             double precision,
  lng             double precision,
  custom          jsonb not null default '{}',   -- ör. {"cks_no": "..."}
  created_at      timestamptz not null default now()
);
create index on places (business_id);

-- Varlık kartı (araç, ekipman)
create table assets (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  kind        text not null default 'arac',
  label       text not null,                 -- plaka
  capacity    int,                           -- kaç kişilik
  driver_id   uuid references people(id) on delete set null,
  custom      jsonb not null default '{}',
  created_at  timestamptz not null default now()
);
create index on assets (business_id);

-- Evrak + bitiş tarihi (araç, kişi ya da işletmeye bağlı)
create table documents (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references businesses(id) on delete cascade,
  subject_type text not null check (subject_type in ('asset', 'person', 'business')),
  subject_id   uuid,
  title        text not null,                -- 'İzin kâğıdı', 'Muayene', 'Sigorta'
  expires_on   date,
  file_path    text,                         -- Supabase Storage yolu (fotoğraf)
  notes        text,
  created_at   timestamptz not null default now()
);
create index on documents (business_id, expires_on);

-- Kayıt defteri (puantaj, randevu, ziyaret...)
create table events (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  kind        text not null,                 -- 'puantaj', 'randevu', ...
  occurred_on date not null default (now() at time zone 'Europe/Istanbul')::date,
  starts_at   timestamptz,
  place_id    uuid references places(id) on delete set null,
  asset_id    uuid references assets(id) on delete set null,
  person_id   uuid references people(id) on delete set null, -- ör. işin sahibi çiftçi
  quantity    numeric,                       -- puantajda kişi sayısı
  data        jsonb not null default '{}',
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now()
);
create index on events (business_id, kind, occurred_on);

-- Kayda katılan kişiler (isimli puantaj için; ilk sürümde opsiyonel)
create table event_people (
  event_id  uuid not null references events(id) on delete cascade,
  person_id uuid not null references people(id) on delete cascade,
  primary key (event_id, person_id)
);

-- Cari hesap: alacak / ödeme / avans
create table ledger_entries (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  person_id   uuid not null references people(id) on delete cascade,
  kind        text not null check (kind in ('alacak', 'odeme', 'avans')),
  amount      numeric(12,2) not null check (amount >= 0),
  occurred_on date not null default (now() at time zone 'Europe/Istanbul')::date,
  event_id    uuid references events(id) on delete set null,
  note        text,
  created_at  timestamptz not null default now()
);
create index on ledger_entries (business_id, person_id);

-- Yoklama: "Yarın geliyor musun?"
create table rsvps (
  business_id uuid not null references businesses(id) on delete cascade,
  person_id   uuid not null references people(id) on delete cascade,
  for_date    date not null,
  answer      text check (answer in ('evet', 'hayir')),  -- null = bekleniyor
  updated_at  timestamptz not null default now(),
  primary key (person_id, for_date)
);

-- Mesaj şablonları (business_id null = herkese ortak varsayılan)
create table message_templates (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  key         text not null,                 -- 'yoklama', 'hesap_dokumu', 'evrak_hatirlatma'
  body        text not null,                 -- {ad}, {tutar} gibi yer tutucularla
  created_at  timestamptz not null default now()
);

insert into message_templates (business_id, key, body) values
  (null, 'yoklama', 'Merhaba {ad}, yarın işe geliyor musun? Evet ya da Hayır yazman yeterli.'),
  (null, 'hesap_dokumu', 'Merhaba {ad}, hesabın: {kisi_gun} kişi-gün iş, toplam {tutar} TL, ödenen {odenen} TL, kalan {kalan} TL.'),
  (null, 'evrak_hatirlatma', '{plaka} arabasının {belge} süresi {gun} gün sonra bitiyor.');

-- Row Level Security: herkes yalnız üyesi olduğu işletmenin verisini görür
alter table businesses        enable row level security;
alter table memberships       enable row level security;
alter table people            enable row level security;
alter table places            enable row level security;
alter table assets            enable row level security;
alter table documents         enable row level security;
alter table events            enable row level security;
alter table event_people      enable row level security;
alter table ledger_entries    enable row level security;
alter table rsvps             enable row level security;
alter table message_templates enable row level security;

create policy "uye okur ve yazar" on businesses
  for all using (is_member(id)) with check (is_member(id));
create policy "kendi uyeligi" on memberships
  for select using (user_id = auth.uid());

create policy "uye" on people         for all using (is_member(business_id)) with check (is_member(business_id));
create policy "uye" on places         for all using (is_member(business_id)) with check (is_member(business_id));
create policy "uye" on assets         for all using (is_member(business_id)) with check (is_member(business_id));
create policy "uye" on documents      for all using (is_member(business_id)) with check (is_member(business_id));
create policy "uye" on events         for all using (is_member(business_id)) with check (is_member(business_id));
create policy "uye" on ledger_entries for all using (is_member(business_id)) with check (is_member(business_id));
create policy "uye" on rsvps          for all using (is_member(business_id)) with check (is_member(business_id));
create policy "uye" on event_people   for all
  using (exists (select 1 from events e where e.id = event_id and is_member(e.business_id)))
  with check (exists (select 1 from events e where e.id = event_id and is_member(e.business_id)));
create policy "ortak veya uye" on message_templates
  for select using (business_id is null or is_member(business_id));
create policy "uye yazar" on message_templates
  for all using (is_member(business_id)) with check (is_member(business_id));

-- Yeni işletme açma: işletmeyi oluşturur ve açan kişiyi sahip yapar
create or replace function create_business(p_name text, p_product text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare bid uuid;
begin
  insert into businesses (name, product) values (p_name, p_product) returning id into bid;
  insert into memberships (business_id, user_id, role) values (bid, auth.uid(), 'sahip');
  return bid;
end;
$$;

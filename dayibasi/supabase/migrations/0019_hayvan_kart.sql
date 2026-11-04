-- Hayvan kartı (küpe no ile tek tek hayvan) ve olaylar: doğum, kızgınlık, tohumlama, gebelik, kuruya, ilaç, aşı, tartım, satış, ölüm.
-- Hayvancılık oturumu (4 Kasım 2026). Yalnız yeni tablo: geriye uyumlu. Yetki: 'hayvan' ekranı (0018 ile aynı).

create table animals (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  species     text not null check (species in ('kucukbas', 'buyukbas')),
  kind        text not null check (kind in ('inek', 'koyun', 'keci')),
  barn_id     uuid references barns(id),
  tag         text check (tag is null or char_length(tag) <= 30),          -- küpe no
  name        text check (name is null or char_length(name) <= 40),        -- adı / lakabı
  sex         text not null check (sex in ('disi', 'erkek')),
  breed       text check (breed is null or char_length(breed) <= 40),
  born_on     date,
  mother_id   uuid references animals(id) on delete set null,
  status      text not null default 'var' check (status in ('var', 'satildi', 'oldu')),
  left_on     date,
  note        text check (note is null or char_length(note) <= 300),
  data        jsonb not null default '{}' check (pg_column_size(data) < 20000),
  created_by  uuid default auth.uid() references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  check (tag is not null or name is not null)
);
create index on animals (business_id);

create table animal_events (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  animal_id   uuid not null references animals(id) on delete cascade,
  day         date not null,
  type        text not null check (type in ('dogum', 'kizgin', 'tohum', 'gebe', 'bos', 'kuru', 'ilac', 'asi', 'tartim', 'satis', 'olum', 'not')),
  data        jsonb not null default '{}' check (pg_column_size(data) < 20000), -- ilac {drug, milk_days, meat_days}, asi {vaccine, next_on}, tartim {kg}, satis {price, buyer}…
  note        text check (note is null or char_length(note) <= 300),
  created_by  uuid default auth.uid() references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index on animal_events (business_id);
create index on animal_events (animal_id);

do $$ declare t text; begin
  foreach t in array array['animals', 'animal_events'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "uye" on %I for all using (is_member(business_id)) with check (is_member(business_id))', t);
    execute format('create policy "yetki: hayvan" on %I as restrictive for all using (can(business_id, ''hayvan'', 1)) with check (can(business_id, ''hayvan'', 2))', t);
    execute format('create policy "yetki: hayvan yazar" on %I as restrictive for update using (can(business_id, ''hayvan'', 2))', t);
    execute format('create policy "yetki: hayvan siler" on %I as restrictive for delete using (can(business_id, ''hayvan'', 2))', t);
    execute format('create trigger log_%s after insert or update or delete on %I for each row execute function log_activity()', t, t);
  end loop;
end $$;

do $$ begin
  execute replace(pg_get_functiondef('public.undo_activity(bigint)'::regprocedure),
    '''herd_days'')', '''herd_days'',''animals'',''animal_events'')');
end $$;

revoke insert, update, delete, truncate on animals, animal_events from anon;

create or replace function admin_table_ok(t text) returns boolean language sql immutable as $$
  select t = any (array['businesses','places','expenses','events','dues','inventory_items','documents','lots','people','ledger_entries','lists','receipt_inbox','invites','activity_log','message_templates','barns','herds','herd_days','animals','animal_events']);
$$;

-- Not: yedek.al() (0013) uygulanınca animals ve animal_events de eklenmeli.

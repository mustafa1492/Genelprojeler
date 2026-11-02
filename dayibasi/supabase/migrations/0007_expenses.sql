-- Masraflar (dayıbaşı ve çiftçi defteri ortak). Veresiye: paid=false + vendor; ödemeleri `paid_amount`.
create table expenses (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references businesses(id) on delete cascade,
  occurred_on  date not null default (now() at time zone 'Europe/Istanbul')::date,
  category     text not null check (char_length(category) between 1 and 40),
  amount       numeric(12,2) not null check (amount > 0 and amount <= 100000000),
  note         text check (note is null or char_length(note) <= 300),
  vendor       text check (vendor is null or char_length(vendor) <= 80),   -- veresiye: kime borçlu
  paid_amount  numeric(12,2) not null default 0 check (paid_amount >= 0),   -- veresiyeden ödenen
  on_credit    boolean not null default false,
  charge_to    uuid references people(id) on delete set null,              -- çiftçiye yansıt
  place_id     uuid references places(id) on delete set null,              -- çiftçi defteri: tarla
  photo_path   text check (photo_path is null or char_length(photo_path) <= 300),
  data         jsonb not null default '{}' check (octet_length(data::text) <= 4000),
  created_at   timestamptz not null default now()
);
create index on expenses (business_id, occurred_on);
alter table expenses enable row level security;
create policy "uye" on expenses for all using (is_member(business_id)) with check (is_member(business_id));
create trigger log_expenses after insert or update or delete on expenses for each row execute function log_activity();

-- Fiş fotoğrafları: gizli kova; yol "<business_id>/<dosya>"; yalnız o işletmenin üyeleri.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 5242880, array['image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do nothing;
create policy "fis okur" on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and is_member(((storage.foldername(name))[1])::uuid));
create policy "fis yukler" on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and is_member(((storage.foldername(name))[1])::uuid));
create policy "fis siler" on storage.objects for delete to authenticated
  using (bucket_id = 'receipts' and is_member(((storage.foldername(name))[1])::uuid));

-- Geri alma masrafları da kapsasın (0006'daki fonksiyonun listesi genişler)
do $$ begin
  execute replace(pg_get_functiondef('public.undo_activity(bigint)'::regprocedure),
    '''rsvps'',''lists'')', '''rsvps'',''lists'',''expenses'')');
end $$;

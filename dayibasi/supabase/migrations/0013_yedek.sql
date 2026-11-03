-- Günlük yedek: her işletmenin bütün kayıtları JSON olarak "yedek" şemasına yazılır.
-- Bu şema API'ye açık değil; işletme silinse bile (cascade) yedekler kalır. 90 gün saklanır.
create schema if not exists yedek;
revoke all on schema yedek from public, anon, authenticated;

create table if not exists yedek.gunluk (
  id bigserial primary key,
  business_id uuid not null,
  business_name text,
  taken_at timestamptz not null default now(),
  data jsonb not null
);
create index if not exists gunluk_biz on yedek.gunluk (business_id, taken_at desc);

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
      'ledger_entries', coalesce((select jsonb_agg(to_jsonb(x)) from ledger_entries x where x.business_id = b.id), '[]')
    ));
    n := n + 1;
  end loop;
  delete from yedek.gunluk where taken_at < now() - interval '90 days';
  return n;
end $$;
revoke all on function yedek.al() from public, anon, authenticated;

create extension if not exists pg_cron;
select cron.schedule('gunluk-yedek', '17 0 * * *', 'select yedek.al()');   -- her gece 03:17 (TR)
select yedek.al();

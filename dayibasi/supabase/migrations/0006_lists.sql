-- Kişi listeleri: dayıbaşı havuzdan istediği kişileri listelere koyar (ör. "Manisa", "Aydın").
-- Üyeler tek satırda dizi olarak tutulur (internetsiz çalışmada tek kayıt güncellenir).
create table lists (
  id          uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 60),
  members     uuid[] not null default '{}' check (cardinality(members) <= 1000),
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);
create index on lists (business_id);
alter table lists enable row level security;
create policy "uye" on lists for all using (is_member(business_id)) with check (is_member(business_id));
create trigger log_lists after insert or update or delete on lists for each row execute function log_activity();

-- Geri alma listeleri de kapsasın
create or replace function undo_activity(p_id bigint)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  l activity_log;
  t text;
  w text;
  cur jsonb;
  ch text[];
begin
  select * into l from activity_log where id = p_id for update;
  if not found then raise exception 'yok'; end if;
  if not is_member(l.business_id) then raise exception 'izin_yok'; end if;
  if l.undone_at is not null then raise exception 'zaten_geri_alindi'; end if;
  if l.table_name not in ('people','places','assets','documents','events','ledger_entries','rsvps','lists') then
    raise exception 'geri_alinamadi';
  end if;
  t := l.table_name;
  select string_agg(format('x.%I::text = %L', key, value), ' and ') into w from jsonb_each_text(l.row_key);
  perform set_config('app.undo_of', p_id::text, true);
  if l.action = 'insert' then
    execute format('select to_jsonb(x) from %I x where %s', t, w) into cur;
    if cur is not null and cur <> l.new_data then raise exception 'sonradan_degisti'; end if;
    execute format('delete from %I x where %s', t, w);
  elsif l.action = 'delete' then
    execute format('insert into %I select * from jsonb_populate_record(null::%I, $1)', t, t) using l.old_data;
  else
    select array_agg(key) into ch from jsonb_each(l.new_data) where l.old_data -> key is distinct from value;
    execute format('select to_jsonb(x) from %I x where %s', t, w) into cur;
    if cur is null then raise exception 'sonradan_degisti'; end if;
    if exists (select 1 from unnest(ch) c where cur -> c is distinct from l.new_data -> c) then
      raise exception 'sonradan_degisti';
    end if;
    execute format('update %I x set %s from jsonb_populate_record(null::%I, $1) r where %s',
      t, (select string_agg(format('%I = r.%I', c, c), ', ') from unnest(ch) c), t, w)
      using l.old_data;
  end if;
  perform set_config('app.undo_of', '', true);
  update activity_log set undone_at = now() where id = p_id;
  return 'tamam';
exception
  when raise_exception then raise;
  when others then raise exception 'geri_alinamadi';
end;
$$;

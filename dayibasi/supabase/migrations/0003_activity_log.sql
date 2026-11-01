-- İşlem geçmişi: her ekleme / değiştirme / silme kaydedilir ve geri alınabilir.
-- Kayıt tetikleyiciyle tutulur; uygulama kodunun hatırlaması gerekmez.

create table activity_log (
  id          bigserial primary key,
  business_id uuid not null references businesses(id) on delete cascade,
  user_id     uuid default auth.uid(),
  table_name  text not null,
  action      text not null check (action in ('insert', 'update', 'delete')),
  row_key     jsonb not null,               -- birincil anahtar: {"id": "..."} ya da {"person_id": "...", "for_date": "..."}
  old_data    jsonb,
  new_data    jsonb,
  undo_of     bigint references activity_log(id) on delete set null,  -- bu satır bir geri alma ise, neyi geri aldığı
  undone_at   timestamptz,                  -- geri alındıysa ne zaman
  created_at  timestamptz not null default now()
);
create index on activity_log (business_id, created_at desc);

alter table activity_log enable row level security;
create policy "uye okur" on activity_log for select using (is_member(business_id));
-- Doğrudan yazma yok: yalnız tetikleyici ve undo_activity yazar.

create or replace function log_activity()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  o jsonb := case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end;
  n jsonb := case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end;
  d jsonb := coalesce(n, o);
  k jsonb;
begin
  if tg_op = 'UPDATE' and o = n then return null; end if;
  select jsonb_object_agg(a.attname, d -> a.attname) into k
    from pg_index i join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any(i.indkey)
   where i.indrelid = tg_relid and i.indisprimary;
  insert into activity_log (business_id, table_name, action, row_key, old_data, new_data, undo_of)
  values ((d ->> 'business_id')::uuid, tg_table_name, lower(tg_op), k, o, n,
          nullif(current_setting('app.undo_of', true), '')::bigint);
  return null;
end;
$$;

-- Geçmişe giren tablolar (business_id sütunu olanlar). Yeni tablo eklenince buraya da eklenir.
create trigger log_people         after insert or update or delete on people         for each row execute function log_activity();
create trigger log_places         after insert or update or delete on places         for each row execute function log_activity();
create trigger log_assets         after insert or update or delete on assets         for each row execute function log_activity();
create trigger log_documents      after insert or update or delete on documents      for each row execute function log_activity();
create trigger log_events         after insert or update or delete on events         for each row execute function log_activity();
create trigger log_ledger_entries after insert or update or delete on ledger_entries for each row execute function log_activity();
create trigger log_rsvps          after insert or update or delete on rsvps          for each row execute function log_activity();

-- Bir işlemi geri al. Dönüş: 'tamam'. Hata kodları (uygulama Türkçeye çevirir):
--   yok, izin_yok, zaten_geri_alindi, sonradan_degisti, geri_alinamadi
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
  if l.table_name not in ('people','places','assets','documents','events','ledger_entries','rsvps') then
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

  else -- update: yalnız bu işlemin değiştirdiği alanlar, şu an hâlâ o haldeyse geri döner
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

revoke execute on function undo_activity(bigint) from public, anon;
grant execute on function undo_activity(bigint) to authenticated;
revoke execute on function log_activity() from public, anon, authenticated;

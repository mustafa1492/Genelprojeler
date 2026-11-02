-- İşletme silinirken (cascade) alt kayıtların geçmişe yazılması yabancı anahtar hatası veriyordu.
-- İşletme artık yoksa geçmişe yazma.
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
  if not exists (select 1 from businesses where id = (d ->> 'business_id')::uuid) then return null; end if;
  select jsonb_object_agg(a.attname, d -> a.attname) into k
    from pg_index i join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any(i.indkey)
   where i.indrelid = tg_relid and i.indisprimary;
  insert into activity_log (business_id, table_name, action, row_key, old_data, new_data, undo_of)
  values ((d ->> 'business_id')::uuid, tg_table_name, lower(tg_op), k, o, n,
          nullif(current_setting('app.undo_of', true), '')::bigint);
  return null;
end;
$$;
revoke execute on function log_activity() from public, anon, authenticated;

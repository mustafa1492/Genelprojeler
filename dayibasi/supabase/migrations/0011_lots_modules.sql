-- Fidan (şimşir) modülü: partiler + işletme bazında modül aç/kapa (yalnız yönetici).
create table lots (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references businesses(id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 60),
  place_id      uuid references places(id) on delete set null,          -- parsel / tarla
  planted_on    date,                                                  -- dikim (geçmiş tarih olabilir)
  initial_count integer not null default 0 check (initial_count between 0 and 10000000),
  source        text check (source is null or char_length(source) <= 40), -- çelik, fide, tohum…
  status        text not null default 'aktif' check (status in ('aktif', 'bitti')),
  note          text check (note is null or char_length(note) <= 300),
  data          jsonb not null default '{}' check (octet_length(data::text) <= 8000), -- prior_cost, initial_cost, reminders…
  created_by    uuid default auth.uid() references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index on lots (business_id);
alter table lots enable row level security;
create policy "uye" on lots for all using (is_member(business_id)) with check (is_member(business_id));
create trigger log_lots after insert or update or delete on lots for each row execute function log_activity();

do $$ begin
  execute replace(pg_get_functiondef('public.undo_activity(bigint)'::regprocedure),
    '''dues'',''inventory_items'')', '''dues'',''inventory_items'',''lots'')');
end $$;

-- Modül aç/kapa: yalnız platform yöneticisi (kullanıcı kendi açamaz)
create or replace function admin_set_modules(p_business uuid, p_modules text[])
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_platform_admin() then raise exception 'izin_yok'; end if;
  update businesses set settings = jsonb_set(coalesce(settings, '{}'), '{modules}', to_jsonb(coalesce(p_modules, '{}'))) where id = p_business;
end; $$;
revoke execute on function admin_set_modules(uuid, text[]) from public, anon;
grant execute on function admin_set_modules(uuid, text[]) to authenticated;

-- Yönetici özetine ürün modülleri
drop function if exists admin_overview();
create or replace function admin_overview()
returns table (business_id uuid, name text, product text, owner_email text, created_at timestamptz,
  isci bigint, ciftci bigint, kayit bigint, son_islem timestamptz, modules jsonb)
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_platform_admin() then raise exception 'izin_yok'; end if;
  return query
    select b.id, b.name, b.product,
      (select u.email::text from memberships m join auth.users u on u.id = m.user_id where m.business_id = b.id and m.role = 'sahip' order by m.created_at limit 1),
      b.created_at,
      (select count(*) from people p where p.business_id = b.id and p.kind = 'isci' and p.active),
      (select count(*) from people p where p.business_id = b.id and p.kind = 'ciftci' and p.active),
      (select count(*) from events e where e.business_id = b.id),
      (select max(a.created_at) from activity_log a where a.business_id = b.id),
      coalesce(b.settings -> 'modules', '[]'::jsonb)
    from businesses b order by b.created_at desc;
end; $$;
revoke execute on function admin_overview() from public, anon;
grant execute on function admin_overview() to authenticated;

-- Kullanıcı işletme ayarlarını güncellerken modül listesini değiştiremesin
create or replace function keep_modules()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not is_platform_admin() and (new.settings -> 'modules') is distinct from (old.settings -> 'modules') then
    new.settings := jsonb_set(coalesce(new.settings, '{}'), '{modules}', coalesce(old.settings -> 'modules', '[]'::jsonb));
  end if;
  return new;
end; $$;
create trigger keep_modules before update on businesses for each row execute function keep_modules();

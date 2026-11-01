-- Platform yöneticisi: bütün işletmelerin özetini görür (yalnız okuma).
create table platform_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table platform_admins enable row level security;   -- politika yok: kimse doğrudan okuyamaz/yazamaz

create or replace function is_platform_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from platform_admins where user_id = auth.uid()); $$;

create or replace function admin_overview()
returns table (
  business_id uuid, name text, product text, owner_email text, created_at timestamptz,
  isci bigint, ciftci bigint, kayit bigint, son_islem timestamptz
)
language plpgsql stable security definer set search_path = public
as $$
begin
  if not is_platform_admin() then raise exception 'izin_yok'; end if;
  return query
    select b.id, b.name, b.product,
      (select u.email::text from memberships m join auth.users u on u.id = m.user_id
        where m.business_id = b.id and m.role = 'sahip' order by m.created_at limit 1),
      b.created_at,
      (select count(*) from people p where p.business_id = b.id and p.kind = 'isci' and p.active),
      (select count(*) from people p where p.business_id = b.id and p.kind = 'ciftci' and p.active),
      (select count(*) from events e where e.business_id = b.id),
      (select max(a.created_at) from activity_log a where a.business_id = b.id)
    from businesses b
    order by b.created_at desc;
end;
$$;

revoke execute on function is_platform_admin() from public, anon;
revoke execute on function admin_overview() from public, anon;
grant execute on function is_platform_admin() to authenticated;
grant execute on function admin_overview() to authenticated;

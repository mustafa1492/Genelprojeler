-- Yetkiler (Mustafa, 4 Kasım 2026): her üyenin hangi ekranı göreceği/değiştireceği seçilir.
-- memberships.perms = { preset: 'yonetici'|'aile'|'calisan'|'ozel', ekran: { masraf: 'yok'|'gor'|'yaz', ... } }
-- Eski kayıtlar: role 'sahip' → yonetici, role 'calisan' → calisan. Asıl koruma veritabanında (kısıtlayıcı politikalar).
alter table memberships add column if not exists perms jsonb not null default '{}'::jsonb;
alter table memberships add constraint memberships_perms_size check (pg_column_size(perms) < 4000) not valid;

create or replace function perm_level(bid uuid, scr text) returns int language plpgsql stable security definer set search_path = public as $$
declare m memberships; p text; e jsonb;
begin
  select * into m from memberships where business_id = bid and user_id = auth.uid();
  if not found then return 0; end if;
  p := coalesce(m.perms ->> 'preset', case when m.role = 'calisan' then 'calisan' else 'yonetici' end);
  if p = 'yonetici' then return 2; end if;
  if p = 'aile' then return case when scr = 'uyeler' then 1 else 2 end; end if;
  if p = 'calisan' then e := '{"tarlalar":"yaz","takvim":"yaz","depo":"yaz","fis":"yaz","belgeler":"gor","uyeler":"gor"}';
  else e := coalesce(m.perms -> 'ekran', '{}'); end if;
  return case e ->> scr when 'yaz' then 2 when 'gor' then 1 else 0 end;
end $$;
create or replace function can(bid uuid, scr text, lvl int) returns boolean language sql stable security definer set search_path = public as $$
  select perm_level(bid, scr) >= lvl;
$$;
create or replace function event_screen(k text) returns text language sql immutable as $$
  select case when k = 'gelir' then 'gelir' when k in ('islem', 'verim') then 'tarlalar' when k = 'hatirlat' then 'takvim'
              when k in ('sayim', 'siparis', 'foto', 'aktarim', 'bakim') then 'fidan' else 'tarlalar' end;
$$;
-- Eski adla kullananlar için: para görebilen = masrafı görebilen
create or replace function is_money(bid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select perm_level(bid, 'masraf') >= 1;
$$;
create or replace function my_perms(bid uuid) returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_object_agg(s, perm_level(bid, s)) from unnest(array['tarlalar','masraf','gelir','fidan','depo','takvim','rapor','vadeler','belgeler','kayitlar','fis','gecmis','ayarlar','uyeler']) s;
$$;

-- Politikalar: görmek için 1, değiştirmek için 2
alter policy "para: calisan goremez" on expenses using (can(business_id, 'masraf', 1)) with check (can(business_id, 'masraf', 2));
create policy "yetki: masraf yazar" on expenses as restrictive for update using (can(business_id, 'masraf', 2));
create policy "yetki: masraf siler" on expenses as restrictive for delete using (can(business_id, 'masraf', 2));
alter policy "para: calisan goremez" on dues using (can(business_id, 'vadeler', 1)) with check (can(business_id, 'vadeler', 2));
create policy "yetki: vade yazar" on dues as restrictive for update using (can(business_id, 'vadeler', 2));
create policy "yetki: vade siler" on dues as restrictive for delete using (can(business_id, 'vadeler', 2));
alter policy "para: calisan goremez" on ledger_entries using (can(business_id, 'masraf', 1)) with check (can(business_id, 'masraf', 2));
alter policy "para: calisan goremez" on lots using (can(business_id, 'fidan', 1)) with check (can(business_id, 'fidan', 2));
create policy "yetki: fidan yazar" on lots as restrictive for update using (can(business_id, 'fidan', 2));
create policy "yetki: fidan siler" on lots as restrictive for delete using (can(business_id, 'fidan', 2));
alter policy "para: calisan goremez" on activity_log using (can(business_id, 'gecmis', 1));
alter policy "para: calisan sadece tarla isi" on events using (can(business_id, event_screen(kind), 1)) with check (can(business_id, event_screen(kind), 2));
create policy "yetki: olay yazar" on events as restrictive for update using (can(business_id, event_screen(kind), 2));
create policy "yetki: olay siler" on events as restrictive for delete using (can(business_id, event_screen(kind), 2));
create policy "yetki: depo" on inventory_items as restrictive for all using (can(business_id, 'depo', 1)) with check (can(business_id, 'depo', 2));
create policy "yetki: depo yazar" on inventory_items as restrictive for update using (can(business_id, 'depo', 2));
create policy "yetki: depo siler" on inventory_items as restrictive for delete using (can(business_id, 'depo', 2));
create policy "yetki: belge" on documents as restrictive for all using (can(business_id, 'belgeler', 1)) with check (can(business_id, 'belgeler', 2));
create policy "yetki: belge yazar" on documents as restrictive for update using (can(business_id, 'belgeler', 2));
create policy "yetki: belge siler" on documents as restrictive for delete using (can(business_id, 'belgeler', 2));
-- Tarlalar: herkes görür (seçim listeleri için), değiştirmek tarlalar yazma ister
create policy "yetki: tarla ekler" on places as restrictive for insert with check (can(business_id, 'tarlalar', 2));
create policy "yetki: tarla yazar" on places as restrictive for update using (can(business_id, 'tarlalar', 2));
create policy "yetki: tarla siler" on places as restrictive for delete using (can(business_id, 'tarlalar', 2));
-- Defter ayarları (listeler, sezonlar, fidan ayarı)
create policy "yetki: ayar" on businesses as restrictive for update using (can(id, 'ayarlar', 2));
-- Fiş kutusu
alter policy "fis kutusu: uye ekler" on receipt_inbox with check (can(business_id, 'fis', 2) and created_by = auth.uid());
alter policy "fis kutusu: sahip ya da yukleyen gorur" on receipt_inbox using (can(business_id, 'masraf', 1) or (is_member(business_id) and created_by = auth.uid()));
alter policy "fis kutusu: sahip isler" on receipt_inbox using (can(business_id, 'masraf', 2)) with check (can(business_id, 'masraf', 2));
alter policy "fis kutusu: sahip siler" on receipt_inbox using (can(business_id, 'masraf', 2));

-- Üye yönetimi: 'uyeler' yazma izni olan (yönetici)
create or replace function create_invite(p_business uuid, p_role text) returns text language plpgsql security definer set search_path = public as $$
declare c text;
begin
  if not can(p_business, 'uyeler', 2) then raise exception 'izin_yok'; end if;
  if p_role not in ('sahip', 'calisan') then raise exception 'rol_yok'; end if;
  c := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  insert into invites (code, business_id, role, created_by) values (c, p_business, p_role, auth.uid());
  return c;
end $$;
create or replace function set_member_role(p_business uuid, p_user uuid, p_role text) returns text language plpgsql security definer set search_path = public as $$
begin
  if not can(p_business, 'uyeler', 2) then raise exception 'izin_yok'; end if;
  if p_user = auth.uid() then raise exception 'kendin_degil'; end if;
  if p_role = 'cikar' then delete from memberships where business_id = p_business and user_id = p_user; return 'tamam'; end if;
  if p_role not in ('sahip', 'calisan') then raise exception 'rol_yok'; end if;
  update memberships set role = p_role, perms = '{}'::jsonb where business_id = p_business and user_id = p_user;
  return 'tamam';
end $$;
-- Ayrıntılı yetki: preset + ekran ekran
create or replace function set_member_perms(p_business uuid, p_user uuid, p_perms jsonb) returns text language plpgsql security definer set search_path = public as $$
declare pr text := p_perms ->> 'preset';
begin
  if not (can(p_business, 'uyeler', 2) or is_platform_admin()) then raise exception 'izin_yok'; end if;
  if p_user = auth.uid() and not is_platform_admin() then raise exception 'kendin_degil'; end if;
  if pr not in ('yonetici', 'aile', 'calisan', 'ozel') then raise exception 'rol_yok'; end if;
  -- Defterde en az bir yönetici kalsın
  if pr <> 'yonetici' and not exists (select 1 from memberships m where m.business_id = p_business and m.user_id <> p_user
      and coalesce(m.perms ->> 'preset', case when m.role = 'calisan' then 'calisan' else 'yonetici' end) = 'yonetici') then raise exception 'son_yonetici'; end if;
  update memberships set perms = jsonb_build_object('preset', pr, 'ekran', coalesce(p_perms -> 'ekran', '{}'::jsonb)),
    role = case when pr = 'yonetici' or pr = 'aile' then 'sahip' else 'calisan' end
  where business_id = p_business and user_id = p_user;
  return 'tamam';
end $$;
-- Üye listesi (yetkilerle)
create or replace function member_list(p_business uuid) returns table(user_id uuid, display_name text, role text, perms jsonb, email text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not (is_member(p_business) or is_platform_admin()) then raise exception 'izin_yok'; end if;
  return query select m.user_id, m.display_name, m.role, m.perms, split_part(u.email::text, '@', 1)
    from memberships m join auth.users u on u.id = m.user_id where m.business_id = p_business order by m.created_at;
end $$;
do $$ declare f text; begin
  foreach f in array array['perm_level(uuid,text)','can(uuid,text,integer)','my_perms(uuid)','set_member_perms(uuid,uuid,jsonb)','member_list(uuid)'] loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated', f);
  end loop;
end $$;

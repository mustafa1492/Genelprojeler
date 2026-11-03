-- Çalışan modu (Mustafa, 3 Kasım 2026): rol 'calisan' para kayıtlarına erişemez.
-- Çalışan: tarla işi, verim, hatırlatma girer; depoyu görür/kullanır; fiş fotoğrafı yükler (sahip onaylar).
-- Hepsi kısıtlayıcı (restrictive) politika: mevcut "üye" politikalarının üstüne ek şart.

create or replace function is_money(bid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from memberships where business_id = bid and user_id = auth.uid() and role <> 'calisan');
$$;
revoke execute on function is_money(uuid) from public, anon;
grant execute on function is_money(uuid) to authenticated;

create policy "para: calisan goremez" on expenses as restrictive for all using (is_money(business_id)) with check (is_money(business_id));
create policy "para: calisan goremez" on dues as restrictive for all using (is_money(business_id)) with check (is_money(business_id));
create policy "para: calisan goremez" on ledger_entries as restrictive for all using (is_money(business_id)) with check (is_money(business_id));
create policy "para: calisan goremez" on lots as restrictive for all using (is_money(business_id)) with check (is_money(business_id));
create policy "para: calisan goremez" on activity_log as restrictive for select using (is_money(business_id));
create policy "para: calisan sadece tarla isi" on events as restrictive for all
  using (is_money(business_id) or kind in ('islem', 'verim', 'hatirlat'))
  with check (is_money(business_id) or kind in ('islem', 'verim', 'hatirlat'));
create policy "para: calisan fis okuyamaz" on storage.objects as restrictive for select to authenticated
  using (bucket_id <> 'receipts' or is_money(((storage.foldername(name))[1])::uuid) or owner = auth.uid());

-- Fiş kutusu: çalışan (ya da herkes) fotoğraf yükler, sahip açıp masrafa çevirir
create table if not exists receipt_inbox (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  photo_path text not null check (length(photo_path) <= 300),
  note text check (note is null or length(note) <= 300),
  place_id uuid references places(id) on delete set null,
  status text not null default 'bekliyor' check (status in ('bekliyor', 'islendi', 'atildi')),
  expense_id uuid,
  created_by uuid default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);
alter table receipt_inbox enable row level security;
create policy "fis kutusu: uye ekler" on receipt_inbox for insert with check (is_member(business_id) and created_by = auth.uid());
create policy "fis kutusu: sahip ya da yukleyen gorur" on receipt_inbox for select using (is_money(business_id) or (is_member(business_id) and created_by = auth.uid()));
create policy "fis kutusu: sahip isler" on receipt_inbox for update using (is_money(business_id)) with check (is_money(business_id));
create policy "fis kutusu: sahip siler" on receipt_inbox for delete using (is_money(business_id));
grant select, insert, update, delete on receipt_inbox to authenticated;

-- Davet: rolüyle (aile = sahip, çalışan). Sadece para görebilenler davet oluşturur.
alter table invites add column if not exists role text not null default 'sahip' check (role in ('sahip', 'calisan'));
create or replace function create_invite(p_business uuid) returns text language plpgsql security definer set search_path = public as $$
begin return create_invite(p_business, 'sahip'); end $$;
create or replace function create_invite(p_business uuid, p_role text) returns text language plpgsql security definer set search_path = public as $$
declare c text;
begin
  if not is_money(p_business) then raise exception 'izin_yok'; end if;
  if p_role not in ('sahip', 'calisan') then raise exception 'rol_yok'; end if;
  c := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  insert into invites (code, business_id, role, created_by) values (c, p_business, p_role, auth.uid());
  return c;
end $$;
revoke execute on function create_invite(uuid, text) from public, anon;
grant execute on function create_invite(uuid, text) to authenticated;

create or replace function join_business(p_code text, p_name text) returns uuid language plpgsql security definer set search_path = public as $$
declare i invites;
begin
  if auth.uid() is null then raise exception 'giris_yok'; end if;
  if (select count(*) from join_attempts where user_id = auth.uid() and at > now() - interval '1 hour') >= 10 then raise exception 'cok_deneme'; end if;
  select * into i from invites where code = upper(trim(p_code)) for update;
  if not found or i.used_by is not null or i.expires_at < now() then
    insert into join_attempts (user_id) values (auth.uid());
    raise exception 'kod_gecersiz';
  end if;
  insert into memberships (business_id, user_id, role, display_name)
  values (i.business_id, auth.uid(), i.role, nullif(trim(left(p_name, 60)), ''))
  on conflict (business_id, user_id) do nothing;
  update invites set used_by = auth.uid() where code = i.code;
  return i.business_id;
end $$;

-- Üyenin rolünü değiştir / üyeyi çıkar (sadece para görebilen üye; kendini çıkaramaz)
create or replace function set_member_role(p_business uuid, p_user uuid, p_role text) returns text language plpgsql security definer set search_path = public as $$
begin
  if not is_money(p_business) then raise exception 'izin_yok'; end if;
  if p_user = auth.uid() then raise exception 'kendin_degil'; end if;
  if p_role = 'cikar' then delete from memberships where business_id = p_business and user_id = p_user; return 'tamam'; end if;
  if p_role not in ('sahip', 'calisan') then raise exception 'rol_yok'; end if;
  update memberships set role = p_role where business_id = p_business and user_id = p_user;
  return 'tamam';
end $$;
revoke execute on function set_member_role(uuid, uuid, text) from public, anon;
grant execute on function set_member_role(uuid, uuid, text) to authenticated;

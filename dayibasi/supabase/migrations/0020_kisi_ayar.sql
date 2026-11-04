-- Kişiye özel görünüm ayarları (alt çubuk, özet kartları, kâr dönemi, büyük yazı).
-- Defter başına, kişi başına bir satır. Sadece sahibi okur/yazar.
create table if not exists user_prefs (
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, business_id)
);
alter table user_prefs enable row level security;
create policy "kendi ayarim" on user_prefs for all
  using (user_id = auth.uid() and is_member(business_id))
  with check (user_id = auth.uid() and is_member(business_id));
grant select, insert, update, delete on user_prefs to authenticated;

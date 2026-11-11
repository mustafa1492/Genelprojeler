-- Deneme (tanıtım) defteri koruması (Mustafa, 11 Kasım 2026): TÜBİTAK hakemlerine verilen ortak deneme hesabı.
-- businesses.settings.demo = true olan defterde ÖRNEK kayıtlar (created_by boş; SQL ile yüklenenler) silinemez.
-- Kullanıcının uygulamadan eklediği kayıt (created_by dolu) silinebilir: "Geri al" çalışmaya devam eder.
-- Ayar, üye ve davet değişikliği ayrıca üyeliğin yetkisiyle kapatılır (perms: ayarlar 'gor', uyeler 'yok').
-- Geriye uyumlu: demo işareti olmayan defterlerde hiçbir şey değişmez. Örnek veri: supabase/seed/deneme_mcbu.sql
create or replace function is_demo(bid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select settings ->> 'demo' = 'true' from businesses where id = bid), false);
$$;
do $$ declare t text; begin
  foreach t in array array['places','expenses','events','dues','inventory_items','documents','people','lots'] loop
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = 'deneme: ornek kayit silinmez') then
      execute format('create policy "deneme: ornek kayit silinmez" on %I as restrictive for delete using (not is_demo(business_id) or created_by is not null)', t);
    end if;
  end loop;
end $$;

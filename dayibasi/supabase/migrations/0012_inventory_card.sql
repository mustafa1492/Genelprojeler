-- Depo: az kaldı sınırı + ilaç kartı (etiket bilgileri kullanıcı girer: doz, bekleme süresi, hedef, uygulama şekli)
alter table inventory_items add column if not exists min_qty numeric(12,2) check (min_qty is null or (min_qty >= 0 and min_qty <= 100000000));
alter table inventory_items add column if not exists data jsonb not null default '{}' check (octet_length(data::text) <= 4000);

-- Deneme hesabı "denememcbü" (MCBÜ deneme çiftliği) için UYDURMA örnek veri. Gerçek kişi ya da işletme verisi değildir.
-- Tekrar çalıştırılabilir: defteri baştan kurar (hakemler bir şey eklediyse/değiştirdiyse temizler).
-- SQL Editor'de (ya da execute_sql ile) tek seferde çalıştırılır. Yalnız bu deftere dokunur.
do $$
declare
  bid constant uuid := 'ee6e4d54-2563-4b99-81fd-90320dabeb69';
  uid constant uuid := 'e813c465-58ef-4ac0-8bb0-6c7b67dae196';
  p1 constant uuid := 'd0000000-0000-4000-8000-000000000001';  -- mısır
  p2 constant uuid := 'd0000000-0000-4000-8000-000000000002';  -- ayçiçeği
  p3 constant uuid := 'd0000000-0000-4000-8000-000000000003';  -- domates
  koy constant jsonb := '{"koy": "Bergama, İzmir", "lat": 39.12, "lon": 27.18}';
  t text;
begin
  if not exists (select 1 from businesses where id = bid and name = 'MCBÜ deneme çiftliği') then raise exception 'deneme defteri bulunamadı'; end if;

  -- 1) Eski kayıtları temizle (yalnız bu defter)
  foreach t in array array['animal_events','animals','herd_days','herds','barns','receipt_inbox','lots','events','expenses','dues','documents','inventory_items','people','places','activity_log'] loop
    execute format('delete from %I where business_id = %L', t, bid);
  end loop;
  delete from user_prefs where user_id = uid and business_id = bid;

  -- 2) Defter ayarı: ek modül yok, tek sezon, deneme işareti. (keep_modules tetikleyicisi modülleri yalnız yöneticiye değiştirtir.)
  alter table businesses disable trigger keep_modules;
  update businesses set settings = jsonb_build_object('demo', true, 'modules', '[]'::jsonb,
    'seasons', jsonb_build_array(jsonb_build_object('id', 's26', 'name', '2026', 'start', '2026-01-01', 'end', '2026-12-31'))) where id = bid;
  alter table businesses enable trigger keep_modules;

  -- 3) Üyelik: kayıt ekler/değiştirir; ayarları ve geçmişi yalnız görür; üye/davet yok; fidan yok
  update memberships set role = 'calisan', display_name = 'Deneme kullanıcısı', perms = '{"preset": "ozel", "ekran": {"tarlalar": "yaz", "masraf": "yaz", "gelir": "yaz", "depo": "yaz", "takvim": "yaz",
    "rapor": "yaz", "vadeler": "yaz", "belgeler": "yaz", "kayitlar": "yaz", "fis": "yaz", "gecmis": "gor", "ayarlar": "gor"}}'::jsonb
    where business_id = bid and user_id = uid;
  insert into user_prefs (user_id, business_id, prefs) values (uid, bid, '{"doviz": "usd"}');

  -- 4) Tarlalar (Bergama)
  insert into places (id, business_id, name, custom, created_by) values
    (p1, bid, 'Kozak yolu tarlası', koy || '{"urun": "Mısır (dane)", "donum": "40"}', null),
    (p2, bid, 'Bakırçay kenarı',    koy || '{"urun": "Ayçiçeği (yağlık)", "donum": "25"}', null),
    (p3, bid, 'Ova tarlası',        koy || '{"urun": "Domates (salçalık)", "donum": "15"}', null);

  -- 5) Masraflar (2026 sezonu). Veresiye olanlar: on_credit = true, paid_amount = ödenen
  insert into expenses (business_id, occurred_on, category, amount, note, vendor, paid_amount, on_credit, place_id, created_by) values
    (bid, '2026-04-10', 'Tohum / fide',      60000, 'Dane mısır tohumu, 16 torba', null, 60000, false, p1, null),
    (bid, '2026-04-12', 'Gübre',             85000, 'Taban gübresi', 'Tarım Kredi Kooperatifi', 40000, true, p1, null),
    (bid, '2026-04-14', 'Mazot',             18000, 'Sürüm ve ekim', null, 18000, false, p1, null),
    (bid, '2026-06-05', 'Gübre',             70000, 'Üst gübre (üre)', null, 70000, false, p1, null),
    (bid, '2026-06-20', 'İlaç',              22000, 'Yabancı ot ilacı', null, 22000, false, p1, null),
    (bid, '2026-07-01', 'Mazot',             14000, null, null, 14000, false, p1, null),
    (bid, '2026-07-15', 'Sulama / elektrik', 34000, 'Temmuz elektrik faturası', null, 34000, false, p1, null),
    (bid, '2026-08-15', 'Sulama / elektrik', 31000, 'Ağustos elektrik faturası', null, 31000, false, p1, null),
    (bid, '2026-10-02', 'Traktör / makine',  40000, 'Biçerdöver ücreti', null, 40000, false, p1, null),
    (bid, '2026-10-03', 'Nakliye',           18000, 'Fabrikaya taşıma', null, 18000, false, p1, null),
    (bid, '2026-04-20', 'Tohum / fide',      22000, 'Ayçiçeği tohumu', null, 22000, false, p2, null),
    (bid, '2026-04-21', 'Gübre',             38000, 'Taban gübresi', null, 38000, false, p2, null),
    (bid, '2026-04-22', 'Mazot',             11000, 'Sürüm ve ekim', null, 11000, false, p2, null),
    (bid, '2026-05-25', 'İşçilik',           15000, 'Çapa, 10 yevmiye', null, 15000, false, p2, null),
    (bid, '2026-06-10', 'İlaç',               9000, null, null, 9000, false, p2, null),
    (bid, '2026-08-28', 'Traktör / makine',  17500, 'Biçerdöver ücreti', null, 17500, false, p2, null),
    (bid, '2026-08-29', 'Nakliye',            6000, null, null, 6000, false, p2, null),
    (bid, '2026-05-05', 'Tohum / fide',      96000, 'Salçalık domates fidesi', null, 96000, false, p3, null),
    (bid, '2026-05-06', 'Gübre',             42000, 'Taban gübresi', null, 42000, false, p3, null),
    (bid, '2026-05-08', 'Diğer',             45000, 'Damlama borusu', null, 45000, false, p3, null),
    (bid, '2026-05-10', 'İşçilik',           30000, 'Fide dikimi', null, 30000, false, p3, null),
    (bid, '2026-06-12', 'İlaç',              28000, 'Mantar ve böcek ilacı', 'Zirai ilaç bayisi', 0, true, p3, null),
    (bid, '2026-06-25', 'İşçilik',           25000, 'Çapa', null, 25000, false, p3, null),
    (bid, '2026-07-05', 'Gübre',             36000, 'Damlama gübresi', null, 36000, false, p3, null),
    (bid, '2026-07-20', 'İlaç',              36000, null, null, 36000, false, p3, null),
    (bid, '2026-07-25', 'Sulama / elektrik', 24000, 'Temmuz elektrik faturası', null, 24000, false, p3, null),
    (bid, '2026-08-10', 'Mazot',             12000, null, null, 12000, false, p3, null),
    (bid, '2026-08-18', 'İşçilik',           95000, 'Hasat, birinci el', null, 95000, false, p3, null),
    (bid, '2026-08-19', 'Nakliye',           20000, null, null, 20000, false, p3, null),
    (bid, '2026-08-20', 'Sulama / elektrik', 24000, 'Ağustos elektrik faturası', null, 24000, false, p3, null),
    (bid, '2026-09-08', 'İşçilik',           85000, 'Hasat, ikinci el', null, 85000, false, p3, null),
    (bid, '2026-09-09', 'Nakliye',           16000, null, null, 16000, false, p3, null),
    (bid, '2026-10-06', 'Tohum / fide',       6500, 'Ispanak tohumu (ikinci ürün)', null, 6500, false, p3, null),
    (bid, '2026-01-15', 'Diğer',              3500, 'Ziraat odası aidatı', null, 3500, false, null, null),
    (bid, '2026-03-10', 'Traktör / makine',  18000, 'Traktör yağ ve filtre bakımı', null, 18000, false, null, null),
    (bid, '2026-03-20', 'Diğer',             24000, 'Tarım sigortası', null, 24000, false, null, null),
    (bid, '2026-11-02', 'Mazot',              9000, null, null, 9000, false, null, null);

  -- 6) Gelir, verim, tarla işleri, hatırlatma, makine bakımı
  insert into events (business_id, kind, occurred_on, place_id, quantity, data, created_by) values
    (bid, 'gelir', '2026-10-05', p1, 624000, '{"type": "Hasat satışı", "crop": "Mısır", "qty": 48000, "unit": "kg", "price": 13, "buyer": "Yem fabrikası", "received": 624000}', null),
    (bid, 'gelir', '2026-09-02', p2, 200000, '{"type": "Hasat satışı", "crop": "Ayçiçeği", "qty": 6250, "unit": "kg", "price": 32, "buyer": "Yağ fabrikası", "received": 200000}', null),
    (bid, 'gelir', '2026-08-20', p3, 336000, '{"type": "Hasat satışı", "crop": "Domates", "qty": 70, "unit": "ton", "price": 4800, "buyer": "Salça fabrikası", "received": 336000}', null),
    (bid, 'gelir', '2026-09-10', p3, 240000, '{"type": "Hasat satışı", "crop": "Domates", "qty": 50, "unit": "ton", "price": 4800, "buyer": "Salça fabrikası", "received": 100000, "due_on": "2026-12-15"}', null),
    (bid, 'gelir', '2026-06-30', null, 21500, '{"type": "Devlet desteği", "received": 21500}', null),
    (bid, 'verim', '2026-10-01', p1, 48000, '{"year": "2026", "crop": "Mısır", "unit": "kg"}', null),
    (bid, 'verim', '2026-08-27', p2, 6250,  '{"year": "2026", "crop": "Ayçiçeği", "unit": "kg"}', null),
    (bid, 'verim', '2026-09-08', p3, 120,   '{"year": "2026", "crop": "Domates", "unit": "ton"}', null),
    (bid, 'islem', '2026-04-14', p1, null, '{"type": "Ekim / dikim", "note": "Dane mısır ekildi"}', null),
    (bid, 'islem', '2026-06-05', p1, null, '{"type": "Gübreleme", "product": "Üre", "dose": "25 kg / dekar"}', null),
    (bid, 'islem', '2026-07-10', p1, null, '{"type": "Sulama", "method": "Yağmurlama"}', null),
    (bid, 'islem', '2026-10-01', p1, null, '{"type": "Hasat"}', null),
    (bid, 'islem', '2026-04-22', p2, null, '{"type": "Ekim / dikim", "note": "Ayçiçeği ekildi"}', null),
    (bid, 'islem', '2026-05-25', p2, null, '{"type": "Çapa"}', null),
    (bid, 'islem', '2026-08-27', p2, null, '{"type": "Hasat"}', null),
    (bid, 'islem', '2026-05-10', p3, null, '{"type": "Ekim / dikim", "note": "Domates fidesi dikildi"}', null),
    (bid, 'islem', '2026-07-20', p3, null, '{"type": "İlaçlama", "product": "Mantar ilacı", "dose": "200 g / 100 litre su", "wait_days": 7}', null),
    (bid, 'islem', '2026-08-18', p3, null, '{"type": "Hasat", "note": "Birinci el"}', null),
    (bid, 'islem', '2026-10-06', p3, null, '{"type": "Ekim / dikim", "note": "İkinci ürün: ıspanak"}', null),
    -- Hasat bekleme süresi örneği: çalıştırıldığı günden 2 gün önce ilaçlandı, 21 gün bekleme (Özet ve Takvim'de görünür)
    (bid, 'islem', current_date - 2, p3, null, '{"type": "İlaçlama", "product": "Yaprak biti ilacı", "dose": "50 ml / 100 litre su", "wait_days": 21, "note": "Ispanak"}', null),
    (bid, 'hatirlat', current_date + 6, p1, null, '{"title": "Toprak tahlili için numune al"}', null),
    (bid, 'hatirlat', '2026-12-20', null, null, '{"title": "ÇKS kaydını yenile"}', null),
    (bid, 'makine', '2026-03-10', null, 3450, '{"makine": "Traktör", "is": "Yağ ve filtre değişimi", "next_hours": 3700}', null);

  -- 7) Borç, depo, belgeler
  insert into dues (business_id, direction, party, kind, amount, paid_amount, due_on, note, created_by) values
    (bid, 'borc', 'Banka (tarım kredisi)', 'Kredi', 150000, 50000, '2026-12-20', 'İşletme kredisi, son taksit', null);
  insert into inventory_items (business_id, name, category, unit, quantity, min_qty, note, data, created_by) values
    (bid, 'Üre', 'Gübre', 'çuval', 6, 5, null, '{}', null),
    (bid, 'Taban gübresi', 'Gübre', 'çuval', 2, 4, null, '{}', null),
    (bid, 'Yaprak biti ilacı', 'İlaç', 'litre', 1.5, null, null, '{"label_dose": "50 ml / 100 litre su", "wait_days": 21, "target": "Yaprak biti"}', null),
    (bid, 'Ispanak tohumu', 'Tohum', 'kg', 4, null, null, '{}', null);
  insert into documents (business_id, subject_type, title, expires_on, notes, created_by) values
    (bid, 'business', 'ÇKS', '2026-12-31', 'Her yıl yenilenir', null),
    (bid, 'business', 'TARSİM sigortası', '2027-03-20', null, null);

  -- 8) Geçmiş ekranı temiz başlasın (yukarıdaki yüklemelerin izleri)
  delete from activity_log where business_id = bid;
end $$;

// "Nasıl kullanılır" rehberinin içeriği. Düğme ve alan adları uygulamadaki gerçek yazılarla aynı tutuldu
// (products/ciftci/screens, core/expenses). Uygulama değişince burası da güncellenmeli.

/** Telefon çizimi: başlık, alanlar (etiket: örnek), seçim düğmeleri, ana düğme, kart. */
export type Ekran = {
  baslik: string;
  secim?: { ad: string; on?: boolean }[];
  alanlar?: [string, string][];
  kartlar?: [string, string][];
  kar?: [string, string];
  dugme?: string;
  ikinci?: string;
};
export type Konu = { b: string; k: string; m: string[]; ipucu?: string; ekran?: Ekran };
export type Bolum = { id: string; ad: string; ik: string; ozet: string; konular: Konu[] };

export const BOLUMLER: Bolum[] = [
  {
    id: "baslangic", ad: "İlk adımlar", ik: "🚀", ozet: "Hesap aç, defterini oluştur, ailene katıl.",
    konular: [
      {
        b: "Hesabını aç", k: "Bir kere yapılır, bir dakika sürer.",
        m: ["Bu sayfada “Hemen başla”ya dokun.", "E-postanı yaz, kendine en az 8 harf ya da rakamdan bir şifre seç.", "“Hesap aç”a dokun. E-postana bağlantı gelirse ona dokun, sonra “Giriş yap”."],
        ipucu: "Şifreni unutursan giriş ekranındaki “Şifremi unuttum”a dokun; e-postana yenileme bağlantısı gelir.",
        ekran: { baslik: "Yeni hesap aç", alanlar: [["E-posta", "ali@ornek.com"], ["Şifre", "••••••••"]], dugme: "Hesap aç" },
      },
      {
        b: "Defterini oluştur", k: "Defterine bir ad ver.",
        m: ["Defterin adını yaz. Örnek: “Yılmaz ailesi”.", "“Oluştur”a dokun. Bundan sonra hep bu deftere girersin."],
        ekran: { baslik: "Defterini oluştur", alanlar: [["Defterin adı", "Yılmaz ailesi"]], dugme: "Oluştur", ikinci: "Davet kodum var" },
      },
      {
        b: "Birinin defterine katıl", k: "Eşin ya da baban sana davet kodu gönderdiyse.",
        m: ["Hesabını aç, defter oluşturma ekranında “Davet kodum var”a dokun.", "Gelen kodu ve adını yaz (adın kayıtlarda görünür).", "“Katıl”a dokun. Artık aynı defteri birlikte kullanırsınız."],
        ekran: { baslik: "Davet koduyla katıl", alanlar: [["Davet kodu", "7F3A9C21"], ["Adın", "Mustafa"]], dugme: "Katıl" },
      },
      {
        b: "Uygulamada gezinmek", k: "Alttaki çubuk ve Menü.",
        m: ["Alttaki çubukta Özet, Tarlalar, Masraf, Gelir ve Depo durur.", "En sağdaki “Menü”de diğer her şey var: Takvim, Borç ve vadeler, Belgeler, Sezon raporu, Ayarlar…", "Her kayıttan sonra “Kaydettim: …” diye bir cümle çıkar. Yanlışsa oradan hemen geri alabilirsin."],
        ipucu: "Alt çubukta ne olacağını kendin seçebilirsin: Ayarlar → Ekranımı düzenle.",
        ekran: { baslik: "Menü", kartlar: [["Tarla ve üretim", "›"], ["Para", "›"], ["Defter", "›"], ["⚙️ Ayarlar", "›"]] },
      },
    ],
  },
  {
    id: "ozet", ad: "Özet", ik: "📊", ozet: "Kâr kartı, hızlı düğmeler, yaklaşanlar.",
    konular: [
      {
        b: "Kâr kartını oku", k: "Kâr mı ettin zarar mı, tek bakışta.",
        m: ["Özet’in en üstündeki koyu yeşil kart kârını gösterir; altında gelir ve masraf yazar.", "Kartın üstündeki seçimle dönemi değiştir: Sezon, Bu ay, Bu yıl ya da 30 gün.", "Borcun ya da alacağın varsa kartın altında o da görünür."],
        ekran: { baslik: "Özet", kar: ["Sezon kârı", "184.250 TL"], kartlar: [["Gelir", "412.000 TL"], ["Masraf", "227.750 TL"]] },
      },
      {
        b: "Hızlı düğmeler", k: "En sık yaptığın işler tek dokunuşta.",
        m: ["“+ Masraf” ve “+ Gelir” doğrudan yeni kayıt açar.", "“Tarla işi” ile ilaçlama, gübre, sulama gibi işleri yazarsın.", "“Fiş” ile fişin fotoğrafını çekip gönderirsin."],
        ekran: { baslik: "Özet", secim: [{ ad: "+ Masraf", on: true }, { ad: "+ Gelir" }, { ad: "Tarla işi" }, { ad: "Fiş" }] },
      },
      {
        b: "Yaklaşanlar ve hava", k: "Unutmaman gerekenler önüne gelir.",
        m: ["Yaklaşan hatırlatmalar, vadeler, belge bitişleri ve hasat günleri “Yaklaşanlar”da çıkar.", "İş yapıldıysa “Yapıldı”ya dokun.", "Tarlana köy ya da ilçe yazdıysan hava durumu da burada görünür.", "Depoda azalan malzeme varsa “Depoda az kalan” uyarısı çıkar."],
        ekran: { baslik: "Yaklaşanlar", kartlar: [["Mısıra ikinci gübre · Yarın", "Yapıldı"], ["Kredi taksiti · 5 gün", "Ödenecek"], ["ÇKS · 12 gün", "Belge"]] },
      },
      {
        b: "Özet kartlarını düzenle", k: "Sana lazım olan önde dursun.",
        m: ["Bir karta uzun bas.", "“Gizle” ile kaldır, “↑ Yukarı / ↓ Aşağı” ile yerini değiştir.", "“Tamam”a dokun. Gizlediğin kartları Ekranımı düzenle’den geri açarsın."],
      },
    ],
  },
  {
    id: "tarlalar", ad: "Tarlalar", ik: "🌾", ozet: "Tarla, tapudan parsel, ilaçlama, sulama, verim.",
    konular: [
      {
        b: "Tarla ekle", k: "Masrafı hangi tarlaya yazdığını bilmek için.",
        m: ["Alt çubukta “Tarlalar”a, sonra “+ Tarla ekle”ye dokun.", "Tarlanın adını yaz. Örnek: “Kınık yolu”.", "İstersen kaç dekar olduğunu ve ürününü yaz.", "“Bu tarlada hangi iş?” sorusuna cevap verirsen tarlanın masrafları o işe sayılır.", "“Kaydet”e dokun."],
        ekran: { baslik: "Yeni tarla", alanlar: [["Tarlanın adı", "Kınık yolu"], ["Kaç dekar?", "12"], ["Ürün", "Zeytin"]], dugme: "Kaydet" },
      },
      {
        b: "Tapudan parsel sorgula", k: "Dekarı elle yazmana gerek kalmaz.",
        m: ["Tarla eklerken “📄 Parsel sorgula”ya dokun.", "İlçeyi, mahalle ya da köyü seç; ada ve parsel numarasını yaz.", "“Parsel sorgula”ya dokun; tarlanın büyüklüğü tapudan gelir.", "İnternet yoksa bilgileri elle de yazabilirsin."],
        ekran: { baslik: "Parsel sorgula", alanlar: [["İlçe", "Bergama"], ["Mahalle / köy", "Yeniköy"], ["Ada no", "105"], ["Parsel no", "3"]], dugme: "Parsel sorgula" },
      },
      {
        b: "Hava durumunu bağla", k: "Tarlanın köyüne göre hava.",
        m: ["Tarla bilgilerinde “Köy / ilçe” alanına köyünün adını yaz.", "“Bul”a dokun. “✓ Hava durumu bu yere göre” yazısı çıkınca tamam.", "Hava durumu Özet’te görünür."],
      },
      {
        b: "İlaçlama yaz", k: "Hangi ilaç, ne kadar, ne zaman hasat edilebilir.",
        m: ["Tarlaya dokun, “+ İlaçlama”yı seç.", "Tarihi, hangi ilacı attığını ve dozunu yaz.", "Etiketteki hasat öncesi bekleme süresini yaz.", "“Kaydet”e dokun. Tarlada “Hasat en erken …” günü görünür."],
        ipucu: "İlacı depoya “İlaç kartı” ile eklediysen dozu ve bekleme süresi kendiliğinden gelir.",
        ekran: { baslik: "İlaçlama", alanlar: [["Hangi ilaç?", "Decis"], ["Doz", "50 ml / 100 lt"], ["Bekleme (gün)", "7"]], dugme: "Kaydet" },
      },
      {
        b: "Gübre, sulama ve diğer işler", k: "Tarla günlüğün dolsun.",
        m: ["Tarlaya dokun, “+ İşlem”i seç.", "İşi seç: gübreleme, sulama, budama, sürüm, ekim, çapa, hasat…", "Sulamada başlama-bitiş saatini ya da kaç saat sürdüğünü, istersen sayaç ve su ücretini yaz.", "Hepsi tarlanın “Tarla günlüğü”nde tarih sırasıyla durur."],
        ekran: { baslik: "Bu tarlada hangi iş?", secim: [{ ad: "Gübreleme" }, { ad: "Sulama", on: true }, { ad: "Budama" }, { ad: "Hasat" }], alanlar: [["Ya da kaç saat sürdü?", "4"]], dugme: "Kaydet" },
      },
      {
        b: "Verim yaz", k: "Bu yıl tarladan ne kadar ürün aldın.",
        m: ["Tarlaya dokun, “+ Verim”i seç.", "Ürünü ve ne kadar alındığını yaz.", "Verimi girince tarlanın başabaş fiyatı çıkar: ürünü bu fiyattan aşağı satarsan zarar edersin."],
        ekran: { baslik: "Verim", alanlar: [["Ürün", "Zeytin"], ["Ne kadar alındı?", "6.200 kg"]], kartlar: [["Başabaş fiyatı", "21,40 TL/kg"]], dugme: "Kaydet" },
      },
      {
        b: "Tarlanın hesabını gör", k: "Bu tarla kazandırıyor mu?",
        m: ["Tarlaya dokun.", "Bu sezon bu tarlaya giden masrafları, verimi ve sulamayı görürsün.", "Buradan doğrudan “+ Masraf” ya da “Fiş yükle” ile bu tarlaya kayıt ekleyebilirsin.", "Bilgileri değiştirmek için “Tarla bilgilerini değiştir”."],
      },
    ],
  },
  {
    id: "masraf", ad: "Masraf", ik: "🧾", ozet: "Masraf, veresiye, tarlalara bölme, fiş.",
    konular: [
      {
        b: "Masraf yaz", k: "Gübre, ilaç, mazot, işçilik… Ne verdiysen.",
        m: ["Özet’te “+ Masraf”a ya da Masraf’ta “+ Masraf ekle”ye dokun.", "“Ne için harcadın?” sorusunda türü seç: Tohum / fide, Gübre, İlaç, Mazot, İşçilik, Sulama / elektrik, Kira, Traktör / makine, Nakliye, Diğer.", "“Kaç TL?” yaz, tarihi ve tarlayı seç.", "İstersen not ve fişin fotoğrafını ekle, “Kaydet”e dokun."],
        ekran: { baslik: "Ne için harcadın?", secim: [{ ad: "Gübre", on: true }, { ad: "İlaç" }, { ad: "Mazot" }, { ad: "İşçilik" }], alanlar: [["Kaç TL?", "18.400"], ["Tarla", "Kınık yolu"]], dugme: "Kaydet" },
      },
      {
        b: "Veresiye aldıysan", k: "Bayiye, akaryakıtçıya borcun unutulmasın.",
        m: ["Masrafı yazarken “Veresiye”yi seç.", "“Kime borçlusun?” alanına yaz. Örnek: “Petrol Ofisi”.", "Masraf’taki “Veresiye borcun” kutusunda kime ne kadar borçlu olduğun görünür.", "Ödeyince “Ödedim”e dokun ve “Kaç TL ödedin?” yaz; kısmen de ödeyebilirsin."],
        ekran: { baslik: "Borçlu olduğun yerler", kartlar: [["Petrol Ofisi", "6.200 TL"], ["Gübre bayisi", "12.000 TL"]], dugme: "Ödedim" },
      },
      {
        b: "Bir masrafı tarlalara böl", k: "Tek fişle birkaç tarlaya gübre aldıysan.",
        m: ["Masrafta tarla seçerken “Tarlalara böl”ü seç.", "Masraf tarlaların dekarına göre paylaştırılır (dekar yazılmamışsa eşit).", "Her tarlanın hesabına kendi payı yazılır."],
      },
      {
        b: "Masrafla depoya ekle", k: "Aldığın gübre, ilaç depoya da girsin.",
        m: ["Gübre, ilaç ya da tohum masrafı yazarken malzemenin adını ve “Kaç tane / ne kadar?” yaz.", "Kaydedince hem masraf yazılır hem depoya eklenir.", "“Kaydettim: … Depoya eklendi: …” cümlesi çıkar."],
      },
      {
        b: "Ay ay ve sezona göre bak", k: "Ne kadar harcadığını gör.",
        m: ["Masraf ekranında “Ay ay” ya da “Sezon”u seç.", "“Ay seç” ile başka bir aya bak.", "Bir masrafı düzeltmek ya da silmek için üstüne dokun."],
        ekran: { baslik: "Masraf", secim: [{ ad: "Ay ay", on: true }, { ad: "Sezon" }], kartlar: [["Gübre · 3 Kas", "18.400 TL"], ["Mazot · 1 Kas", "4.250 TL"], ["İşçilik · 28 Eki", "9.000 TL"]] },
      },
      {
        b: "Kendi masraf türünü ekle", k: "Listede olmayan bir şey için.",
        m: ["Tür seçerken “+ Yeni tür”e dokun.", "“Türün adı”nı yaz. Örnek: “Köprü-otoyol”.", "Kullanmadığın türleri Ayarlar → Listeler’den kaldırabilirsin."],
      },
    ],
  },
  {
    id: "gelir", ad: "Gelir", ik: "💰", ozet: "Satış, destek, alınacak para.",
    konular: [
      {
        b: "Satış yaz", k: "Ürününü sattın.",
        m: ["Özet’te “+ Gelir”e dokun, “Hasat satışı”nı seç.", "Ürünü, miktarı ve birim fiyatını yaz; toplamı kendisi hesaplar.", "Tarlayı seçersen tarlanın başabaş fiyatı da görünür.", "İstersen “Kime sattın?” yaz. Örnek: “Tüccar Ahmet”."],
        ekran: { baslik: "Yeni gelir", alanlar: [["Ürün", "Pamuk"], ["Miktar", "4.000 kg"], ["Birim fiyat (TL)", "24"]], kartlar: [["Toplam", "96.000 TL"]], dugme: "Kaydet" },
      },
      {
        b: "Destek ve diğer gelirler", k: "Devlet desteği, kira geliri…",
        m: ["“+ Gelir”de türü seç: destek ya da diğer.", "Tutarı ve “Kimden?” yaz. Örnek: “Tarım Müdürlüğü”.", "“Kaydet”e dokun."],
      },
      {
        b: "Paranın bir kısmı sonra gelecekse", k: "Alacağını unutma.",
        m: ["Gelirin sonunda “Para alındı mı?” sorusunu cevapla: Hepsi alındı, Bir kısmı ya da Sonra alınacak.", "“Bir kısmı”nda şimdi alınan tutarı yaz.", "Kalanın ne zaman alınacağını (vade) yazarsan Özet’te ve Takvim’de hatırlatılır.", "Para gelince gelire dokun, “Alındı” olarak işaretle."],
        ekran: { baslik: "Para alındı mı?", secim: [{ ad: "Hepsi alındı" }, { ad: "Bir kısmı", on: true }, { ad: "Sonra alınacak" }], alanlar: [["Şimdi alınan (TL)", "50.000"], ["Kalanı ne zaman?", "15 Aralık"]], dugme: "Kaydet" },
      },
    ],
  },
  {
    id: "depo", ad: "Depo", ik: "📦", ozet: "Gübre, ilaç, tohum stoğu ve ilaç kartı.",
    konular: [
      {
        b: "Malzeme ekle", k: "Depoda ne var, ne kadar var.",
        m: ["Alt çubukta “Depo”ya, sonra “+ Malzeme ekle”ye dokun.", "Adını, türünü (Gübre, İlaç, Tohum, Malzeme) ve birimini (kg, litre, adet, çuval…) seç.", "Miktarı yaz, “Kaydet”e dokun."],
        ekran: { baslik: "Yeni malzeme", alanlar: [["Adı", "20-20-0 gübre"], ["Türü", "Gübre"], ["Miktar", "40 çuval"]], dugme: "Kaydet" },
      },
      {
        b: "Kullandıkça düş", k: "Stok kendiliğinden doğru kalsın.",
        m: ["Depoda malzemenin yanındaki − ve + ile miktarı değiştir.", "Azalanlar “Az kaldı”, bitenler “Bitti” diye işaretlenir.", "Az kalan malzeme Özet’te de uyarı olarak çıkar."],
        ekran: { baslik: "Depo", kartlar: [["20-20-0 gübre", "40 çuval"], ["Decis", "Az kaldı"], ["Buğday tohumu", "Bitti"]] },
      },
      {
        b: "İlaç kartı", k: "Etiketi bir kere yaz, hep hazır olsun.",
        m: ["Türü “İlaç” olan malzemede “İlaç kartı” kısmını doldur.", "Etiketteki dozu, hasat öncesi bekleme süresini, hangi zararlıya karşı olduğunu ve dikkat edilecekleri yaz.", "Tarlaya ilaçlama yazarken bu bilgiler kendiliğinden gelir."],
        ekran: { baslik: "İlaç kartı", alanlar: [["Etiketteki doz", "50 ml / 100 lt su"], ["Bekleme süresi", "7 gün"], ["Neye karşı", "Zeytin sineği"]], dugme: "Kaydet" },
      },
      { b: "Depoyu Excel’e indir", k: "Elinde liste olsun.", m: ["Depo ekranının altındaki “Excel’e indir”e dokun."] },
    ],
  },
  {
    id: "makineler", ad: "Makineler", ik: "🚜", ozet: "Bakım kaydı, motor saati, sonraki bakım.",
    konular: [
      {
        b: "Makine ekle", k: "Traktör, pulluk, ilaçlama makinesi…",
        m: ["Menü’den “Makineler”e gir.", "“Makine ekle / çıkar”a dokun, makinenin adını yaz."],
      },
      {
        b: "Bakım kaydı yaz", k: "Yağ değişimi, filtre, lastik, tamir…",
        m: ["Makineye dokun, “+ Bakım kaydı”nı seç.", "“Ne yapıldı?” sorusunda işi seç: Yağ değişimi, Yağ filtresi, Hava filtresi, Mazot filtresi, Gres yağlama, Lastik, Tamir.", "Motor saatini ve istersen tutarı yaz; tutar masraflara da eklenir.", "Sonraki bakımın gününü ya da motor saatini yazarsan zamanı gelince hatırlatılır."],
        ekran: { baslik: "Bakım kaydı", secim: [{ ad: "Yağ değişimi", on: true }, { ad: "Hava filtresi" }, { ad: "Lastik" }], alanlar: [["Motor saati", "1250"], ["Tutar, TL", "2.500"], ["Sonraki bakım", "1500 saat"]], dugme: "Kaydet" },
      },
      {
        b: "Makinenin durumuna bak", k: "Ne zaman bakıma girecek?",
        m: ["Makineye dokun: son motor saati, sonraki bakım ve toplam bakım masrafı görünür.", "Muayene ve sigorta tarihlerini “Belgeler”e yazarsın."],
      },
    ],
  },
  {
    id: "takvim", ad: "Takvim", ik: "📅", ozet: "Hatırlatma, ay ay bütün işler.",
    konular: [
      {
        b: "Hatırlatma ekle", k: "Unutmak istemediğin her şey.",
        m: ["Menü’den “Takvim”e gir, “+ Hatırlatma ekle”ye dokun.", "Hazırlardan seç (İlaçlama, Gübre, Sulama, Hasat, Kira ödemesi, Kredi taksiti, ÇKS başvurusu, Traktör muayenesi) ya da kendin yaz.", "Günü ve istersen tarlayı seç, “Kaydet”e dokun.", "Günü gelince Özet’te çıkar; yapınca “Yapıldı”ya dokun."],
        ekran: { baslik: "Ne zaman, ne yapılacak?", alanlar: [["Ne yapılacak?", "Mısıra ikinci gübre"], ["Hangi gün?", "Yarın"], ["Hangi tarla?", "Dere kenarı"]], dugme: "Kaydet" },
      },
      {
        b: "Ayı gez", k: "Bütün işler tek takvimde.",
        m: ["Takvimde tarla işleri, hasat günleri, satışlar, vadeler, belge bitişleri, makine bakımları ve hatırlatmalar görünür.", "‹ ve › ile önceki ya da sonraki aya geç.", "Bir güne dokun, o günün kayıtlarını gör.", "“Geçen yıl bu günlerde” ne yaptığını da gösterir.", "“Bütün tarlalar” yerine bir tarla seçerek sadece onu görebilirsin."],
      },
    ],
  },
  {
    id: "vadeler", ad: "Borç ve vadeler", ik: "🏦", ozet: "Kredi, kooperatif, bayi, tüccar, çek.",
    konular: [
      {
        b: "Borç ya da alacak ekle", k: "Kime borçlusun, kimden alacaklısın.",
        m: ["Menü’den “Borç ve vadeler”e gir.", "“+ Borç ekle” ya da “+ Alacak ekle”ye dokun.", "Kime borçlu olduğunu ya da kimden alacağını, tutarı ve vade gününü yaz.", "Vade yaklaşınca “Vadesi yaklaşıyor”, geçince “Vadesi geçti” yazar; Özet’te de çıkar."],
        ekran: { baslik: "Kime borçlusun?", alanlar: [["Kime borçlusun?", "Ziraat Bankası"], ["Tutar (TL)", "45.000"], ["Vade günü", "15 Ocak"], ["Not", "3. taksit"]], dugme: "Kaydet" },
      },
      {
        b: "Ödeme ya da tahsilat yaz", k: "Parça parça da olur.",
        m: ["Borca dokun, “Ödedim”i seç; alacakta “Tahsil ettim”.", "“Kaç TL?” yaz. Kalan kendiliğinden hesaplanır."],
        ekran: { baslik: "Borç ve vadeler", kartlar: [["Ziraat Bankası · 15 Oca", "45.000 TL"], ["Tüccar Ahmet · alacak", "46.000 TL"]], dugme: "Ödedim" },
      },
    ],
  },
  {
    id: "belgeler", ad: "Belgeler", ik: "📄", ozet: "ÇKS, sigorta, sözleşme bitiş tarihleri.",
    konular: [
      {
        b: "Belge ekle", k: "Bitiş tarihi olan her kâğıt.",
        m: ["Menü’den “Belgeler”e gir, “+ Belge ekle”ye dokun.", "Belgenin adını yaz: ÇKS, sigorta, kira sözleşmesi, traktör muayenesi…", "Bitiş / son tarihini ve istersen notunu (poliçe no, hangi tarla) yaz.", "Bitişe az kalınca hatırlatılır; geçince “Süresi geçti” yazar."],
        ekran: { baslik: "Yeni belge", alanlar: [["Belgenin adı", "Traktör sigortası"], ["Bitiş / son tarih", "20 Mart"], ["Not", "Poliçe 12345"]], dugme: "Kaydet" },
      },
    ],
  },
  {
    id: "fis", ad: "Fiş", ik: "📷", ozet: "Fişin fotoğrafını çek, sonra masrafa çevir.",
    konular: [
      {
        b: "Fiş yükle", k: "Tarlada vaktin yoksa fotoğrafını çek, geç.",
        m: ["Özet’te “Fiş”e ya da tarlada “Fiş yükle”ye dokun.", "Fişin fotoğrafını çek.", "İstersen tarlayı seç ve not yaz. Örnek: “Mazot, traktör için”.", "“Gönder”e dokun. Fiş kutuya kondu."],
        ekran: { baslik: "Fiş yükle", alanlar: [["Hangi tarla için?", "Genel"], ["Not", "Mazot, traktör için"]], dugme: "Gönder" },
      },
      {
        b: "Fişi masrafa çevir", k: "Akşam evde tutarını gir.",
        m: ["Masraf ekranında bekleyen fişler görünür.", "Fişe dokun, “Aç”ı seç; fotoğrafa bakarak tutarı yaz, kaydet.", "Çalışanın gönderdiği fişler sen onaylayınca masraflara eklenir."],
      },
    ],
  },
  {
    id: "rapor", ad: "Sezon raporu", ik: "📈", ozet: "Sezonun hesabı, PDF ve Excel.",
    konular: [
      {
        b: "Sezon raporunu aç", k: "Sezonun bütün hesabı tek sayfada.",
        m: ["Menü’den “Sezon raporu ve kâr”a gir.", "Gelir, masraf ve kâr / zarar en üstte; geçen yılla farkı da yazar.", "Altında masraf türleri, ay ay masraf, iş iş ve tarla tarla hesap var.", "Tarla tarla bölümünde dekar başı masraf, verim ve başabaş fiyatı görünür."],
        ekran: { baslik: "Sezon raporu", kar: ["Kâr / zarar", "184.250 TL"], kartlar: [["Kınık yolu · dekar başı", "6.300 TL"], ["Dere kenarı · başabaş", "21,40 TL/kg"]] },
      },
      {
        b: "PDF ya da Excel olarak al", k: "Bankaya, kooperatife, muhasebeciye.",
        m: ["“PDF olarak kaydet”e dokun; telefonuna kaydet ya da yazdır.", "“Excel (tüm sezon)” ile bütün kayıtları Excel dosyası olarak indir."],
      },
      {
        b: "Sezonları ayarla", k: "Sezon başı ve sonu.",
        m: ["Menü → Ayarlar → “Sezonlar”a gir.", "“İlk sezonu aç” ya da “Sonraki sezonu aç”a dokun.", "Sezonun adını, başlangıç ve bitiş gününü yaz. Örnek: “2025-26 Zeytin”.", "Gelir sezona göre, masraf hem ay ay hem sezona göre hesaplanır."],
        ekran: { baslik: "Yeni sezon", alanlar: [["Sezonun adı", "2025-26 Zeytin"], ["Başlangıç", "1 Eylül 2025"], ["Bitiş", "31 Ağustos 2026"]], dugme: "Kaydet" },
      },
    ],
  },
  {
    id: "kayitlar", ad: "Kayıtlar ve geçmiş", ik: "🔎", ozet: "Ara, düzelt, kim ne değiştirdi.",
    konular: [
      {
        b: "Bir kaydı bul ve düzelt", k: "Yanlış yazdıysan.",
        m: ["Menü’den “Kayıtlar”a gir.", "Masraf, Gelir ya da Tarla işi olarak süz; “Ara” kutusuna “mazot” gibi bir kelime yaz.", "Düzeltmek ya da silmek için kayda dokun."],
        ekran: { baslik: "Kayıtlar", secim: [{ ad: "Hepsi", on: true }, { ad: "Masraf" }, { ad: "Gelir" }], alanlar: [["Ara", "mazot"]], kartlar: [["Mazot · 1 Kas", "4.250 TL"]] },
      },
      {
        b: "Geçmiş", k: "Kim, ne zaman, ne değiştirdi.",
        m: ["Ayarlar’da ya da ekranların üstündeki “Geçmiş”e dokun.", "Aileden ya da çalışanlardan kimin ne eklediğini, neyi değiştirdiğini görürsün.", "Geçmişe bakmak için internet gerekir."],
      },
    ],
  },
  {
    id: "aile", ad: "Aile ve çalışan", ik: "👨‍👩‍👧", ozet: "Ortak defter, davet kodu, yetkiler.",
    konular: [
      {
        b: "Birini davet et", k: "Eşin, oğlun, çalışanın da yazsın.",
        m: ["Menü → Ayarlar → “Aile ve çalışanlar”a gir.", "“Birini davet et”te seç: “Aileden biri (her şeyi görür)” ya da “Çalışan (para görmez)”.", "“Davet kodu oluştur”a dokun, “WhatsApp’tan gönder” ile kodu yolla.", "O kişi kendi hesabını açıp “Davet kodum var” ile katılır."],
        ekran: { baslik: "Aile ve ortak defter", secim: [{ ad: "Aileden biri", on: true }, { ad: "Çalışan" }], kartlar: [["Davet kodu", "7F3A9C21"]], dugme: "WhatsApp’tan gönder" },
      },
      {
        b: "Kim neyi görür, neyi değiştirir", k: "Karar senin.",
        m: ["Aile ve çalışanlar ekranında kişiye dokun, “Yetkiyi değiştir”i seç.", "Her ekran için görür mü, değiştirebilir mi, sen seçersin.", "Çalışan para ekranlarını görmez; gönderdiği fişler senin onayınla masrafa girer.", "Birini defterden çıkarmak için “Çıkar”."],
      },
    ],
  },
  {
    id: "ayarlar", ad: "Ayarlar ve görünüm", ik: "⚙️", ozet: "Ekranımı düzenle, tutarları gizle, dolar, yedek.",
    konular: [
      {
        b: "Ekranımı düzenle", k: "Uygulama sana göre olsun.",
        m: ["Menü → Ayarlar → “Ekranımı düzenle”ye gir.", "Hazır görünümlerden birini seç: Tarlacı, Fidancı, Sadece para, En sade.", "Kâr kartının neyi göstereceğini seç: Sezon, Bu ay, Bu yıl, 30 gün.", "Özette görünen kartları gizle ya da yerlerini değiştir.", "Alt çubuktaki 4 yere dokun, oraya ne geleceğini seç. Beğenmezsen “Varsayılana dön”."],
        ipucu: "Sadece senin ekranın değişir; ailedeki diğer kişiler etkilenmez.",
        ekran: { baslik: "Hazır görünümler", secim: [{ ad: "Tarlacı", on: true }, { ad: "Fidancı" }, { ad: "Sadece para" }, { ad: "En sade" }] },
      },
      {
        b: "Tutarları gizle", k: "Yanında biri varken.",
        m: ["Kâr kartındaki göz düğmesine ya da Ayarlar’daki “Tutarları gizle”ye dokun.", "Para yazan her yer *** olur. Tekrar dokununca açılır."],
        ekran: { baslik: "Özet", kar: ["Sezon kârı", "*** TL"], kartlar: [["Gelir", "*** TL"], ["Masraf", "*** TL"]] },
      },
      {
        b: "Dolar ya da euro karşılığı", k: "Paranın gerçek değerini gör.",
        m: ["Ayarlar’da “Döviz karşılığı”nı Dolar ya da Euro yap.", "Her tutarın yanında, kaydın yapıldığı günün Merkez Bankası kuruyla karşılığı yazar.", "Kapatmak için “Kapalı”yı seç."],
      },
      { b: "Büyük yazı", k: "Gözün yorulmasın.", m: ["Ayarlar’da “Büyük yazı”yı aç; bütün ekranlarda yazılar büyür."] },
      {
        b: "Listeleri düzenle", k: "Sana lazım olanlar kalsın.",
        m: ["Ayarlar → “Listeler”e gir.", "Masraf türleri, tarla işleri, gelir türleri, birimler, depo türleri, makine bakım işleri gibi listeleri düzenle.", "Kullanmadığını kaldır, ihtiyacın olanı ekle."],
      },
      {
        b: "Bütün verini indir", k: "Yedeğin elinde olsun.",
        m: ["Ayarlar’da “Bütün verimi indir”e dokun.", "Excel (özet, ay ay, dolar karşılığı) ve yedek dosyası iner."],
      },
      {
        b: "İnternet yokken", k: "Tarlada çekmese de olur.",
        m: ["İnternet yokken de kayıt yazabilirsin; telefonda saklanır.", "İnternet gelince kayıtlar kendiliğinden gönderilir.", "Uygulamayı ilk açışta bir kere internet lazım. Geri alma, Geçmiş ve fiş gönderme internet ister."],
      },
    ],
  },
  {
    id: "fidan", ad: "Fidan", ik: "🌱", ozet: "Parti, sayım, maliyet, sipariş, müşteri.",
    konular: [
      {
        b: "Yeni dikim (parti) aç", k: "Her dikim ayrı bir parti.",
        m: ["Fidan ekranında “+ Yeni dikim”e dokun.", "Partinin adını yaz. Örnek: “2024 Mart dikimi”.", "Parsel / tarlayı, dikim tarihini (geçmiş tarih olabilir), kaç adet dikildiğini ve kaynağını (Çelik, Fide, Tohum, Hazır fidan) seç.", "“Kaydet”e dokun."],
        ekran: { baslik: "Yeni parti", alanlar: [["Partinin adı", "2024 Mart dikimi"], ["Dikim tarihi", "12 Mart 2024"], ["Kaç adet dikildi?", "5.000"]], secim: [{ ad: "Çelik", on: true }, { ad: "Fide" }, { ad: "Hazır fidan" }], dugme: "Kaydet" },
      },
      {
        b: "Sayım yap", k: "Kaç fidan canlı, boyları ne?",
        m: ["Partiye dokun, “+ Sayım”ı seç.", "Canlı adedi ve boy boy kaç tane olduğunu yaz.", "Stok son sayımlardan hesaplanır; satılan ve taşınan düşülür.", "Partide boy dağılımı ve sayımdan sayıma büyüme görünür."],
      },
      {
        b: "Bakım, masraf, fotoğraf", k: "Partinin günlüğü.",
        m: ["“+ Bakım / işlem” ile budama, güve kontrolü, ilaçlama, gübreleme, sulama yaz.", "“+ Masraf” ile partiye özel masraf ekle.", "“+ Fotoğraf” ile gelişim günlüğü tut.", "“Hatırlatıcılar” ile “her kaç günde bir” yapılacak işleri kur.", "Ölen ya da kaybolanları fire olarak sebebiyle yaz (kuraklık, güve, kök çürüklüğü…)."],
      },
      {
        b: "Fidan başı maliyet ve fiyat", k: "Kaça satmalıyım?",
        m: ["Partide toplam maliyet ve fidan başı maliyet görünür: partiye özel masraf, tarla masrafından payı ve genel masraftan payı.", "Kâr oranını girersen “Önerilen satış fiyatı” çıkar.", "Satarken fiyat maliyetin altındaysa uyarır."],
        ekran: { baslik: "Parti", kartlar: [["Canlı fidan", "4.620"], ["Fidan başı maliyet", "18,40 TL"], ["Önerilen satış fiyatı", "26 TL"]] },
      },
      {
        b: "Taşı / saksıya al", k: "Fidan yer değiştirdiyse.",
        m: ["Partide “Taşı / saksıya al”a dokun.", "Başka tarlaya ya da saksıya kaç tane taşındığını yaz; maliyeti de beraber taşınır."],
      },
      {
        b: "Sipariş al, teslim et", k: "Müşteri kapora verdi.",
        m: ["“+ Sipariş”e dokun; müşteri, boy, adet, fiyat ve kaporayı yaz.", "Siparişteki fidanlar stokta “Siparişte ayrılan” olarak ayrılır.", "Teslim günü “Teslim et → satış”a dokun; satış gelire yazılır.", "“Sevk listesi”ni PDF olarak kaydet ya da yazdır."],
      },
      {
        b: "Müşteriler ve alacak", k: "Kim ne kadar borçlu.",
        m: ["“Müşteriler”de her müşterinin kalan borcu görünür.", "“Ödeme al” ile tahsilat yaz.", "“Hesabı WhatsApp’tan gönder” ile müşteriye hesabını yolla."],
        ekran: { baslik: "Müşteriler", kartlar: [["Toplam alacak", "38.500 TL"], ["Ali Usta", "12.000 TL"], ["Köprü Peyzaj", "26.500 TL"]], dugme: "Ödeme al" },
      },
      { b: "Stok, fiyat listesi, Excel", k: "Elinde ne var.", m: ["“Stok”ta boylara göre satışa hazır fidanlar görünür.", "“Fiyat listesi”nde boy boy fiyatlar durur.", "“Excel’e indir” ile partiler, boy stoku ve siparişler iner."] },
    ],
  },
];

export const TELEFONA_EKLE = {
  android: ["Chrome ile siteyi aç ve giriş yap.", "Sağ üstteki üç noktaya (⋮) dokun.", "“Ana ekrana ekle” ya da “Uygulamayı yükle”ye dokun.", "“Ekle”ye dokun. Artık telefonunda simgesi var."],
  iphone: ["Safari ile siteyi aç ve giriş yap.", "Alttaki paylaş düğmesine (kare ve yukarı ok) dokun.", "Aşağı kaydır, “Ana Ekrana Ekle”ye dokun.", "Sağ üstte “Ekle”ye dokun. Artık telefonunda simgesi var."],
};

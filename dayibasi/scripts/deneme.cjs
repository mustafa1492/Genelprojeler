// Yayından önce ekran denemesi: sahte Supabase (gerçek veritabanına dokunmaz), telefon ve bilgisayar genişliğinde bütün ekranlar.
// Kullanım (dayibasi klasöründe):
//   NEXT_PUBLIC_SUPABASE_URL=https://x.supabase.co npx next build && npx next start -p 3111 &
//   node scripts/deneme.cjs                 → örnek veriyle bütün ekranlar
//   node scripts/deneme.cjs --bos           → boş defter (ilk açılış)
//   node scripts/deneme.cjs --resim <klasör> → her ekranın telefon görüntüsü
//   node scripts/deneme.cjs --akis          → kayıt akışları: masraf/gelir/tarla işi/hatırlatma/depo ekle, masraf sil + geri al, ＋ Ekle
// Bir ekranda sayfa hatası, yatay taşma, başlıksız ekran ya da "Yükleniyor"da kalma varsa sayar; sonunda "sorun: 0" beklenir.
const { chromium } = require("playwright");

const ADRES = process.env.ADRES || "http://localhost:3111";
const BOS = process.argv.includes("--bos");
const AKIS = process.argv.includes("--akis");
const yazilan = [];   // sahte sunucuya giden yazma istekleri (POST/PATCH/DELETE)
const ri = process.argv.indexOf("--resim");
const RESIM = ri > 0 ? process.argv[ri + 1] : null;
const EKRANLAR = ["", "tarlalar", "masraf", "gelir", "depo", "makineler", "takvim", "rapor", "vadeler", "kayitlar", "belgeler", "fotograflar", "fis", "gecmis", "aile", "ayarlar", "listeler", "sezonlar", "duzenle", "fidan"];

const user = { id: "11111111-1111-1111-1111-111111111111", email: "deneme@ornek.test", aud: "authenticated", role: "authenticated", app_metadata: {}, user_metadata: {} };
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const jwt = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: user.id, role: "authenticated", aud: "authenticated", exp: Math.floor(Date.now() / 1000) + 999999 })}.imza`;
const oturum = { access_token: jwt, refresh_token: "r", token_type: "bearer", expires_in: 999999, expires_at: Math.floor(Date.now() / 1000) + 999999, user };

// Uydurma örnek veri
const P = BOS ? [] : [
  { id: "p1", business_id: "b1", name: "Dere tarlası", custom: { donum: "12", urun: "Buğday" } },
  { id: "p2", business_id: "b1", name: "Yol üstü", custom: { donum: "8", urun: "Mısır (dane)" } },
];
const X = (i, d, c, a, pl, n) => ({ id: `e${i}`, business_id: "b1", occurred_on: d, category: c, amount: a, note: n || null, vendor: null, paid_amount: a, on_credit: false, charge_to: null, place_id: pl, photo_path: null, data: {} });
const MASRAF = BOS ? [] : [X(1, "2026-03-04", "Gübre", 18500, "p1", "Üre 10 çuval"), X(2, "2026-04-11", "Mazot", 9200, null), X(3, "2026-05-02", "İlaç", 42000, "p2"), X(4, "2026-06-20", "İşçilik", 16800, "p2")];
const E = (i, k, d, pl, q, data) => ({ id: `v${i}`, business_id: "b1", kind: k, occurred_on: d, place_id: pl, person_id: null, quantity: q, data });
const OLAY = BOS ? [] : [
  E(1, "gelir", "2026-07-15", "p1", 96000, { type: "Hasat satışı", crop: "Buğday", buyer: "Un fabrikası", received: 96000 }),
  E(2, "gelir", "2026-09-20", "p2", 29800, { type: "Hasat satışı", crop: "Mısır (dane)", buyer: "Yem fabrikası", received: 10000, due_on: "2026-12-15" }),
  E(3, "verim", "2026-07-10", "p1", 6200, { year: "2026", crop: "Buğday", unit: "kg" }),
  E(4, "islem", "2026-04-02", "p1", null, { type: "İlaçlama", product: "Herbisit", dose: "100 ml/da" }),
];

(async () => {
  const tarayici = await chromium.launch();
  const ctx = await tarayici.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addCookies([{ name: "sb-x-auth-token", value: `base64-${b64(oturum)}`, domain: new URL(ADRES).hostname, path: "/" }]);
  await ctx.route("**://x.supabase.co/**", (r) => {
    const u = r.request().url(); let body = "[]";
    const m = r.request().method();
    if (["POST", "PATCH", "DELETE"].includes(m) && u.includes("/rest/v1/") && !u.includes("/rpc/")) { yazilan.push(`${m} ${u.split("/rest/v1/")[1].split("?")[0]}`); return r.fulfill({ status: 201, contentType: "application/json", body: "[]" }); }
    if (u.includes("/auth/v1/user")) body = JSON.stringify(user);
    else if (u.includes("/auth/v1/token")) body = JSON.stringify(oturum);
    else if (u.includes("/memberships")) body = JSON.stringify([{ business_id: "b1", role: "sahip", businesses: { id: "b1", name: "Deneme defteri", product: "ciftci", settings: { modules: ["fidan"] } } }]);
    else if (u.includes("/places")) body = JSON.stringify(P);
    else if (u.includes("/expenses")) body = JSON.stringify(MASRAF);
    else if (u.includes("/events")) { const k = (u.match(/kind=eq\.(\w+)/) || [])[1]; body = JSON.stringify(OLAY.filter((e) => !k || e.kind === k)); }
    else if (u.includes("/rpc/")) body = "null";
    r.fulfill({ status: 200, contentType: "application/json", body });
  });
  const s = await ctx.newPage();
  let sorun = 0, simdi = "";
  s.on("pageerror", (e) => { sorun++; console.log("HATA", simdi, e.message.slice(0, 200)); });
  if (AKIS) { await akislar(s, () => sorun++, (x) => { simdi = x; }); console.log(`bitti, kayıt akışları, sorun: ${sorun}`); await tarayici.close(); process.exit(sorun ? 1 : 0); }
  for (const w of [390, 1366]) {
    await s.setViewportSize({ width: w, height: 844 });
    for (const r of EKRANLAR) {
      simdi = `${w} /ciftci/${r}`;
      await s.goto(`${ADRES}/ciftci${r ? `/${r}` : ""}`, { waitUntil: "networkidle" });
      await s.waitForTimeout(600);
      // Birden çok bölüm açıksa ilk açılışta seçim ekranı çıkar: Tarla'yı seç
      const kart = s.locator(".modul-kart").first();
      if (await kart.count()) { await kart.click(); await s.waitForTimeout(400); }
      const d = await s.evaluate(() => ({ baslik: document.querySelector("h1")?.textContent ?? "", girisEkrani: !document.querySelector(".ui-nav"), tasma: document.documentElement.scrollWidth > innerWidth + 1, yukleniyor: document.body.innerText.includes("Yükleniyor") }));
      if (d.girisEkrani) { console.log("DURDU: giriş ekranında kaldı. Derleme NEXT_PUBLIC_SUPABASE_URL=https://x.supabase.co ile yapılmalı (sahte sunucu)."); process.exit(2); }
      if (!d.baslik || d.tasma || d.yukleniyor) { sorun++; console.log("SORUN", simdi, JSON.stringify(d)); }
      if (RESIM && w === 390) await s.screenshot({ path: `${RESIM}/${r || "ozet"}${BOS ? "-bos" : ""}.png`, fullPage: true });
    }
  }
  console.log(`bitti, ${EKRANLAR.length * 2} ekran, sorun: ${sorun}`);
  await tarayici.close();
  process.exit(sorun ? 1 : 0);
})();

// ---------- Kayıt akışları: her adımda "Kaydettim/Sildim" onayı ve sunucuya giden yazma isteği beklenir ----------
async function akislar(s, hata, yer) {
  const B = `${ADRES}/ciftci`;
  const ac = async (yol) => { await s.goto(B + yol, { waitUntil: "networkidle" }); await s.waitForTimeout(600); const k = s.locator(".modul-kart").first(); if (await k.count()) { await k.click(); await s.waitForTimeout(300); } };
  const tik = (sec) => s.locator(`section:not([hidden]) ${sec}`).first().click();
  const onay = async (ad, bek, tablo) => {
    yer(ad);
    const metin = await s.locator("section:not([hidden]) .ui-done[role=status]", { hasText: bek }).first().innerText({ timeout: 5000 }).catch(() => "");
    await s.waitForTimeout(1500);   // giden kutusu sunucuya göndersin
    const gitti = !tablo || yazilan.some((y) => y.includes(tablo));
    const ok = metin.includes(bek) && gitti;
    if (!ok) hata();
    console.log(ok ? "tamam" : "SORUN", ad, "·", metin.replace(/\s+/g, " ").slice(0, 70), tablo ? `· sunucuya: ${gitti ? "gitti" : "GİTMEDİ"}` : "");
  };
  // 1. Masraf ekle
  await ac("/masraf?yeni=1"); await tik(".ui-liste-sec button:has-text('Mazot')"); await s.waitForTimeout(400);
  await s.fill("#masraf_tutar", "1250"); await tik(".ui-sticky-bottom button"); await onay("masraf ekle", "Kaydettim: Mazot", "expenses");
  // 2. Masraf sil + geri al (boş defterde silinecek kayıt yok)
  if (!BOS) {
  yazilan.length = 0;
  await ac("/masraf"); await tik(".ui-chips button:has-text('2026')").catch(() => {});
  await tik(".ui-tabs button:has-text('Sezon'), [role=tab]:has-text('Sezon')"); await s.waitForTimeout(400);
  await tik(".only-mobile .ui-moneyrow"); await s.waitForTimeout(400);
  await tik("button:has-text('Bu masrafı sil')"); await onay("masraf sil", "Sildim:", "expenses");
  await tik(".ui-done button:has-text('Geri al')"); await s.waitForTimeout(800);
  const kaldi = await s.locator("section:not([hidden]) .ui-done").count(); if (kaldi) { hata(); console.log("SORUN geri al: onay kartı kapanmadı"); } else console.log("tamam masraf geri al");
  }
  // 3. Gelir ekle
  yazilan.length = 0;
  await ac("/gelir?yeni=1"); await tik(".ui-tiles button:has-text('Hasat satışı')"); await s.waitForTimeout(400);
  await s.fill("#g_miktar", "10"); await s.fill("#g_fiyat", "100"); await tik(".ui-sticky-bottom button"); await onay("gelir ekle", "Kaydettim: Hasat satışı", "events");
  // 4. Tarla işi
  if (!BOS) {
    yazilan.length = 0;
    await ac("/tarlalar"); await tik("button.ui-card"); await s.waitForTimeout(400);
    await tik("button:has-text('+ İşlem')"); await s.waitForTimeout(300); await tik(".ui-tiles button:has-text('Sulama')"); await s.waitForTimeout(300);
    await tik(".ui-sticky-bottom button"); await onay("tarla işi", "Kaydettim:", "events");
  }
  // 5. Hatırlatma
  yazilan.length = 0;
  await ac("/takvim"); await tik("button:has-text('+ Hatırlatma ekle')"); await s.waitForTimeout(300);
  await s.fill("#h_ne", "Deneme hatırlatması"); await tik(".ui-sticky-bottom button"); await onay("hatırlatma", "Hatırlatma kuruldu", "events");
  // 6. Depo
  yazilan.length = 0;
  await ac("/depo"); await tik("button:has-text('Malzeme ekle')"); await s.waitForTimeout(300);
  await tik(".ui-chips button:has-text('Gübre')"); await tik("[aria-label='Sık kullanılanlar'] button"); await s.fill("#d_miktar", "5");
  await tik(".ui-sticky-bottom button"); await onay("depo ekle", "Depoya ekledim", "inventory_items");
  // 7. ＋ Ekle → Gelir
  await ac(""); await s.locator(".ui-nav-ekle").click(); await s.waitForTimeout(300); await s.locator(".ui-ekle button:has-text('Gelir')").click(); await s.waitForTimeout(600);
  yer("＋ Ekle"); const h = await s.locator("section:not([hidden]) h1").first().innerText().catch(() => "");
  if (h.includes("Ne geliri")) console.log("tamam ＋ Ekle → Gelir"); else { hata(); console.log("SORUN ＋ Ekle → Gelir:", h); }
}


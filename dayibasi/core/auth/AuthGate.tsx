"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { clearLocal, startSync } from "@/core/offline/store";
import { SyncBar } from "@/core/offline/SyncBar";
import { supabase } from "@/core/supabase/client";
import { Announcement } from "@/core/appConfig";
import { ErrorText, MainButton, TextField } from "@/core/ui";

/** role: üyenin bu defterdeki rolü ("sahip" | "calisan"). Çalışan para ekranlarını görmez. */
export type Business = { id: string; name: string; settings?: Record<string, unknown>; role?: string; perms?: Record<string, number> };
const BusinessCtx = createContext<Business | null>(null);
const SetBusinessCtx = createContext<(b: Business) => void>(() => {});
/** İşletme ayarı değişince ekranı güncellemek için. */
export const useSetBusiness = () => useContext(SetBusinessCtx);
/** Giriş yapılmış kişinin işletmesi. */
export const useBusiness = () => useContext(BusinessCtx)!;

type Texts = { appName: string; businessPlaceholder: string };

/** Kullanıcı adıyla giriş: "@" yoksa iç e-postaya çevrilir (gerçek e-posta gerekmez). */
export const USERNAME_DOMAIN = "kullanici.dayibasi.app";
/** Türkçe harfleri düz harfe çevirir (giriş sistemi e-postada yalnız ASCII kabul eder): "hüseyinköprü" → "huseyinkopru". */
export const asciiUser = (x: string) => x.trim().toLocaleLowerCase("tr")
  .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u").replace(/\s+/g, "");
export const toEmail = (x: string) => { const v = x.trim().toLocaleLowerCase("tr"); return v.includes("@") ? v : `${asciiUser(v)}@${USERNAME_DOMAIN}`; };

/**
 * Giriş + işletme kapısı: giriş yoksa giriş ekranı, işletme yoksa "işletmeni oluştur",
 * ikisi de varsa içeriği gösterir. Ürüne özel kelimeler `texts` ve `product` ile gelir.
 */
/** Girişsiz açılan sayfalar (şifre yenileme, aydınlatma metni). */
const PUBLIC_PATHS = ["/sifre", "/kvkk"];

export function AuthGate(props: { product: string; texts: Texts; children: React.ReactNode; otherHomes?: Record<string, string> }) {
  const path = usePathname();
  if (PUBLIC_PATHS.includes(path)) return <>{props.children}</>;
  return <Gate {...props} path={path} />;
}

/** Girişi isteyen ama işletme istemeyen sayfalar (platform yöneticisi). */
const SESSION_ONLY_PATHS = ["/yonetim"];

function Gate({ product, texts, children, path, otherHomes = {} }: { product: string; texts: Texts; children: React.ReactNode; path: string; otherHomes?: Record<string, string> }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [biz, setBiz] = useState<Business | null | undefined>(undefined);

  useEffect(() => {
    const sb = supabase();
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setBiz(session === null ? null : undefined); return; }
    const cacheKey = `ko:biz:${session.user.id}:${product}`;
    let cached: Business | null = null;
    try { cached = JSON.parse(localStorage.getItem(cacheKey) ?? "null"); } catch { /* yok */ }
    if (cached) setBiz(cached); // internetsiz açılışta da işletme bilinsin
    supabase()
      .from("memberships")
      .select("business_id, role, businesses(id, name, product, settings)")
      .then(({ data, error }) => {
        if (error) { if (!cached) setBiz(undefined); return; } // internet yok: önbellekle devam
        const rows = (data ?? []).filter((m) => m.businesses).map((m) => ({ ...(m.businesses as unknown as Business & { product: string }), role: (m as { role?: string }).role }));
        const row = rows.find((b) => b.product === product);
        // Başka ürünün hesabı: o ürünün sayfasına gönder (ör. çiftçi defteri → /ciftci)
        const other = !row && rows.find((b) => otherHomes[b.product]);
        if (other) { router.replace(otherHomes[other.product]); return; }
        const b = row ? { id: row.id, name: row.name, settings: row.settings ?? {}, role: row.role } : null;
        try { localStorage.setItem(cacheKey, JSON.stringify(b)); } catch { /* yok */ }
        setBiz(b);
        // Ekran yetkileri (0 yok, 1 görür, 2 değiştirir); veritabanı da aynı kurala göre korur
        if (b) supabase().rpc("my_perms", { bid: b.id }).then(({ data }) => {
          if (!data || typeof data !== "object" || Array.isArray(data) || !("tarlalar" in data)) return;   // beklenmeyen cevap: eski kurala göre devam
          const nb = { ...b, perms: data as Record<string, number> };
          try { localStorage.setItem(cacheKey, JSON.stringify(nb)); } catch { /* yok */ }
          setBiz(nb);
        });
      });
  }, [session, product, otherHomes, router]);

  useEffect(() => (session && biz ? startSync() : undefined), [session, biz]);

  // İşletmesi olmayan yönetici doğrudan Yönetim sayfasına
  useEffect(() => {
    if (session && biz === null && !SESSION_ONLY_PATHS.includes(path)) {
      supabase().rpc("is_platform_admin").then(({ data }) => { if (data === true) router.replace("/yonetim"); });
    }
  }, [session, biz, path, router]);

  if (session && SESSION_ONLY_PATHS.includes(path)) return <>{children}</>;
  if (session === undefined || (session && biz === undefined)) {
    return <main><div className="ui-empty">Yükleniyor… İnternet yoksa ilk açılış için bir kere internet lazım.</div></main>;
  }
  if (!session) return <Login appName={texts.appName} />;
  if (!biz) return <CreateBusiness product={product} placeholder={texts.businessPlaceholder} onDone={(b) => { try { localStorage.setItem(`ko:biz:${session.user.id}:${product}`, JSON.stringify(b)); } catch { /* yok */ } setBiz(b); }} />;
  const update = (b: Business) => {
    try { localStorage.setItem(`ko:biz:${session.user.id}:${product}`, JSON.stringify(b)); } catch { /* yok */ }
    setBiz(b);
  };
  return <BusinessCtx.Provider value={biz}><SetBusinessCtx.Provider value={update}><SyncBar /><Announcement />{children}</SetBusinessCtx.Provider></BusinessCtx.Provider>;
}

function Login({ appName }: { appName: string }) {
  const [mode, setMode] = useState<"giris" | "kayit" | "unuttum">("giris");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setInfo(""); setBusy(true);
    const sb = supabase().auth;
    if (mode === "unuttum") {
      if (!email.includes("@")) { setBusy(false); setError("Kullanıcı adıyla girenler şifreyi yöneticiden yeniletir."); return; }
      const { error } = await sb.resetPasswordForEmail(email, { redirectTo: `${location.origin}/sifre` });
      setBusy(false);
      if (error) setError(error.code === "over_email_send_rate_limit" ? "Çok sık denedin. Birkaç dakika sonra tekrar dene." : "Gönderemedim, tekrar dene.");
      else { setInfo("E-postana şifre yenileme bağlantısı gönderdim. Ona dokun, yeni şifreni yaz."); setMode("giris"); }
      return;
    }
    // Yanıt gelmezse (telefonda takılma) sayfayı yenile: oturum kaydedildiyse içeri girer.
    const stuck = setTimeout(() => location.reload(), 15000);
    const { data, error } = mode === "giris"
      ? await sb.signInWithPassword({ email: toEmail(email), password })
      : await sb.signUp({ email: toEmail(email), password });
    clearTimeout(stuck);
    setBusy(false);
    if (error) {
      const c = error.code ?? "";
      setError(
        c === "invalid_credentials" ? "Kullanıcı adı / e-posta ya da şifre yanlış." :
        c === "user_already_exists" ? "Bu e-postayla hesap var. Giriş yap." :
        c === "weak_password" ? "Şifre en az 8 harf ya da rakam olmalı." :
        c === "over_request_rate_limit" || c === "over_email_send_rate_limit" ? "Çok sık denedin. Birkaç dakika sonra tekrar dene." :
        c === "email_not_confirmed" ? "E-postana gelen bağlantıya dokun, sonra giriş yap." :
        error.status === 0 || !error.status ? "İnternet yok gibi. Bağlantını kontrol et." :
        "Olmadı, tekrar dene.",
      );
    } else if (mode === "kayit" && !data.session) {
      setInfo("E-postana bir bağlantı gönderdim. Ona dokun, sonra buradan giriş yap.");
      setMode("giris");
    }
  };

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ marginBottom: 0 }}>{appName}</h1>
      <p style={{ margin: 0, fontSize: "1.0rem" }}>{mode === "giris" ? "Hoş geldin. Giriş yap." : mode === "kayit" ? "Yeni hesap aç." : "E-postanı yaz, şifre yenileme bağlantısı göndereyim."}</p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <TextField id="email" label={mode === "giris" ? "E-posta ya da kullanıcı adı" : "E-posta"} type={mode === "giris" ? "text" : "email"} maxLength={254} autoCapitalize="none" autoCorrect="off" autoComplete="email" inputMode="email" required
          value={email} onChange={(e) => setEmail(e.target.value)} />
        {mode !== "unuttum" && (
          <TextField id="password" label={mode === "kayit" ? "Şifre (en az 8 harf ya da rakam)" : "Şifre"} type="password" required
            minLength={mode === "kayit" ? 8 : undefined} maxLength={72}
            autoComplete={mode === "giris" ? "current-password" : "new-password"}
            value={password} onChange={(e) => setPassword(e.target.value)} />
        )}
        {error && <ErrorText>{error}</ErrorText>}
        {info && <div className="ui-done"><p>{info}</p></div>}
        <MainButton type="submit" disabled={busy}>{busy ? "Bekle…" : mode === "giris" ? "Giriş yap" : mode === "kayit" ? "Hesap aç" : "Bağlantı gönder"}</MainButton>
      </form>
      {mode === "giris" && (
        <button type="button" className="ui-link" onClick={() => { setMode("unuttum"); setError(""); setInfo(""); }}>Şifremi unuttum</button>
      )}
      <button type="button" className="ui-link" onClick={() => { setMode(mode === "giris" ? "kayit" : "giris"); setError(""); }}>
        {mode === "giris" ? "Hesabın yok mu? Yeni hesap aç" : "Giriş ekranına dön"}
      </button>
      <a className="ui-link" href="/kvkk" style={{ textAlign: "center", fontSize: "0.833rem" }}>Kişisel verilerin korunması</a>
    </main>
  );
}

function CreateBusiness({ product: asked, placeholder: ph, onDone: done }: { product: string; placeholder: string; onDone: (b: Business) => void }) {
  // Dayıbaşı tarafı şimdilik kapalı (Mustafa, 3 Kasım 2026): yeni hesaplar çiftçi defteri açar.
  const product = asked === "dayibasi" ? "ciftci" : asked;
  const placeholder = asked === "dayibasi" ? "Örnek: Aile defteri" : ph;
  const onDone = (b: Business) => (asked === product ? done(b) : location.assign("/ciftci"));
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");
    const { data, error } = await supabase().rpc("create_business", { p_name: name.trim(), p_product: product });
    setBusy(false);
    if (error) setError(error.message === "isletme_siniri" ? "En çok 3 işletme açabilirsin." : error.message === "kapali" ? "Şu an yeni defter açılamıyor. Yöneticiden davet kodu iste ya da “Davet kodum var”ı kullan." : "Olmadı, tekrar dene.");
    else onDone({ id: data as string, name: name.trim() });
  };

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ marginBottom: 0 }}>{product === "ciftci" ? "Defterini oluştur" : "İşletmeni oluştur"}</h1>
      <p style={{ margin: 0, fontSize: "1.0rem" }}>Bir kere yapacaksın. Sonra hep bu adla gireceksin.</p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <TextField id="bizname" label={product === "ciftci" ? "Defterin adı" : "İşletmenin adı"} maxLength={100} placeholder={placeholder} required
          value={name} onChange={(e) => setName(e.target.value)} />
        {error && <ErrorText>{error}</ErrorText>}
        <MainButton type="submit" disabled={busy || !name.trim()}>{busy ? "Bekle…" : "Oluştur"}</MainButton>
      </form>
      <JoinWithCode />
      <button type="button" className="ui-link" onClick={() => { clearLocal(); supabase().auth.signOut(); }}>Çıkış yap</button>
    </main>
  );
}

/** Aileden biri davet kodu gönderdiyse: kodu yaz, o deftere katıl. */
function JoinWithCode() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!open) return <button type="button" className="ui-link" onClick={() => setOpen(true)}>Davet kodum var</button>;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");
    const { error } = await supabase().rpc("join_business", { p_code: code.trim(), p_name: name.trim() });
    setBusy(false);
    if (!error) { location.reload(); return; }
    const m = error.message ?? "";
    setError(m.includes("cok_deneme") ? "Çok fazla yanlış kod denendi. Bir saat sonra tekrar dene." :
      m.includes("kod_gecersiz") ? "Kod yanlış ya da süresi geçmiş. Kodu gönderen kişiden yenisini iste." :
      navigator.onLine ? "Olmadı, tekrar dene." : "İnternet lazım.");
  };
  return (
    <form onSubmit={submit} className="ui-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <b>Davet koduyla katıl</b>
      <TextField id="davet_kod" label="Davet kodu" placeholder="Örnek: 7F3A9C21" maxLength={12} autoCapitalize="characters" autoComplete="off"
        value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
      <TextField id="davet_ad" label="Adın (kayıtlarda görünür)" placeholder="Örnek: Mustafa" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      <MainButton type="submit" disabled={busy || code.trim().length < 6}>{busy ? "Bekle…" : "Katıl"}</MainButton>
    </form>
  );
}

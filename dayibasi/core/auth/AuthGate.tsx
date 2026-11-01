"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/core/supabase/client";
import { ErrorText, MainButton, TextField } from "@/core/ui";

export type Business = { id: string; name: string };
const BusinessCtx = createContext<Business | null>(null);
/** Giriş yapılmış kişinin işletmesi. */
export const useBusiness = () => useContext(BusinessCtx)!;

type Texts = { appName: string; businessPlaceholder: string };

/**
 * Giriş + işletme kapısı: giriş yoksa giriş ekranı, işletme yoksa "işletmeni oluştur",
 * ikisi de varsa içeriği gösterir. Ürüne özel kelimeler `texts` ve `product` ile gelir.
 */
/** Girişsiz açılan sayfalar (şifre yenileme, aydınlatma metni). */
const PUBLIC_PATHS = ["/sifre", "/kvkk"];

export function AuthGate(props: { product: string; texts: Texts; children: React.ReactNode }) {
  const path = usePathname();
  if (PUBLIC_PATHS.includes(path)) return <>{props.children}</>;
  return <Gate {...props} />;
}

function Gate({ product, texts, children }: { product: string; texts: Texts; children: React.ReactNode }) {
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
    supabase()
      .from("memberships")
      .select("business_id, businesses(id, name, product)")
      .then(({ data }) => {
        const row = (data ?? []).map((m) => m.businesses as unknown as Business & { product: string })
          .find((b) => b && b.product === product);
        setBiz(row ? { id: row.id, name: row.name } : null);
      });
  }, [session, product]);

  if (session === undefined || (session && biz === undefined)) return <main><p>Yükleniyor…</p></main>;
  if (!session) return <Login appName={texts.appName} />;
  if (!biz) return <CreateBusiness product={product} placeholder={texts.businessPlaceholder} onDone={setBiz} />;
  return <BusinessCtx.Provider value={biz}>{children}</BusinessCtx.Provider>;
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
      const { error } = await sb.resetPasswordForEmail(email, { redirectTo: `${location.origin}/sifre` });
      setBusy(false);
      if (error) setError(error.code === "over_email_send_rate_limit" ? "Çok sık denedin. Birkaç dakika sonra tekrar dene." : "Gönderemedim, tekrar dene.");
      else { setInfo("E-postana şifre yenileme bağlantısı gönderdim. Ona dokun, yeni şifreni yaz."); setMode("giris"); }
      return;
    }
    const { data, error } = mode === "giris"
      ? await sb.signInWithPassword({ email, password })
      : await sb.signUp({ email, password });
    setBusy(false);
    if (error) {
      const c = error.code ?? "";
      setError(
        c === "invalid_credentials" ? "E-posta ya da şifre yanlış." :
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
      <p style={{ margin: 0, fontSize: 18 }}>{mode === "giris" ? "Hoş geldin. Giriş yap." : mode === "kayit" ? "Yeni hesap aç." : "E-postanı yaz, şifre yenileme bağlantısı göndereyim."}</p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <TextField id="email" label="E-posta" type="email" maxLength={254} autoComplete="email" inputMode="email" required
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
      <a className="ui-link" href="/kvkk" style={{ textAlign: "center", fontSize: 15 }}>Kişisel verilerin korunması</a>
    </main>
  );
}

function CreateBusiness({ product, placeholder, onDone }: { product: string; placeholder: string; onDone: (b: Business) => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");
    const { data, error } = await supabase().rpc("create_business", { p_name: name.trim(), p_product: product });
    setBusy(false);
    if (error) setError(error.message === "isletme_siniri" ? "En çok 3 işletme açabilirsin." : "Olmadı, tekrar dene.");
    else onDone({ id: data as string, name: name.trim() });
  };

  return (
    <main style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ marginBottom: 0 }}>İşletmeni oluştur</h1>
      <p style={{ margin: 0, fontSize: 18 }}>Bir kere yapacaksın. Sonra hep bu adla gireceksin.</p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <TextField id="bizname" label="İşletmenin adı" maxLength={100} placeholder={placeholder} required
          value={name} onChange={(e) => setName(e.target.value)} />
        {error && <ErrorText>{error}</ErrorText>}
        <MainButton type="submit" disabled={busy || !name.trim()}>{busy ? "Bekle…" : "Oluştur"}</MainButton>
      </form>
      <button type="button" className="ui-link" onClick={() => supabase().auth.signOut()}>Çıkış yap</button>
    </main>
  );
}

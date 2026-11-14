"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/core/supabase/client";
import { DoneCard, ErrorText, MainButton, PageHeader, TextField } from "@/core/ui";

/** E-postadaki bağlantıdan gelinen yeni şifre ekranı. */
export default function Page() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [demo, setDemo] = useState(false);   // ortak deneme hesabının şifresi değişmez

  useEffect(() => {
    const sb = supabase();
    sb.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    const { data } = sb.auth.onAuthStateChange((e, s) => { if (s && (e === "PASSWORD_RECOVERY" || e === "SIGNED_IN")) setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!ready) return;
    supabase().from("memberships").select("businesses(settings)").then(({ data }) => {
      if ((data ?? []).some((m) => (m.businesses as unknown as { settings?: { demo?: boolean } } | null)?.settings?.demo === true)) setDemo(true);
    });
  }, [ready]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (demo) return;
    setBusy(true); setError("");
    const { error } = await supabase().auth.updateUser({ password });
    setBusy(false);
    if (error) setError(error.code === "weak_password" ? "Şifre en az 8 harf ya da rakam olmalı." :
      error.code === "same_password" ? "Bu zaten eski şifren. Başka bir şifre yaz." : "Olmadı. E-postadaki bağlantıya tekrar dokun.");
    else setOk(true);
  };

  return (
    <main className="ui-stack">
      <PageHeader sub="Şifre yenileme" title="Yeni şifren" />
      {demo ? (
        <div className="ui-empty">Bu ortak bir deneme hesabı; şifresi değiştirilemez.</div>
      ) : ok ? (
        <>
          <DoneCard message="Şifreni değiştirdim. Artık yeni şifrenle girebilirsin." />
          <MainButton onClick={() => (location.href = "/")}>Uygulamaya gir</MainButton>
        </>
      ) : !ready ? (
        <div className="ui-empty">Bağlantı açılıyor… Uzun sürerse e-postadaki bağlantıya tekrar dokun.</div>
      ) : (
        <form onSubmit={submit} className="ui-stack">
          <TextField id="newpass" label="Yeni şifre (en az 8 harf ya da rakam)" type="password" required minLength={8} maxLength={72}
            autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <ErrorText>{error}</ErrorText>}
          <MainButton type="submit" disabled={busy}>{busy ? "Bekle…" : "Kaydet"}</MainButton>
        </form>
      )}
    </main>
  );
}

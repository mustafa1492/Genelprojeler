"use client";
import { useEffect, useState } from "react";
import { clearLocal } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";
import { ErrorText, InfoRows, MainButton, PageHeader } from "@/core/ui";

type Row = {
  business_id: string; name: string; product: string; owner_email: string | null; created_at: string;
  isci: number; ciftci: number; kayit: number; son_islem: string | null; modules: string[] | null;
};
const MODULES = [{ id: "fidan", label: "Fidan (şimşir) modülü", product: "ciftci" }, { id: "kanatli", label: "Kümes (kanatlı) modülü", product: "ciftci" }];
const when = (iso: string | null) => iso
  ? new Date(iso).toLocaleString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" })
  : "Hiç işlem yok";

/** Platform yöneticisi: bütün işletmelerin özeti (yalnız okuma). */
export default function Page() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");

  const [msg, setMsg] = useState("");
  const load = () => {
    supabase().rpc("admin_overview").then(({ data, error }) => {
      if (error) setError(error.message === "izin_yok" ? "Bu sayfayı görme yetkin yok." : "Bilgileri getiremedim. İnterneti kontrol et.");
      else setRows(data as Row[]);
    });
  };
  useEffect(load, []);
  const toggle = async (r: Row, mod: string) => {
    const cur = r.modules ?? [];
    const next = cur.includes(mod) ? cur.filter((m) => m !== mod) : [...cur, mod];
    const { error } = await supabase().rpc("admin_set_modules", { p_business: r.business_id, p_modules: next });
    if (error) setError("Değiştiremedim."); else { setMsg(`${r.name}: ${next.includes(mod) ? "açıldı" : "kapatıldı"}.`); load(); }
  };

  const total = (k: "isci" | "ciftci" | "kayit") => (rows ?? []).reduce((t, r) => t + Number(r[k]), 0);

  return (
    <main className="ui-stack">
      <PageHeader sub="Yönetici" title="Yönetim" />
      {error && <ErrorText>{error}</ErrorText>}
      {msg && <div className="ui-done"><p>{msg}</p></div>}
      {!rows && !error && <div className="ui-empty">Yükleniyor…</div>}
      {rows && (
        <div className="ui-total">
          <span>Toplam işletme</span>
          <b>{rows.length}</b>
          <div className="ui-total-row">
            <div><span>İşçi</span><strong>{total("isci")}</strong></div>
            <div><span>Kayıt</span><strong>{total("kayit")}</strong></div>
          </div>
        </div>
      )}
      {rows?.map((r) => (
        <div key={r.business_id} className="ui-card ui-stack" style={{ gap: 10 }}>
          <div style={{ fontSize: "1.056rem", fontWeight: 800 }}>{r.name}</div>
          <InfoRows rows={[
            ["Sahibi", r.owner_email ?? "Yok"],
            ["Açıldı", when(r.created_at)],
            ["İşçi / çiftçi", `${r.isci} / ${r.ciftci}`],
            ["Kayıt", String(r.kayit)],
            ["Ürün", r.product === "ciftci" ? "Çiftçi defteri" : "Dayıbaşı"],
            ["Son işlem", when(r.son_islem)],
          ]} />
          {MODULES.filter((m) => m.product === r.product).map((m) => {
            const on = (r.modules ?? []).includes(m.id);
            return <button key={m.id} type="button" className={on ? "ui-main-btn" : "ui-main-btn ikincil"} style={{ minHeight: 52 }} onClick={() => toggle(r, m.id)}>
              {m.label}: {on ? "Açık" : "Kapalı"}</button>;
          })}
        </div>
      ))}
      <MainButton secondary onClick={async () => { clearLocal(); await supabase().auth.signOut(); location.href = "/"; }}>Çıkış yap</MainButton>
    </main>
  );
}

"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listActivity, undoActivity, type Activity } from "@/core/activity/api";
import { useBusiness } from "@/core/auth/AuthGate";
import { supabase } from "@/core/supabase/client";
import { BackButton, DoneCard, ErrorText, PageHeader } from "@/core/ui";
import { useMembers } from "@/core/auth/members";

const when = (iso: string) => {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
  const time = d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });
  return day === today ? `Bugün ${time}` : `${d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", timeZone: "Europe/Istanbul" })} ${time}`;
};

/** İşlem geçmişi: yapılan her şey, kim yaptı, her satırda "Geri al". Cümleler ürüne göre `describe` ile. */
export function HistoryScreen({ describe, onBack }: { describe: (a: Activity, names: Record<string, string>) => string; onBack?: () => void }) {
  const biz = useBusiness();
  const router = useRouter();
  const { nameOf } = useMembers(biz.id);
  const [items, setItems] = useState<Activity[] | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(() => {
    listActivity(biz.id).then(setItems).catch(() => setError(navigator.onLine ? "Geçmişi getiremedim, tekrar dene." : "Geçmişi görmek için internet lazım."));
    Promise.all([
      supabase().from("people").select("id, full_name").eq("business_id", biz.id),
      supabase().from("places").select("id, name").eq("business_id", biz.id),
    ]).then(([a, b]) => setNames({
      ...Object.fromEntries((a.data ?? []).map((p) => [p.id, p.full_name])),
      ...Object.fromEntries((b.data ?? []).map((p) => [p.id, p.name])),
    }));
  }, [biz.id]);
  useEffect(load, [load]);

  const undo = async (a: Activity) => {
    setBusy(a.id); setError(""); setDone("");
    if (!navigator.onLine) { setBusy(null); setError("Geri almak için internet lazım."); return; }
    const err = await undoActivity(a.id);
    setBusy(null);
    if (err) setError(err);
    else { setDone(`Geri aldım: ${describe(a, names)}.`); load(); }
  };

  return (
    <main className="ui-stack">
      <BackButton onClick={() => (onBack ? onBack() : router.back())} />
      <PageHeader sub="Yapılan her şey burada" title="Geçmiş" />
      <p style={{ margin: "0 4px", fontSize: "0.944rem" }}>Yanlışlıkla bir şey yaptıysan o satırdaki <b>Geri al</b>’a dokun.</p>
      {done && <DoneCard message={done} />}
      {error && <ErrorText>{error}</ErrorText>}
      {items === null && !error && <div className="ui-empty">Yükleniyor…</div>}
      {items?.length === 0 && <div className="ui-empty">Henüz bir işlem yok.</div>}
      {items?.map((a) => {
        const undone = !!a.undone_at;
        return (
          <div key={a.id} className="ui-moneyrow" style={{ background: "var(--kart)", opacity: undone ? 0.6 : 1 }}>
            <b style={{ minWidth: 0 }}>
              {a.undo_of ? "Geri alındı: " : ""}{describe(a, names)}
              <small>{when(a.created_at)}{a.user_id ? ` · ${nameOf(a.user_id)}` : ""}{undone ? " · geri alındı" : ""}</small>
            </b>
            {!undone && (
              <button type="button" className="ui-chip" disabled={busy !== null} onClick={() => undo(a)}>
                {busy === a.id ? "…" : "Geri al"}
              </button>
            )}
          </div>
        );
      })}
    </main>
  );
}

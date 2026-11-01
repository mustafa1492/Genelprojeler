"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listActivity, undoActivity, type Activity } from "@/core/activity/api";
import { useBusiness } from "@/core/auth/AuthGate";
import { supabase } from "@/core/supabase/client";
import { BackButton, DoneCard, ErrorText, PageHeader } from "@/core/ui";
import { describe } from "../activityText";

const when = (iso: string) => {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
  const time = d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });
  return day === today ? `Bugün ${time}` : `${d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", timeZone: "Europe/Istanbul" })} ${time}`;
};

/** İşlem geçmişi: yapılan her şey, her satırda "Geri al". */
export default function Gecmis() {
  const biz = useBusiness();
  const router = useRouter();
  const [items, setItems] = useState<Activity[] | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(() => {
    listActivity(biz.id).then(setItems).catch(() => setError("Geçmişi getiremedim. İnterneti kontrol et."));
    supabase().from("people").select("id, full_name").eq("business_id", biz.id)
      .then(({ data }) => setNames(Object.fromEntries((data ?? []).map((p) => [p.id, p.full_name]))));
  }, [biz.id]);
  useEffect(load, [load]);

  const undo = async (a: Activity) => {
    setBusy(a.id); setError(""); setDone("");
    const err = await undoActivity(a.id);
    setBusy(null);
    if (err) setError(err);
    else { setDone(`Geri aldım: ${describe(a, names)}.`); load(); }
  };

  return (
    <main className="ui-stack">
      <BackButton onClick={() => router.back()} />
      <PageHeader sub="Yapılan her şey burada" title="Geçmiş" />
      <p style={{ margin: "0 4px", fontSize: 17 }}>Yanlışlıkla bir şey yaptıysan o satırdaki <b>Geri al</b>’a dokun.</p>
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
              <small>{when(a.created_at)}{undone ? " · geri alındı" : ""}</small>
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

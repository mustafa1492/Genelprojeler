"use client";
// Fiş kutusu: herkes (çalışan da) fişin fotoğrafını yükler; para görebilen üye açıp masrafa çevirir.
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { useMembers } from "@/core/auth/members";
import { receiptUrl, uploadReceipt } from "@/core/expenses/api";
import { listPlaces, type Place } from "@/core/places/api";
import { useGo, useOnActivate, useBack } from "@/core/shell/TabShell";
import { supabase } from "@/core/supabase/client";
import { BackButton, Chip, DoneCard, ErrorText, MainButton, PageHeader, TextField } from "@/core/ui";
import { dayYear } from "../kayit";
import { useRole } from "../rol";

export type Inbox = { id: string; business_id: string; photo_path: string; note: string | null; place_id: string | null; status: string; created_by: string | null; created_at: string };

export async function listInbox(businessId: string) {
  const { data, error } = await supabase().from("receipt_inbox").select("*").eq("business_id", businessId).eq("status", "bekliyor").order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Inbox[];
}
export async function closeInbox(id: string, status: "islendi" | "atildi", expenseId?: string) {
  const { error } = await supabase().from("receipt_inbox").update({ status, ...(expenseId ? { expense_id: expenseId } : {}) }).eq("id", id);
  if (error) throw error;
}

/** Fiş yükleme ekranı (internet ister: fotoğraf sunucuya gider). */
export default function Fis() {
  const biz = useBusiness();
  const go = useGo();
  const back = useBack();
  const { money, writes } = useRole();
  const writesMasraf = writes("masraf");
  const { nameOf } = useMembers(biz.id);
  const [places, setPlaces] = useState<Place[]>([]);
  const [placeId, setPlaceId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [mine, setMine] = useState<Inbox[]>([]);
  const load = useCallback(() => {
    listPlaces(biz.id).then(setPlaces).catch(() => {});
    listInbox(biz.id).then(setMine).catch(() => {});
  }, [biz.id]);
  useEffect(load, [load]);
  useOnActivate(load);

  const pick = async (f: File | undefined) => {
    if (!f) return;
    if (!navigator.onLine) { setError("Fiş göndermek için internet lazım."); return; }
    setBusy(true); setError(""); setDone("");
    try { setPreview(URL.createObjectURL(f)); setPhoto(await uploadReceipt(biz.id, f)); }
    catch { setError("Fotoğrafı yükleyemedim, tekrar dene."); setPreview(null); }
    setBusy(false);
  };
  const send = async () => {
    if (!photo) { setError("Önce fişin fotoğrafını çek."); return; }
    setBusy(true);
    const { error } = await supabase().from("receipt_inbox").insert({ business_id: biz.id, photo_path: photo, note: note.trim() || null, place_id: placeId });
    setBusy(false);
    if (error) { setError("Gönderemedim, tekrar dene."); return; }
    setDone(money ? "Fiş beklemeye alındı. Masraf ekranının üstünde görünür; açıp tutarını girebilirsin." : "Fiş gönderildi. Defterin sahibi onaylayınca masraflara eklenecek.");
    setPhoto(null); setPreview(null); setNote(""); load();
  };

  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={() => back()} label="Geri" />
      <PageHeader sub="Fotoğrafını çek, gönder" title="Fiş yükle" />
      {done && <DoneCard message={done} />}
      <label className="ui-main-btn ikincil" style={{ textAlign: "center", cursor: "pointer" }}>
        {busy ? "Yükleniyor…" : photo ? "Başka fotoğraf çek" : "📷 Fişin fotoğrafını çek"}
        <input type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => pick(e.target.files?.[0])} />
      </label>
      {preview && <img src={preview} alt="Fiş" style={{ width: "100%", maxHeight: 320, objectFit: "contain", borderRadius: 14, background: "#fff" }} />}
      {places.length > 0 && (
        <div className="ui-stack" style={{ gap: 8 }}>
          <span className="ui-label">Hangi tarla için? (isteğe bağlı)</span>
          <div className="ui-chips wrap">
            <Chip selected={!placeId} onClick={() => setPlaceId(null)}>Genel</Chip>
            {places.map((p) => <Chip key={p.id} selected={placeId === p.id} onClick={() => setPlaceId(p.id)}>{p.name}</Chip>)}
          </div>
        </div>
      )}
      <TextField id="fis_not" label="Not (isteğe bağlı)" placeholder="Örnek: Mazot, traktör için" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      {writesMasraf ? (
        <>
          <div className="ui-sticky-bottom"><MainButton disabled={!photo || busy} onClick={() => {
            const p: Record<string, string> = { fis: photo!, ...(note.trim() ? { not: note.trim() } : {}), ...(placeId ? { tarla: placeId } : {}) };
            setPhoto(null); setPreview(null); setNote(""); go("masraf", p);
          }}>Devam: tutarını gir</MainButton></div>
          {photo && <button type="button" className="ui-link" disabled={busy} onClick={send}>Tutarı sonra gireceğim (fişi beklemeye al)</button>}
        </>
      ) : <div className="ui-sticky-bottom"><MainButton disabled={!photo || busy} onClick={send}>Gönder</MainButton></div>}
      {mine.length > 0 && (
        <>
          <h2 className="ui-section">{money ? "Tutarı girilecek fişler" : "Gönderdiğin, bekleyen fişler"}</h2>
          {mine.map((x) => <div key={x.id} className="ui-moneyrow"><b>{x.note || "Fiş"}<small>{[dayYear(x.created_at.slice(0, 10)), places.find((p) => p.id === x.place_id)?.name, nameOf(x.created_by)].filter(Boolean).join(" · ")}</small></b><span>bekliyor</span></div>)}
          {money && <button type="button" className="ui-link" onClick={() => go("masraf", { fisler: 1 })}>Masraf sekmesinde aç ›</button>}
        </>
      )}
    </main>
  );
}

/** Masraf ekranının üstünde: onay bekleyen fişler. Dokununca masraf formu fotoğrafla açılır. */
export function InboxCard({ onOpen }: { onOpen: (x: Inbox, url: string | null) => void }) {
  const biz = useBusiness();
  const { nameOf } = useMembers(biz.id);
  const [rows, setRows] = useState<Inbox[]>([]);
  const load = useCallback(() => { listInbox(biz.id).then(setRows).catch(() => {}); }, [biz.id]);
  useEffect(load, [load]);
  useOnActivate(load);
  if (!rows.length) return null;
  return (
    <div className="ui-card fis-kutu">
      <div className="ui-stack" style={{ gap: 8 }}>
        <b>📷 Tutarı girilecek fiş ({rows.length})</b>
        {rows.map((x) => (
          <div key={x.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ flex: 1, minWidth: 0 }}>{x.note || "Fiş"} · {nameOf(x.created_by)} · {dayYear(x.created_at.slice(0, 10))}</span>
            <button type="button" className="ui-chip" onClick={async () => onOpen(x, await receiptUrl(x.photo_path))}>Tutarı gir</button>
            <button type="button" className="ui-chip" onClick={async () => { await closeInbox(x.id, "atildi"); load(); }}>Sil</button>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useGo } from "@/core/shell/TabShell";
import { BackButton, DoneCard, ErrorText, MainButton, PageHeader, TextField } from "@/core/ui";
import { dayYear, thisYear } from "../kayit";
import { useSeason, type Season } from "../sezon";

const nextYear = (d: string, n = 1) => `${Number(d.slice(0, 4)) + n}${d.slice(4)}`;

/** Sezonları aç / düzenle / sil. "Sonraki sezonu aç" son sezonun bir yıl sonrasını hazırlar. */
export default function Sezonlar() {
  const go = useGo();
  const { seasons, real, save, select } = useSeason();
  const list = real ? seasons : [];
  const [form, setForm] = useState<Season | null>(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const commit = async (next: Season[], m: string) => {
    setError("");
    try { await save(next); setMsg(m); setForm(null); } catch { setError(navigator.onLine ? "Kaydedemedim, tekrar dene." : "Sezon kaydetmek için internet lazım."); }
  };

  if (form) {
    const isNew = !list.some((s) => s.id === form.id);
    return (
      <main className="ui-stack">
        <BackButton onClick={() => setForm(null)} label="Vazgeç" />
        <PageHeader sub="Sezon" title={isNew ? "Yeni sezon" : "Sezonu düzenle"} />
        <TextField id="s_ad" label="Sezonun adı" placeholder="Örnek: 2025-26 Zeytin" maxLength={30} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <TextField id="s_bas" label="Başlangıç" type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
        <TextField id="s_bit" label="Bitiş" type="date" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
        <p className="ui-note">Bu tarihler arasındaki masraf, gelir ve işler bu sezona sayılır. Çok yıllık işlerde (ör. şimşir) bitişi birkaç yıl sonraya koyabilirsin.</p>
        {error && <ErrorText>{error}</ErrorText>}
        <MainButton onClick={() => {
          if (!form.name.trim() || !form.start || !form.end) { setError("Adı, başlangıcı ve bitişi gir."); return; }
          if (form.end < form.start) { setError("Bitiş başlangıçtan önce olamaz."); return; }
          const f = { ...form, name: form.name.trim() };
          commit(isNew ? [...list, f] : list.map((s) => (s.id === f.id ? f : s)), isNew ? `“${f.name}” sezonu açıldı.` : `Değiştirdim: ${f.name}.`).then(() => select(f.id));
        }}>Kaydet</MainButton>
        {!isNew && <MainButton className="tehlike" onClick={() => commit(list.filter((s) => s.id !== form.id), `“${form.name}” sezonu silindi (kayıtlar silinmedi).`)}>Sezonu sil</MainButton>}
      </main>
    );
  }

  const last = list.slice().sort((a, b) => b.end.localeCompare(a.end))[0];
  const y = Number(thisYear());
  return (
    <main className="ui-stack">
      <BackButton onClick={() => go("ozet")} label="Özet" />
      <PageHeader sub="Gelir sezona göre, masraf hem ay ay hem sezona göre" title="Sezonlar" />
      {msg && <DoneCard message={msg} />}
      {list.length === 0 && <div className="ui-empty">Henüz sezon açılmadı; şimdilik takvim yılı kullanılıyor. İlk sezonunu aç.</div>}
      {list.map((s) => (
        <button key={s.id} type="button" className="ui-card" onClick={() => { setMsg(""); setForm(s); }}
          style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <b>{s.name}</b><span className="ui-note" style={{ margin: 0 }}>{dayYear(s.start)} – {dayYear(s.end)}</span>
        </button>
      ))}
      {last
        ? <MainButton onClick={() => { setMsg(""); setForm({ id: crypto.randomUUID(), name: last.name.replace(/\d{4}/g, (m) => String(Number(m) + 1)).replace(/-(\d{2})\b/, (_, a) => `-${String((Number(a) + 1) % 100).padStart(2, "0")}`), start: nextYear(last.start), end: nextYear(last.end) }); }}>Sonraki sezonu aç</MainButton>
        : <MainButton onClick={() => { setMsg(""); setForm({ id: crypto.randomUUID(), name: `${y - 1}-${String(y % 100).padStart(2, "0")}`, start: `${y - 1}-09-01`, end: `${y}-08-31` }); }}>İlk sezonu aç</MainButton>}
      <MainButton secondary onClick={() => { setMsg(""); setForm({ id: crypto.randomUUID(), name: "", start: `${y}-01-01`, end: `${y}-12-31` }); }}>Boş sezon aç</MainButton>
    </main>
  );
}

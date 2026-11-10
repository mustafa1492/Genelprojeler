"use client";
import { useState } from "react";
import { useBusiness, useSetBusiness, type Business } from "@/core/auth/AuthGate";
import { supabase } from "@/core/supabase/client";
import { BackButton, DoneCard, ErrorText, MainButton, PageHeader, Pick, TextField } from "@/core/ui";

/**
 * Düzenlenebilir seçim listeleri (masraf türleri, işlem türleri, birimler…).
 * Hazır gelenler gizlenebilir, yenileri eklenebilir. businesses.settings.lists[key] = {added, hidden}.
 * Bir maddeyi kaldırmak eski kayıtları silmez; yalnız seçim listesinden çıkar.
 */
type ListSetting = { added?: string[]; hidden?: string[]; order?: string[] };

/** Hazırlar − kaldırılanlar + eklenenler; kullanıcı sıraladıysa onun sırasıyla. */
function compose(defaults: readonly string[], added: string[], hiddenList: string[], order?: string[]): string[] {
  const hidden = new Set(hiddenList);
  const base = defaults.filter((d) => !hidden.has(d));
  // Sıralanmadıysa "Diğer" hep sonda kalsın
  const all = [...base.filter((d) => d !== "Diğer"), ...added.filter((a) => !defaults.includes(a) && !hidden.has(a)), ...base.filter((d) => d === "Diğer")];
  if (!order?.length) return all;
  const pos = (x: string) => { const k = order.indexOf(x); return k < 0 ? order.length + all.indexOf(x) : k; };
  return all.slice().sort((a, b) => pos(a) - pos(b));
}

export function resolveList(b: Business, key: string, defaults: readonly string[], legacyAdded: string[] = []): string[] {
  const ls = ((b.settings?.lists as Record<string, ListSetting> | undefined) ?? {})[key] ?? {};
  const added = [...legacyAdded, ...(ls.added ?? [])].filter((x, i, a) => a.indexOf(x) === i);
  return compose(defaults, added, ls.hidden ?? [], ls.order);
}

export function useList(key: string, defaults: readonly string[], legacyAdded: string[] = []) {
  const biz = useBusiness();
  return resolveList(biz, key, defaults, legacyAdded);
}

/** Bir listeyi düzenleme ekranı: ekle, kaldır, sırala; her değişiklik geri alınabilir. */
export function ListEditor({ title, listKey, defaults, legacyAdded = [], legacyKey, onDone }: {
  title: string; listKey: string; defaults: readonly string[]; legacyAdded?: string[]; legacyKey?: string; onDone: () => void;
}) {
  const biz = useBusiness();
  const setBiz = useSetBusiness();
  const cur = ((biz.settings?.lists as Record<string, ListSetting> | undefined) ?? {})[listKey] ?? {};
  type St = { added: string[]; hidden: string[]; order?: string[] };
  const [st, setSt] = useState<St>({ added: [...legacyAdded, ...(cur.added ?? [])].filter((x, i, a) => a.indexOf(x) === i && !defaults.includes(x)), hidden: cur.hidden ?? [], order: cur.order });
  const [nw, setNw] = useState("");
  const [done, setDone] = useState<{ message: string; prev: St } | null>(null);
  const [error, setError] = useState("");
  const visible = compose(defaults, st.added, st.hidden, st.order);

  // Her değişiklik hemen kaydedilir (ayrı "Kaydet" düğmesi unutuluyordu).
  const persist = async (next: St, message: string | null) => {
    const prev = st;
    setSt(next); setError("");
    const lists = { ...((biz.settings?.lists as Record<string, ListSetting>) ?? {}), [listKey]: { added: next.added, hidden: next.hidden, ...(next.order?.length ? { order: next.order } : {}) } };
    const settings = { ...biz.settings, lists, ...(legacyKey ? { [legacyKey]: [] } : {}) };   // eski ayar listeye taşındı
    const { error } = await supabase().from("businesses").update({ settings }).eq("id", biz.id);
    if (error) { setSt(prev); setDone(null); setError(navigator.onLine ? "Kaydedemedim, tekrar dene." : "Listeyi değiştirmek için internet lazım."); return; }
    setBiz({ ...biz, settings });
    setDone(message ? { message, prev } : null);
  };
  const hide = (x: string) => persist({ ...st, hidden: [...st.hidden, x] }, `“${x}” listeden kaldırıldı.`);
  const unhide = (x: string) => persist({ ...st, hidden: st.hidden.filter((h) => h !== x) }, `“${x}” geri getirildi.`);
  const removeAdded = (x: string) => persist({ ...st, added: st.added.filter((a) => a !== x), order: st.order?.filter((o) => o !== x) }, `“${x}” silindi.`);
  const move = (x: string, d: -1 | 1) => {
    const o = visible.slice(); const a = o.indexOf(x), b = a + d;
    if (b < 0 || b >= o.length) return;
    [o[a], o[b]] = [o[b], o[a]];
    persist({ ...st, order: o }, `“${x}” ${d < 0 ? "yukarı" : "aşağı"} alındı.`);
  };
  const add = () => {
    const v = nw.trim(); if (!v) return;
    setNw("");
    if (visible.some((x) => x.toLocaleLowerCase("tr") === v.toLocaleLowerCase("tr"))) { setError(`“${v}” zaten listede.`); return; }
    if (defaults.includes(v)) { unhide(v); return; }
    persist({ ...st, added: [...st.added, v], ...(st.order?.length ? { order: [...visible, v] } : {}) }, `“${v}” eklendi.`);
  };
  const hiddenDefaults = defaults.filter((d) => st.hidden.includes(d));

  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onDone} label="Geri" />
      <PageHeader sub="Düzenleme" title={title} />
      {done && <DoneCard message={done.message} onUndo={async () => { const p = done.prev; await persist(p, null); }} />}
      <p className="ui-note">Sırayı ↑ ↓ ile değiştir; kullanmadığını kaldır, ihtiyacın olanı ekle. Kaldırmak eski kayıtları silmez. Değişiklikler hemen kaydedilir.</p>
      <div className="ui-quickadd">
        <TextField id={`liste_${listKey}`} label="Yeni ekle" maxLength={40} value={nw} onChange={(e) => setNw(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} />
        <button type="button" disabled={!nw.trim()} onClick={add}>Ekle</button>
      </div>
      {error && <ErrorText>{error}</ErrorText>}
      {visible.length === 0 && <div className="ui-empty">Liste boş. Yukarıdan ekle.</div>}
      {visible.map((x, k) => (
        <div key={x} className="ui-moneyrow liste-satir">
          <b>{x}<small>{defaults.includes(x) ? "Hazır" : "Senin eklediğin"}</small></b>
          <span className="mn-sira">
            <button type="button" aria-label={`${x}: yukarı`} disabled={k === 0} onClick={() => move(x, -1)}>↑</button>
            <button type="button" aria-label={`${x}: aşağı`} disabled={k === visible.length - 1} onClick={() => move(x, 1)}>↓</button>
          </span>
          <button type="button" className="ui-chip" onClick={() => (defaults.includes(x) ? hide(x) : removeAdded(x))}>{defaults.includes(x) ? "Kaldır" : "Sil"}</button>
        </div>
      ))}
      {hiddenDefaults.length > 0 && <h2 className="ui-section">Kaldırdıkların</h2>}
      {hiddenDefaults.map((d) => (
        <div key={d} className="ui-moneyrow" style={{ opacity: 0.6 }}>
          <b>{d}<small>Kaldırıldı</small></b>
          <button type="button" className="ui-chip" onClick={() => unhide(d)}>Geri getir</button>
        </div>
      ))}
      <div className="ui-sticky-bottom"><MainButton onClick={onDone}>Bitti</MainButton></div>
    </main>
  );
}

/** Listeye tek madde ekler (ör. masraf ekranında yeni iş). İnternet ister. */
export function useAddToList(key: string) {
  const biz = useBusiness();
  const setBiz = useSetBusiness();
  return async (name: string) => {
    const all = (biz.settings?.lists as Record<string, ListSetting> | undefined) ?? {};
    const cur = all[key] ?? {};
    const lists = { ...all, [key]: { ...cur, added: [...(cur.added ?? []).filter((x) => x !== name), name], hidden: (cur.hidden ?? []).filter((x) => x !== name) } };
    const settings = { ...biz.settings, lists };
    const { error } = await supabase().from("businesses").update({ settings }).eq("id", biz.id);
    if (error) throw error;
    setBiz({ ...biz, settings });
  };
}

/** Çip seçimi + "+ Yeni" ile yerinde ekleme. */
export function PickWithAdd({ label, items, value, onChange, noneLabel, onAdd, addLabel = "+ Yeni ekle", placeholder }: {
  label: string; items: readonly string[]; value: string | null; onChange: (v: string | null) => void; noneLabel: string;
  onAdd: (name: string) => Promise<void>; addLabel?: string; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [nw, setNw] = useState("");
  const [error, setError] = useState("");
  const add = async () => {
    const n = nw.trim(); if (!n) return;
    const same = items.find((x) => x.toLocaleLowerCase("tr") === n.toLocaleLowerCase("tr"));
    if (same) { onChange(same); setOpen(false); setNw(""); return; }
    try { await onAdd(n); onChange(n); setOpen(false); setNw(""); setError(""); }
    catch { setError(navigator.onLine ? "Ekleyemedim, tekrar dene." : "Yeni eklemek için internet lazım."); }
  };
  return (
    <div className="ui-stack" style={{ gap: 8 }}>
      <Pick label={label} value={value} onChange={onChange} options={[{ value: null, label: noneLabel }, ...items.map((b) => ({ value: b, label: b }))]}
        footer={() => (!open ? <button type="button" className="ekle" onClick={() => setOpen(true)}><span>{addLabel}</span></button> : null)} />
      {open && (
        <div className="ui-quickadd">
          <TextField id={`yeni_${label.length}`} label="Adı" placeholder={placeholder} maxLength={40} autoFocus value={nw} onChange={(e) => setNw(e.target.value)} />
          <button type="button" disabled={!nw.trim()} onClick={add}>Ekle</button>
        </div>
      )}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

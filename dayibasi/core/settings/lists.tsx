"use client";
import { useState } from "react";
import { useBusiness, useSetBusiness, type Business } from "@/core/auth/AuthGate";
import { supabase } from "@/core/supabase/client";
import { BackButton, Chip, DoneCard, ErrorText, MainButton, PageHeader, TextField } from "@/core/ui";

/**
 * Düzenlenebilir seçim listeleri (masraf türleri, işlem türleri, birimler…).
 * Hazır gelenler gizlenebilir, yenileri eklenebilir. businesses.settings.lists[key] = {added, hidden}.
 * Bir maddeyi kaldırmak eski kayıtları silmez; yalnız seçim listesinden çıkar.
 */
type ListSetting = { added?: string[]; hidden?: string[] };

export function resolveList(b: Business, key: string, defaults: readonly string[], legacyAdded: string[] = []): string[] {
  const ls = ((b.settings?.lists as Record<string, ListSetting> | undefined) ?? {})[key] ?? {};
  const hidden = new Set(ls.hidden ?? []);
  const added = [...legacyAdded, ...(ls.added ?? [])].filter((x, i, a) => a.indexOf(x) === i);
  const base = defaults.filter((d) => !hidden.has(d));
  // "Diğer" hep sonda kalsın
  const all = [...base.filter((d) => d !== "Diğer"), ...added.filter((a) => !defaults.includes(a) && !hidden.has(a)), ...base.filter((d) => d === "Diğer")];
  return all;
}

export function useList(key: string, defaults: readonly string[], legacyAdded: string[] = []) {
  const biz = useBusiness();
  return resolveList(biz, key, defaults, legacyAdded);
}

/** Bir listeyi düzenleme ekranı. */
export function ListEditor({ title, listKey, defaults, legacyAdded = [], legacyKey, onDone }: {
  title: string; listKey: string; defaults: readonly string[]; legacyAdded?: string[]; legacyKey?: string; onDone: () => void;
}) {
  const biz = useBusiness();
  const setBiz = useSetBusiness();
  const cur = ((biz.settings?.lists as Record<string, ListSetting> | undefined) ?? {})[listKey] ?? {};
  const [added, setAdded] = useState<string[]>([...legacyAdded, ...(cur.added ?? [])].filter((x, i, a) => a.indexOf(x) === i && !defaults.includes(x)));
  const [hidden, setHidden] = useState<string[]>(cur.hidden ?? []);
  const [nw, setNw] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // Her değişiklik hemen kaydedilir (ayrı "Kaydet" düğmesi unutuluyordu).
  const persist = async (ad: string[], hi: string[]) => {
    const pa = added, ph = hidden;
    setAdded(ad); setHidden(hi); setError(""); setMsg("");
    const lists = { ...((biz.settings?.lists as Record<string, ListSetting>) ?? {}), [listKey]: { added: ad, hidden: hi } };
    const settings = { ...biz.settings, lists, ...(legacyKey ? { [legacyKey]: [] } : {}) };   // eski ayar listeye taşındı
    const { error } = await supabase().from("businesses").update({ settings }).eq("id", biz.id);
    if (error) { setAdded(pa); setHidden(ph); setError(navigator.onLine ? "Kaydedemedim, tekrar dene." : "Listeyi değiştirmek için internet lazım."); return; }
    setBiz({ ...biz, settings });
    setMsg("Kaydedildi.");
  };
  const toggle = (x: string) => persist(added, hidden.includes(x) ? hidden.filter((h) => h !== x) : [...hidden, x]);

  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onDone} label="Geri" />
      <PageHeader sub="Düzenleme" title={title} />
      <p className="ui-note">Kullanmadığını kaldır, ihtiyacın olanı ekle. Kaldırmak eski kayıtları silmez; sadece seçerken çıkmaz. Değişiklikler hemen kaydedilir.</p>
      {defaults.map((d) => (
        <div key={d} className="ui-moneyrow" style={{ opacity: hidden.includes(d) ? 0.5 : 1 }}>
          <b>{d}<small>{hidden.includes(d) ? "Kaldırıldı" : "Hazır"}</small></b>
          <button type="button" className="ui-chip" onClick={() => toggle(d)}>{hidden.includes(d) ? "Geri getir" : "Kaldır"}</button>
        </div>
      ))}
      {added.map((a) => (
        <div key={a} className="ui-moneyrow">
          <b>{a}<small>Senin eklediğin</small></b>
          <button type="button" className="ui-chip" onClick={() => persist(added.filter((x) => x !== a), hidden)}>Kaldır</button>
        </div>
      ))}
      <div className="ui-quickadd">
        <TextField id={`liste_${listKey}`} label="Yeni ekle" maxLength={40} value={nw} onChange={(e) => setNw(e.target.value)} />
        <button type="button" disabled={!nw.trim()} onClick={() => {
          const v = nw.trim();
          if (defaults.includes(v)) persist(added, hidden.filter((h) => h !== v));
          else if (!added.includes(v)) persist([...added, v], hidden);
          setNw("");
        }}>Ekle</button>
      </div>
      {msg && <p className="ui-note" style={{ margin: 0 }}>✓ {msg}</p>}
      {error && <ErrorText>{error}</ErrorText>}
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
    const lists = { ...all, [key]: { added: [...(cur.added ?? []).filter((x) => x !== name), name], hidden: (cur.hidden ?? []).filter((x) => x !== name) } };
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
      <span className="ui-label">{label}</span>
      <div className="ui-chips wrap">
        <Chip selected={!value} onClick={() => onChange(null)}>{noneLabel}</Chip>
        {items.map((b) => <Chip key={b} selected={value === b} onClick={() => onChange(b)}>{b}</Chip>)}
        {!open && <Chip onClick={() => setOpen(true)}>{addLabel}</Chip>}
      </div>
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

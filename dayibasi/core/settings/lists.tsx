"use client";
import { useState } from "react";
import { useBusiness, useSetBusiness, type Business } from "@/core/auth/AuthGate";
import { supabase } from "@/core/supabase/client";
import { BackButton, DoneCard, ErrorText, MainButton, PageHeader, TextField } from "@/core/ui";

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

  const save = async () => {
    setError("");
    const lists = { ...((biz.settings?.lists as Record<string, ListSetting>) ?? {}), [listKey]: { added, hidden } };
    const settings = { ...biz.settings, lists, ...(legacyKey ? { [legacyKey]: [] } : {}) };   // eski ayar listeye taşındı
    const { error } = await supabase().from("businesses").update({ settings }).eq("id", biz.id);
    if (error) { setError(navigator.onLine ? "Kaydedemedim, tekrar dene." : "Listeyi kaydetmek için internet lazım."); return; }
    setBiz({ ...biz, settings });
    setMsg("Kaydedildi.");
    onDone();
  };
  const toggle = (x: string) => setHidden(hidden.includes(x) ? hidden.filter((h) => h !== x) : [...hidden, x]);

  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onDone} label="Vazgeç" />
      <PageHeader sub="Düzenleme" title={title} />
      {msg && <DoneCard message={msg} />}
      <p className="ui-note">Kullanmadığını kaldır, ihtiyacın olanı ekle. Kaldırmak eski kayıtları silmez; sadece seçerken çıkmaz.</p>
      {defaults.map((d) => (
        <div key={d} className="ui-moneyrow" style={{ opacity: hidden.includes(d) ? 0.5 : 1 }}>
          <b>{d}<small>{hidden.includes(d) ? "Kaldırıldı" : "Hazır"}</small></b>
          <button type="button" className="ui-chip" onClick={() => toggle(d)}>{hidden.includes(d) ? "Geri getir" : "Kaldır"}</button>
        </div>
      ))}
      {added.map((a) => (
        <div key={a} className="ui-moneyrow">
          <b>{a}<small>Senin eklediğin</small></b>
          <button type="button" className="ui-chip" onClick={() => setAdded(added.filter((x) => x !== a))}>Kaldır</button>
        </div>
      ))}
      <div className="ui-quickadd">
        <TextField id={`liste_${listKey}`} label="Yeni ekle" maxLength={40} value={nw} onChange={(e) => setNw(e.target.value)} />
        <button type="button" disabled={!nw.trim()} onClick={() => {
          const v = nw.trim();
          if (defaults.includes(v)) setHidden(hidden.filter((h) => h !== v));
          else if (!added.includes(v)) setAdded([...added, v]);
          setNw("");
        }}>Ekle</button>
      </div>
      {error && <ErrorText>{error}</ErrorText>}
      <div className="ui-sticky-bottom"><MainButton onClick={save}>Kaydet</MainButton></div>
    </main>
  );
}

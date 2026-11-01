"use client";
import { useState } from "react";
import { Chip, ErrorText, MainButton, PageHeader, TextField } from "@/core/ui";
import type { Person, PersonInput } from "./api";

export type CustomField = { key: string; label: string; type: string; required?: boolean };

/** Kişi ekleme / düzenleme. Etiketler dokunarak seçilir; yazı yalnızca ad, telefon ve özel alanlarda. */
export function PersonForm({ kindLabel, tags, customFields, person, onSave, onCancel, onRemove, onForget, groups, groupKey = "grup" }: {
  kindLabel: string;
  tags: readonly string[];
  customFields: readonly CustomField[];
  person?: Person;
  onSave: (p: PersonInput) => Promise<void>;
  onCancel: () => void;
  onRemove?: () => void;
  onForget?: () => Promise<void>;
  /** Var olan gruplar; verilirse "Grubu" seçimi çıkar (custom[groupKey]). */
  groups?: string[];
  groupKey?: string;
}) {
  const [name, setName] = useState(person?.full_name ?? "");
  const [phone, setPhone] = useState(person?.phone ?? "");
  const [picked, setPicked] = useState<string[]>(person?.tags ?? []);
  const [custom, setCustom] = useState<Record<string, string>>(person?.custom ?? {});
  const [newGroup, setNewGroup] = useState(false);
  const [notes, setNotes] = useState(person?.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [forgetAsk, setForgetAsk] = useState(false);
  const [error, setError] = useState("");

  const toggle = (t: string) => setPicked(picked.includes(t) ? picked.filter((x) => x !== t) : [...picked, t]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await onSave({ full_name: name.trim(), phone: phone.replace(/\s+/g, "") || null, tags: picked, custom, notes: notes.trim() || null });
    } catch {
      setError("Kaydedemedim. İnterneti kontrol edip tekrar dene.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="ui-stack">
      <PageHeader sub={person ? "Bilgilerini değiştir" : `Yeni ${kindLabel.toLocaleLowerCase("tr")}`} title={person ? person.full_name : `${kindLabel} ekle`} />
      <TextField id="full_name" label="Adı soyadı" required maxLength={100} autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} />
      <TextField id="phone" label="Telefonu (WhatsApp için)" maxLength={20} type="tel" inputMode="tel" placeholder="05xx xxx xx xx"
        value={phone} onChange={(e) => setPhone(e.target.value)} />
      {customFields.map((f) => (
        <TextField key={f.key} id={`custom_${f.key}`} label={f.label} maxLength={100} value={custom[f.key] ?? ""}
          type={f.type === "date" ? "date" : "text"} required={f.required} max={f.type === "date" ? new Date().toISOString().slice(0, 10) : undefined}
          onChange={(e) => setCustom({ ...custom, [f.key]: e.target.value })} />
      ))}
      {groups && (
        <div className="ui-stack" style={{ gap: 8 }}>
          <span style={{ fontSize: "0.944rem", fontWeight: 700 }}>Grubu</span>
          <div className="ui-chips wrap">
            {groups.map((g) => (
              <Chip key={g} selected={custom[groupKey] === g}
                onClick={() => { setNewGroup(false); setCustom({ ...custom, [groupKey]: custom[groupKey] === g ? "" : g }); }}>{g}</Chip>
            ))}
            <Chip selected={newGroup} onClick={() => { setNewGroup(true); setCustom({ ...custom, [groupKey]: "" }); }}>+ Yeni grup</Chip>
          </div>
          {newGroup && (
            <TextField id="new_group" label="Grubun adı" placeholder="Örnek: Kınık ekibi" maxLength={40} autoFocus
              value={custom[groupKey] ?? ""} onChange={(e) => setCustom({ ...custom, [groupKey]: e.target.value })} />
          )}
        </div>
      )}
      {tags.length > 0 && <div className="ui-stack" style={{ gap: 8 }}>
        <span style={{ fontSize: "0.944rem", fontWeight: 700 }}>Hangi işleri yapar?</span>
        <div className="ui-chips wrap">
          {tags.map((t) => <Chip key={t} selected={picked.includes(t)} onClick={() => toggle(t)}>{t}</Chip>)}
        </div>
      </div>}
      <TextField id="notes" label="Not (isteğe bağlı)" maxLength={500} placeholder="Örnek: Sabah erken gelemez"
        value={notes} onChange={(e) => setNotes(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      <MainButton type="submit" disabled={busy || !name.trim()}>{busy ? "Kaydediyorum…" : "Kaydet"}</MainButton>
      <MainButton secondary onClick={onCancel}>Vazgeç</MainButton>
      {onRemove && <MainButton className="tehlike" onClick={onRemove}>Ekipten çıkar</MainButton>}
      {onForget && !forgetAsk && (
        <button type="button" className="ui-link" style={{ color: "var(--tehlike)" }} onClick={() => setForgetAsk(true)}>
          Bilgilerini tamamen sil (kişi isterse)
        </button>
      )}
      {onForget && forgetAsk && (
        <div className="ui-warn gecti">
          <div className="ui-warn-row"><span>{name} ve bütün avans, ödeme, yoklama bilgileri kalıcı olarak silinecek. Bu geri alınamaz.</span></div>
          <MainButton onClick={async () => { setBusy(true); try { await onForget(); } catch { setError(navigator.onLine ? "Silemedim, tekrar dene." : "Tamamen silmek için internet lazım."); setBusy(false); } }} disabled={busy}>Evet, tamamen sil</MainButton>
          <MainButton secondary onClick={() => setForgetAsk(false)}>Vazgeç</MainButton>
        </div>
      )}
    </form>
  );
}

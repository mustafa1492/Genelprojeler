"use client";
import { useState } from "react";
import { Chip, ErrorText, MainButton, PageHeader, TextField } from "@/core/ui";
import type { Person, PersonInput } from "./api";

export type CustomField = { key: string; label: string; type: string };

/** Kişi ekleme / düzenleme. Etiketler dokunarak seçilir; yazı yalnızca ad, telefon ve özel alanlarda. */
export function PersonForm({ kindLabel, tags, customFields, person, onSave, onCancel, onRemove, onForget }: {
  kindLabel: string;
  tags: readonly string[];
  customFields: readonly CustomField[];
  person?: Person;
  onSave: (p: PersonInput) => Promise<void>;
  onCancel: () => void;
  onRemove?: () => void;
  onForget?: () => Promise<void>;
}) {
  const [name, setName] = useState(person?.full_name ?? "");
  const [phone, setPhone] = useState(person?.phone ?? "");
  const [picked, setPicked] = useState<string[]>(person?.tags ?? []);
  const [custom, setCustom] = useState<Record<string, string>>(person?.custom ?? {});
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
          onChange={(e) => setCustom({ ...custom, [f.key]: e.target.value })} />
      ))}
      <div className="ui-stack" style={{ gap: 8 }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>Hangi işleri yapar?</span>
        <div className="ui-chips wrap">
          {tags.map((t) => <Chip key={t} selected={picked.includes(t)} onClick={() => toggle(t)}>{t}</Chip>)}
        </div>
      </div>
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
          <MainButton onClick={async () => { setBusy(true); try { await onForget(); } catch { setError("Silemedim, tekrar dene."); setBusy(false); } }} disabled={busy}>Evet, tamamen sil</MainButton>
          <MainButton secondary onClick={() => setForgetAsk(false)}>Vazgeç</MainButton>
        </div>
      )}
    </form>
  );
}

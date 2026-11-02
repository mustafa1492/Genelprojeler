"use client";
import { useGo, useOnActivate } from "@/core/shell/TabShell";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { addDoc, daysLeft, deleteDoc, listDocs, restoreDoc, updateDoc, type Doc } from "@/core/documents/api";
import { BackButton, Chip, DoneCard, ErrorText, MainButton, PageHeader, StatusPill, TextField } from "@/core/ui";
import { config } from "../config";
import { hasFidan } from "../fidan";
import { dayYear } from "../kayit";

type Done = { message: string; undo?: () => Promise<void> } | null;

/** Belgeler ve bitiş tarihleri (ÇKS, TARSİM, kira sözleşmesi, destek başvurusu…). */
export default function Belgeler() {
  const biz = useBusiness();
  const go = useGo();
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [form, setForm] = useState<{ edit?: Doc } | null>(null);
  const [done, setDone] = useState<Done>(null);
  const load = useCallback(() => { listDocs(biz.id).then(setDocs).catch(() => setDocs([])); }, [biz.id]);
  useEffect(load, [load]);
  useOnActivate(load);

  if (form) return <DocForm edit={form.edit} fidan={hasFidan(biz)} onCancel={() => setForm(null)}
    onDelete={form.edit ? async () => { const d = form.edit!; await deleteDoc(d.id); setDone({ message: `Sildim: ${d.title}.`, undo: () => restoreDoc(d) }); setForm(null); load(); } : undefined}
    onSave={async (v) => {
      if (form.edit) { const b = { ...form.edit }; await updateDoc(b.id, v); setDone({ message: `Değiştirdim: ${v.title}.`, undo: () => updateDoc(b.id, b) }); }
      else { const d = await addDoc(biz.id, v); setDone({ message: `Kaydettim: ${d.title}${d.expires_on ? `, bitiş ${dayYear(d.expires_on)}` : ""}.`, undo: () => deleteDoc(d.id) }); }
      setForm(null); load();
    }} />;

  const list = (docs ?? []).slice().sort((a, b) => (a.expires_on ?? "9999").localeCompare(b.expires_on ?? "9999"));
  return (
    <main className="ui-stack">
      <BackButton onClick={() => go("ozet")} label="Özet" />
      <PageHeader sub="Bitiş tarihleri ve hatırlatma" title="Belgeler" />
      {done && <DoneCard message={done.message} onUndo={done.undo ? async () => { await done.undo!(); setDone(null); load(); } : undefined} />}
      <MainButton onClick={() => { setDone(null); setForm({}); }}>+ Belge ekle</MainButton>
      {docs && list.length === 0 && <div className="ui-empty">Henüz belge yok. ÇKS, sigorta, kira sözleşmesi gibi bitiş tarihi olanları ekle.</div>}
      {list.map((d) => {
        const n = daysLeft(d.expires_on);
        return (
          <button key={d.id} type="button" className={`ui-card${n !== null && n < 0 ? " late" : ""}`} onClick={() => { setDone(null); setForm({ edit: d }); }}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <span style={{ minWidth: 0 }}><b>{d.title}</b><br /><span className="ui-note" style={{ margin: 0 }}>{[d.expires_on ? `Bitiş ${dayYear(d.expires_on)}` : "Bitiş tarihi yok", d.notes].filter(Boolean).join(" · ")}</span></span>
            {n === null ? null : n < 0 ? <StatusPill status="gecti">Süresi geçti</StatusPill>
              : n <= config.remindDays.documents ? <StatusPill status="yakin">{n} gün kaldı</StatusPill> : <StatusPill status="tamam">Tamam</StatusPill>}
          </button>
        );
      })}
    </main>
  );
}

function DocForm({ edit, fidan, onSave, onCancel, onDelete }: {
  fidan?: boolean;
  edit?: Doc; onSave: (v: Pick<Doc, "title" | "expires_on" | "notes">) => Promise<void>; onCancel: () => void; onDelete?: () => Promise<void>;
}) {
  const [title, setTitle] = useState(edit?.title ?? "");
  const [exp, setExp] = useState(edit?.expires_on ?? "");
  const [notes, setNotes] = useState(edit?.notes ?? "");
  const [error, setError] = useState("");
  return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub="Belge" title={edit ? "Belgeyi düzenle" : "Yeni belge"} />
      <div className="ui-chips wrap">{[...config.documents, ...(fidan ? ["Fidan üretim izni", "Bitki pasaportu", "Fidan sertifikası"] : [])].map((t) => <Chip key={t} selected={t === title} onClick={() => setTitle(t)}>{t}</Chip>)}</div>
      <TextField id="b_ad" label="Belgenin adı" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} />
      <TextField id="b_bitis" label="Bitiş / son tarih" type="date" value={exp} onChange={(e) => setExp(e.target.value)} />
      <TextField id="b_not" label="Not (isteğe bağlı)" placeholder="Örnek: poliçe no, hangi tarla" maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      <MainButton onClick={async () => { if (!title.trim()) { setError("Belgenin adını yaz."); return; } await onSave({ title: title.trim(), expires_on: exp || null, notes: notes.trim() || null }); }}>Kaydet</MainButton>
      {onDelete && <MainButton className="tehlike" onClick={onDelete}>Belgeyi sil</MainButton>}
    </main>
  );
}

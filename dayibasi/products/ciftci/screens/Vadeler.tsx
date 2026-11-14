"use client";
import { HistoryLink } from "../nav";
import { useCList } from "../lists";
import { useGo, useOnActivate, useBack } from "@/core/shell/TabShell";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { useMembers } from "@/core/auth/members";
import { addDue, deleteDue, listDues, remaining, restoreDue, updateDue, type Due } from "@/core/dues/api";
import { listEvents, updateEvent, type EventRow } from "@/core/events/api";
import { listExpenses, owed, payVendor, updateExpense, type Expense } from "@/core/expenses/api";
import { formatTL } from "@/core/ledger/api";
import { BackButton, Chip, DoneCard, ErrorText, MainButton, PageHeader, TextField } from "@/core/ui";
import { config } from "../config";
import { dayYear, GELIR, incomeOpen, num, todayStr } from "../kayit";

type Done = { message: string; undo?: () => Promise<void> } | null;
type Row = { key: string; dir: "borc" | "alacak"; party: string; kind: string; left: number; due: string | null; note: string; src: "due" | "gelir" | "veresiye"; ref: Due | EventRow | string };

/** Borç ve vadeler: kendi girdiklerin + vadeli satışlar (alacak) + veresiye masraflar (borç). */
export default function Vadeler() {
  const biz = useBusiness();
  const go = useGo();
  const back = useBack();
  const { nameOf } = useMembers(biz.id);
  const [dues, setDues] = useState<Due[]>([]);
  const [income, setIncome] = useState<EventRow[]>([]);
  const [exps, setExps] = useState<Expense[]>([]);
  const [form, setForm] = useState<{ dir: "borc" | "alacak"; edit?: Due } | null>(null);
  const [pay, setPay] = useState<Row | null>(null);
  const [done, setDone] = useState<Done>(null);
  const load = useCallback(() => {
    listDues(biz.id).then(setDues).catch(() => {});
    listEvents(biz.id, GELIR).then(setIncome).catch(() => {});
    listExpenses(biz.id).then(setExps).catch(() => {});
  }, [biz.id]);
  useEffect(load, [load]);
  useOnActivate(load);

  const vendors = [...new Set(exps.filter((e) => owed(e) > 0).map((e) => e.vendor!))];
  const rows: Row[] = [
    ...dues.filter((d) => remaining(d) > 0).map((d) => ({ key: d.id, dir: d.direction, party: d.party, kind: d.kind, left: remaining(d), due: d.due_on, note: [d.note, nameOf(d.created_by)].filter(Boolean).join(" · "), src: "due" as const, ref: d })),
    ...income.filter((e) => incomeOpen(e) > 0).map((e) => ({ key: e.id, dir: "alacak" as const, party: String(e.data.buyer || e.data.type), kind: String(e.data.type), left: incomeOpen(e), due: (e.data.due_on as string) || null, note: String(e.data.crop ?? ""), src: "gelir" as const, ref: e })),
    ...vendors.map((v) => ({ key: `v:${v}`, dir: "borc" as const, party: v, kind: "Veresiye masraf", left: exps.filter((e) => e.vendor === v).reduce((t, e) => t + owed(e), 0), due: null, note: "", src: "veresiye" as const, ref: v })),
  ].sort((a, b) => (a.due ?? "9999").localeCompare(b.due ?? "9999"));
  const borc = rows.filter((r) => r.dir === "borc"), alacak = rows.filter((r) => r.dir === "alacak");
  const sum = (xs: Row[]) => xs.reduce((t, r) => t + r.left, 0);
  const today = todayStr();

  if (form) return <DueForm dir={form.dir} edit={form.edit} onCancel={() => setForm(null)}
    onDelete={form.edit ? async () => { const d = form.edit!; await deleteDue(d.id); setDone({ message: `Sildim: ${d.party}.`, undo: () => restoreDue(d) }); setForm(null); load(); } : undefined}
    onSave={async (v) => {
      if (form.edit) { const b = { ...form.edit }; await updateDue(b.id, v); setDone({ message: `Değiştirdim: ${v.party}.`, undo: () => updateDue(b.id, b) }); }
      else { const d = await addDue(biz.id, v); setDone({ message: `Kaydettim: ${d.direction === "borc" ? "Borç" : "Alacak"} · ${d.party}, ${formatTL(d.amount)}.`, undo: () => deleteDue(d.id) }); }
      setForm(null); load();
    }} />;

  if (pay) return <PayForm row={pay} onCancel={() => setPay(null)} onSave={async (n) => {
    const amt = Math.min(n, pay.left);
    if (pay.src === "due") { const d = pay.ref as Due; await updateDue(d.id, { paid_amount: d.paid_amount + amt }); setDone({ message: `Kaydettim: ${d.party}, ${formatTL(amt)}.`, undo: () => updateDue(d.id, { paid_amount: d.paid_amount }) }); }
    else if (pay.src === "gelir") { const e = pay.ref as EventRow; const r0 = Number(e.data.received ?? 0); await updateEvent(e.id, { data: { ...e.data, received: r0 + amt } }); setDone({ message: `Tahsil ettim: ${pay.party}, ${formatTL(amt)}.`, undo: () => updateEvent(e.id, { data: e.data }) }); }
    else { const { before } = await payVendor(exps, pay.ref as string, amt); setDone({ message: `Ödedin: ${pay.party}, ${formatTL(amt)}.`, undo: async () => { for (const b of before) await updateExpense(b.id, { paid_amount: b.paid_amount }); } }); }
    setPay(null); load();
  }} />;

  const block = (title: string, xs: Row[], dir: "borc" | "alacak") => (
    <section className="ui-stack" style={{ gap: 8 }}>
      <h2 className="ui-section">{title} <span>· {formatTL(sum(xs))}</span></h2>
      {xs.length === 0 && <div className="ui-empty">{dir === "borc" ? "Borcun yok." : "Alacağın yok."}</div>}
      {xs.map((r) => {
        const late = r.due && r.due < today, soon = r.due && !late && (Date.parse(r.due) - Date.parse(today)) / 86400000 <= config.remindDays.dues;
        return (
          <div key={r.key} className={`ui-card ui-stack${late ? " late" : ""}`} style={{ gap: 8 }}>
            <button type="button" className="ui-plain" onClick={() => r.src === "due" && setForm({ dir: r.dir, edit: r.ref as Due })}>
              <span style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><b>{r.party}</b><span className={`ui-amount${dir === "borc" ? " borc" : ""}`}>{formatTL(r.left)}</span></span>
              <span className="ui-note" style={{ margin: 0 }}>{[r.kind, r.due ? `vade ${dayYear(r.due)}` : "", r.note].filter(Boolean).join(" · ")}</span>
            </button>
            {(late || soon) && <span className={`ui-pill ${late ? "gecti" : "yakin"}`} style={{ alignSelf: "flex-start" }}>{late ? "Vadesi geçti" : "Vadesi yaklaşıyor"}</span>}
            <MainButton secondary onClick={() => { setDone(null); setPay(r); }}>{dir === "borc" ? "Ödedim" : "Tahsil ettim"}</MainButton>
          </div>
        );
      })}
    </section>
  );

  return (
    <main className="ui-stack">
      <BackButton onClick={() => back()} label="Geri" />
      <PageHeader sub="Kredi, kooperatif, bayi, tüccar, çek" title="Borç ve vadeler" right={<HistoryLink />} />
      {done && <DoneCard message={done.message} onUndo={done.undo ? async () => { await done.undo!(); setDone(null); load(); } : undefined} />}
      <div className="ui-split">
        <div><span>Borcun</span><b>{formatTL(sum(borc))}</b></div>
        <div className="mine"><span>Alacağın</span><b>{formatTL(sum(alacak))}</b></div>
      </div>
      <div className="ui-seg">
        <button type="button" onClick={() => setForm({ dir: "borc" })}>+ Borç ekle</button>
        <button type="button" onClick={() => setForm({ dir: "alacak" })}>+ Alacak ekle</button>
      </div>
      {block("Borçlarım", borc, "borc")}
      {block("Alacaklarım", alacak, "alacak")}
    </main>
  );
}

function DueForm({ dir, edit, onSave, onCancel, onDelete }: {
  dir: "borc" | "alacak"; edit?: Due; onCancel: () => void; onDelete?: () => Promise<void>;
  onSave: (v: Pick<Due, "direction" | "party" | "kind" | "amount" | "due_on" | "note">) => Promise<void>;
}) {
  const dueKinds = useCList("due_kinds");
  const [party, setParty] = useState(edit?.party ?? "");
  const [kind, setKind] = useState(edit?.kind ?? (dir === "borc" ? "Kredi" : "Diğer"));
  const [amount, setAmount] = useState(edit ? String(edit.amount) : "");
  const [due, setDue] = useState(edit?.due_on ?? "");
  const [note, setNote] = useState(edit?.note ?? "");
  const [error, setError] = useState("");
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={edit ? "Düzenle" : "Yeni"} title={dir === "borc" ? "Borç" : "Alacak"} />
      <div className="ui-chips wrap">{dueKinds.map((k) => <Chip key={k} selected={k === kind} onClick={() => setKind(k)}>{k}</Chip>)}</div>
      <TextField id="v_kim" label={dir === "borc" ? "Kime borçlusun?" : "Kimden alacaksın?"} placeholder={dir === "borc" ? "Örnek: Ziraat Bankası, Tarım Kredi" : "Örnek: Tüccar Ahmet"} maxLength={80} value={party} onChange={(e) => setParty(e.target.value)} />
      <TextField id="v_tutar" label="Tutar (TL)" inputMode="decimal" maxLength={12} value={amount} onChange={(e) => setAmount(e.target.value)} style={{ fontSize: "1.6rem", fontWeight: 800 }} />
      <TextField id="v_vade" label="Vade günü (isteğe bağlı)" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
      <TextField id="v_not" label="Not (isteğe bağlı)" placeholder="Örnek: 3. taksit, çek no 12345" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      {onDelete && <MainButton className="tehlike" onClick={onDelete}>Sil</MainButton>}
      <div className="ui-sticky-bottom"><MainButton onClick={async () => {
        const n = num(amount);
        if (!party.trim()) { setError(dir === "borc" ? "Kime borçlu olduğunu yaz." : "Kimden alacağını yaz."); return; }
        if (!(n > 0)) { setError("Tutarı yaz."); return; }
        await onSave({ direction: dir, party: party.trim(), kind, amount: n, due_on: due || null, note: note.trim() || null });
      }}>Kaydet</MainButton></div>
    </main>
  );
}

function PayForm({ row, onSave, onCancel }: { row: Row; onSave: (n: number) => Promise<void>; onCancel: () => void }) {
  const [v, setV] = useState("");
  const [err, setErr] = useState("");
  return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={`Kalan: ${formatTL(row.left)}`} title={`${row.dir === "borc" ? "Ödeme" : "Tahsilat"}: ${row.party}`} />
      <TextField id="p_tutar" label="Kaç TL?" inputMode="decimal" autoFocus maxLength={12} value={v} onChange={(e) => setV(e.target.value)} style={{ fontSize: "1.8rem", fontWeight: 800 }} />
      <Chip onClick={() => setV(String(row.left))}>Hepsi: {formatTL(row.left)}</Chip>
      {err && <ErrorText>{err}</ErrorText>}
      <MainButton onClick={async () => { const n = num(v); if (!(n > 0)) { setErr("Tutarı yaz."); return; } await onSave(n); }}>Kaydet</MainButton>
    </main>
  );
}

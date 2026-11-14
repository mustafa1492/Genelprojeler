"use client";
import { HistoryLink } from "../nav";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { addEvent, deleteEvent, listEvents, updateEvent, type EventRow } from "@/core/events/api";
import { addExpense, deleteExpense, listExpenses, updateExpense, type Expense } from "@/core/expenses/api";
import { formatTL } from "@/core/ledger/api";
import { mutate } from "@/core/offline/store";
import { useGo, useOnActivate, useTabParams, useBack } from "@/core/shell/TabShell";
import { BackButton, Card, Chip, DoneCard, InfoRows, MainButton, PageHeader, TextField } from "@/core/ui";
import { useCList } from "../lists";
import { dayYear, MAKINE, num, todayStr } from "../kayit";
import { useRole } from "../rol";

type Done = { message: string; undo?: () => Promise<unknown> } | null;
export type Bakim = { makine: string; lastHours: number | null; nextOn: string | null; nextHours: number | null; left: number | null };
const KATEGORI = "Traktör / makine";

const sorted = (ev: EventRow[]) => ev.slice().sort((a, b) => b.occurred_on.localeCompare(a.occurred_on) || (b.created_at ?? "").localeCompare(a.created_at ?? ""));

/** Her makinenin son motor saati ve sonraki bakımı (en son "sonraki" yazılan kayda göre). */
export function bakimDurumu(ev: EventRow[]): Bakim[] {
  const by = new Map<string, EventRow[]>();
  for (const e of ev.filter((x) => x.kind === MAKINE)) { const m = String(e.data.makine ?? ""); if (m) by.set(m, [...(by.get(m) ?? []), e]); }
  return [...by.entries()].map(([makine, list]) => {
    const hrs = list.map((e) => Number(e.quantity)).filter((n) => Number.isFinite(n) && n > 0);
    const lastHours = hrs.length ? Math.max(...hrs) : null;
    const n = sorted(list).find((e) => e.data.next_on || e.data.next_hours);
    const nextOn = n?.data.next_on ? String(n.data.next_on) : null;
    const nextHours = n?.data.next_hours ? Number(n.data.next_hours) : null;
    return { makine, lastHours, nextOn, nextHours, left: nextHours !== null && lastHours !== null ? nextHours - lastHours : null };
  });
}

export default function Makineler() {
  const biz = useBusiness();
  const go = useGo();
  const back = useBack();
  const { money, writes } = useRole();
  const canWrite = writes("tarlalar");
  const makineler = useCList("makineler");
  const [ev, setEv] = useState<EventRow[]>([]);
  const [exp, setExp] = useState<Expense[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [form, setForm] = useState<{ makine: string; edit?: EventRow } | null>(null);
  const [done, setDone] = useState<Done>(null);
  const load = useCallback(() => {
    listEvents(biz.id, MAKINE).then(setEv).catch(() => {});
    if (money) listExpenses(biz.id).then(setExp).catch(() => {});
  }, [biz.id, money]);
  useEffect(load, [load]);
  useOnActivate(load);
  const tp = useTabParams();
  useEffect(() => { if (tp.p.makine) setSel(String(tp.p.makine)); }, [tp.n]); // eslint-disable-line react-hooks/exhaustive-deps

  const durum = bakimDurumu(ev);
  const durumOf = (m: string) => durum.find((d) => d.makine === m);
  const masrafOf = (m: string) => exp.filter((x) => x.category === KATEGORI && x.data?.makine === m);
  const names = [...makineler]; // listeden çıkarılan makine görünmez (kayıtları masrafta kalır)
  const nextText = (d?: Bakim) => [
    d?.nextOn ? `${dayYear(d.nextOn)}${d.nextOn < todayStr() ? " (geçti)" : ""}` : "",
    d?.nextHours ? `tavsiye ${d.nextHours.toLocaleString("tr-TR")} saatte${d.left !== null && d.left > 0 ? ` (${d.left.toLocaleString("tr-TR")} saat var)` : ""}` : "",
  ].filter(Boolean).join(" · ");

  if (form) return <BakimForm makine={form.makine} edit={form.edit} money={money} lastHours={durumOf(form.makine)?.lastHours ?? null}
    expense={form.edit?.data.expense_id ? exp.find((x) => x.id === form.edit!.data.expense_id) : undefined}
    onCancel={() => setForm(null)}
    onDelete={form.edit ? async () => {
      const e = form.edit!; const fx = exp.find((x) => x.id === e.data.expense_id);
      await deleteEvent(e.id); if (fx) await deleteExpense(fx.id);
      setDone({ message: `Sildim: ${form.makine}, ${String(e.data.is)}.`, undo: async () => { await mutate({ kind: "insert", table: "events", values: e }); if (fx) await mutate({ kind: "insert", table: "expenses", values: fx }); } });
      setForm(null); load();
    } : undefined}
    onSave={async (v) => {
      const m = form.makine; const old = form.edit;
      const note = `${m}: ${v.is}${v.not ? ` (${v.not})` : ""}`;
      let expenseId = old?.data.expense_id ? String(old.data.expense_id) : "";
      if (money) {
        if (expenseId && v.tutar) await updateExpense(expenseId, { amount: v.tutar, occurred_on: v.day, note });
        else if (expenseId && !v.tutar) { await deleteExpense(expenseId); expenseId = ""; }
        else if (v.tutar) expenseId = (await addExpense(biz.id, { occurred_on: v.day, category: KATEGORI, amount: v.tutar, note, on_credit: false, vendor: null, paid_amount: 0, charge_to: null, place_id: null, photo_path: null, data: { makine: m } })).id;
      }
      const data: Record<string, unknown> = { makine: m, is: v.is, ...(v.not ? { not: v.not } : {}), ...(v.nextOn ? { next_on: v.nextOn } : {}), ...(v.nextHours ? { next_hours: v.nextHours } : {}), ...(expenseId ? { expense_id: expenseId } : {}) };
      if (old) { await updateEvent(old.id, { occurred_on: v.day, quantity: v.saat, data }); setDone({ message: `Değiştirdim: ${m}, ${v.is}.` }); }
      else {
        const e = await addEvent(biz.id, { kind: MAKINE, person_id: null, place_id: null, quantity: v.saat, occurred_on: v.day, data });
        setDone({ message: `Kaydettim: ${m}, ${v.is}${v.saat ? `, ${v.saat.toLocaleString("tr-TR")} saat` : ""}.${expenseId && v.tutar ? ` Masraflara ${formatTL(v.tutar)} eklendi.` : ""}`,
          undo: async () => { await deleteEvent(e.id); if (expenseId) await deleteExpense(expenseId); } });
      }
      setForm(null); setSel(m); load();
    }} />;

  if (sel) {
    const d = durumOf(sel);
    const list = sorted(ev.filter((e) => e.kind === MAKINE && e.data.makine === sel));
    const mx = masrafOf(sel);
    return (
      <main className="ui-stack">
        <BackButton onClick={() => { setSel(null); setDone(null); }} label="Makineler" />
        <PageHeader sub="Makine" title={sel} />
        {done && <DoneCard message={done.message} onUndo={done.undo ? async () => { await done.undo!(); setDone(null); load(); } : undefined} />}
        <Card><InfoRows rows={[
          ["Son motor saati", d?.lastHours ? `${d.lastHours.toLocaleString("tr-TR")} saat` : "Yazılmadı"],
          ["Sonraki bakım", nextText(d) || "Yazılmadı"],
          ...(money ? [["Toplam bakım masrafı", formatTL(mx.reduce((t, x) => t + x.amount, 0))] as [string, string]] : []),
        ]} /></Card>
        {canWrite && <MainButton onClick={() => { setDone(null); setForm({ makine: sel }); }}>+ Bakım kaydı</MainButton>}
        {list.length === 0 && <div className="ui-empty">Henüz bakım kaydı yok.</div>}
        {list.map((e) => {
          const fx = exp.find((x) => x.id === e.data.expense_id);
          return (
            <Card key={e.id} onClick={canWrite ? () => { setDone(null); setForm({ makine: sel, edit: e }); } : undefined}>
              <b>{String(e.data.is)}</b>
              <span className="ui-note" style={{ margin: 0 }}>
                {[dayYear(e.occurred_on), e.quantity ? `${Number(e.quantity).toLocaleString("tr-TR")} saat` : "", money && fx ? formatTL(fx.amount) : "", e.data.not ? String(e.data.not) : ""].filter(Boolean).join(" · ")}
              </span>
            </Card>
          );
        })}
        <button type="button" className="ui-link" onClick={() => go("belgeler", { geri: "makineler" })}>📄 Muayene ve sigorta tarihleri: Belgeler ›</button>
      </main>
    );
  }

  return (
    <main className="ui-stack">
      <BackButton onClick={() => back()} label="Geri" />
      <PageHeader sub="Bakım, motor saati, sonraki bakım" title="Makineler" right={<HistoryLink />} />
      {done && <DoneCard message={done.message} onUndo={done.undo ? async () => { await done.undo!(); setDone(null); load(); } : undefined} />}
      {names.length === 0 && <div className="ui-empty">Henüz makine yok. Traktör, pulluk, ilaçlama makinesi gibi makinelerini ekle.</div>}
      {names.map((m) => {
        const d = durumOf(m);
        return (
          <Card key={m} onClick={() => { setDone(null); setSel(m); }}>
            <b>{m}</b>
            <span className="ui-note" style={{ margin: 0 }}>
              {[d?.lastHours ? `${d.lastHours.toLocaleString("tr-TR")} saat` : "", nextText(d) ? `Sonraki bakım: ${nextText(d)}` : ""].filter(Boolean).join(" · ") || "Bakım kaydı yok"}
            </span>
          </Card>
        );
      })}
      {writes("ayarlar") && <MainButton secondary onClick={() => go("listeler", { liste: "makineler", geri: "makineler" })}>Makine ekle ya da çıkar</MainButton>}
      <button type="button" className="ui-link" onClick={() => go("belgeler", { geri: "makineler" })}>📄 Muayene ve sigorta tarihleri: Belgeler ›</button>
    </main>
  );
}

type FormV = { day: string; is: string; saat: number | null; not: string; tutar: number; nextOn: string; nextHours: number | null };

function BakimForm({ makine, edit, money, lastHours, expense, onSave, onCancel, onDelete }: {
  makine: string; edit?: EventRow; money: boolean; lastHours: number | null; expense?: Expense;
  onSave: (v: FormV) => Promise<void>; onCancel: () => void; onDelete?: () => Promise<void>;
}) {
  const isler = useCList("makine_isleri");
  const go = useGo();
  const d = edit?.data ?? {};
  const [is, setIs] = useState(String(d.is ?? ""));
  const [day, setDay] = useState(edit?.occurred_on ?? todayStr());
  const [saat, setSaat] = useState(edit?.quantity ? String(edit.quantity) : "");
  const [not, setNot] = useState(String(d.not ?? ""));
  const [tutar, setTutar] = useState(expense ? String(expense.amount) : "");
  const [nextOn, setNextOn] = useState(String(d.next_on ?? ""));
  const [nextHours, setNextHours] = useState(d.next_hours ? String(d.next_hours) : "");
  const [busy, setBusy] = useState(false);
  const n = (s: string) => (s.trim() ? num(s) : null);
  const bad = [saat, tutar, nextHours].some((s) => s.trim() && !(Number.isFinite(num(s)) && num(s) >= 0));
  return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={makine} title={edit ? "Bakımı düzenle" : "Bakım kaydı"} />
      <div className="ui-stack" style={{ gap: 8 }}>
        <span className="ui-label">Ne yapıldı?</span>
        <div className="ui-chips wrap">
          {isler.map((x) => <Chip key={x} selected={is === x} onClick={() => setIs(x)}>{x}</Chip>)}
          <button type="button" className="ui-chip" onClick={() => go("listeler", { liste: "makine_isleri", geri: "makineler" })}>Düzenle</button>
        </div>
      </div>
      <TextField id="mk_gun" label="Tarih" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
      <TextField id="mk_saat" label={`Motor saati (isteğe bağlı)${lastHours ? `, son: ${lastHours.toLocaleString("tr-TR")}` : ""}`} inputMode="decimal" placeholder="Örnek: 1250" maxLength={8} value={saat} onChange={(e) => setSaat(e.target.value)} />
      {money && <TextField id="mk_tutar" label="Tutar, TL (isteğe bağlı, masrafa da eklenir)" inputMode="decimal" placeholder="Örnek: 2500" maxLength={10} value={tutar} onChange={(e) => setTutar(e.target.value)} />}
      <TextField id="mk_not" label="Not (isteğe bağlı)" placeholder="Örnek: 15W40, 12 litre" maxLength={200} value={not} onChange={(e) => setNot(e.target.value)} />
      <span className="ui-label">Sonraki bakım (isteğe bağlı)</span>
      <TextField id="mk_sonraki_gun" label="Tarih" type="date" value={nextOn} onChange={(e) => setNextOn(e.target.value)} />
      <TextField id="mk_sonraki_saat" label="ya da tavsiye edilen motor saati (kılavuzdan)" inputMode="decimal" placeholder="Örnek: 1500" maxLength={8} value={nextHours} onChange={(e) => setNextHours(e.target.value)} />
      {bad && <span className="ui-note" style={{ margin: 0 }}>Sayıları kontrol et.</span>}
      <MainButton disabled={!is || !day || bad || busy} onClick={async () => {
        setBusy(true);
        try { await onSave({ day, is, saat: n(saat), not: not.trim(), tutar: n(tutar) ?? 0, nextOn, nextHours: n(nextHours) }); } finally { setBusy(false); }
      }}>Kaydet</MainButton>
      {onDelete && <MainButton secondary onClick={onDelete}>Sil</MainButton>}
    </main>
  );
}

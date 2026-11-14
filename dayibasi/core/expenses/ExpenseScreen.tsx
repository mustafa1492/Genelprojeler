"use client";
// Ortak masraf ekranı (dayıbaşı + çiftçi defteri). Ürün farkları prop olarak gelir.
import { dinle, sesVarMi, turBul, tutarBul } from "./ses";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBack, useOnActivate, useTabParams } from "@/core/shell/TabShell";
import { useBusiness, useSetBusiness } from "@/core/auth/AuthGate";
import { todayIstanbul } from "@/core/events/api";
import {
  addExpense, deleteExpense, listExpenses, owed, payVendor, receiptUrl, restoreExpense, updateExpense, uploadReceipt, type Expense,
} from "@/core/expenses/api";
import { downloadBook } from "@/core/export/xlsx";
import { fmtFx, getRates, useRates } from "@/core/fx";
import { masrafOzet, masrafSheet } from "./excel";
import { formatTL } from "@/core/ledger/api";
import type { Person } from "@/core/people/api";
import type { Place } from "@/core/places/api";
import { addItem, deleteItem, listItems, updateItem, type Item } from "@/core/inventory/api";
import { supabase } from "@/core/supabase/client";
import { DeskTable, Tag } from "@/core/ui/DeskTable";
import { PickWithAdd } from "@/core/settings/lists";
import { BackButton, BottomNav, Chip, DoneCard, ErrorText, MainButton, PageHeader, TextField, type NavItem, Pick } from "@/core/ui";

const SPLIT = "__bol__";   // masraf formunda "Tarlalara böl" seçimi
const dayText = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long" });

/** Ürün farkları: türler, "çiftçiye yansıt" hedefleri, tarla seçimi, özet kartı, menü. */
export type ExpenseScreenProps = {
  categories: readonly string[];
  chargeTargets?: Person[];          // dayıbaşı: çiftçiye yansıt
  places?: Place[];                  // çiftçi: tarla seç
  /** Ayın özet kartı (ör. dayıbaşı: net kazanç). Verilmezse toplam masraf gösterilir. */
  summary?: (month: string, monthTotal: number) => React.ReactNode;
  /** Excel "Özet" sayfasına ek satırlar. */
  summaryRows?: (month: string, monthTotal: number) => (string | number)[][];
  navItems?: NavItem[]; current?: string; headerRight?: React.ReactNode;
  memberName?: (userId: string | null | undefined) => string;   // kim girdi
  /** Sezon görünümü (çiftçi): seçili dönem + seçici + özet kartı. Verilirse "Ay ay / Sezon" düğmeleri çıkar. */
  period?: { name: string; start: string; end: string };
  periodPicker?: React.ReactNode;
  periodSummary?: (total: number, fx?: string) => React.ReactNode;
  /** Tarla seçilmeyen masrafın adı (çiftçi: "İşletme gideri"). */
  noPlaceLabel?: string;   // fx: döviz karşılığı yazısı ("≈ 1.234 $") ya da boş
  /** Ek bağlantı (ör. fidan partisi): seçilen id data[key]'e yazılır. */
  link?: { label: string; key: string; options: { id: string; name: string }[]; param: string };
  /** Masrafla birlikte depoya ekleme: masraf türü → depo türü (yoksa null). */
  stock?: { categoryOf: (expenseCategory: string) => string | null; units: readonly string[] };
  /** Verilirse türler hazır (düzenlenmiş) liste olarak gelir ve "Türleri düzenle" bağlantısı çıkar. */
  onEditCategories?: () => void;
  /** Birden çok iş varsa (ör. Fidan, Buğday): "Hangi iş için?" seçimi, data.branch'e yazılır. Tarlanın işi (custom.is) önceden seçilir. */
  branches?: readonly string[];
  /** Verilirse "Hangi iş için?" her zaman çıkar ve yerinde yeni iş eklenir. */
  onAddBranch?: (name: string) => Promise<void>;
  /** Liste üstünde (ör. onay bekleyen fişler). start(foto, not, tarla, kaydedilince) ile masraf formunu açar. */
  inbox?: (start: (photo: string, note: string | null, placeId: string | null, saved: (expenseId: string) => void) => void) => React.ReactNode;
};
type StockAdd = { itemId: string | null; name: string; qty: number; unit: string; category: string };

type View = { v: "list" } | { v: "tur" } | { v: "form"; cat: string; edit?: Expense; tutar?: number } | { v: "veresiye" } | { v: "ode"; vendor: string } | { v: "foto"; url: string };
type Done = { message: string; undo?: () => Promise<void> } | null;
const num = (s: string) => Number(s.replace(/\./g, "").replace(",", "."));
const monthName = (m: string) => new Date(m + "-15T12:00:00").toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

export function ExpenseScreen({ categories: baseCats, chargeTargets = [], places = [], summary, summaryRows, navItems, current, headerRight, memberName, period, periodPicker, periodSummary, link, stock, onEditCategories, branches = [], onAddBranch, inbox, noPlaceLabel }: ExpenseScreenProps) {
  const biz = useBusiness();
  const setBiz = useSetBusiness();
  const [items, setItems] = useState<Expense[] | null>(null);
  const farmers = chargeTargets;
  const [view, setView] = useState<View>({ v: "list" });
  const [presetPlace, setPresetPlace] = useState<string | null>(null);
  const [fromInbox, setFromInbox] = useState<{ photo: string; note: string | null; saved: (id: string) => void } | null>(null);
  const [presetLink, setPresetLink] = useState<string | null>(null);
  const [stockItems, setStockItems] = useState<Item[]>([]);
  const [month, setMonth] = useState(todayIstanbul().slice(0, 7));
  const [mode, setMode] = useState<"ay" | "sezon">("ay");
  const bySeason = !!period && mode === "sezon";
  const [done, setDone] = useState<Done>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    if (stock) listItems(biz.id).then(setStockItems).catch(() => {});
    listExpenses(biz.id).then(setItems)
      .catch(() => setError("Masrafları getiremedim."));
  }, [biz.id]);
  useEffect(load, [load]);
  useOnActivate(load);
  // "Yeni masraf" isteği: adresten (?yeni=1) ya da sekme kabuğundan ({yeni, tarla})
  useEffect(() => { try { if (new URLSearchParams(location.search).get("yeni")) setView({ v: "tur" }); } catch { /* yok */ } }, []);
  const tp = useTabParams();
  const back = useBack();
  const viaTab = useRef(false);   // form başka bir ekrandan açıldı: Vazgeç oraya döner
  const leave = () => { setFromInbox(null); setView({ v: "list" }); if (viaTab.current) { viaTab.current = false; back(); } };
  useEffect(() => { if (tp.n > 0 && (tp.p.duzenle || tp.p.yeni || tp.p.fis)) viaTab.current = true; }, [tp.n]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (tp.p.duzenle) { const e = (items ?? []).find((x) => x.id === tp.p.duzenle); if (e) { setDone(null); setView({ v: "form", cat: e.category, edit: e }); } return; }
    // Fiş ekranından: fotoğraf hazır, tutarı gir
    if (tp.p.fis) { setDone(null); setPresetPlace(tp.p.tarla ? String(tp.p.tarla) : null); setFromInbox({ photo: String(tp.p.fis), note: tp.p.not ? String(tp.p.not) : null, saved: () => {} }); setView({ v: "tur" }); return; }
    if (tp.p.yeni) { setDone(null); setPresetPlace(tp.p.tarla ? String(tp.p.tarla) : null); setPresetLink(link && tp.p[link.param] ? String(tp.p[link.param]) : null); setView({ v: "tur" }); } }, [tp.n, !!items]); // eslint-disable-line react-hooks/exhaustive-deps

  const custom = (Array.isArray(biz.settings?.expense_categories) ? biz.settings!.expense_categories : []) as string[];
  const categories = onEditCategories ? [...baseCats] : [...baseCats.filter((c) => c !== "Diğer"), ...custom.filter((c) => !baseCats.includes(c)), "Diğer"];
  const all = items ?? [];
  const { doviz, conv } = useRates(useMemo(() => all.map((e) => e.occurred_on), [all]));   // döviz karşılığı (kaydın günündeki kur)
  const lastOf = (cat: string) => all.find((e) => e.category === cat)?.amount;
  const vendors = [...new Set(all.map((e) => e.vendor).filter(Boolean) as string[])];
  const farmerName = (id: string | null) => farmers.find((f) => f.id === id)?.full_name ?? "";

  // --- Tür seç
  if (view.v === "tur") {
    return <TurSec categories={categories} lastOf={lastOf} onEdit={onEditCategories} onCancel={leave}
      onPick={(cat, tutar) => setView({ v: "form", cat, tutar })}
      onAddCategory={async (name) => {
        const settings = { ...biz.settings, expense_categories: [...custom, name] };
        const { error } = await supabase().from("businesses").update({ settings }).eq("id", biz.id);
        if (error) throw error;
        setBiz({ ...biz, settings });
        setView({ v: "form", cat: name });
      }} />;
  }

  // --- Ekle / düzenle
  if (view.v === "form") {
    const ed = view.edit;
    return <MasrafForm noPlaceLabel={noPlaceLabel} categories={categories} cat={view.cat} edit={ed} presetAmount={view.tutar} lastAmount={lastOf(view.cat)} vendors={vendors} farmers={farmers} places={places} presetPlace={presetPlace} presetPhoto={ed ? null : fromInbox?.photo} presetNote={ed ? null : fromInbox?.note} link={link} presetLink={presetLink} branches={branches} onAddBranch={onAddBranch}
      stockCategory={stock && !ed ? stock.categoryOf(view.cat) : null} stockUnits={stock?.units ?? []} stockItems={stockItems}
      onCancel={leave}
      onSave={async (input, add) => {
        viaTab.current = false;
        if (ed) {
          const before = { ...ed };
          await updateExpense(ed.id, input);
          setDone({ message: `Değiştirdim: ${input.category} ${formatTL(input.amount)}.`, undo: () => updateExpense(ed.id, before) });
        } else if (input.place_id === SPLIT) {
          // Tarlalara dekara göre böl (dekar yazılmamışsa eşit)
          const ps = places.filter((p) => Number(p.custom?.donum) > 0).length ? places.filter((p) => Number(p.custom?.donum) > 0) : places;
          const w = ps.map((p) => Number(p.custom?.donum) || 1), W = w.reduce((a, b) => a + b, 0);
          let left = input.amount;
          const made: Expense[] = [];
          for (let k = 0; k < ps.length; k++) {
            const part = k === ps.length - 1 ? Math.round(left * 100) / 100 : Math.round((input.amount * w[k]) / W * 100) / 100;
            left -= part;
            const placeIs = ps[k].custom?.is;
            made.push(await addExpense(biz.id, { ...input, amount: part, place_id: ps[k].id,
              note: [input.note, `${formatTL(input.amount)} tarlalara bölündü`].filter(Boolean).join(" · "),
              ...(placeIs && input.data && !input.data.branch ? { data: { ...input.data, branch: placeIs } } : {}) }));
          }
          setDone({ message: `Kaydettim: ${input.category} ${formatTL(input.amount)}, ${made.map((e) => `${places.find((p) => p.id === e.place_id)?.name} ${formatTL(e.amount)}`).join(", ")}.`,
            undo: async () => { for (const e of made) await deleteExpense(e.id); } });
          setMonth(input.occurred_on.slice(0, 7));
        } else {
          const e = await addExpense(biz.id, input);
          if (fromInbox) { fromInbox.saved(e.id); setFromInbox(null); }
          let undoStock: (() => Promise<void>) | null = null, stockMsg = "";
          if (add && add.qty > 0) {
            const it = add.itemId ? stockItems.find((i) => i.id === add.itemId) : undefined;
            if (it) { await updateItem(it.id, { quantity: it.quantity + add.qty }); undoStock = () => updateItem(it.id, { quantity: it.quantity }); stockMsg = ` Depo: ${it.name} +${add.qty} ${it.unit}.`; }
            else { const ni = await addItem(biz.id, { name: add.name, category: add.category, unit: add.unit, quantity: add.qty, note: null }); undoStock = () => deleteItem(ni.id); stockMsg = ` Depoya eklendi: ${ni.name} ${add.qty} ${add.unit}.`; }
          }
          setDone({
            message: `Kaydettim: ${e.category} ${formatTL(e.amount)}${e.on_credit ? ` (veresiye: ${e.vendor})` : ""}${e.charge_to ? ` (yansıtıldı: ${farmerName(e.charge_to)})` : ""}.`,
            undo: async () => { await deleteExpense(e.id); if (undoStock) await undoStock(); },
          });
          if (stockMsg) setDone((d) => (d ? { ...d, message: d.message + stockMsg } : d));
          setMonth(e.occurred_on.slice(0, 7));
        }
        setView({ v: "list" }); load(); window.scrollTo({ top: 0 });
      }}
      onDelete={ed ? async () => {
        await deleteExpense(ed.id);
        setDone({ message: `Sildim: ${ed.category} ${formatTL(ed.amount)}.`, undo: () => restoreExpense(ed) });
        setView({ v: "list" }); load();
      } : undefined}
      onPhoto={async (path) => { const u = await receiptUrl(path); if (u) setView({ v: "foto", url: u }); }} />;
  }

  if (view.v === "foto") {
    return (
      <main className="ui-stack">
        <BackButton onClick={() => setView({ v: "list" })} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={view.url} alt="Fiş fotoğrafı" style={{ width: "100%", borderRadius: 14 }} />
      </main>
    );
  }

  // --- Veresiye: kime ne kadar borçluyum
  const byVendor = vendors.map((v) => ({ v, total: all.filter((e) => e.vendor === v).reduce((t, e) => t + owed(e), 0) })).filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);
  const totalOwed = byVendor.reduce((t, x) => t + x.total, 0);

  if (view.v === "ode") {
    const vt = byVendor.find((x) => x.v === view.vendor)?.total ?? 0;
    return <OdemeGir vendor={view.vendor} owedAmount={vt} onCancel={() => setView({ v: "veresiye" })}
      onSave={async (n) => {
        const { before } = await payVendor(all, view.vendor, n);
        setDone({ message: `Ödedin: ${view.vendor}, ${formatTL(Math.min(n, vt))}.`,
          undo: async () => { for (const b of before) await updateExpense(b.id, { paid_amount: b.paid_amount }); } });
        setView({ v: "veresiye" }); load();
      }} />;
  }

  if (view.v === "veresiye") {
    return (
      <main className="ui-stack">
        <BackButton onClick={() => setView({ v: "list" })} label="Masraf" />
        <PageHeader sub="Veresiye" title="Borçlu olduğun yerler" />
        {done && <DoneCard message={done.message} onUndo={done.undo ? async () => { await done.undo!(); setDone(null); load(); } : undefined} />}
        <div className="ui-total"><span>Toplam borcun</span><b>{formatTL(totalOwed)}</b></div>
        {byVendor.length === 0 && <div className="ui-empty">Veresiye borcun yok.</div>}
        {byVendor.map(({ v, total }) => {
          const open = all.filter((e) => e.vendor === v && owed(e) > 0);
          return (
            <div key={v} className="ui-card ui-stack" style={{ gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><b style={{ fontSize: "1.1rem" }}>{v}</b><span className="ui-amount borc">{formatTL(total)}</span></div>
              <span className="ui-note" style={{ margin: 0 }}>{open.map((e) => `${dayText(e.occurred_on)} ${e.category} ${formatTL(owed(e))}`).join(" · ")}</span>
              <MainButton onClick={() => { setDone(null); setView({ v: "ode", vendor: v }); }}>Ödedim</MainButton>
            </div>
          );
        })}
      </main>
    );
  }

  // --- Liste + özet
  const months = [...new Set([todayIstanbul().slice(0, 7), ...all.map((e) => e.occurred_on.slice(0, 7))])].sort().reverse();
  const inMonth = bySeason ? all.filter((e) => e.occurred_on >= period!.start && e.occurred_on <= period!.end) : all.filter((e) => e.occurred_on.startsWith(month));
  const label = bySeason ? `${period!.name} sezonu` : monthName(month);
  const mine = inMonth.filter((e) => !e.charge_to);
  const total = mine.reduce((t, e) => t + e.amount, 0);
  const charged = inMonth.filter((e) => e.charge_to).reduce((t, e) => t + e.amount, 0);
  const placeName = (id: string | null) => places.find((p) => p.id === id)?.name ?? "";
  const byCat = [...new Set(mine.map((e) => e.category))].map((c) => ({ c, t: mine.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0) }))
    .sort((a, b) => b.t - a.t);
  const max = Math.max(1, ...byCat.map((x) => x.t));
  const days = [...new Set(inMonth.map((e) => e.occurred_on))].sort().reverse();
  // Sezon içinde ay ay toplam
  const perMonth = [...new Set(mine.map((e) => e.occurred_on.slice(0, 7)))].sort().map((m) => ({ m, t: mine.filter((e) => e.occurred_on.startsWith(m)).reduce((s, e) => s + e.amount, 0) }));
  const maxM = Math.max(1, ...perMonth.map((x) => x.t));

  const totalFx = inMonth.filter((e) => !e.charge_to).reduce((t, e) => { const v = conv(e.amount, e.occurred_on); return v == null || t == null ? null : t + v; }, 0 as number | null);
  const excel = async () => {
    const fx = doviz === "kapali" || !navigator.onLine ? null : { rates: await getRates(inMonth.map((e) => e.occurred_on)), eur: doviz === "eur" };
    const M = masrafSheet(inMonth, places.map((p) => ({ id: p.id, name: p.name })), fx, { title: `${biz.name} · Masraflar · ${label}`,
      who: memberName ? (id) => memberName(id) : undefined, extra: farmers.length ? [{ h: "Çiftçiye yansıtıldı", get: (e) => farmerName(e.charge_to) }] : [] });
    await downloadBook(`masraflar-${bySeason ? period!.name.replace(/\s+/g, "-") : month}`, [
      masrafOzet(M, mine, fx, `${biz.name} · Masraf özeti`, label, [...(charged ? [["Çiftçiye yansıtılan (toplama girmez)", charged] as [string, number]] : []), ...(!bySeason && summaryRows ? summaryRows(month, total).filter((r) => r.length === 2 && typeof r[1] === "number").map((r) => [String(r[0]), Number(r[1])] as [string, number]) : []), ["Veresiye borcun (bugün)", totalOwed]]),
      M,
    ]);
  };

  return (
    <main className="ui-has-nav ui-stack">
      <PageHeader sub={label} title="Masraf" right={headerRight} />
      {done && <DoneCard message={done.message} onUndo={done.undo ? async () => { await done.undo!(); setDone(null); load(); } : undefined} />}
      {error && <ErrorText>{error}</ErrorText>}
      <MainButton className="kompakt" onClick={() => { setDone(null); setFromInbox(null); viaTab.current = false; setView({ v: "tur" }); }}>+ Masraf ekle</MainButton>
      {inbox?.((photo, note, placeId, saved) => { setDone(null); setPresetPlace(placeId); setFromInbox({ photo, note, saved }); setView({ v: "tur" }); })}

      {period && (
        <div className="ui-tabs" role="tablist" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <button type="button" role="tab" aria-selected={mode === "ay"} onClick={() => setMode("ay")}>Ay ay</button>
          <button type="button" role="tab" aria-selected={mode === "sezon"} onClick={() => setMode("sezon")}>Sezon</button>
        </div>
      )}
      {bySeason ? periodPicker : (
        <div className="ui-chips" role="group" aria-label="Ay seç">
          {months.map((m) => <Chip key={m} selected={m === month} onClick={() => setMonth(m)}>{monthName(m)}</Chip>)}
        </div>
      )}

      {bySeason
        ? (periodSummary ? periodSummary(total, totalFx != null && total > 0 ? fmtFx(totalFx, doviz) : "") : <div className="ui-total"><span>{label} masraf</span><b>{formatTL(total)}</b>{totalFx != null && doviz !== "kapali" && total > 0 && <small className="ui-fx ui-money">{fmtFx(totalFx, doviz)}</small>}</div>)
        : summary ? summary(month, total) : <div className="ui-total"><span>Bu ay masraf</span><b>{formatTL(total)}</b>{totalFx != null && doviz !== "kapali" && total > 0 && <small className="ui-fx ui-money">{fmtFx(totalFx, doviz)}</small>}</div>}
      {bySeason && perMonth.length > 0 && (
        <div className="ui-card ui-stack" style={{ gap: 10 }}>
          <b>Ay ay</b>
          {perMonth.map((x) => (
            <div key={x.m} className="ui-stack" style={{ gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><span>{monthName(x.m)}</span><span>{formatTL(x.t)}</span></div>
              <div className="ui-bar"><i style={{ width: `${(x.t / maxM) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      )}

      {totalOwed > 0 && (
        <button type="button" className="ui-card late" onClick={() => setView({ v: "veresiye" })}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <span><b>Veresiye borcun</b><br /><span className="ui-note" style={{ margin: 0 }}>{byVendor.map((x) => x.v).join(", ")}</span></span>
          <span className="ui-amount borc">{formatTL(totalOwed)} ›</span>
        </button>
      )}

      {byCat.length > 0 && (
        <div className="ui-card ui-stack" style={{ gap: 10 }}>
          {byCat.map((x) => (
            <div key={x.c} className="ui-stack" style={{ gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><b>{x.c}</b><span>{formatTL(x.t)}</span></div>
              <div className="ui-bar"><i className="mine" style={{ width: `${(x.t / max) * 100}%` }} /></div>
            </div>
          ))}
          {charged > 0 && <span className="ui-note" style={{ margin: 0 }}>Çiftçiye yansıtılan {formatTL(charged)} bu toplama girmez, çiftçinin borcuna eklendi.</span>}
        </div>
      )}

      {items && inMonth.length === 0 && <div className="ui-empty">{bySeason ? "Bu sezon masraf yok." : "Bu ay masraf yok."}</div>}
      <DeskTable rows={inMonth} rowKey={(e) => e.id} onRow={(e) => { setDone(null); setView({ v: "form", cat: e.category, edit: e }); }}
        cols={[
          { label: "Tarih", cell: (e) => `${e.occurred_on.slice(8)}.${e.occurred_on.slice(5, 7)}.${e.occurred_on.slice(0, 4)}`, width: "110px" },
          { label: "Tür", cell: (e) => <b>{e.category}</b> },
          ...(places.length ? [{ label: "Tarla", cell: (e: Expense) => placeName(e.place_id) }] : []),
          { label: "Not", cell: (e) => [e.note, (e.data?.branch as string) || ""].filter(Boolean).join(" · ") },
          { label: "Durum", cell: (e) => e.on_credit ? (owed(e) ? <Tag tone="kirmizi">Veresiye: {e.vendor}</Tag> : <Tag tone="yesil">Ödendi</Tag>) : e.charge_to ? <Tag tone="gri">Yansıtıldı</Tag> : <Tag tone="yesil">{e.photo_path ? "Ödendi · fişli" : "Ödendi"}</Tag> },
          ...(memberName ? [{ label: "Giren", cell: (e: Expense) => memberName((e as Expense & { created_by?: string }).created_by) }] : []),
          { label: "Tutar", num: true, cell: (e) => <><b>{formatTL(e.amount)}</b>{doviz !== "kapali" && <small className="ui-fx ui-money" style={{ display: "block" }}>{fmtFx(conv(e.amount, e.occurred_on), doviz)}</small>}</> },
        ]} />
      {days.map((d) => (
        <section key={d} className="ui-stack only-mobile" style={{ gap: 8 }}>
          <h2 style={{ margin: "6px 4px 0", fontSize: "1.05rem" }}>{dayText(d)}</h2>
          {inMonth.filter((e) => e.occurred_on === d).map((e) => (
            <button key={e.id} type="button" className="ui-moneyrow" style={{ width: "100%", font: "inherit", textAlign: "left", cursor: "pointer" }}
              onClick={() => { setDone(null); setView({ v: "form", cat: e.category, edit: e }); }}>
              <b style={{ minWidth: 0 }}>{e.category}{e.photo_path ? " · fişli" : ""}
                <small>{[placeName(e.place_id), (e.data?.branch as string) || "", e.note, memberName ? memberName((e as Expense & { created_by?: string }).created_by) : "", e.on_credit ? `Veresiye: ${e.vendor}${owed(e) ? "" : " (ödendi)"}` : "", e.charge_to ? `Yansıtıldı: ${farmerName(e.charge_to)}` : ""].filter(Boolean).join(" · ") || "Düzenlemek için dokun"}</small></b>
              <strong>{formatTL(e.amount)}{doviz !== "kapali" && <small className="ui-fx">{fmtFx(conv(e.amount, e.occurred_on), doviz)}</small>}</strong>
            </button>
          ))}
        </section>
      ))}
      {inMonth.length > 0 && <MainButton secondary onClick={excel}>Excel’e indir ({label})</MainButton>}
      {navItems && <BottomNav items={navItems} current={current ?? ""} />}
    </main>
  );
}

function TurSec({ categories, lastOf, onPick, onCancel, onAddCategory, onEdit }: {
  categories: string[]; onEdit?: () => void; lastOf: (c: string) => number | undefined; onPick: (c: string, tutar?: number) => void; onCancel: () => void; onAddCategory: (n: string) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  // Sesle masraf: "mazota üç bin verdim" → tür ve tutar dolu form. Tür anlaşılmazsa tutar saklanır, tür listeden seçilir.
  const [sesVar, setSesVar] = useState(false);
  useEffect(() => setSesVar(sesVarMi()), []);
  const [ses, setSes] = useState<{ durum: "dinliyor" } | { durum: "anlasilmadi"; metin: string; tutar: number | null } | { durum: "hata"; yazi: string } | null>(null);
  const durdur = useRef<(() => void) | null>(null);
  useEffect(() => () => durdur.current?.(), []);
  const sesBasla = () => {
    setSes({ durum: "dinliyor" });
    durdur.current = dinle((metin) => {
      const tutar = tutarBul(metin), tur = turBul(metin, categories);
      if (tur) { setSes(null); onPick(tur, tutar ?? undefined); }
      else setSes({ durum: "anlasilmadi", metin, tutar });
    }, (neden) => setSes({ durum: "hata", yazi: neden === "izin" ? "Mikrofon izni verilmedi. Telefonun ayarından bu siteye mikrofon izni verebilirsin." : neden === "internet" ? "Ses için internet lazım. Listeden seçerek yazabilirsin." : "Duyamadım. Tekrar dene ya da listeden seç." }));
  };
  const bekleyenTutar = ses?.durum === "anlasilmadi" ? ses.tutar ?? undefined : undefined;
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub="Yeni masraf" title="Ne için harcadın?" />
      {sesVar && !ses && <button type="button" className="ui-ses" onClick={sesBasla}><span aria-hidden="true">🎤</span>Söyleyerek yaz<small>Örnek: “mazota üç bin verdim”</small></button>}
      {ses?.durum === "dinliyor" && <div className="ui-ses dinliyor" role="status"><span aria-hidden="true">🎤</span>Dinliyorum… şimdi söyle<button type="button" className="ui-link inline" onClick={() => { durdur.current?.(); setSes(null); }}>Vazgeç</button></div>}
      {ses?.durum === "anlasilmadi" && <p className="ui-note" role="status">Duyduğum: “{ses.metin}”{ses.tutar ? ` · ${formatTL(ses.tutar)}` : ""}. Türünü aşağıdan seç.</p>}
      {ses?.durum === "hata" && <p className="ui-note" role="status">{ses.yazi}</p>}
      <div className="ui-liste-sec">
        {categories.map((c) => (
          <button key={c} type="button" onClick={() => onPick(c, bekleyenTutar)}>
            <b>{c}</b>{lastOf(c) ? <small>son: {formatTL(lastOf(c)!)}</small> : null}<i aria-hidden="true">›</i>
          </button>
        ))}
        <button type="button" className="ekle" onClick={() => (onEdit ? onEdit() : setAdding(true))}><b>{onEdit ? "Türleri düzenle (ekle, sırala)" : "+ Yeni tür"}</b><i aria-hidden="true">›</i></button>
      </div>
      {adding && (
        <div className="ui-card ui-stack" style={{ gap: 10 }}>
          <TextField id="yeni_tur" label="Türün adı" placeholder="Örnek: Köprü-otoyol" maxLength={40} autoFocus value={name} onChange={(e) => setName(e.target.value)} />
          {err && <ErrorText>{err}</ErrorText>}
          <MainButton disabled={!name.trim()} onClick={async () => {
            if (categories.some((c) => c.toLocaleLowerCase("tr") === name.trim().toLocaleLowerCase("tr"))) { onPick(name.trim()); return; }
            try { await onAddCategory(name.trim()); } catch { setErr(navigator.onLine ? "Ekleyemedim, tekrar dene." : "Yeni tür eklemek için internet lazım."); }
          }}>Ekle ve devam et</MainButton>
        </div>
      )}
    </main>
  );
}

function MasrafForm({ noPlaceLabel = "Genel", presetPhoto, presetNote, presetAmount, categories = [], branches = [], onAddBranch, cat, edit, lastAmount, vendors, farmers, places, presetPlace, link, presetLink, stockCategory, stockUnits = [], stockItems = [], onSave, onCancel, onDelete, onPhoto }: {
  stockCategory?: string | null; stockUnits?: readonly string[]; stockItems?: Item[]; noPlaceLabel?: string;
  presetPhoto?: string | null; presetNote?: string | null; presetAmount?: number; categories?: string[]; cat: string; edit?: Expense; lastAmount?: number; vendors: string[]; farmers: Person[]; places: Place[]; presetPlace?: string | null;
  link?: ExpenseScreenProps["link"]; presetLink?: string | null; branches?: readonly string[]; onAddBranch?: (name: string) => Promise<void>;
  onSave: (e: Omit<Expense, "id" | "business_id" | "created_at" | "data"> & { data?: Record<string, unknown> }, stockAdd?: StockAdd | null) => Promise<void>; onCancel: () => void;
  onDelete?: () => Promise<void>; onPhoto: (path: string) => void;
}) {
  const biz = useBusiness();
  const [amount, setAmount] = useState(edit ? String(edit.amount) : presetAmount ? String(presetAmount) : "");
  const [category, setCategory] = useState(cat);
  const [day, setDay] = useState(edit?.occurred_on ?? todayIstanbul());
  const [note, setNote] = useState(edit?.note ?? presetNote ?? "");
  const [credit, setCredit] = useState(edit?.on_credit ?? false);
  const [vendor, setVendor] = useState(edit?.vendor ?? "");
  const [chargeTo, setChargeTo] = useState<string | null>(edit?.charge_to ?? null);
  const [placeId, setPlaceId] = useState<string | null>(edit?.place_id ?? presetPlace ?? null);
  const placeIs = (id: string | null) => places.find((p) => p.id === id)?.custom?.is || null;
  const [branch, setBranch] = useState<string | null>((edit?.data?.branch as string) ?? placeIs(edit?.place_id ?? presetPlace ?? null));
  const pickPlace = (id: string | null) => { setPlaceId(id); const b = placeIs(id); if (b) setBranch(b); };
  const [toStock, setToStock] = useState(false);
  const [stItem, setStItem] = useState<string | null>(null);
  const [stName, setStName] = useState("");
  const [stQty, setStQty] = useState("");
  const [stUnit, setStUnit] = useState(stockUnits[0] ?? "adet");
  const sameCat = stockItems.filter((i) => i.category === stockCategory);
  const [linkId, setLinkId] = useState<string | null>(link ? ((edit?.data?.[link.key] as string) ?? presetLink ?? null) : null);
  const [photo, setPhoto] = useState<string | null>(edit?.photo_path ?? presetPhoto ?? null);
  const [more, setMore] = useState((!!edit && !!(edit.note || edit.on_credit || edit.charge_to || edit.photo_path || edit.occurred_on !== todayIstanbul())));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    const n = num(amount);
    if (!(n > 0) || n > 100000000) { setError("Tutarı yaz. Örnek: 2000"); return; }
    if (credit && !vendor.trim()) { setError("Veresiye ise kime borçlu olduğunu yaz."); return; }
    if (toStock && !(num(stQty) > 0)) { setError("Depoya kaç tane eklendiğini yaz ya da “Depoya da ekle”yi kapat."); return; }
    if (toStock && !stItem && !stName.trim()) { setError("Depodaki malzemeyi seç ya da yeni adını yaz."); return; }
    setBusy(true);
    try {
      await onSave({
        occurred_on: day, category, amount: n, note: note.trim() || null, on_credit: credit, vendor: credit ? vendor.trim() : null,
        paid_amount: edit?.paid_amount ?? 0, charge_to: chargeTo, place_id: placeId, photo_path: photo,
        ...(link || branches.length > 1 || onAddBranch ? { data: { ...(edit?.data ?? {}), ...(link ? { [link.key]: linkId } : {}), ...(branches.length > 1 || onAddBranch ? { branch } : {}) } } : {}),
      }, toStock && stockCategory ? { itemId: stItem, name: stName.trim() || cat, qty: num(stQty) || 0, unit: stUnit, category: stockCategory } : null);
    } catch { setError("Kaydedemedim, tekrar dene."); setBusy(false); }
  };

  const pickPhoto = async (f: File | undefined) => {
    if (!f) return;
    if (!navigator.onLine) { setError("Fotoğraf eklemek için internet lazım. Masrafı şimdi kaydedip fotoğrafı sonra ekleyebilirsin."); return; }
    setBusy(true); setError("");
    try { setPhoto(await uploadReceipt(biz.id, f)); } catch { setError("Fotoğrafı yükleyemedim, tekrar dene."); }
    setBusy(false);
  };

  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={edit ? "Masrafı düzenle" : "Yeni masraf"} title={category} />
      {edit && categories.length > 0 && (
        <Pick label="Masrafın türü" value={category} onChange={(v) => v && setCategory(v)} options={[...categories, ...(categories.includes(cat) ? [] : [cat])].map((c) => ({ value: c, label: c }))} />
      )}
      <TextField id="masraf_tutar" label="Kaç TL?" inputMode="decimal" autoFocus={!edit} maxLength={12} placeholder="Örnek: 2000"
        value={amount} onChange={(e) => setAmount(e.target.value)} style={{ fontSize: "1.8rem", fontWeight: 800 }} />
      {!edit && lastAmount && <Chip onClick={() => setAmount(String(lastAmount))}>Geçen sefer: {formatTL(lastAmount)}</Chip>}
      {places.length > 0 && (
        <div className="ui-stack" style={{ gap: 8 }}>
          <Pick label="Hangi tarla?" value={placeId} onChange={pickPlace} options={[{ value: null, label: noPlaceLabel, hint: "Belli bir tarlaya ait değil (mazot, tamir, sigorta…)" }, ...places.map((p) => ({ value: p.id, label: p.name })),
            ...(!edit && places.length > 1 ? [{ value: SPLIT, label: "Tarlalara böl", hint: "Tutar tarlalara dekarına göre paylaştırılır" }] : [])]} />
          {placeId === SPLIT && (() => {
            const ps = places.filter((p) => Number(p.custom?.donum) > 0).length ? places.filter((p) => Number(p.custom?.donum) > 0) : places;
            const w = ps.map((p) => Number(p.custom?.donum) || 1), W = w.reduce((a, b) => a + b, 0), a = num(amount) || 0;
            return <span className="ui-note" style={{ margin: 0 }}>{ps.some((p) => Number(p.custom?.donum) > 0) ? "Dekara göre" : "Eşit"} bölünür: {ps.map((p, k) => `${p.name} ${a ? formatTL(Math.round((a * w[k]) / W)) : `%${Math.round((w[k] / W) * 100)}`}`).join(" · ")}</span>;
          })()}
        </div>
      )}
      {(branches.length > 1 || onAddBranch) && (onAddBranch
        ? <PickWithAdd label="Hangi iş için?" items={branches} value={branch} onChange={setBranch} noneLabel="Genel (hepsi)" onAdd={onAddBranch} addLabel="+ Yeni iş" placeholder="Örnek: Buğday" />
        : <Pick label="Hangi iş için?" value={branch} onChange={setBranch} options={[{ value: null, label: "Genel (hepsi)" }, ...branches.map((b) => ({ value: b, label: b }))]} />)}
      {link && link.options.length > 0 && (
        <Pick label={link.label} value={linkId} onChange={setLinkId} options={[{ value: null, label: "Hiçbiri" }, ...link.options.map((o) => ({ value: o.id, label: o.name }))]} />
      )}

      {stockCategory && (
        <div className="ui-card ui-stack" style={{ gap: 10 }}>
          <label className="ui-check"><input type="checkbox" checked={toStock} onChange={(e) => setToStock(e.target.checked)} /> Depoya da ekle</label>
          {toStock && (
            <>
              <div className="ui-chips wrap">
                {sameCat.map((i) => <Chip key={i.id} selected={stItem === i.id} onClick={() => { setStItem(i.id); setStUnit(i.unit); }}>{i.name} · {i.quantity.toLocaleString("tr-TR")} {i.unit}</Chip>)}
                <Chip selected={!stItem} onClick={() => setStItem(null)}>+ Yeni malzeme</Chip>
              </div>
              {!stItem && <TextField id="st_ad" label="Malzemenin adı" placeholder={stockCategory === "Gübre" ? "Örnek: 20-20-0" : "Örnek: Decis"} maxLength={80} value={stName} onChange={(e) => setStName(e.target.value)} />}
              <TextField id="st_miktar" label="Kaç tane / ne kadar?" inputMode="decimal" maxLength={10} value={stQty} onChange={(e) => setStQty(e.target.value)} />
              {!stItem && <div className="ui-chips wrap">{stockUnits.map((u) => <Chip key={u} selected={stUnit === u} onClick={() => setStUnit(u)}>{u}</Chip>)}</div>}
            </>
          )}
        </div>
      )}
      {!more && photo && <span className="ui-note" style={{ margin: 0 }}>📷 Fiş fotoğrafı eklendi. <button type="button" className="ui-link" style={{ display: "inline", padding: 0, minHeight: 0 }} onClick={() => onPhoto(photo)}>Gör</button></span>}
      {!more ? (
        <button type="button" className="ui-link" onClick={() => setMore(true)}>Detaylandır / düzenle</button>
      ) : (
        <>
          <TextField id="masraf_gun" label="Tarih" type="date" max={todayIstanbul()} value={day} onChange={(e) => setDay(e.target.value)} />
          <TextField id="masraf_not" label="Not (isteğe bağlı)" placeholder="Örnek: Manisa yolunda" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />

          <div className="ui-stack" style={{ gap: 8 }}>
            <span className="ui-label">Ödeme</span>
            <div className="ui-seg">
              <button type="button" className="evet" aria-pressed={!credit} onClick={() => setCredit(false)}>Ödedim</button>
              <button type="button" className="hayir" aria-pressed={credit} onClick={() => setCredit(true)}>Veresiye</button>
            </div>
            {credit && (
              <>
                <TextField id="masraf_kime" label="Kime borçlusun?" placeholder="Örnek: Petrol Ofisi, Ahmet usta" maxLength={80} value={vendor} onChange={(e) => setVendor(e.target.value)} />
                {vendors.length > 0 && <div className="ui-chips wrap">{vendors.map((v) => <Chip key={v} selected={vendor === v} onClick={() => setVendor(v)}>{v}</Chip>)}</div>}
              </>
            )}
          </div>

          {farmers.length > 0 && (
            <div className="ui-stack" style={{ gap: 8 }}>
              <span className="ui-label">Çiftçiye yansıt (isteğe bağlı)</span>
              <div className="ui-chips wrap">
                <Chip selected={!chargeTo} onClick={() => setChargeTo(null)}>Hayır</Chip>
                {farmers.map((f) => <Chip key={f.id} selected={chargeTo === f.id} onClick={() => setChargeTo(f.id)}>{f.full_name}</Chip>)}
              </div>
              {chargeTo && <span className="ui-note" style={{ margin: 0 }}>Bu tutar çiftçinin borcuna eklenir, senin masrafına sayılmaz.</span>}
            </div>
          )}

          <div className="ui-stack" style={{ gap: 8 }}>
            <span className="ui-label">Fiş / fatura fotoğrafı (isteğe bağlı)</span>
            {photo ? (
              <div className="ui-seg">
                <button type="button" onClick={() => onPhoto(photo)}>Fotoğrafı gör</button>
                <button type="button" onClick={() => setPhoto(null)}>Kaldır</button>
              </div>
            ) : (
              <label className="ui-main-btn ikincil" style={{ cursor: "pointer" }}>
                Fotoğraf çek / seç
                <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => pickPhoto(e.target.files?.[0])} />
              </label>
            )}
          </div>
        </>
      )}
      {error && <ErrorText>{error}</ErrorText>}
      {onDelete && <MainButton className="tehlike" onClick={onDelete}>Bu masrafı sil</MainButton>}
      <div className="ui-sticky-bottom"><MainButton disabled={busy} onClick={save}>{busy ? "Bekle…" : "Kaydet"}</MainButton></div>
    </main>
  );
}

function OdemeGir({ vendor, owedAmount, onSave, onCancel }: { vendor: string; owedAmount: number; onSave: (n: number) => Promise<void>; onCancel: () => void }) {
  const [v, setV] = useState("");
  const [err, setErr] = useState("");
  return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={`Borcun: ${formatTL(owedAmount)}`} title={`Ödeme: ${vendor}`} />
      <TextField id="ode_tutar" label="Kaç TL ödedin?" inputMode="decimal" autoFocus maxLength={12} value={v} onChange={(e) => setV(e.target.value)} style={{ fontSize: "1.8rem", fontWeight: 800 }} />
      <Chip onClick={() => setV(String(owedAmount))}>Hepsini ödedim: {formatTL(owedAmount)}</Chip>
      {err && <ErrorText>{err}</ErrorText>}
      <MainButton onClick={async () => { const n = num(v); if (!(n > 0)) { setErr("Tutarı yaz."); return; } await onSave(n); }}>Kaydet</MainButton>
    </main>
  );
}

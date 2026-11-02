"use client";
// Ortak masraf ekranı (dayıbaşı + çiftçi defteri). Ürün farkları prop olarak gelir.
import { useCallback, useEffect, useState } from "react";
import { useOnActivate, useTabParams } from "@/core/shell/TabShell";
import { useBusiness, useSetBusiness } from "@/core/auth/AuthGate";
import { todayIstanbul } from "@/core/events/api";
import {
  addExpense, deleteExpense, listExpenses, owed, payVendor, receiptUrl, restoreExpense, updateExpense, uploadReceipt, type Expense,
} from "@/core/expenses/api";
import { downloadXlsx } from "@/core/export/xlsx";
import { formatTL } from "@/core/ledger/api";
import type { Person } from "@/core/people/api";
import type { Place } from "@/core/places/api";
import { addItem, deleteItem, listItems, updateItem, type Item } from "@/core/inventory/api";
import { supabase } from "@/core/supabase/client";
import { BackButton, BottomNav, Chip, DoneCard, ErrorText, MainButton, PageHeader, TextField, type NavItem } from "@/core/ui";

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
  periodSummary?: (total: number) => React.ReactNode;
  /** Ek bağlantı (ör. fidan partisi): seçilen id data[key]'e yazılır. */
  link?: { label: string; key: string; options: { id: string; name: string }[]; param: string };
  /** Masrafla birlikte depoya ekleme: masraf türü → depo türü (yoksa null). */
  stock?: { categoryOf: (expenseCategory: string) => string | null; units: readonly string[] };
  /** Verilirse türler hazır (düzenlenmiş) liste olarak gelir ve "Türleri düzenle" bağlantısı çıkar. */
  onEditCategories?: () => void;
};
type StockAdd = { itemId: string | null; name: string; qty: number; unit: string; category: string };

type View = { v: "list" } | { v: "tur" } | { v: "form"; cat: string; edit?: Expense } | { v: "veresiye" } | { v: "ode"; vendor: string } | { v: "foto"; url: string };
type Done = { message: string; undo?: () => Promise<void> } | null;
const num = (s: string) => Number(s.replace(/\./g, "").replace(",", "."));
const monthName = (m: string) => new Date(m + "-15T12:00:00").toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

export function ExpenseScreen({ categories: baseCats, chargeTargets = [], places = [], summary, summaryRows, navItems, current, headerRight, memberName, period, periodPicker, periodSummary, link, stock, onEditCategories }: ExpenseScreenProps) {
  const biz = useBusiness();
  const setBiz = useSetBusiness();
  const [items, setItems] = useState<Expense[] | null>(null);
  const farmers = chargeTargets;
  const [view, setView] = useState<View>({ v: "list" });
  const [presetPlace, setPresetPlace] = useState<string | null>(null);
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
  useEffect(() => { if (tp.p.yeni) { setDone(null); setPresetPlace(tp.p.tarla ? String(tp.p.tarla) : null); setPresetLink(link && tp.p[link.param] ? String(tp.p[link.param]) : null); setView({ v: "tur" }); } }, [tp.n]); // eslint-disable-line react-hooks/exhaustive-deps

  const custom = (Array.isArray(biz.settings?.expense_categories) ? biz.settings!.expense_categories : []) as string[];
  const categories = onEditCategories ? [...baseCats] : [...baseCats.filter((c) => c !== "Diğer"), ...custom.filter((c) => !baseCats.includes(c)), "Diğer"];
  const all = items ?? [];
  const lastOf = (cat: string) => all.find((e) => e.category === cat)?.amount;
  const vendors = [...new Set(all.map((e) => e.vendor).filter(Boolean) as string[])];
  const farmerName = (id: string | null) => farmers.find((f) => f.id === id)?.full_name ?? "";

  // --- Tür seç
  if (view.v === "tur") {
    return <TurSec categories={categories} lastOf={lastOf} onEdit={onEditCategories} onCancel={() => setView({ v: "list" })}
      onPick={(cat) => setView({ v: "form", cat })}
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
    return <MasrafForm cat={view.cat} edit={ed} lastAmount={lastOf(view.cat)} vendors={vendors} farmers={farmers} places={places} presetPlace={presetPlace} link={link} presetLink={presetLink}
      stockCategory={stock && !ed ? stock.categoryOf(view.cat) : null} stockUnits={stock?.units ?? []} stockItems={stockItems}
      onCancel={() => setView({ v: "list" })}
      onSave={async (input, add) => {
        if (ed) {
          const before = { ...ed };
          await updateExpense(ed.id, input);
          setDone({ message: `Değiştirdim: ${input.category} ${formatTL(input.amount)}.`, undo: () => updateExpense(ed.id, before) });
        } else {
          const e = await addExpense(biz.id, input);
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

  const excel = () => downloadXlsx(`masraflar-${bySeason ? period!.name.replace(/\s+/g, "-") : month}`, [
    { name: "Masraflar", title: `${biz.name} · Masraflar · ${label}`, rows: [
      ["Tarih", "Tür", "Tutar (TL)", ...(places.length ? ["Tarla"] : []), "Not", "Veresiye (kime)", "Kalan borç (TL)", ...(farmers.length ? ["Çiftçiye yansıtıldı"] : []), "Fiş", ...(memberName ? ["Giren"] : [])],
      ...inMonth.slice().sort((a, b) => a.occurred_on.localeCompare(b.occurred_on)).map((e) => [
        `${e.occurred_on.slice(8)}.${e.occurred_on.slice(5, 7)}.${e.occurred_on.slice(0, 4)}`, e.category, e.amount, ...(places.length ? [placeName(e.place_id)] : []), e.note ?? "",
        e.on_credit ? e.vendor ?? "" : "", e.on_credit ? owed(e) : "", ...(farmers.length ? [farmerName(e.charge_to)] : []), e.photo_path ? "var" : "",
        ...(memberName ? [memberName((e as Expense & { created_by?: string }).created_by)] : [])]),
    ] },
    { name: "Özet", title: `${biz.name} · Masraf özeti · ${label}`, rows: [
      [label, ""], [],
      ["Tür", "Toplam (TL)"], ...byCat.map((x) => [x.c, x.t]), ["Toplam masraf", total], [],
      ...(bySeason ? [["Ay", "Toplam (TL)"], ...perMonth.map((x) => [monthName(x.m), x.t]), []] : summaryRows ? summaryRows(month, total) : []),
      ...(charged ? [["Çiftçiye yansıtılan", charged]] : []), ["Veresiye borcun (bugün)", totalOwed],
    ] },
  ]);

  return (
    <main className="ui-has-nav ui-stack">
      <PageHeader sub={label} title="Masraf" right={headerRight} />
      {done && <DoneCard message={done.message} onUndo={done.undo ? async () => { await done.undo!(); setDone(null); load(); } : undefined} />}
      {error && <ErrorText>{error}</ErrorText>}
      <MainButton onClick={() => { setDone(null); setView({ v: "tur" }); }}>+ Masraf ekle</MainButton>

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
        ? (periodSummary ? periodSummary(total) : <div className="ui-total"><span>{label} masraf</span><b>{formatTL(total)}</b></div>)
        : summary ? summary(month, total) : <div className="ui-total"><span>Bu ay masraf</span><b>{formatTL(total)}</b></div>}
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
      {days.map((d) => (
        <section key={d} className="ui-stack" style={{ gap: 8 }}>
          <h2 style={{ margin: "6px 4px 0", fontSize: "1.05rem" }}>{dayText(d)}</h2>
          {inMonth.filter((e) => e.occurred_on === d).map((e) => (
            <button key={e.id} type="button" className="ui-moneyrow" style={{ width: "100%", font: "inherit", textAlign: "left", cursor: "pointer" }}
              onClick={() => { setDone(null); setView({ v: "form", cat: e.category, edit: e }); }}>
              <b style={{ minWidth: 0 }}>{e.category}{e.photo_path ? " · fişli" : ""}
                <small>{[placeName(e.place_id), e.note, memberName ? memberName((e as Expense & { created_by?: string }).created_by) : "", e.on_credit ? `Veresiye: ${e.vendor}${owed(e) ? "" : " (ödendi)"}` : "", e.charge_to ? `Yansıtıldı: ${farmerName(e.charge_to)}` : ""].filter(Boolean).join(" · ") || "Düzenlemek için dokun"}</small></b>
              <strong>{formatTL(e.amount)}</strong>
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
  categories: string[]; onEdit?: () => void; lastOf: (c: string) => number | undefined; onPick: (c: string) => void; onCancel: () => void; onAddCategory: (n: string) => Promise<void>;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub="Yeni masraf" title="Ne için harcadın?" />
      <div className="ui-tiles">
        {categories.map((c) => (
          <button key={c} type="button" onClick={() => onPick(c)}>
            <b>{c}</b>{lastOf(c) ? <small>son: {formatTL(lastOf(c)!)}</small> : null}
          </button>
        ))}
        <button type="button" className="add" onClick={() => (onEdit ? onEdit() : setAdding(true))}><b>{onEdit ? "Türleri düzenle" : "+ Yeni tür"}</b></button>
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

function MasrafForm({ cat, edit, lastAmount, vendors, farmers, places, presetPlace, link, presetLink, stockCategory, stockUnits = [], stockItems = [], onSave, onCancel, onDelete, onPhoto }: {
  stockCategory?: string | null; stockUnits?: readonly string[]; stockItems?: Item[];
  cat: string; edit?: Expense; lastAmount?: number; vendors: string[]; farmers: Person[]; places: Place[]; presetPlace?: string | null;
  link?: ExpenseScreenProps["link"]; presetLink?: string | null;
  onSave: (e: Omit<Expense, "id" | "business_id" | "created_at" | "data"> & { data?: Record<string, unknown> }, stockAdd?: StockAdd | null) => Promise<void>; onCancel: () => void;
  onDelete?: () => Promise<void>; onPhoto: (path: string) => void;
}) {
  const biz = useBusiness();
  const [amount, setAmount] = useState(edit ? String(edit.amount) : "");
  const [day, setDay] = useState(edit?.occurred_on ?? todayIstanbul());
  const [note, setNote] = useState(edit?.note ?? "");
  const [credit, setCredit] = useState(edit?.on_credit ?? false);
  const [vendor, setVendor] = useState(edit?.vendor ?? "");
  const [chargeTo, setChargeTo] = useState<string | null>(edit?.charge_to ?? null);
  const [placeId, setPlaceId] = useState<string | null>(edit?.place_id ?? presetPlace ?? null);
  const [toStock, setToStock] = useState(false);
  const [stItem, setStItem] = useState<string | null>(null);
  const [stName, setStName] = useState("");
  const [stQty, setStQty] = useState("");
  const [stUnit, setStUnit] = useState(stockUnits[0] ?? "adet");
  const sameCat = stockItems.filter((i) => i.category === stockCategory);
  const [linkId, setLinkId] = useState<string | null>(link ? ((edit?.data?.[link.key] as string) ?? presetLink ?? null) : null);
  const [photo, setPhoto] = useState<string | null>(edit?.photo_path ?? null);
  const [more, setMore] = useState(!!edit && !!(edit.note || edit.on_credit || edit.charge_to || edit.photo_path || edit.occurred_on !== todayIstanbul()));
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
        occurred_on: day, category: cat, amount: n, note: note.trim() || null, on_credit: credit, vendor: credit ? vendor.trim() : null,
        paid_amount: edit?.paid_amount ?? 0, charge_to: chargeTo, place_id: placeId, photo_path: photo,
        ...(link ? { data: { ...(edit?.data ?? {}), [link.key]: linkId } } : {}),
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
      <PageHeader sub={edit ? "Masrafı düzenle" : "Yeni masraf"} title={cat} />
      <TextField id="masraf_tutar" label="Kaç TL?" inputMode="decimal" autoFocus={!edit} maxLength={12} placeholder="Örnek: 2000"
        value={amount} onChange={(e) => setAmount(e.target.value)} style={{ fontSize: "1.8rem", fontWeight: 800 }} />
      {!edit && lastAmount && <Chip onClick={() => setAmount(String(lastAmount))}>Geçen sefer: {formatTL(lastAmount)}</Chip>}
      {places.length > 0 && (
        <div className="ui-stack" style={{ gap: 8 }}>
          <span className="ui-label">Hangi tarla?</span>
          <div className="ui-chips wrap">
            <Chip selected={!placeId} onClick={() => setPlaceId(null)}>Genel</Chip>
            {places.map((p) => <Chip key={p.id} selected={placeId === p.id} onClick={() => setPlaceId(p.id)}>{p.name}</Chip>)}
          </div>
        </div>
      )}
      {link && link.options.length > 0 && (
        <div className="ui-stack" style={{ gap: 8 }}>
          <span className="ui-label">{link.label}</span>
          <div className="ui-chips wrap">
            <Chip selected={!linkId} onClick={() => setLinkId(null)}>Hiçbiri</Chip>
            {link.options.map((o) => <Chip key={o.id} selected={linkId === o.id} onClick={() => setLinkId(o.id)}>{o.name}</Chip>)}
          </div>
        </div>
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
      {!more ? (
        <button type="button" className="ui-link" onClick={() => setMore(true)}>Tarih, not, veresiye, çiftçiye yansıt, fiş fotoğrafı…</button>
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

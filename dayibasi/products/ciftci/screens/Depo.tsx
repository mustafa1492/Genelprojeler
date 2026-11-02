"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { useMembers } from "@/core/auth/members";
import { addItem, deleteItem, listItems, restoreItem, updateItem, type Item } from "@/core/inventory/api";
import { downloadXlsx } from "@/core/export/xlsx";
import { BackButton, BottomNav, Chip, DoneCard, ErrorText, MainButton, PageHeader, TextField } from "@/core/ui";
import { config } from "../config";
import { num } from "../kayit";
import { HistoryLink, navItems } from "../nav";

type Done = { message: string; undo?: () => Promise<void> } | null;
const fmt = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

/** Depo / envanter: malzemeleri tek tek ekle, miktarı − / + ile değiştir. */
export default function Depo() {
  const biz = useBusiness();
  const { nameOf } = useMembers(biz.id);
  const [items, setItems] = useState<Item[] | null>(null);
  const [form, setForm] = useState<{ edit?: Item } | null>(null);
  const [done, setDone] = useState<Done>(null);
  const [cat, setCat] = useState("Hepsi");
  const load = useCallback(() => { listItems(biz.id).then(setItems).catch(() => setItems([])); }, [biz.id]);
  useEffect(load, [load]);

  const step = async (i: Item, d: number) => {
    const q = Math.max(0, i.quantity + d);
    setItems((items ?? []).map((x) => (x.id === i.id ? { ...x, quantity: q } : x)));
    await updateItem(i.id, { quantity: q });
    setDone({ message: `${i.name}: ${fmt(q)} ${i.unit}.`, undo: () => updateItem(i.id, { quantity: i.quantity }) });
  };

  if (form) return <ItemForm edit={form.edit} onCancel={() => setForm(null)}
    onDelete={form.edit ? async () => { const i = form.edit!; await deleteItem(i.id); setDone({ message: `Sildim: ${i.name}.`, undo: () => restoreItem(i) }); setForm(null); load(); } : undefined}
    onSave={async (v) => {
      if (form.edit) { const before = { ...form.edit }; await updateItem(before.id, v); setDone({ message: `Değiştirdim: ${v.name}.`, undo: () => updateItem(before.id, before) }); }
      else { const i = await addItem(biz.id, v); setDone({ message: `Depoya ekledim: ${i.name}, ${fmt(i.quantity)} ${i.unit}.`, undo: () => deleteItem(i.id) }); }
      setForm(null); load();
    }} />;

  const all = items ?? [];
  const cats = ["Hepsi", ...config.inventory.categories.filter((c) => all.some((i) => i.category === c))];
  const shown = all.filter((i) => cat === "Hepsi" || i.category === cat);

  return (
    <main className="ui-has-nav ui-stack">
      <PageHeader sub={`${all.length} malzeme`} title="Depo" right={<HistoryLink />} />
      {done && <DoneCard message={done.message} onUndo={done.undo ? async () => { await done.undo!(); setDone(null); load(); } : undefined} />}
      <MainButton onClick={() => { setDone(null); setForm({}); }}>+ Malzeme ekle</MainButton>
      {cats.length > 2 && <div className="ui-chips">{cats.map((c) => <Chip key={c} selected={c === cat} onClick={() => setCat(c)}>{c}</Chip>)}</div>}
      {items && all.length === 0 && <div className="ui-empty">Depo boş. Gübre, ilaç, tohum ya da malzemeleri tek tek ekle.</div>}
      {shown.map((i) => (
        <div key={i.id} className={`ui-card ui-stock${i.quantity <= 0 ? " empty" : ""}`}>
          <button type="button" className="ui-plain" style={{ flex: 1, minWidth: 0 }} onClick={() => { setDone(null); setForm({ edit: i }); }}>
            <b style={{ fontSize: "1.05rem" }}>{i.name}</b>
            <span className="ui-note" style={{ margin: 0 }}>{[i.category, i.quantity <= 0 ? "Bitti" : "", nameOf(i.created_by)].filter(Boolean).join(" · ")}</span>
          </button>
          <div className="ui-stepper">
            <button type="button" aria-label={`${i.name} azalt`} onClick={() => step(i, -1)} disabled={i.quantity <= 0}>−</button>
            <output><b>{fmt(i.quantity)}</b><small>{i.unit}</small></output>
            <button type="button" aria-label={`${i.name} artır`} onClick={() => step(i, 1)}>+</button>
          </div>
        </div>
      ))}
      {all.length > 0 && <MainButton secondary onClick={() => downloadXlsx("depo", [{ name: "Depo", rows: [["Malzeme", "Tür", "Miktar", "Birim", "Not"],
        ...all.map((i) => [i.name, i.category, i.quantity, i.unit, i.note ?? ""])] }])}>Excel’e indir</MainButton>}
      <BottomNav items={navItems} current="/ciftci/depo" />
    </main>
  );
}

function ItemForm({ edit, onSave, onCancel, onDelete }: {
  edit?: Item; onSave: (v: Pick<Item, "name" | "category" | "unit" | "quantity" | "note">) => Promise<void>; onCancel: () => void; onDelete?: () => Promise<void>;
}) {
  const [name, setName] = useState(edit?.name ?? "");
  const [category, setCategory] = useState(edit?.category ?? "Gübre");
  const [unit, setUnit] = useState(edit?.unit ?? "kg");
  const [qty, setQty] = useState(edit ? String(edit.quantity) : "");
  const [note, setNote] = useState(edit?.note ?? "");
  const [error, setError] = useState("");
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub="Depo" title={edit ? "Malzemeyi düzenle" : "Yeni malzeme"} />
      <TextField id="d_ad" label="Adı" placeholder="Örnek: 20-20-0 gübre, Decis, Budama makası" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
      <div className="ui-stack" style={{ gap: 8 }}><span className="ui-label">Türü</span>
        <div className="ui-chips wrap">{config.inventory.categories.map((c) => <Chip key={c} selected={c === category} onClick={() => setCategory(c)}>{c}</Chip>)}</div></div>
      <div className="ui-stack" style={{ gap: 8 }}><span className="ui-label">Birimi</span>
        <div className="ui-chips wrap">{config.inventory.units.map((u) => <Chip key={u} selected={u === unit} onClick={() => setUnit(u)}>{u}</Chip>)}</div></div>
      <TextField id="d_miktar" label={`Miktar (${unit})`} inputMode="decimal" placeholder="Örnek: 10" maxLength={12} value={qty} onChange={(e) => setQty(e.target.value)} style={{ fontSize: "1.6rem", fontWeight: 800 }} />
      <TextField id="d_not" label="Not (isteğe bağlı)" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      {onDelete && <MainButton className="tehlike" onClick={onDelete}>Depodan sil</MainButton>}
      <div className="ui-sticky-bottom"><MainButton onClick={async () => {
        const q = qty === "" ? 0 : num(qty);
        if (!name.trim()) { setError("Adını yaz."); return; }
        if (!(q >= 0)) { setError("Miktarı doğru yaz."); return; }
        await onSave({ name: name.trim(), category, unit, quantity: q, note: note.trim() || null });
      }}>Kaydet</MainButton></div>
    </main>
  );
}

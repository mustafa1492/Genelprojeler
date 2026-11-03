"use client";
// Genel tablo düzenleyici: her tabloyu listeler, arar, ekler, değiştirir, siler. Sütunlar veritabanından okunur.
import { useCallback, useEffect, useMemo, useState } from "react";
import { columns as getCols, remove, rows as getRows, save, type Col, type Row } from "./api";

export const LABELS: Record<string, string> = {
  name: "Ad", category: "Tür", amount: "Tutar (TL)", note: "Not", notes: "Not", occurred_on: "Tarih", place_id: "Tarla", kind: "Kayıt türü",
  quantity: "Miktar / tutar", data: "Ayrıntılar (JSON)", custom: "Bilgiler (JSON)", settings: "Ayarlar (JSON)", on_credit: "Veresiye", vendor: "Kime borçlu",
  paid_amount: "Ödenen (TL)", photo_path: "Fiş fotoğrafı", charge_to: "Yansıtılan kişi", created_at: "Eklendi", created_by: "Ekleyen", unit: "Birim",
  min_qty: "Az kaldı sınırı", direction: "Yön", party: "Kim", due_on: "Vade", title: "Başlık", expires_on: "Bitiş", status: "Durum", product: "Ürün",
  planted_on: "Dikim", initial_count: "Başlangıç adedi", source: "Kaynak", phone: "Telefon", full_name: "Ad soyad", role: "Rol", code: "Kod",
  expires_at: "Geçerlilik", used_by: "Kullanan", person_id: "Kişi", business_id: "Defter", id: "Kimlik", subject_type: "Kime ait", subject_id: "Ait olduğu",
  file_path: "Dosya", expense_id: "Masraf", action: "İşlem", table_name: "Tablo", undone_at: "Geri alındı", user_id: "Hesap",
};
const HIDE_IN_GRID = new Set(["id", "business_id", "row_key", "old_data", "new_data"]);
const isJson = (t: string) => t === "jsonb" || t === "json";
const isNum = (t: string) => ["numeric", "integer", "bigint", "smallint", "real", "double precision"].includes(t);
const show = (v: unknown, c: Col) => {
  if (v == null || v === "") return "";
  if (isJson(c.type)) { const s = JSON.stringify(v); return s.length > 60 ? s.slice(0, 60) + "…" : s; }
  if (c.type === "boolean") return v ? "Evet" : "Hayır";
  if (c.type.startsWith("timestamp")) return new Date(String(v)).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
  if (c.type === "date") { const s = String(v); return `${s.slice(8, 10)}.${s.slice(5, 7)}.${s.slice(0, 4)}`; }
  if (isNum(c.type)) return Number(v).toLocaleString("tr-TR");
  return String(v);
};

export function TableEditor({ table, business, fixed = {}, filter, lookups = {}, readOnly, title }: {
  table: string; business?: string | null; title?: string;
  fixed?: Row;                                   // yeni kayda otomatik (ör. business_id, kind)
  filter?: (r: Row) => boolean;                  // ör. olaylarda sadece gelir
  lookups?: Record<string, { id: string; name: string }[]>;   // ör. place_id → tarlalar
  readOnly?: boolean;
}) {
  const [cols, setCols] = useState<Col[]>([]);
  const [data, setData] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Row | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const load = useCallback(() => {
    setErr("");
    Promise.all([getCols(table), getRows(table, business)]).then(([c, r]) => { setCols(c); setData(r); }).catch((e) => setErr(e.message));
  }, [table, business]);
  useEffect(load, [load]);

  const list = useMemo(() => (data ?? []).filter((r) => (!filter || filter(r)) && (!q.trim() || JSON.stringify(r).toLocaleLowerCase("tr").includes(q.trim().toLocaleLowerCase("tr")))), [data, filter, q]);
  const grid = cols.filter((c) => !HIDE_IN_GRID.has(c.name) && !(c.name in fixed && c.name !== "kind")).slice(0, 9);
  const look = (c: string, v: unknown) => lookups[c]?.find((x) => x.id === v)?.name;

  return (
    <div className="pn-stack">
      <div className="pn-bar">
        {title && <h2>{title}</h2>}
        <input className="pn-input" placeholder="Ara…" value={q} onChange={(e) => setQ(e.target.value)} />
        <span className="pn-muted">{list.length} kayıt</span>
        {!readOnly && <button type="button" className="pn-btn" onClick={() => { setMsg(""); setEdit({ ...fixed }); }}>+ Yeni</button>}
        <button type="button" className="pn-btn ghost" onClick={load}>Yenile</button>
      </div>
      {err && <div className="pn-err">{err}</div>}
      {msg && <div className="pn-ok">{msg}</div>}
      {!data && !err && <div className="pn-muted">Yükleniyor…</div>}
      {data && (
        <div className="pn-table-wrap">
          <table className="pn-table">
            <thead><tr>{grid.map((c) => <th key={c.name}>{LABELS[c.name] ?? c.name}</th>)}</tr></thead>
            <tbody>
              {list.map((r, i) => (
                <tr key={String(r.id ?? i)} onClick={() => { setMsg(""); setEdit(r); }}>
                  {grid.map((c) => <td key={c.name} className={isNum(c.type) ? "num" : ""}>{look(c.name, r[c.name]) ?? show(r[c.name], c)}</td>)}
                </tr>
              ))}
              {!list.length && <tr><td colSpan={grid.length} className="pn-muted">Kayıt yok.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {edit && <RowForm table={table} cols={cols} row={edit} lookups={lookups} readOnly={readOnly}
        onClose={() => setEdit(null)}
        onSaved={(m) => { setEdit(null); setMsg(m); load(); }} />}
    </div>
  );
}

function RowForm({ table, cols, row, lookups, readOnly, onClose, onSaved }: {
  table: string; cols: Col[]; row: Row; lookups: Record<string, { id: string; name: string }[]>; readOnly?: boolean; onClose: () => void; onSaved: (m: string) => void;
}) {
  const isNew = !row.id;
  const [v, setV] = useState<Record<string, string | boolean>>(() => Object.fromEntries(cols.map((c) => {
    const x = row[c.name];
    if (c.type === "boolean") return [c.name, !!x];
    if (isJson(c.type)) return [c.name, x == null ? "" : JSON.stringify(x, null, 2)];
    return [c.name, x == null ? "" : String(x)];
  })));
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const editable = (c: Col) => !readOnly && !["id", "created_at", "created_by", "updated_at"].includes(c.name) && !(c.name === "business_id" && !isNew);

  const submit = async () => {
    setErr("");
    const out: Row = isNew ? {} : { id: row.id };
    for (const c of cols) {
      if (!editable(c) && !(isNew && c.name in row)) continue;
      const s = v[c.name];
      if (c.type === "boolean") { out[c.name] = !!s; continue; }
      const t = String(s ?? "").trim();
      if (t === "") { if (isNew && c.has_default) continue; if (c.nullable) { out[c.name] = null; continue; } if (isNew && c.name === "id") continue; setErr(`“${LABELS[c.name] ?? c.name}” boş olamaz.`); return; }
      if (isJson(c.type)) { try { out[c.name] = JSON.parse(t); } catch { setErr(`“${LABELS[c.name] ?? c.name}” geçerli JSON değil.`); return; } continue; }
      if (isNum(c.type)) { const n = Number(t.replace(",", ".")); if (!Number.isFinite(n)) { setErr(`“${LABELS[c.name] ?? c.name}” sayı olmalı.`); return; } out[c.name] = n; continue; }
      out[c.name] = t;
    }
    setBusy(true);
    try { await save(table, out); onSaved(isNew ? "Eklendi." : "Kaydedildi."); } catch (e) { setErr((e as Error).message); }
    setBusy(false);
  };
  const del = async () => {
    if (!confirm("Bu kayıt kalıcı olarak silinsin mi?")) return;
    setBusy(true);
    try { await remove(table, String(row.id)); onSaved("Silindi."); } catch (e) { setErr((e as Error).message); setBusy(false); }
  };

  return (
    <div className="pn-drawer-bg" onClick={onClose}>
      <aside className="pn-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="pn-bar"><h2>{isNew ? "Yeni kayıt" : readOnly ? "Kayıt" : "Kaydı düzenle"}</h2><button type="button" className="pn-btn ghost" onClick={onClose}>Kapat</button></div>
        <div className="pn-form">
          {cols.map((c) => {
            const lab = LABELS[c.name] ?? c.name;
            const dis = !editable(c);
            if (isNew && dis && !(c.name in row)) return null;
            const val = v[c.name];
            const set = (x: string | boolean) => setV({ ...v, [c.name]: x });
            let input: React.ReactNode;
            if (lookups[c.name]) input = <select className="pn-input" disabled={dis} value={String(val)} onChange={(e) => set(e.target.value)}><option value="">—</option>{lookups[c.name].map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>;
            else if (c.type === "boolean") input = <input type="checkbox" disabled={dis} checked={!!val} onChange={(e) => set(e.target.checked)} />;
            else if (isJson(c.type)) input = <textarea className="pn-input mono" rows={6} disabled={dis} value={String(val)} onChange={(e) => set(e.target.value)} />;
            else if (c.type === "date") input = <input className="pn-input" type="date" disabled={dis} value={String(val).slice(0, 10)} onChange={(e) => set(e.target.value)} />;
            else input = <input className="pn-input" disabled={dis} inputMode={isNum(c.type) ? "decimal" : undefined} value={String(val)} onChange={(e) => set(e.target.value)} />;
            return <label key={c.name} className="pn-field"><span>{lab}{!c.nullable && !c.has_default && !dis ? " *" : ""}</span>{input}</label>;
          })}
        </div>
        {err && <div className="pn-err">{err}</div>}
        {!readOnly && (
          <div className="pn-bar">
            <button type="button" className="pn-btn" disabled={busy} onClick={submit}>{busy ? "Bekle…" : "Kaydet"}</button>
            {!isNew && <button type="button" className="pn-btn danger" disabled={busy} onClick={del}>Sil</button>}
          </div>
        )}
      </aside>
    </div>
  );
}

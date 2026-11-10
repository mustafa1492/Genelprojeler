"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { listExpenses, receiptUrl, type Expense } from "@/core/expenses/api";
import { formatTL } from "@/core/ledger/api";
import { useBack, useGo, useOnActivate } from "@/core/shell/TabShell";
import { BackButton, MainButton, PageHeader } from "@/core/ui";
import { dayYear } from "../kayit";
import { listInbox, type Inbox } from "./Fis";

type Foto = { key: string; path: string; day: string; title: string; sub: string; expenseId?: string };
const PAGE = 24;

/** Eklenen bütün fotoğraflar tek yerde: masraflara eklenen fişler ve tutarı bekleyen fişler. İnternet ister (fotoğraflar sunucuda). */
export default function Fotograflar() {
  const biz = useBusiness();
  const go = useGo();
  const back = useBack();
  const [items, setItems] = useState<Foto[] | null>(null);
  const [urls, setUrls] = useState<Record<string, string | null>>({});
  const [n, setN] = useState(PAGE);
  const [open, setOpen] = useState<Foto | null>(null);
  const load = useCallback(() => {
    Promise.all([listExpenses(biz.id).catch(() => [] as Expense[]), listInbox(biz.id).catch(() => [] as Inbox[])]).then(([ex, inbox]) => {
      setItems([
        ...inbox.map((x): Foto => ({ key: "i" + x.id, path: x.photo_path, day: x.created_at.slice(0, 10), title: x.note || "Fiş", sub: "Tutarı bekliyor" })),
        ...ex.filter((e) => e.photo_path).map((e): Foto => ({ key: "e" + e.id, path: e.photo_path!, day: e.occurred_on, title: e.category, sub: formatTL(e.amount), expenseId: e.id })),
      ].sort((a, b) => b.day.localeCompare(a.day)));
    });
  }, [biz.id]);
  useEffect(load, [load]);
  useOnActivate(load);
  // Görünen fotoğrafların adreslerini sırayla al
  useEffect(() => {
    let live = true;
    (async () => {
      for (const f of (items ?? []).slice(0, n)) {
        if (!live) return;
        if (f.path in urls) continue;
        const u = await receiptUrl(f.path).catch(() => null);
        if (live) setUrls((m) => ({ ...m, [f.path]: u }));
      }
    })();
    return () => { live = false; };
  }, [items, n]); // eslint-disable-line react-hooks/exhaustive-deps

  if (open) {
    return (
      <main className="ui-stack">
        <BackButton onClick={() => setOpen(null)} label="Fotoğraflar" />
        <PageHeader sub={dayYear(open.day)} title={open.title} />
        {urls[open.path] ? <img src={urls[open.path]!} alt={`${open.title} fotoğrafı`} style={{ width: "100%", borderRadius: 14, background: "#fff" }} /> : <div className="ui-empty">Fotoğraf açılamadı (internet lazım).</div>}
        <p className="ui-note" style={{ margin: 0 }}>{open.sub}</p>
        {open.expenseId
          ? <MainButton secondary onClick={() => { const id = open.expenseId!; setOpen(null); go("masraf", { duzenle: id }); }}>Bu masrafı aç</MainButton>
          : <MainButton secondary onClick={() => { setOpen(null); go("masraf", { fisler: 1 }); }}>Masraf ekranında tutarını gir</MainButton>}
      </main>
    );
  }
  const list = items ?? [];
  return (
    <main className="ui-stack">
      <BackButton onClick={() => back()} label="Geri" />
      <PageHeader sub="Masraflara eklediğin fişler ve faturalar" title="Fotoğraflar" />
      {items && list.length === 0 && <div className="ui-empty">Henüz fotoğraf yok. Masraf eklerken ya da “Fiş” düğmesinden fotoğraf çekebilirsin.</div>}
      {!items && <div className="ui-empty">Yükleniyor…</div>}
      <div className="foto-izgara">
        {list.slice(0, n).map((f) => (
          <button key={f.key} type="button" onClick={() => setOpen(f)} aria-label={`${f.title}, ${dayYear(f.day)}, ${f.sub}`}>
            {urls[f.path] ? <img src={urls[f.path]!} alt="" loading="lazy" /> : <span className="bos">{f.path in urls ? "Açılamadı" : "…"}</span>}
            <b>{f.title}</b><small>{dayYear(f.day)} · {f.sub}</small>
          </button>
        ))}
      </div>
      {list.length > n && <MainButton secondary onClick={() => setN(n + PAGE)}>Daha fazla göster ({list.length - n})</MainButton>}
    </main>
  );
}

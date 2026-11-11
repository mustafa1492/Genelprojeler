"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { useMembers } from "@/core/auth/members";
import { listEvents, type EventRow } from "@/core/events/api";
import { listExpenses, type Expense } from "@/core/expenses/api";
import { formatTL } from "@/core/ledger/api";
import { listPlaces, type Place } from "@/core/places/api";
import { useGo, useOnActivate, useBack } from "@/core/shell/TabShell";
import { BackButton, Chip, PageHeader, TextField } from "@/core/ui";
import { GELIR, ISLEM } from "../kayit";
import { DeskTable, Tag } from "@/core/ui/DeskTable";

const monthName = (m: string) => new Date(m + "-15T12:00:00").toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
type Row = { id: string; kind: "Masraf" | "Gelir" | "Tarla işi"; day: string; title: string; sub: string; amount: number | null; by?: string | null; open: () => void };

/** Bütün kayıtlar tek listede: türe göre süz, ara, dokununca düzenle. */
export default function Kayitlar() {
  const biz = useBusiness();
  const go = useGo();
  const back = useBack();
  const { nameOf } = useMembers(biz.id);
  const [exp, setExp] = useState<Expense[]>([]);
  const [ev, setEv] = useState<EventRow[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [kind, setKind] = useState<Row["kind"] | null>(null);
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(60);
  const load = useCallback(() => {
    listExpenses(biz.id).then(setExp).catch(() => {});
    Promise.all([listEvents(biz.id, GELIR), listEvents(biz.id, ISLEM)]).then(([a, b]) => setEv([...a, ...b])).catch(() => {});
    listPlaces(biz.id).then(setPlaces).catch(() => {});
  }, [biz.id]);
  useEffect(load, [load]);
  useOnActivate(load);
  const pName = (id: string | null) => places.find((p) => p.id === id)?.name ?? "";

  const rows: Row[] = [
    ...exp.map((e): Row => ({ id: e.id, kind: "Masraf", day: e.occurred_on, title: e.category, amount: e.amount, by: e.created_by,
      sub: [pName(e.place_id), (e.data?.branch as string) || "", e.note ?? "", e.on_credit ? `veresiye: ${e.vendor}` : ""].filter(Boolean).join(" · "),
      open: () => go("masraf", { duzenle: e.id }) })),
    ...ev.map((e): Row => e.kind === GELIR
      ? { id: e.id, kind: "Gelir", day: e.occurred_on, title: String(e.data.type), amount: Number(e.quantity), by: e.created_by,
          sub: [pName(e.place_id), String(e.data.crop ?? ""), String(e.data.buyer ?? "")].filter(Boolean).join(" · "), open: () => go("gelir", { duzenle: e.id }) }
      : { id: e.id, kind: "Tarla işi", day: e.occurred_on, title: String(e.data.type) + (e.data.product ? ` · ${String(e.data.product)}` : ""), amount: null, by: e.created_by,
          sub: [pName(e.place_id), e.data.dose ? `doz ${String(e.data.dose)}` : "", String(e.data.note ?? "")].filter(Boolean).join(" · "), open: () => go("tarlalar", { islem: e.id }) }),
  ].filter((r) => !kind || r.kind === kind)
    .filter((r) => !q.trim() || `${r.title} ${r.sub}`.toLocaleLowerCase("tr").includes(q.trim().toLocaleLowerCase("tr")))
    .sort((a, b) => b.day.localeCompare(a.day));
  const shown = rows.slice(0, limit);
  const months = [...new Set(shown.map((r) => r.day.slice(0, 7)))];

  return (
    <main className="ui-stack">
      <BackButton onClick={() => back()} label="Geri" />
      <PageHeader sub="Masraf, gelir, tarla işleri" title="Kayıtlar" />
      <div className="ui-chips wrap">
        <Chip selected={!kind} onClick={() => setKind(null)}>Hepsi</Chip>
        {(["Masraf", "Gelir", "Tarla işi"] as const).map((k) => <Chip key={k} selected={kind === k} onClick={() => setKind(k)}>{k}</Chip>)}
      </div>
      <TextField id="k_ara" label="Ara" placeholder="Örnek: mazot, Kınık yolu" maxLength={40} value={q} onChange={(e) => setQ(e.target.value)} />
      <p className="ui-note" style={{ margin: 0 }}>Düzeltmek ya da silmek için kayda dokun.</p>
      {rows.length === 0 && <div className="ui-empty">Kayıt yok.</div>}
      <DeskTable rows={shown} rowKey={(r) => r.kind + r.id} onRow={(r) => r.open()}
        cols={[
          { label: "Tarih", cell: (r) => `${r.day.slice(8)}.${r.day.slice(5, 7)}.${r.day.slice(0, 4)}`, width: "110px" },
          { label: "Kayıt", cell: (r) => <Tag tone={r.kind === "Gelir" ? "yesil" : r.kind === "Masraf" ? "kirmizi" : "gri"}>{r.kind}</Tag>, width: "110px" },
          { label: "Ne", cell: (r) => <b>{r.title}</b> },
          { label: "Ayrıntı", cell: (r) => r.sub },
          { label: "Giren", cell: (r) => nameOf(r.by) },
          { label: "Tutar", num: true, cell: (r) => (r.amount === null ? "" : <b>{r.kind === "Gelir" ? "+" : "−"}{formatTL(r.amount)}</b>) },
        ]} />
      {months.map((m) => (
        <div key={m} className="ui-stack only-mobile" style={{ gap: 8 }}>
          <h2 className="ui-section">{monthName(m)}</h2>
          {shown.filter((r) => r.day.startsWith(m)).map((r) => (
            <button key={r.kind + r.id} type="button" className="ui-moneyrow" style={{ width: "100%", font: "inherit", textAlign: "left", cursor: "pointer" }} onClick={r.open}>
              <b style={{ minWidth: 0 }}>{r.kind} · {r.title}
                <small>{[`${Number(r.day.slice(8))} ${monthName(m).split(" ")[0]}`, r.sub, nameOf(r.by)].filter(Boolean).join(" · ")}</small></b>
              {r.amount !== null && <strong className="ui-money" style={{ color: r.kind === "Gelir" ? "var(--basari, inherit)" : undefined }}>{r.kind === "Gelir" ? "+" : "−"}{formatTL(r.amount)}</strong>}
            </button>
          ))}
        </div>
      ))}
      {rows.length > limit && <button type="button" className="ui-link" onClick={() => setLimit(limit + 60)}>Daha eski kayıtlar ({rows.length - limit})</button>}
    </main>
  );
}

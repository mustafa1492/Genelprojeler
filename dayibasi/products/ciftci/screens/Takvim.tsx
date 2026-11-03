"use client";
// Takvim: ay görünümünde tarla işleri, hasat beklemesi, satış/verim, vadeler, belgeler ve hatırlatmalar.
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { daysLeft, listDocs, type Doc } from "@/core/documents/api";
import { listDues, remaining, type Due } from "@/core/dues/api";
import { addEvent, deleteEvent, listEvents, updateEvent, type EventRow } from "@/core/events/api";
import { mutate } from "@/core/offline/store";
import { listPlaces, type Place } from "@/core/places/api";
import { useGo, useOnActivate, useTabParams } from "@/core/shell/TabShell";
import { BackButton, Chip, DoneCard, ErrorText, MainButton, PageHeader, TextField } from "@/core/ui";
import { dayYear, GELIR, harvestFrom, HATIRLAT, ISLEM, todayStr, VERIM } from "../kayit";
import { useRole } from "../rol";

type Mark = { day: string; kind: "is" | "hasat" | "satis" | "verim" | "vade" | "belge" | "hatir"; text: string; place?: string | null; ev?: EventRow };
const COLOR: Record<Mark["kind"], string> = { is: "var(--yesil, #2E6A2B)", hasat: "#C98A00", satis: "#1F7A8C", verim: "#7A5C1F", vade: "#B3261E", belge: "#6B4FA0", hatir: "#E07A00" };
const LABEL: Record<Mark["kind"], string> = { is: "Tarla işi", hasat: "Hasat olur", satis: "Satış", verim: "Verim", vade: "Vade", belge: "Belge bitişi", hatir: "Hatırlatma" };
const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const ym = (d: string) => d.slice(0, 7);
const addMonth = (m: string, k: number) => { const d = new Date(m + "-15T12:00:00Z"); d.setUTCMonth(d.getUTCMonth() + k); return d.toISOString().slice(0, 7); };
const monthName = (m: string) => new Date(m + "-15T12:00:00").toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

export default function Takvim() {
  const biz = useBusiness();
  const go = useGo();
  const { sees } = useRole();
  const money = sees("gelir");
  const vade = sees("vadeler");
  const [ev, setEv] = useState<EventRow[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [dues, setDues] = useState<Due[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [month, setMonth] = useState(ym(todayStr()));
  const [day, setDay] = useState<string>(todayStr());
  const [place, setPlace] = useState<string | null>(null);
  const [form, setForm] = useState<{ edit?: EventRow } | null>(null);
  const [done, setDone] = useState<{ message: string; undo?: () => Promise<unknown> } | null>(null);
  const load = useCallback(() => {
    Promise.all([listEvents(biz.id, ISLEM), listEvents(biz.id, VERIM), listEvents(biz.id, HATIRLAT), money ? listEvents(biz.id, GELIR) : Promise.resolve([] as EventRow[])])
      .then((r) => setEv(r.flat())).catch(() => {});
    listPlaces(biz.id).then(setPlaces).catch(() => {});
    if (vade) listDues(biz.id).then(setDues).catch(() => {});
    listDocs(biz.id).then(setDocs).catch(() => {});
  }, [biz.id, money, vade]);
  useEffect(load, [load]);
  useOnActivate(load);
  const tp = useTabParams();
  useEffect(() => { if (tp.p.yeni) { setDone(null); setForm({}); } }, [tp.n]); // eslint-disable-line react-hooks/exhaustive-deps
  const pName = (id: string | null | undefined) => places.find((p) => p.id === id)?.name ?? "";

  if (form) return <HatirlatForm places={places} edit={form.edit} defDay={day} onCancel={() => setForm(null)}
    onDelete={form.edit ? async () => { const e = form.edit!; await deleteEvent(e.id); setDone({ message: `Sildim: ${String(e.data.title)}.`, undo: () => mutate({ kind: "insert", table: "events", values: e }) }); setForm(null); load(); } : undefined}
    onSave={async (v) => {
      if (form.edit) { const o = form.edit; await updateEvent(o.id, v); setDone({ message: `Değiştirdim: ${String(v.data.title)}.`, undo: () => updateEvent(o.id, { occurred_on: o.occurred_on, place_id: o.place_id, data: o.data }) }); }
      else { const e = await addEvent(biz.id, { kind: HATIRLAT, person_id: null, quantity: null, ...v }); setDone({ message: `Hatırlatma kuruldu: ${dayYear(v.occurred_on)}, ${String(v.data.title)}.`, undo: () => deleteEvent(e.id) }); }
      setMonth(ym(v.occurred_on)); setDay(v.occurred_on); setForm(null); load();
    }} />;

  const marks: Mark[] = [
    ...ev.filter((e) => e.kind === ISLEM).map((e): Mark => ({ day: e.occurred_on, kind: "is", text: `${String(e.data.type)}${e.data.product ? ` · ${String(e.data.product)}` : ""}`, place: e.place_id, ev: e })),
    ...ev.filter((e) => e.kind === ISLEM && harvestFrom(e)).map((e): Mark => ({ day: harvestFrom(e)!, kind: "hasat", text: `Hasat edilebilir (${String(e.data.product ?? "ilaç")} beklemesi bitti)`, place: e.place_id })),
    ...ev.filter((e) => e.kind === GELIR).map((e): Mark => ({ day: e.occurred_on, kind: "satis", text: `${String(e.data.type)}${e.data.crop ? ` · ${String(e.data.crop)}` : ""}`, place: e.place_id, ev: e })),
    ...ev.filter((e) => e.kind === VERIM).map((e): Mark => ({ day: e.occurred_on, kind: "verim", text: `${Number(e.quantity).toLocaleString("tr-TR")} ${String(e.data.unit)} ${String(e.data.crop ?? "")}`, place: e.place_id, ev: e })),
    ...ev.filter((e) => e.kind === HATIRLAT).map((e): Mark => ({ day: e.occurred_on, kind: "hatir", text: `${e.data.done ? "✓ " : ""}${String(e.data.title)}`, place: e.place_id, ev: e })),
    ...dues.filter((d) => d.due_on && remaining(d) > 0).map((d): Mark => ({ day: d.due_on!, kind: "vade", text: `${d.direction === "borc" ? "Ödenecek" : "Alınacak"}: ${d.party}` })),
    ...docs.filter((d) => d.expires_on).map((d): Mark => ({ day: d.expires_on!, kind: "belge", text: `${d.title} bitiyor` })),
  ].filter((m) => !place || m.place === place);

  // Ay ızgarası (pazartesiden başlar)
  const first = new Date(month + "-01T12:00:00Z");
  const lead = (first.getUTCDay() + 6) % 7;
  const nDays = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: nDays }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`)];
  const today = todayStr();
  const onDay = marks.filter((m) => m.day === day);
  const lastYear = `${Number(day.slice(0, 4)) - 1}${day.slice(4)}`;
  const lastYearNear = marks.filter((m) => m.kind === "is" && Math.abs((Date.parse(m.day) - Date.parse(lastYear)) / 86400000) <= 7);

  const open = (m: Mark) => {
    if (m.kind === "hatir" && m.ev) { setDone(null); setForm({ edit: m.ev }); }
    else if (m.kind === "is" && m.ev) go("tarlalar", { islem: m.ev.id });
    else if (m.kind === "satis" && m.ev) go("gelir", { duzenle: m.ev.id });
    else if (m.kind === "vade") go("vadeler");
    else if (m.kind === "belge") go("belgeler");
    else if (m.place) go("tarlalar", { tarla: m.place });
  };

  return (
    <main className="ui-stack">
      <BackButton onClick={() => go("ozet")} label="Özet" />
      <PageHeader sub="Tarla işleri, hasat, vade, hatırlatma" title="Takvim" />
      {done && <DoneCard message={done.message} onUndo={done.undo ? async () => { await done.undo!(); setDone(null); load(); } : undefined} />}
      <MainButton onClick={() => { setDone(null); setForm({}); }}>+ Hatırlatma ekle</MainButton>
      {places.length > 1 && (
        <div className="ui-chips wrap">
          <Chip selected={!place} onClick={() => setPlace(null)}>Bütün tarlalar</Chip>
          {places.map((p) => <Chip key={p.id} selected={place === p.id} onClick={() => setPlace(p.id)}>{p.name}</Chip>)}
        </div>
      )}
      <div className="takvim-bas">
        <button type="button" onClick={() => setMonth(addMonth(month, -1))} aria-label="Önceki ay">‹</button>
        <b>{monthName(month)}</b>
        <button type="button" onClick={() => setMonth(addMonth(month, 1))} aria-label="Sonraki ay">›</button>
      </div>
      <div className="takvim">
        {DAYS.map((d) => <span key={d} className="gun-ad">{d}</span>)}
        {cells.map((c, i) => {
          if (!c) return <span key={i} />;
          const ms = marks.filter((m) => m.day === c);
          const kinds = [...new Set(ms.map((m) => m.kind))];
          return (
            <button key={c} type="button" className={`gun${c === day ? " secili" : ""}${c === today ? " bugun" : ""}`} onClick={() => setDay(c)} aria-label={`${dayYear(c)}, ${ms.length} kayıt`}>
              <span>{Number(c.slice(8))}</span>
              <i>{kinds.slice(0, 4).map((k) => <em key={k} style={{ background: COLOR[k] }} />)}</i>
            </button>
          );
        })}
      </div>
      <div className="takvim-renk">{(Object.keys(LABEL) as Mark["kind"][]).filter((k) => money || !["satis", "vade"].includes(k)).map((k) => <span key={k}><em style={{ background: COLOR[k] }} />{LABEL[k]}</span>)}</div>

      <h2 className="ui-section">{dayYear(day)}</h2>
      {onDay.length === 0 && <div className="ui-empty">Bu gün kayıt yok.</div>}
      {onDay.map((m, i) => (
        <button key={i} type="button" className="ui-moneyrow" style={{ width: "100%", font: "inherit", textAlign: "left", cursor: "pointer", borderLeft: `6px solid ${COLOR[m.kind]}` }} onClick={() => open(m)}>
          <b style={{ minWidth: 0 }}>{m.text}<small>{[LABEL[m.kind], pName(m.place)].filter(Boolean).join(" · ")}</small></b><span>›</span>
        </button>
      ))}
      {lastYearNear.length > 0 && (
        <div className="ui-card ui-stack" style={{ gap: 4 }}>
          <b>Geçen yıl bu günlerde</b>
          {lastYearNear.map((m, i) => <span key={i}>{dayYear(m.day)}: {m.text}{m.place ? ` (${pName(m.place)})` : ""}</span>)}
        </div>
      )}
      {(() => { const n = docs.filter((d) => (daysLeft(d.expires_on) ?? 99) < 0).length; return n ? <p className="ui-note">{n} belgenin süresi geçmiş.</p> : null; })()}
    </main>
  );
}

function HatirlatForm({ places, edit, defDay, onSave, onCancel, onDelete }: {
  places: Place[]; edit?: EventRow; defDay: string; onCancel: () => void; onDelete?: () => Promise<void>;
  onSave: (v: { occurred_on: string; place_id: string | null; data: Record<string, unknown> }) => Promise<void>;
}) {
  const [title, setTitle] = useState(String(edit?.data.title ?? ""));
  const [day, setDay] = useState(edit?.occurred_on ?? (defDay >= todayStr() ? defDay : todayStr()));
  const [placeId, setPlaceId] = useState<string | null>(edit?.place_id ?? null);
  const [doneF, setDoneF] = useState(!!edit?.data.done);
  const [error, setError] = useState("");
  const quick = ["İlaçlama", "Gübre", "Sulama", "Hasat", "Kira ödemesi", "Kredi taksiti", "ÇKS başvurusu", "Traktör muayenesi"];
  const plus = (k: number) => { const d = new Date(todayStr() + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + k); setDay(d.toISOString().slice(0, 10)); };
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={edit ? "Hatırlatmayı düzenle" : "Yeni hatırlatma"} title="Ne zaman, ne yapılacak?" />
      <TextField id="h_ne" label="Ne yapılacak?" placeholder="Örnek: Mısıra ikinci gübre" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="ui-chips wrap">{quick.map((q) => <Chip key={q} selected={title === q} onClick={() => setTitle(q)}>{q}</Chip>)}</div>
      <TextField id="h_gun" label="Hangi gün?" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
      <div className="ui-chips wrap">{[["Yarın", 1], ["1 hafta sonra", 7], ["2 hafta sonra", 14], ["1 ay sonra", 30]].map(([l, k]) => <Chip key={l} onClick={() => plus(Number(k))}>{l}</Chip>)}</div>
      {places.length > 0 && (
        <div className="ui-stack" style={{ gap: 8 }}>
          <span className="ui-label">Hangi tarla? (isteğe bağlı)</span>
          <div className="ui-chips wrap">
            <Chip selected={!placeId} onClick={() => setPlaceId(null)}>Genel</Chip>
            {places.map((p) => <Chip key={p.id} selected={placeId === p.id} onClick={() => setPlaceId(p.id)}>{p.name}</Chip>)}
          </div>
        </div>
      )}
      {edit && <label className="ui-check"><input type="checkbox" checked={doneF} onChange={(e) => setDoneF(e.target.checked)} /> Yapıldı</label>}
      {error && <ErrorText>{error}</ErrorText>}
      <div className="ui-sticky-bottom">
        <MainButton onClick={async () => {
          if (!title.trim()) { setError("Ne yapılacağını yaz."); return; }
          if (!day) { setError("Günü seç."); return; }
          await onSave({ occurred_on: day, place_id: placeId, data: { title: title.trim(), ...(doneF ? { done: true } : {}) } });
        }}>Kaydet</MainButton>
      </div>
      {onDelete && <button type="button" className="ui-link" style={{ color: "var(--tehlike)" }} onClick={onDelete}>Bu hatırlatmayı sil</button>}
    </main>
  );
}

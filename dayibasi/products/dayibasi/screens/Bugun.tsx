"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { addEvent, deleteEvent, listEvents, todayIstanbul, type EventRow } from "@/core/events/api";
import { formatTL } from "@/core/ledger/api";
import { addPerson, listPeople, type Person } from "@/core/people/api";
import { birthYear, displayName } from "@/core/people/birth";
import { addPlace, listPlaces, type Place } from "@/core/places/api";
import { listAnswers, tomorrowIstanbul } from "@/core/rsvp/api";
import {
  BackButton, BottomNav, Card, Chip, ChoiceButton, Counter, DoneCard, ErrorText, InfoRows, MainButton, PageHeader, PersonRow, StatusPill, TextField,
} from "@/core/ui";
import { config } from "../config";
import { dayText, defaults, PUANTAJ, split, workersOf } from "../hesap";
import { HistoryLink, navItems, SignOutLink } from "../nav";
import KayitDuzenle from "./KayitDuzenle";

const LAST_COUNT = "ko:son-kisi";
const LAST_WAGE = "ko:son-yevmiye";
const LAST_FEE = "ko:son-pay";
type Step = "list" | "tarla" | "isci" | "kisi" | "ucret" | "yeniTarla" | "detay";

const addDays = (d: string, n: number) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const weekStart = (d: string) => { const x = new Date(d + "T12:00:00Z"); const wd = (x.getUTCDay() + 6) % 7; return addDays(d, -wd); };

const undos: (() => Promise<void>)[] = [];

export default function Bugun() {
  const biz = useBusiness();
  const today = todayIstanbul();
  const [day, setDay] = useState(today);
  const [allEvents, setAllEvents] = useState<EventRow[] | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [farmers, setFarmers] = useState<Person[]>([]);
  const [workers, setWorkers] = useState<Person[]>([]);
  const [yesIds, setYesIds] = useState<string[]>([]);
  const [tomorrow, setTomorrow] = useState({ yes: 0, no: 0 });
  const [step, setStep] = useState<Step>("list");
  const [place, setPlace] = useState<Place | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [kisi, setKisi] = useState(10);
  const [wage, setWage] = useState(defaults(biz).wage);
  const [fee, setFee] = useState(defaults(biz).fee);
  const [detail, setDetail] = useState<EventRow | null>(null);
  const [done, setDone] = useState<{ message: string; ids: string[] } | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    Promise.all([
      listEvents(biz.id, PUANTAJ), listPlaces(biz.id), listPeople(biz.id, [config.farmers.kind]), listPeople(biz.id, ["isci"]),
      listAnswers(biz.id, day).catch(() => ({})), listAnswers(biz.id, tomorrowIstanbul()).catch(() => ({})),
    ]).then(([ev, pl, fa, wo, ans, tom]) => {
      setAllEvents(ev); setPlaces(pl); setFarmers(fa); setWorkers(wo);
      setYesIds(Object.entries(ans).filter(([, a]) => a === "evet").map(([id]) => id));
      const t = Object.values(tom);
      setTomorrow({ yes: t.filter((a) => a === "evet").length, no: t.filter((a) => a === "hayir").length });
    }).catch(() => setError("Bilgileri getiremedim."));
  }, [biz.id, day]);
  useEffect(load, [load]);
  useEffect(() => {
    try {
      const n = Number(localStorage.getItem(LAST_COUNT)); if (n > 0) setKisi(n);
      const w = Number(localStorage.getItem(LAST_WAGE)); if (w > 0) setWage(w);
      const f = localStorage.getItem(LAST_FEE); if (f !== null && Number(f) >= 0) setFee(Number(f));
    } catch { /* yok */ }
  }, []);

  const events = (allEvents ?? []).filter((e) => e.occurred_on === day);
  const count = picked.length || kisi;
  const farmerOf = (p?: Place | null) => farmers.find((f) => f.id === p?.owner_person_id);
  const placeOf = (id: string | null) => places.find((p) => p.id === id) ?? null;
  const placeLabel = (p?: Place | null) => {
    if (!p) return "Tarla";
    const f = farmerOf(p);
    return f ? (p.name && p.name !== f.full_name ? `${f.full_name} · ${p.name}` : f.full_name) : p.name;
  };
  const firstNames = (ids: string[]) => ids.map((id) => { const w = workers.find((x) => x.id === id); return w ? displayName(w, workers, true) : "?"; }).join(", ");
  const lastUse = (id: string) => (allEvents ?? []).filter((e) => e.place_id === id).map((e) => e.occurred_on + (e.created_at ?? "")).sort().pop() ?? "";
  const sortedPlaces = [...places].sort((a, b) => lastUse(b.id).localeCompare(lastUse(a.id)) || placeLabel(a).localeCompare(placeLabel(b), "tr"));

  // "Dünkü gibi": bu günden önceki son iş gününün kayıtları
  const prevDay = (allEvents ?? []).map((e) => e.occurred_on).filter((d) => d < day).sort().pop();
  const prevEvents = prevDay ? (allEvents ?? []).filter((e) => e.occurred_on === prevDay) : [];
  const repeatable = prevEvents.filter((p) => !events.some((e) => e.place_id === p.place_id));

  const isToday = day === today;
  const dayTitle = isToday ? "Bugün" : day === addDays(today, -1) ? "Dün" : dayText(day);
  const dayLong = new Date(day + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });

  const save = async () => {
    if (!place) return;
    const f = farmerOf(place);
    const ev = await addEvent(biz.id, {
      kind: PUANTAJ, occurred_on: day, place_id: place.id, person_id: f?.id ?? null, quantity: count,
      data: { wage, fee, ...(picked.length ? { workers: picked } : {}) },
    });
    try { localStorage.setItem(LAST_COUNT, String(count)); localStorage.setItem(LAST_WAGE, String(wage)); localStorage.setItem(LAST_FEE, String(fee)); } catch { /* yok */ }
    setDone({ message: `Kaydettim${isToday ? "" : ` (${dayText(day)})`}: ${placeLabel(place)}, ${count} kişi. İşçi başı ${formatTL(wage)}, senin payın ${formatTL(count * fee)}.`, ids: [ev.id] });
    setStep("list"); setPlace(null); setPicked([]);
    load();
  };
  const repeat = async (list: EventRow[]) => {
    const ids: string[] = [];
    for (const p of list) {
      const ev = await addEvent(biz.id, { kind: PUANTAJ, occurred_on: day, place_id: p.place_id, person_id: p.person_id, quantity: p.quantity, data: { ...p.data } });
      ids.push(ev.id);
    }
    setDone({ message: `Kaydettim: ${list.map((p) => `${placeLabel(placeOf(p.place_id))} ${p.quantity} kişi`).join(", ")}.`, ids });
    load();
  };
  const afterPlace = (p: Place) => { setPlace(p); setPicked([]); setStep(workers.length ? "isci" : "kisi"); };

  if (step === "yeniTarla") {
    return <YeniTarla farmers={farmers} onCancel={() => setStep("tarla")} onSaved={(p) => { load(); afterPlace(p); }} />;
  }

  if (step === "tarla") {
    return (
      <main className="ui-stack">
        <BackButton onClick={() => setStep("list")} label="Vazgeç" />
        <PageHeader sub={`1 / 3 · ${dayTitle}`} title="Hangi tarlaya gittiniz?" />
        {sortedPlaces.length === 0 && <div className="ui-empty">Henüz tarla yok. Aşağıdan ilk tarlanı ekle.</div>}
        {sortedPlaces.map((p) => <ChoiceButton key={p.id} selected={place?.id === p.id} onClick={() => afterPlace(p)}>{placeLabel(p)}</ChoiceButton>)}
        <MainButton secondary onClick={() => setStep("yeniTarla")}>+ Yeni tarla</MainButton>
      </main>
    );
  }

  if (step === "isci") {
    const toggle = (id: string) => setPicked(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id]);
    const yesHere = workers.filter((w) => yesIds.includes(w.id)).map((w) => w.id);
    return (
      <main className="ui-stack" style={{ paddingBottom: 120 }}>
        <BackButton onClick={() => setStep("tarla")} />
        <PageHeader sub={`2 / 3 · ${placeLabel(place)}`} title="Kimler gitti?" />
        <div className="ui-chips wrap">
          {yesHere.length > 0 && <Chip onClick={() => setPicked(yesHere)}>Yoklamada gelenler ({yesHere.length})</Chip>}
          <Chip onClick={() => setPicked(workers.map((w) => w.id))}>Hepsi</Chip>
          {picked.length > 0 && <Chip onClick={() => setPicked([])}>Temizle</Chip>}
        </div>
        {workers.map((w) => (
          <button key={w.id} type="button" className="ui-choice" aria-pressed={picked.includes(w.id)} onClick={() => toggle(w.id)}>
            <PersonRow name={w.full_name}
              sub={[birthYear(w.custom?.dogum), w.custom?.[config.people.groupKey] as string].filter(Boolean).join(" · ") || undefined}
              right={<span aria-hidden="true" style={{ fontSize: 26 }}>{picked.includes(w.id) ? "✓" : ""}</span>} />
          </button>
        ))}
        <button type="button" className="ui-link" onClick={() => { setPicked([]); setStep("kisi"); }}>İsim seçmeden sadece sayı gir</button>
        <div className="ui-sticky-bottom">
          <MainButton disabled={!picked.length} onClick={() => setStep("ucret")}>{picked.length ? `${picked.length} kişi · Devam` : "Gidenlere dokun"}</MainButton>
        </div>
      </main>
    );
  }

  if (step === "kisi") {
    return (
      <main className="ui-stack">
        <BackButton onClick={() => setStep(workers.length ? "isci" : "tarla")} />
        <PageHeader sub={`2 / 3 · ${placeLabel(place)}`} title="Kaç kişi gitti?" />
        <Card><Counter value={kisi} onChange={setKisi} min={1} max={200} unit="kişi" /></Card>
        {yesIds.length > 0 && yesIds.length !== kisi && (
          <button type="button" className="ui-link" onClick={() => setKisi(yesIds.length)}>Yoklamada “Geliyor” diyen {yesIds.length} kişi: bunu kullan</button>
        )}
        <MainButton onClick={() => setStep("ucret")}>Devam</MainButton>
      </main>
    );
  }

  if (step === "ucret") {
    const f = farmerOf(place);
    return (
      <main className="ui-stack">
        <BackButton onClick={() => setStep(picked.length ? "isci" : "kisi")} />
        <PageHeader sub={`3 / 3 · ${placeLabel(place)} · ${count} kişi`} title="Ücretler" />
        <div className="ui-stack" style={{ gap: 8 }}>
          <span className="ui-label">İşçi başı yevmiye</span>
          <Card><Counter value={wage} onChange={setWage} min={config.ledger.wageStep} max={20000} step={config.ledger.wageStep} unit="TL, bir işçiye" /></Card>
        </div>
        <div className="ui-stack" style={{ gap: 8 }}>
          <span className="ui-label">Senin payın (kişi başı)</span>
          <Card><Counter value={fee} onChange={setFee} min={0} max={5000} step={10} unit="TL, işçi başına sana" /></Card>
        </div>
        <div className="ui-split">
          <div><span>İşçilere</span><b>{formatTL(count * wage)}</b><small>{count} × {formatTL(wage)}</small></div>
          <div className="mine"><span>Senin payın</span><b>{formatTL(count * fee)}</b><small>{count} × {formatTL(fee)}</small></div>
        </div>
        <Card>
          <InfoRows rows={[[`${f?.full_name ?? "Çiftçi"} öder`, formatTL(count * (wage + fee))], ["Kişi başı", `${formatTL(wage)} + ${formatTL(fee)} = ${formatTL(wage + fee)}`]]} />
        </Card>
        <MainButton onClick={save}>Kaydet</MainButton>
      </main>
    );
  }

  if (step === "detay" && detail) {
    return <KayitDuzenle event={detail} places={places} farmers={farmers} workers={workers} placeLabel={placeLabel}
      onClose={(r) => {
        setStep("list"); setDetail(null); load();
        if (r) setDone({ message: r.message, ids: [`fn:${undos.push(r.undo) - 1}`] });
      }} />;
  }

  // --- Liste
  const toplam = events.reduce((t, e) => t + (e.quantity ?? 0), 0);
  const payGun = events.reduce((t, e) => t + (e.quantity ?? 0) * split(e, biz).fee, 0);
  const ws = weekStart(today);
  const weekEv = (allEvents ?? []).filter((e) => e.occurred_on >= ws && e.occurred_on <= today);
  const weekKisi = weekEv.reduce((t, e) => t + (e.quantity ?? 0), 0);
  const weekPay = weekEv.reduce((t, e) => t + (e.quantity ?? 0) * split(e, biz).fee, 0);

  const undo = async () => {
    if (!done) return;
    for (const id of done.ids) {
      if (id.startsWith("fn:")) await undos[Number(id.slice(3))]();
      else if (id.startsWith("restore:")) {
        const e = JSON.parse(id.slice(8)) as EventRow;
        await addEvent(biz.id, { kind: e.kind, occurred_on: e.occurred_on, place_id: e.place_id, person_id: e.person_id, quantity: e.quantity, data: e.data });
      } else await deleteEvent(id);
    }
    setDone(null); load();
  };

  return (
    <main className="ui-has-nav ui-stack">
      <PageHeader sub={dayLong} title={dayTitle} right={<HistoryLink />} />
      <div className="ui-daynav">
        <button type="button" aria-label="Önceki gün" onClick={() => { setDay(addDays(day, -1)); setDone(null); }}>‹ Önceki gün</button>
        {!isToday && <button type="button" onClick={() => { setDay(today); setDone(null); }}>Bugüne dön</button>}
        {!isToday && <button type="button" aria-label="Sonraki gün" onClick={() => { setDay(addDays(day, 1)); setDone(null); }}>Sonraki ›</button>}
      </div>
      {error && <ErrorText>{error}</ErrorText>}
      {done && <DoneCard message={done.message} onUndo={undo} />}

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--sessiz2)" }}>{isToday ? "Bugün tarlada" : "O gün tarlada"}</div>
            <div style={{ fontSize: 40, fontWeight: 800 }}>{toplam} kişi</div>
          </div>
          {payGun > 0 && <div style={{ textAlign: "right" }}><div style={{ fontSize: 14, fontWeight: 600, color: "var(--sessiz2)" }}>Senin payın</div><div style={{ fontSize: 22, fontWeight: 800 }}>{formatTL(payGun)}</div></div>}
        </div>
      </Card>

      {events.map((e) => (
        <button key={e.id} type="button" className="ui-card" onClick={() => { setDetail(e); setDone(null); setStep("detay"); }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 800, minWidth: 0 }}>{placeLabel(placeOf(e.place_id))}</div>
            <StatusPill status="tamam">{e.quantity} kişi</StatusPill>
          </div>
          <div style={{ fontSize: 15, color: "var(--sessiz)", marginTop: 6 }}>
            {workersOf(e).length ? firstNames(workersOf(e)) : "İsim seçilmedi"} · işçi başı {formatTL(split(e, biz).wage)}
          </div>
        </button>
      ))}
      {allEvents && events.length === 0 && <div className="ui-empty">{isToday ? "Bugün henüz kayıt yok." : "Bu gün kayıt yok."}</div>}

      <MainButton onClick={() => { setDone(null); setStep("tarla"); }}>+ {isToday ? "Bugünün" : `${dayTitle} için`} kaydını ekle</MainButton>

      {repeatable.length > 0 && prevDay && (
        <div className="ui-card ui-stack" style={{ gap: 10 }}>
          <b style={{ fontSize: 17 }}>{prevDay === addDays(day, -1) ? "Dünkü gibi" : `${dayText(prevDay)} gibi`}</b>
          {repeatable.map((p) => (
            <button key={p.id} type="button" className="ui-choice" onClick={() => repeat([p])}>
              + {placeLabel(placeOf(p.place_id))} · {p.quantity} kişi
              <span style={{ display: "block", fontSize: 15, fontWeight: 600, color: "var(--sessiz2)" }}>
                {workersOf(p).length ? firstNames(workersOf(p)) : "İsimsiz"} · {formatTL(split(p, biz).wage)}
              </span>
            </button>
          ))}
          {repeatable.length > 1 && <MainButton secondary onClick={() => repeat(repeatable)}>Hepsini ekle</MainButton>}
        </div>
      )}

      {isToday && (
        <Link href="/ekip" className="ui-card" style={{ textDecoration: "none", color: "inherit", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <span><b style={{ fontSize: 17 }}>Yarın</b><br /><span style={{ fontSize: 15, color: "var(--sessiz)" }}>
            {tomorrow.yes || tomorrow.no ? `${tomorrow.yes} geliyor, ${tomorrow.no} gelmiyor` : "Henüz kimseye sorulmadı"}</span></span>
          <span className="ui-pill bekliyor">Yoklama ›</span>
        </Link>
      )}

      <Card>
        <InfoRows rows={[["Bu hafta", `${weekKisi} kişi-gün`], ["Bu hafta senin payın", formatTL(weekPay)]]} />
      </Card>
      <SignOutLink />
      <BottomNav items={navItems} current="/" />
    </main>
  );
}

/** Yeni tarla: kimin tarlası (çiftçi seç ya da yeni yaz) + isteğe bağlı tarla adı. */
function YeniTarla({ farmers, onCancel, onSaved }: { farmers: Person[]; onCancel: () => void; onSaved: (p: Place) => void }) {
  const biz = useBusiness();
  const [farmerId, setFarmerId] = useState<string | "new" | null>(farmers.length ? null : "new");
  const [newName, setNewName] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [error, setError] = useState("");

  const save = async () => {
    let fid = farmerId === "new" ? null : farmerId;
    let label = farmers.find((f) => f.id === fid)?.full_name ?? "";
    if (farmerId === "new") {
      if (!newName.trim()) { setError("Çiftçinin adını yaz."); return; }
      const f = await addPerson(biz.id, config.farmers.kind, { full_name: newName.trim(), phone: null, tags: [], custom: {}, notes: null });
      fid = f.id; label = f.full_name;
    }
    if (!fid) { setError("Kimin tarlası, seç."); return; }
    onSaved(await addPlace(biz.id, placeName.trim() || label, fid));
  };

  return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub="Yeni tarla" title="Kimin tarlası?" />
      {farmers.map((f) => <ChoiceButton key={f.id} selected={farmerId === f.id} onClick={() => setFarmerId(f.id)}>{f.full_name}</ChoiceButton>)}
      <ChoiceButton selected={farmerId === "new"} onClick={() => setFarmerId("new")}>+ Yeni çiftçi</ChoiceButton>
      {farmerId === "new" && (
        <TextField id="farmer_name" label="Çiftçinin adı" placeholder="Örnek: Hasan Ağa" maxLength={100} autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} />
      )}
      <TextField id="place_name" label="Tarlanın adı (isteğe bağlı)" placeholder="Örnek: Kınık yolu" maxLength={100} value={placeName} onChange={(e) => setPlaceName(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      <MainButton onClick={save} disabled={!farmerId}>Devam</MainButton>
    </main>
  );
}

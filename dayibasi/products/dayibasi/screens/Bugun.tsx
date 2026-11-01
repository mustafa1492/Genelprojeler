"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { addEvent, deleteEvent, listEvents, todayIstanbul, type EventRow } from "@/core/events/api";
import { addPerson, listPeople, type Person } from "@/core/people/api";
import { addPlace, listPlaces, type Place } from "@/core/places/api";
import { listAnswers, tomorrowIstanbul } from "@/core/rsvp/api";
import { BackButton, BottomNav, Card, ChoiceButton, Counter, DoneCard, ErrorText, MainButton, PageHeader, StatusPill, TextField } from "@/core/ui";
import { config } from "../config";
import { farmerRate, PUANTAJ } from "../hesap";
import { HistoryLink, navItems } from "../nav";

const LAST_COUNT = "ko:son-kisi";
type Step = "list" | "tarla" | "kisi" | "yeniTarla";

export default function Bugun() {
  const biz = useBusiness();
  const today = todayIstanbul();
  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [farmers, setFarmers] = useState<Person[]>([]);
  const [allEvents, setAllEvents] = useState<EventRow[]>([]);
  const [geliyor, setGeliyor] = useState(0);
  const [step, setStep] = useState<Step>("list");
  const [place, setPlace] = useState<Place | null>(null);
  const [kisi, setKisi] = useState(10);
  const [done, setDone] = useState<{ message: string; id: string } | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    Promise.all([
      listEvents(biz.id, PUANTAJ),
      listPlaces(biz.id),
      listPeople(biz.id, [config.farmers.kind]),
      // Dünkü yoklamada "Geliyor" diyenler bugün için ipucu
      listAnswers(biz.id, today).catch(() => ({})),
    ]).then(([ev, pl, fa, ans]) => {
      setAllEvents(ev); setEvents(ev.filter((e) => e.occurred_on === today));
      setPlaces(pl); setFarmers(fa);
      setGeliyor(Object.values(ans).filter((a) => a === "evet").length);
    }).catch(() => setError("Bilgileri getiremedim."));
  }, [biz.id, today]);
  useEffect(load, [load]);
  useEffect(() => { try { const n = Number(localStorage.getItem(LAST_COUNT)); if (n > 0) setKisi(n); } catch { /* yok */ } }, []);

  const farmerOf = (p?: Place | null) => farmers.find((f) => f.id === p?.owner_person_id);
  const placeLabel = (p?: Place | null) => {
    if (!p) return "Tarla";
    const f = farmerOf(p);
    return f ? (p.name && p.name !== f.full_name ? `${f.full_name} · ${p.name}` : f.full_name) : p.name;
  };

  // En son kullanılan tarlalar üstte
  const lastUse = (id: string) => allEvents.filter((e) => e.place_id === id).map((e) => e.occurred_on + (e.created_at ?? "")).sort().pop() ?? "";
  const sortedPlaces = [...places].sort((a, b) => lastUse(b.id).localeCompare(lastUse(a.id)) || placeLabel(a).localeCompare(placeLabel(b), "tr"));

  const save = async () => {
    if (!place) return;
    const f = farmerOf(place);
    const ev = await addEvent(biz.id, {
      kind: PUANTAJ, place_id: place.id, person_id: f?.id ?? null, quantity: kisi,
      data: { rate: farmerRate(f, biz) },
    });
    try { localStorage.setItem(LAST_COUNT, String(kisi)); } catch { /* yok */ }
    setDone({ message: `Kaydettim: ${placeLabel(place)}, ${kisi} kişi.`, id: ev.id });
    setStep("list"); setPlace(null);
    load();
  };

  const toplam = (events ?? []).reduce((t, e) => t + (e.quantity ?? 0), 0);
  const tarih = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long", timeZone: "Europe/Istanbul" });

  if (step === "yeniTarla") {
    return <YeniTarla farmers={farmers} onCancel={() => setStep("tarla")} onSaved={async (p) => { load(); setPlace(p); setStep("kisi"); }} />;
  }

  if (step === "tarla") {
    return (
      <main className="ui-stack">
        <BackButton onClick={() => setStep("list")} label="Vazgeç" />
        <PageHeader sub="1 / 2" title="Hangi tarlaya gittiniz?" />
        {sortedPlaces.length === 0 && <div className="ui-empty">Henüz tarla yok. Aşağıdan ilk tarlanı ekle.</div>}
        {sortedPlaces.map((p) => (
          <ChoiceButton key={p.id} selected={place?.id === p.id} onClick={() => { setPlace(p); setStep("kisi"); }}>{placeLabel(p)}</ChoiceButton>
        ))}
        <MainButton secondary onClick={() => setStep("yeniTarla")}>+ Yeni tarla</MainButton>
      </main>
    );
  }

  if (step === "kisi") {
    return (
      <main className="ui-stack">
        <BackButton onClick={() => setStep("tarla")} />
        <PageHeader sub={`2 / 2 · ${placeLabel(place)}`} title="Kaç kişi gitti?" />
        <Card><Counter value={kisi} onChange={setKisi} min={1} max={200} unit="kişi" /></Card>
        {geliyor > 0 && geliyor !== kisi && (
          <button type="button" className="ui-link" onClick={() => setKisi(geliyor)}>Yoklamada “Geliyor” diyen {geliyor} kişi: bunu kullan</button>
        )}
        <MainButton onClick={save}>Kaydet</MainButton>
      </main>
    );
  }

  return (
    <main className="ui-has-nav ui-stack">
      <PageHeader sub={tarih} title={config.screens.bugun} right={<HistoryLink />} />
      {error && <ErrorText>{error}</ErrorText>}
      {done && <DoneCard message={done.message} onUndo={async () => { await deleteEvent(done.id); setDone(null); load(); }} />}
      <Card>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--sessiz2)" }}>Bugün tarlada</div>
        <div style={{ fontSize: 40, fontWeight: 800 }}>{toplam} kişi</div>
      </Card>
      {(events ?? []).map((e) => (
        <Card key={e.id}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 800, minWidth: 0 }}>{placeLabel(places.find((p) => p.id === e.place_id))}</div>
            <StatusPill status="tamam">{e.quantity} kişi</StatusPill>
          </div>
        </Card>
      ))}
      {events?.length === 0 && <div className="ui-empty">Bugün henüz kayıt yok.</div>}
      <MainButton onClick={() => { setDone(null); setStep("tarla"); }}>+ Bugünün kaydını ekle</MainButton>
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
    const p = await addPlace(biz.id, placeName.trim() || label, fid);
    onSaved(p);
  };

  return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub="Yeni tarla" title="Kimin tarlası?" />
      {farmers.map((f) => (
        <ChoiceButton key={f.id} selected={farmerId === f.id} onClick={() => setFarmerId(f.id)}>{f.full_name}</ChoiceButton>
      ))}
      <ChoiceButton selected={farmerId === "new"} onClick={() => setFarmerId("new")}>+ Yeni çiftçi</ChoiceButton>
      {farmerId === "new" && (
        <TextField id="farmer_name" label="Çiftçinin adı" placeholder="Örnek: Hasan Ağa" maxLength={100} autoFocus
          value={newName} onChange={(e) => setNewName(e.target.value)} />
      )}
      <TextField id="place_name" label="Tarlanın adı (isteğe bağlı)" placeholder="Örnek: Kınık yolu" maxLength={100}
        value={placeName} onChange={(e) => setPlaceName(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      <MainButton onClick={save} disabled={!farmerId}>Devam</MainButton>
    </main>
  );
}

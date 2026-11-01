"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { listEvents, type EventRow } from "@/core/events/api";
import { formatTL } from "@/core/ledger/api";
import { listPeople, type Person } from "@/core/people/api";
import { displayName } from "@/core/people/birth";
import { listPlaces, type Place } from "@/core/places/api";
import { BottomNav, DoneCard, ErrorText, PageHeader, StatusPill } from "@/core/ui";
import { config } from "../config";
import { PUANTAJ, split, workersOf } from "../hesap";
import { HistoryLink, navItems } from "../nav";
import KayitDuzenle, { type Edited } from "./KayitDuzenle";

const PAGE = 14; // gün

/** Gün gün bütün kayıtlar: hangi tarla, kimler gitti. Dokun → düzenle. */
export default function Kayitlar() {
  const biz = useBusiness();
  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [farmers, setFarmers] = useState<Person[]>([]);
  const [workers, setWorkers] = useState<Person[]>([]);
  const [who, setWho] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [done, setDone] = useState<Edited | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    Promise.all([listEvents(biz.id, PUANTAJ), listPlaces(biz.id), listPeople(biz.id, [config.farmers.kind]), listPeople(biz.id, ["isci"])])
      .then(([e, p, f, w]) => { setEvents(e); setPlaces(p); setFarmers(f); setWorkers(w); })
      .catch(() => setError("Kayıtları getiremedim."));
  }, [biz.id]);
  useEffect(load, [load]);

  const placeLabel = (p?: Place | null) => {
    if (!p) return "Tarla";
    const f = farmers.find((x) => x.id === p.owner_person_id);
    return f ? (p.name && p.name !== f.full_name ? `${f.full_name} · ${p.name}` : f.full_name) : p.name;
  };
  const nameOf = (id: string) => { const w = workers.find((x) => x.id === id); return w ? displayName(w, workers, true) : "Çıkmış"; };

  if (editing) {
    return <KayitDuzenle event={editing} places={places} farmers={farmers} workers={workers} placeLabel={placeLabel}
      onClose={(r) => { setEditing(null); if (r) setDone(r); load(); window.scrollTo({ top: 0 }); }} />;
  }

  const list = (events ?? []).filter((e) => !who || workersOf(e).includes(who));
  const days = [...new Set(list.map((e) => e.occurred_on))].sort().reverse();
  const longDay = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });
  const sel = workers.find((w) => w.id === who);

  return (
    <main className="ui-has-nav ui-stack">
      <PageHeader sub="Gün gün kim nereye gitti" title="Kayıtlar" right={<HistoryLink />} />
      {done && <DoneCard message={done.message} onUndo={async () => { await done.undo(); setDone(null); load(); }} />}
      {error && <ErrorText>{error}</ErrorText>}

      <label className="ui-field">
        Kişiye göre
        <select value={who} onChange={(e) => { setWho(e.target.value); setShown(PAGE); }} className="ui-select">
          <option value="">Herkes</option>
          {[...workers].sort((a, b) => a.full_name.localeCompare(b.full_name, "tr")).map((w) => (
            <option key={w.id} value={w.id}>{displayName(w, workers)}</option>
          ))}
        </select>
      </label>
      {sel && <div className="ui-done"><p>{displayName(sel, workers)}: {days.length} gün çalıştı.</p></div>}

      {events === null && !error && <div className="ui-empty">Yükleniyor…</div>}
      {events && days.length === 0 && <div className="ui-empty">{who ? "Bu kişinin kaydı yok." : "Henüz kayıt yok. Bugün ekranından ekle."}</div>}

      {days.slice(0, shown).map((d) => {
        const de = list.filter((e) => e.occurred_on === d);
        const kisi = de.reduce((t, e) => t + (e.quantity ?? 0), 0);
        return (
          <section key={d} className="ui-stack" style={{ gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, margin: "6px 4px 0" }}>
              <h2 style={{ margin: 0, fontSize: 19 }}>{longDay(d)}</h2>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--sessiz2)", whiteSpace: "nowrap" }}>{kisi} kişi</span>
            </div>
            {de.map((e) => {
              const ws = workersOf(e);
              return (
                <button key={e.id} type="button" className="ui-card" onClick={() => { setDone(null); setEditing(e); }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <b style={{ fontSize: 18, minWidth: 0 }}>{placeLabel(places.find((p) => p.id === e.place_id))}</b>
                    <StatusPill status="tamam">{e.quantity} kişi</StatusPill>
                  </div>
                  <div style={{ fontSize: 16, color: "var(--yazi)", marginTop: 8, lineHeight: 1.45 }}>
                    {ws.length ? ws.map(nameOf).join(", ") : <span style={{ color: "var(--sessiz2)" }}>İsim seçilmedi</span>}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--sessiz2)", marginTop: 6, fontWeight: 600 }}>
                    Yevmiye {formatTL(split(e, biz).wage)} · payın {formatTL((e.quantity ?? 0) * split(e, biz).fee)} · <span style={{ color: "var(--ana-yazi)" }}>düzenle ›</span>
                  </div>
                </button>
              );
            })}
          </section>
        );
      })}
      {days.length > shown && <button type="button" className="ui-main-btn ikincil" onClick={() => setShown(shown + PAGE)}>Daha eski günler</button>}
      <BottomNav items={navItems} current="/kayitlar" />
    </main>
  );
}

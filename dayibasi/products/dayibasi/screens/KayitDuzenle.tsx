"use client";
import { useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { deleteEvent, updateEvent, type EventRow } from "@/core/events/api";
import { formatTL } from "@/core/ledger/api";
import type { Person } from "@/core/people/api";
import { birthYear, displayName } from "@/core/people/birth";
import type { Place } from "@/core/places/api";
import { BackButton, Card, Chip, Counter, ErrorText, MainButton, PageHeader, PersonRow, TextField } from "@/core/ui";
import { config } from "../config";
import { split, workersOf } from "../hesap";

export type Edited = { message: string; undo: () => Promise<void> };

/** Bir kaydı düzenle: gün, tarla, kimler, kişi sayısı, yevmiye, pay. Sil. Her ikisi geri alınabilir. */
export default function KayitDuzenle({ event, places, farmers, workers, placeLabel, onClose }: {
  event: EventRow; places: Place[]; farmers: Person[]; workers: Person[];
  placeLabel: (p?: Place | null) => string; onClose: (r?: Edited) => void;
}) {
  const biz = useBusiness();
  const r0 = split(event, biz);
  const [day, setDay] = useState(event.occurred_on);
  const [placeId, setPlaceId] = useState(event.place_id);
  const [picked, setPicked] = useState<string[]>(workersOf(event));
  const [kisi, setKisi] = useState(event.quantity ?? 1);
  const [wage, setWage] = useState(r0.wage);
  const [fee, setFee] = useState(r0.fee);
  const [showPlaces, setShowPlaces] = useState(false);
  const [error, setError] = useState("");

  const count = picked.length || kisi;
  const place = places.find((p) => p.id === placeId) ?? null;
  const toggle = (id: string) => setPicked(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id]);
  // Ekipten çıkmış ama bu kayıtta olan kişiler de listede kalsın
  const inList = [...workers, ...picked.filter((id) => !workers.some((w) => w.id === id)).map((id) => ({ id, full_name: "Ekipten çıkmış", custom: {} } as unknown as Person))];

  const save = async () => {
    if (!day) { setError("Günü seç."); return; }
    const before = { occurred_on: event.occurred_on, place_id: event.place_id, person_id: event.person_id, quantity: event.quantity, data: event.data };
    const data: Record<string, unknown> = { ...event.data, wage, fee };
    delete data.rate;
    if (picked.length) data.workers = picked; else delete data.workers;
    await updateEvent(event.id, {
      occurred_on: day, place_id: placeId, person_id: place?.owner_person_id ?? event.person_id, quantity: count, data,
    });
    onClose({ message: `Değiştirdim: ${placeLabel(place)}, ${count} kişi.`, undo: () => updateEvent(event.id, before) });
  };

  const remove = async () => {
    await deleteEvent(event.id);
    const { id: _id, ...rest } = event;
    void _id;
    onClose({
      message: `Sildim: ${placeLabel(place)}, ${event.quantity} kişi.`,
      undo: async () => { const { mutate } = await import("@/core/offline/store"); await mutate({ kind: "insert", table: "events", values: { id: event.id, ...rest } }); },
    });
  };

  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={() => onClose()} label="Vazgeç" />
      <PageHeader sub="Kaydı düzenle" title={placeLabel(place)} />

      <TextField id="edit_day" label="Gün" type="date" max={new Date().toISOString().slice(0, 10)} value={day} onChange={(e) => setDay(e.target.value)} />

      <div className="ui-stack" style={{ gap: 8 }}>
        <span className="ui-label">Tarla</span>
        {!showPlaces ? (
          <button type="button" className="ui-choice" aria-pressed onClick={() => setShowPlaces(true)}>{placeLabel(place)} <span style={{ color: "var(--sessiz2)", fontWeight: 700 }}>· değiştir</span></button>
        ) : places.map((p) => (
          <button key={p.id} type="button" className="ui-choice" aria-pressed={p.id === placeId} onClick={() => { setPlaceId(p.id); setShowPlaces(false); }}>{placeLabel(p)}</button>
        ))}
      </div>

      <div className="ui-stack" style={{ gap: 8 }}>
        <span className="ui-label">Kimler gitti {picked.length ? `(${picked.length})` : ""}</span>
        <div className="ui-chips wrap">
          <Chip onClick={() => setPicked(workers.map((w) => w.id))}>Hepsi</Chip>
          {picked.length > 0 && <Chip onClick={() => setPicked([])}>Kimse (sadece sayı)</Chip>}
        </div>
        {inList.map((w) => (
          <button key={w.id} type="button" className="ui-choice" aria-pressed={picked.includes(w.id)} onClick={() => toggle(w.id)}>
            <PersonRow name={displayName(w, workers)}
              sub={birthYear(w.custom?.dogum) || undefined}
              right={<span aria-hidden="true" style={{ fontSize: "1.444rem" }}>{picked.includes(w.id) ? "✓" : ""}</span>} />
          </button>
        ))}
      </div>

      {!picked.length && (
        <div className="ui-stack" style={{ gap: 8 }}>
          <span className="ui-label">Kaç kişi (isimsiz)</span>
          <Card><Counter value={kisi} onChange={setKisi} min={1} max={200} unit="kişi" /></Card>
        </div>
      )}

      <div className="ui-stack" style={{ gap: 8 }}>
        <span className="ui-label">İşçi başı yevmiye</span>
        <Card><Counter value={wage} onChange={setWage} min={config.ledger.wageStep} max={20000} step={config.ledger.wageStep} unit="TL" /></Card>
      </div>
      <div className="ui-stack" style={{ gap: 8 }}>
        <span className="ui-label">Senin payın (kişi başı)</span>
        <Card><Counter value={fee} onChange={setFee} min={0} max={5000} step={10} unit="TL" /></Card>
      </div>
      <div className="ui-split">
        <div><span>İşçilere</span><b>{formatTL(count * wage)}</b><small>{count} × {formatTL(wage)}</small></div>
        <div className="mine"><span>Senin payın</span><b>{formatTL(count * fee)}</b><small>{count} × {formatTL(fee)}</small></div>
      </div>
      {error && <ErrorText>{error}</ErrorText>}
      <MainButton className="tehlike" onClick={remove}>Bu kaydı sil</MainButton>
      <div className="ui-sticky-bottom"><MainButton onClick={save}>Kaydet</MainButton></div>
    </main>
  );
}

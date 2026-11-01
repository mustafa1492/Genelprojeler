"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { addEntry, deleteEntry, formatTL, listEntries, type LedgerEntry, type LedgerKind } from "@/core/ledger/api";
import { prettyPhone, telLink, waLink } from "@/core/messaging/links";
import type { Person } from "@/core/people/api";
import { setAnswer, tomorrowIstanbul, type Answer } from "@/core/rsvp/api";
import { BackButton, Card, ContactButtons, DoneCard, ErrorText, InfoRows, MainButton, PageHeader, TextField } from "@/core/ui";
import { listEvents, type EventRow } from "@/core/events/api";
import { listPlaces, type Place } from "@/core/places/api";
import { config } from "../config";
import { dayText, PUANTAJ, split, workerAccounts } from "../hesap";

const kindText: Record<LedgerKind, string> = { avans: "Avans verdim", odeme: "Ödeme yaptım", alacak: "Alacak" };

/** İşçinin kartı: ara / WhatsApp, bilgiler, yarın, avans ve ödemeler. */
export default function KisiKarti({ person, answer, onBack, onEdit, onAnswer }: {
  person: Person; answer: Answer; onBack: () => void; onEdit: () => void; onAnswer: (a: Answer) => void;
}) {
  const biz = useBusiness();
  const [entries, setEntries] = useState<LedgerEntry[] | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [adding, setAdding] = useState<LedgerKind | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ message: string; id: string } | null>(null);

  const load = useCallback(() => {
    listEntries(person.id).then(setEntries).catch(() => setEntries([]));
    listEvents(biz.id, PUANTAJ).then(setEvents).catch(() => {});
    listPlaces(biz.id).then(setPlaces).catch(() => {});
  }, [person.id, biz.id]);
  useEffect(load, [load]);

  const save = async () => {
    const n = Number(amount.replace(/\./g, "").replace(",", "."));
    if (!adding || !(n > 0) || n > 100000000) { setError("Tutarı yaz. Örnek: 500"); return; }
    try {
      const id = await addEntry(biz.id, person.id, adding, n);
      setDone({ message: `Kaydettim: ${person.full_name}, ${formatTL(n)} ${adding === "avans" ? "avans" : "ödeme"}.`, id });
      setAdding(null); setAmount(""); setError(""); load();
    } catch { setError("Kaydedemedim. İnterneti kontrol edip tekrar dene."); }
  };

  const yarin = async (a: Answer) => {
    const next = answer === a ? null : a;
    await setAnswer(biz.id, person.id, tomorrowIstanbul(), next).catch(() => {});
    onAnswer(next);
  };

  const acc = workerAccounts([person], events, entries ?? [], biz)[0];
  const kindLabel = config.people.kinds.isci.label;

  if (adding) {
    return (
      <main className="ui-stack">
        <BackButton onClick={() => { setAdding(null); setError(""); }} label="Vazgeç" />
        <PageHeader sub={person.full_name} title={adding === "avans" ? "Avans verdim" : "Ödeme yaptım"} />
        <TextField id="amount" label="Kaç TL?" inputMode="decimal" maxLength={12} autoFocus placeholder="Örnek: 500"
          value={amount} onChange={(e) => setAmount(e.target.value)} style={{ fontSize: 30, fontWeight: 800 }} />
        {error && <ErrorText>{error}</ErrorText>}
        <MainButton onClick={save}>Kaydet</MainButton>
      </main>
    );
  }

  return (
    <main className="ui-stack">
      <BackButton onClick={onBack} label={config.screens.ekip} />
      <PageHeader sub={kindLabel} title={person.full_name} />
      {done && <DoneCard message={done.message} onUndo={async () => { await deleteEntry(done.id); setDone(null); load(); }} />}

      {person.phone
        ? <ContactButtons tel={telLink(person.phone)} wa={waLink(person.phone)} />
        : <div className="ui-empty">Telefonu yok. Aşağıdan “Bilgileri değiştir”e dokunup ekle.</div>}

      <h2 className="ui-section">Yarın geliyor mu?</h2>
      <div className="ui-seg">
        <button type="button" className="evet" aria-pressed={answer === "evet"} onClick={() => yarin("evet")}>Geliyor</button>
        <button type="button" className="hayir" aria-pressed={answer === "hayir"} onClick={() => yarin("hayir")}>Gelmiyor</button>
      </div>

      <h2 className="ui-section">Bilgileri</h2>
      <Card>
        <InfoRows rows={[
          ["Telefonu", person.phone ? prettyPhone(person.phone) : "Yok"],
          ...config.people.customFields.map((f) => [f.label, person.custom?.[f.key] || "Yok"] as [string, string]),
          ["Grubu", (person.custom?.[config.people.groupKey] as string) || "Yok"],
          ...(person.notes ? [["Not", person.notes] as [string, string]] : []),
        ]} />
      </Card>

      <h2 className="ui-section">Hesabı</h2>
      <div className="ui-total">
        <span>{acc.kalan > 0 ? "Ona borcun" : acc.kalan < 0 ? "Sana borcu (fazla avans)" : "Hesap kapalı"}</span>
        <b>{formatTL(Math.abs(acc.kalan))}</b>
      </div>
      <Card>
        <InfoRows rows={[["Çalıştığı gün", `${acc.gun} gün`], ["Kazancı", formatTL(acc.kazanc)], ["Verilen avans", formatTL(acc.avans)], ["Yapılan ödeme", formatTL(acc.odenen)]]} />
      </Card>
      <div className="ui-seg">
        <button type="button" onClick={() => { setDone(null); setAdding("avans"); }}>+ Avans verdim</button>
        <button type="button" onClick={() => { setDone(null); setAdding("odeme"); }}>+ Ödeme yaptım</button>
      </div>
      {entries?.map((e) => (
        <div key={e.id} className="ui-moneyrow">
          <b>{kindText[e.kind]}<small>{new Date(e.occurred_on + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}</small></b>
          <strong>{formatTL(e.amount)}</strong>
        </div>
      ))}
      <h2 className="ui-section">Çalıştığı günler</h2>
      {acc.gunler.length === 0 && <div className="ui-empty">Henüz çalıştığı gün yok. Bugün ekranında kayıt eklerken ismini seç.</div>}
      {acc.gunler.slice().reverse().map((e) => (
        <div key={e.id} className="ui-moneyrow">
          <b>{dayText(e.occurred_on)}<small>{places.find((p) => p.id === e.place_id)?.name ?? "Tarla"}</small></b>
          <strong>{formatTL(split(e, biz).wage)}</strong>
        </div>
      ))}

      <MainButton secondary onClick={onEdit}>Bilgileri değiştir</MainButton>
    </main>
  );
}

"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { addEntry, deleteEntry, formatTL, listEntries, type LedgerEntry, type LedgerKind } from "@/core/ledger/api";
import { prettyPhone, telLink, waLink } from "@/core/messaging/links";
import type { Person } from "@/core/people/api";
import { setAnswer, tomorrowIstanbul, type Answer } from "@/core/rsvp/api";
import { BackButton, Card, ContactButtons, DoneCard, ErrorText, InfoRows, MainButton, PageHeader, TextField } from "@/core/ui";
import { config } from "../config";

const kindText: Record<LedgerKind, string> = { avans: "Avans verdim", odeme: "Ödeme yaptım", alacak: "Alacak" };

/** İşçinin kartı: ara / WhatsApp, bilgiler, yarın, avans ve ödemeler. */
export default function KisiKarti({ person, answer, onBack, onEdit, onAnswer }: {
  person: Person; answer: Answer; onBack: () => void; onEdit: () => void; onAnswer: (a: Answer) => void;
}) {
  const biz = useBusiness();
  const [entries, setEntries] = useState<LedgerEntry[] | null>(null);
  const [adding, setAdding] = useState<LedgerKind | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ message: string; id: string } | null>(null);

  const load = useCallback(() => { listEntries(person.id).then(setEntries).catch(() => setEntries([])); }, [person.id]);
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

  const avans = (entries ?? []).filter((e) => e.kind === "avans").reduce((t, e) => t + e.amount, 0);
  const odeme = (entries ?? []).filter((e) => e.kind === "odeme").reduce((t, e) => t + e.amount, 0);
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
          ["Yaptığı işler", person.tags.length ? person.tags.join(", ") : "Seçilmedi"],
          ...(person.notes ? [["Not", person.notes] as [string, string]] : []),
        ]} />
      </Card>

      <h2 className="ui-section">Avans ve ödemeler</h2>
      <Card>
        <InfoRows rows={[["Verilen avans", formatTL(avans)], ["Yapılan ödeme", formatTL(odeme)]]} />
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
      <p style={{ margin: "0 4px", fontSize: 15, color: "var(--sessiz2)" }}>Çalıştığı günler, bugünün kayıtları gerçek olunca burada görünecek.</p>

      <MainButton secondary onClick={onEdit}>Bilgileri değiştir</MainButton>
    </main>
  );
}

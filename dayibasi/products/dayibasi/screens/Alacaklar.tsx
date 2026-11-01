"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness, useSetBusiness } from "@/core/auth/AuthGate";
import { listEvents, type EventRow } from "@/core/events/api";
import { addEntry, deleteEntry, formatTL, listAllEntries, type LedgerEntry } from "@/core/ledger/api";
import { fillTemplate, prettyPhone, telLink, waLink } from "@/core/messaging/links";
import { getTemplate } from "@/core/messaging/templates";
import { addPerson, listPeople, updatePerson, type Person, type PersonInput } from "@/core/people/api";
import { PersonForm } from "@/core/people/PersonForm";
import { listPlaces, type Place } from "@/core/places/api";
import { supabase } from "@/core/supabase/client";
import { BackButton, BottomNav, Card, Chip, ContactButtons, DoneCard, ErrorText, InfoRows, MainButton, PageHeader, PersonRow, StatusPill, TextField } from "@/core/ui";
import { config } from "../config";
import {
  agoText, dayText, defaults, farmerAccounts, monthStart, myEarnings, PUANTAJ, split, workerAccounts, workersOf,
  type FarmerAccount, type WorkerAccount,
} from "../hesap";
import { HistoryLink, navItems } from "../nav";

const HESAP_VARSAYILAN = "Merhaba {ad}, hesabın: {kisi_gun} kişi-gün iş, toplam {tutar} TL, ödenen {odenen} TL, kalan {kalan} TL.";
const ISCI_HESAP = "Merhaba {ad}, hesabın: {gun} gün çalıştın, {kazanc} TL. Avans {avans} TL, ödenen {odenen} TL, kalan {kalan} TL.";
const num = (s: string) => Number(s.replace(/\./g, "").replace(",", "."));
const tl = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
const SENT = "ko:hesap-gonderildi";
const TAB = "ko:alacak-sekme";

type Tab = "ciftci" | "isci" | "puantaj";
type View = { v: "list" } | { v: "card"; id: string } | { v: "form"; id?: string } | { v: "odeme"; id: string } | { v: "ayar"; key: "wage" | "fee" };
type Done = { message: string; undo?: () => Promise<void> } | null;

export default function Alacaklar() {
  const biz = useBusiness();
  const setBiz = useSetBusiness();
  const [farmers, setFarmers] = useState<Person[] | null>(null);
  const [workers, setWorkers] = useState<Person[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [tpl, setTpl] = useState(HESAP_VARSAYILAN);
  const [tab, setTabState] = useState<Tab>("ciftci");
  const [view, setView] = useState<View>({ v: "list" });
  const [done, setDone] = useState<Done>(null);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    Promise.all([listPeople(biz.id, [config.farmers.kind]), listPeople(biz.id, ["isci"]), listEvents(biz.id, PUANTAJ), listAllEntries(biz.id), listPlaces(biz.id)])
      .then(([f, w, e, l, p]) => { setFarmers(f); setWorkers(w); setEvents(e); setEntries(l); setPlaces(p); })
      .catch(() => setError("Bilgileri getiremedim."));
  }, [biz.id]);
  useEffect(load, [load]);
  useEffect(() => { getTemplate(biz.id, "hesap_dokumu", HESAP_VARSAYILAN).then(setTpl).catch(() => {}); }, [biz.id]);
  useEffect(() => {
    try { setSent(JSON.parse(localStorage.getItem(SENT) ?? "{}")); const t = localStorage.getItem(TAB) as Tab | null; if (t) setTabState(t); } catch { /* yok */ }
  }, []);
  const setTab = (t: Tab) => { setTabState(t); setDone(null); try { localStorage.setItem(TAB, t); } catch { /* yok */ } };

  const fAcc = farmerAccounts(farmers ?? [], events, entries, biz).sort((a, b) => b.kalan - a.kalan);
  const wAcc = workerAccounts(workers, events, entries, biz).sort((a, b) => b.kalan - a.kalan);
  const alacak = fAcc.reduce((t, a) => t + Math.max(0, a.kalan), 0);
  const borc = wAcc.reduce((t, a) => t + Math.max(0, a.kalan), 0);
  const kazancAy = myEarnings(events, biz, monthStart());
  const { wage, fee } = defaults(biz);

  const farmerMsg = (a: FarmerAccount) => fillTemplate(tpl, { ad: a.farmer.full_name, kisi_gun: a.kisiGun, tutar: tl(a.tutar), odenen: tl(a.odenen), kalan: tl(Math.max(0, a.kalan)) });
  const workerMsg = (a: WorkerAccount) => fillTemplate(ISCI_HESAP, { ad: a.worker.full_name.split(" ")[0], gun: a.gun, kazanc: tl(a.kazanc), avans: tl(a.avans), odenen: tl(a.odenen), kalan: tl(Math.max(0, a.kalan)) });
  const markSent = (id: string) => {
    const n = { ...sent, [id]: new Date().toISOString().slice(0, 10) };
    setSent(n); try { localStorage.setItem(SENT, JSON.stringify(n)); } catch { /* yok */ }
  };
  const placeLabel = (id: string | null) => {
    const p = places.find((x) => x.id === id); const f = farmers?.find((x) => x.id === p?.owner_person_id);
    return p ? (f ? (p.name !== f.full_name ? `${f.full_name} · ${p.name}` : f.full_name) : p.name) : "Tarla";
  };

  const payWorker = async (a: WorkerAccount) => {
    const id = await addEntry(biz.id, a.worker.id, "odeme", a.kalan);
    setDone({ message: `Kaydettim: ${a.worker.full_name}’a ${formatTL(a.kalan)} ödedin.`, undo: () => deleteEntry(id) });
    load();
  };
  const payAll = async () => {
    const due = wAcc.filter((a) => a.kalan > 0);
    const ids: string[] = [];
    for (const a of due) ids.push(await addEntry(biz.id, a.worker.id, "odeme", a.kalan));
    setDone({ message: `Kaydettim: ${due.length} işçiye toplam ${formatTL(due.reduce((t, a) => t + a.kalan, 0))} ödedin.`,
      undo: async () => { for (const id of ids) await deleteEntry(id); } });
    load();
  };

  // --- Çiftçi ekle / değiştir
  if (view.v === "form") {
    const a = fAcc.find((x) => x.farmer.id === view.id);
    const save = async (input: PersonInput) => {
      if (a) { await updatePerson(a.farmer.id, { ...input, custom: { ...a.farmer.custom, ...input.custom } }); setView({ v: "card", id: a.farmer.id }); }
      else { const p = await addPerson(biz.id, config.farmers.kind, input); setDone({ message: `Kaydettim: ${p.full_name}.` }); setView({ v: "list" }); }
      load();
    };
    return (
      <main>
        <PersonForm kindLabel={config.people.kinds.ciftci.label} tags={[]} customFields={config.farmers.customFields}
          person={a?.farmer} onSave={save} onCancel={() => setView(a ? { v: "card", id: a.farmer.id } : { v: "list" })} />
      </main>
    );
  }

  // --- Çiftçiden ödeme aldım
  if (view.v === "odeme") {
    const a = fAcc.find((x) => x.farmer.id === view.id)!;
    return <Tutar title="Ödeme aldım" sub={a.farmer.full_name} hint={a.kalan > 0 ? `Kalan borcu: ${formatTL(a.kalan)}` : undefined}
      quick={a.kalan > 0 ? a.kalan : undefined}
      onCancel={() => setView({ v: "card", id: a.farmer.id })}
      onSave={async (n) => {
        const id = await addEntry(biz.id, a.farmer.id, "odeme", n);
        setDone({ message: `Kaydettim: ${a.farmer.full_name}, ${formatTL(n)} ödeme aldım.`, undo: () => deleteEntry(id) });
        setView({ v: "card", id: a.farmer.id }); load();
      }} />;
  }

  // --- Ayarlar: varsayılan yevmiye / dayıbaşı payı
  if (view.v === "ayar") {
    const isWage = view.key === "wage";
    return <Tutar title={isWage ? "Varsayılan yevmiye" : "Senin payın (kişi başı)"} sub="Ücretler" initial={String(isWage ? wage : fee)}
      hint={isWage ? "Kayıtta hazır gelen yevmiye. Her kayıtta − / + ile değiştirebilirsin." : "Her işçi-gün için çiftçiden yevmiyenin üstüne alınır. Eski kayıtlar değişmez."}
      onCancel={() => setView({ v: "list" })}
      onSave={async (n) => {
        const settings = { ...biz.settings, [view.key]: n };
        const { error } = await supabase().from("businesses").update({ settings }).eq("id", biz.id);
        if (error) throw error;
        setBiz({ ...biz, settings });
        setDone({ message: `${isWage ? "Varsayılan yevmiye" : "Payın"} ${formatTL(n)} oldu.` });
        setView({ v: "list" });
      }} />;
  }

  // --- Çiftçi kartı
  if (view.v === "card") {
    const a = fAcc.find((x) => x.farmer.id === view.id);
    if (a) {
      const f = a.farmer;
      const works = events.filter((e) => e.person_id === f.id).slice().reverse();
      const pays = entries.filter((e) => e.person_id === f.id && e.kind === "odeme").sort((x, y) => y.occurred_on.localeCompare(x.occurred_on));
      return (
        <main className="ui-stack">
          <BackButton onClick={() => { setDone(null); setView({ v: "list" }); }} label="Alacaklarım" />
          <PageHeader sub={config.people.kinds.ciftci.label} title={f.full_name} />
          {done && <DoneCard message={done.message} onUndo={done.undo ? async () => { await done.undo!(); setDone(null); load(); } : undefined} />}
          <div className="ui-total">
            <span>{a.kalan > 0 ? "Kalan borcu" : "Hesabı kapandı"}</span>
            <b>{formatTL(Math.max(0, a.kalan))}</b>
            {a.kalan < 0 && <span>Fazla ödedi: {formatTL(-a.kalan)}</span>}
          </div>
          <Card><InfoRows rows={[["Yapılan iş", `${a.kisiGun} kişi-gün`], ["İşin tutarı", formatTL(a.tutar)], ["Ödenen", formatTL(a.odenen)]]} /></Card>
          <MainButton onClick={() => { setDone(null); setView({ v: "odeme", id: f.id }); }}>+ Ödeme aldım</MainButton>
          {f.phone ? (
            <>
              <a className="ui-main-btn ikincil" style={{ textDecoration: "none" }} href={waLink(f.phone, farmerMsg(a))} target="_blank" rel="noreferrer" onClick={() => markSent(f.id)}>
                {sent[f.id] ? "Hesabı tekrar gönder" : "Hesabını WhatsApp’tan gönder"}
              </a>
              <ContactButtons tel={telLink(f.phone)} wa={waLink(f.phone)} />
            </>
          ) : <MainButton secondary onClick={() => setView({ v: "form", id: f.id })}>Telefonunu ekle (hesabı göndermek için)</MainButton>}
          <h2 className="ui-section">Yapılan işler</h2>
          {works.length === 0 && <div className="ui-empty">Henüz iş kaydı yok.</div>}
          {works.map((e) => {
            const r = split(e, biz);
            return (
              <div key={e.id} className="ui-moneyrow">
                <b>{e.quantity} kişi · {dayText(e.occurred_on)}<small>{placeLabel(e.place_id)} · kişi başı {formatTL(r.rate)}</small></b>
                <strong>{formatTL((e.quantity ?? 0) * r.rate)}</strong>
              </div>
            );
          })}
          <h2 className="ui-section">Ödemeler</h2>
          {pays.length === 0 && <div className="ui-empty">Henüz ödeme yok.</div>}
          {pays.map((e) => <div key={e.id} className="ui-moneyrow"><b>Ödeme aldım<small>{dayText(e.occurred_on)}</small></b><strong>{formatTL(e.amount)}</strong></div>)}
          <Card><InfoRows rows={[["Telefonu", f.phone ? prettyPhone(f.phone) : "Yok"], ["Köyü", f.custom?.koy || "Yok"]]} /></Card>
          <MainButton secondary onClick={() => { setDone(null); setView({ v: "form", id: f.id }); }}>Bilgileri değiştir</MainButton>
        </main>
      );
    }
  }

  // --- Liste (sekmeler)
  return (
    <main className="ui-has-nav ui-stack">
      <PageHeader sub="Kim kime ne kadar borçlu" title="Alacaklarım" right={<HistoryLink />} />
      {error && <ErrorText>{error}</ErrorText>}
      <div className="ui-total">
        <span>Çiftçilerden alacağın</span>
        <b>{formatTL(alacak)}</b>
        <div className="ui-total-row">
          <div><span>İşçilere borcun</span><strong>{formatTL(borc)}</strong></div>
          <div><span>Bu ay senin payın</span><strong>{formatTL(kazancAy)}</strong></div>
        </div>
      </div>
      <div className="ui-tabs" role="tablist">
        {([["ciftci", "Çiftçiler"], ["isci", "İşçiler"], ["puantaj", "Puantaj"]] as [Tab, string][]).map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {done && <DoneCard message={done.message} onUndo={done.undo ? async () => { await done.undo!(); setDone(null); load(); } : undefined} />}

      {tab === "ciftci" && (
        <>
          {farmers === null && !error && <div className="ui-empty">Yükleniyor…</div>}
          {farmers?.length === 0 && <div className="ui-empty">Henüz çiftçi yok. Bugün ekranında tarla eklerken çiftçi de eklenir, ya da aşağıdan ekle.</div>}
          {fAcc.map((a) => {
            const f = a.farmer; const borclu = a.kalan > 0;
            const aciklama = borclu
              ? `${a.sonOdeme ? `Son ödemesi ${agoText(a.sonOdeme)}.` : "Henüz ödeme yapmadı."} Toplam ${a.kisiGun} kişi-gün iş yapıldı.`
              : a.kisiGun ? "Hesabı kapandı, borcu yok." : "Henüz iş yapılmadı.";
            return (
              <div key={f.id} className="ui-card ui-stack" style={{ padding: 18, gap: 12 }}>
                <button type="button" className="ui-plain" onClick={() => { setDone(null); setView({ v: "card", id: f.id }); }}>
                  <span style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontSize: 20, fontWeight: 800 }}>{f.full_name}</span>
                    {borclu ? <span className="ui-amount borc">{formatTL(a.kalan)}</span> : <StatusPill status="tamam">{a.kisiGun ? "Ödedi" : "İş yok"}</StatusPill>}
                  </span>
                  <span style={{ fontSize: 16, color: "var(--sessiz)", lineHeight: 1.45 }}>{aciklama}</span>
                </button>
                {borclu && (f.phone
                  ? <a className="ui-main-btn" style={{ minHeight: 58, fontSize: 18, borderRadius: 14, textDecoration: "none", ...(sent[f.id] ? { background: "var(--ana-acik)", color: "var(--ana-yazi)" } : {}) }}
                      href={waLink(f.phone, farmerMsg(a))} target="_blank" rel="noreferrer" onClick={() => markSent(f.id)}>
                      {sent[f.id] ? "Hesap gönderildi ✓" : "Hesabını WhatsApp’tan gönder"}
                    </a>
                  : <MainButton secondary onClick={() => setView({ v: "form", id: f.id })}>Telefonunu ekle</MainButton>)}
              </div>
            );
          })}
          <MainButton secondary onClick={() => { setDone(null); setView({ v: "form" }); }}>+ Çiftçi ekle</MainButton>
        </>
      )}

      {tab === "isci" && (
        <>
          {wAcc.length === 0 && <div className="ui-empty">Ekibinde işçi yok. Ekibim’den ekle.</div>}
          {borc > 0 && <MainButton onClick={payAll}>Herkese öde · {formatTL(borc)}</MainButton>}
          {wAcc.map((a) => (
            <div key={a.worker.id} className="ui-card ui-stack" style={{ gap: 12 }}>
              <PersonRow name={a.worker.full_name}
                sub={`${a.gun} gün · ${formatTL(a.kazanc)}${a.avans ? ` · avans ${formatTL(a.avans)}` : ""}${a.odenen ? ` · ödenen ${formatTL(a.odenen)}` : ""}`}
                right={a.kalan > 0 ? <span className="ui-amount">{formatTL(a.kalan)}</span> : <StatusPill status="tamam">{a.gun ? "Ödendi" : "İş yok"}</StatusPill>} />
              {a.kalan > 0 && (
                <div className="ui-seg">
                  <button type="button" onClick={() => payWorker(a)}>Öde</button>
                  {a.worker.phone
                    ? <a className="ui-segbtn" href={waLink(a.worker.phone, workerMsg(a))} target="_blank" rel="noreferrer" onClick={() => markSent(a.worker.id)}>{sent[a.worker.id] ? "Gönderildi ✓" : "Hesabı gönder"}</a>
                    : <span className="ui-segbtn off">Telefonu yok</span>}
                </div>
              )}
            </div>
          ))}
          <p style={{ margin: "0 4px", fontSize: 15, color: "var(--sessiz2)" }}>Avans vermek için: Ekibim → işçiye dokun → “Avans verdim”.</p>
        </>
      )}

      {tab === "puantaj" && <Puantaj events={events} workers={workers} placeLabel={placeLabel} />}

      <h2 className="ui-section">Ücretler</h2>
      <Card>
        <InfoRows rows={[
          ["Varsayılan yevmiye", <button key="w" type="button" className="ui-link inline" onClick={() => { setDone(null); setView({ v: "ayar", key: "wage" }); }}>{formatTL(wage)} · değiştir</button>],
          ["Senin payın (kişi başı)", <button key="f" type="button" className="ui-link inline" onClick={() => { setDone(null); setView({ v: "ayar", key: "fee" }); }}>{formatTL(fee)} · değiştir</button>],
          ["Çiftçiden kişi başı", formatTL(wage + fee)],
        ]} />
      </Card>
      <BottomNav items={navItems} current="/alacaklar" />
    </main>
  );
}

/** Puantaj: ay seç, kim kaç gün, gün gün kim nerede. Paylaşılabilir yazı. */
function Puantaj({ events, workers, placeLabel }: { events: EventRow[]; workers: Person[]; placeLabel: (id: string | null) => string }) {
  const biz = useBusiness();
  const months = [...new Set(events.map((e) => e.occurred_on.slice(0, 7)))].sort().reverse();
  const thisMonth = monthStart().slice(0, 7);
  if (!months.includes(thisMonth)) months.unshift(thisMonth);
  const [m, setM] = useState(thisMonth);
  const [copied, setCopied] = useState(false);
  const ev = events.filter((e) => e.occurred_on.startsWith(m));
  const monthName = (x: string) => new Date(x + "-15T12:00:00").toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
  const name = (id: string) => workers.find((w) => w.id === id)?.full_name ?? "Silinmiş işçi";
  const rows = workerAccounts(workers, ev, [], biz).filter((a) => a.gun > 0).sort((a, b) => b.gun - a.gun);
  const unnamed = ev.filter((e) => workersOf(e).length === 0).reduce((t, e) => t + (e.quantity ?? 0), 0);
  const days = [...new Set(ev.map((e) => e.occurred_on))].sort().reverse();

  const text = [
    `PUANTAJ · ${monthName(m)} · ${biz.name}`, "",
    ...rows.map((a) => `${a.worker.full_name}: ${a.gun} gün, ${formatTL(a.kazanc)}`),
    ...(unnamed ? [`İsimsiz kayıt: ${unnamed} kişi-gün`] : []), "",
    ...days.flatMap((d) => ev.filter((e) => e.occurred_on === d).map((e) =>
      `${dayText(d)} · ${placeLabel(e.place_id)} · ${e.quantity} kişi${workersOf(e).length ? `: ${workersOf(e).map((id) => name(id).split(" ")[0]).join(", ")}` : ""}`)),
  ].join("\n");

  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* izin yok */ }
  };

  return (
    <>
      <div className="ui-chips" role="group" aria-label="Ay seç">
        {months.map((x) => <Chip key={x} selected={m === x} onClick={() => setM(x)}>{monthName(x)}</Chip>)}
      </div>
      {ev.length === 0 && <div className="ui-empty">Bu ay kayıt yok.</div>}
      {rows.length > 0 && (
        <Card>
          <InfoRows rows={rows.map((a) => [a.worker.full_name, `${a.gun} gün · ${formatTL(a.kazanc)}`] as [string, string])} />
        </Card>
      )}
      {unnamed > 0 && <p style={{ margin: "0 4px", fontSize: 15, color: "var(--sessiz2)" }}>İsim seçilmeden girilen: {unnamed} kişi-gün (işçi hesabına girmez).</p>}
      {days.map((d) => (
        <div key={d} className="ui-stack" style={{ gap: 8 }}>
          <h3 style={{ margin: "6px 4px 0", fontSize: 17 }}>{dayText(d)}</h3>
          {ev.filter((e) => e.occurred_on === d).map((e) => (
            <div key={e.id} className="ui-moneyrow" style={{ background: "var(--kart)" }}>
              <b style={{ minWidth: 0 }}>{placeLabel(e.place_id)}
                <small>{workersOf(e).length ? workersOf(e).map((id) => name(id).split(" ")[0]).join(", ") : "İsim seçilmedi"}</small></b>
              <strong>{e.quantity} kişi</strong>
            </div>
          ))}
        </div>
      ))}
      {ev.length > 0 && (
        <div className="ui-seg">
          <a className="ui-segbtn" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer">WhatsApp’ta paylaş</a>
          <button type="button" onClick={copy}>{copied ? "Kopyalandı ✓" : "Kopyala"}</button>
        </div>
      )}
    </>
  );
}

/** Tek alanlı tutar girişi (sayı klavyesi). */
function Tutar({ title, sub, hint, initial = "", quick, onSave, onCancel }: {
  title: string; sub: string; hint?: string; initial?: string; quick?: number; onSave: (n: number) => Promise<void>; onCancel: () => void;
}) {
  const [v, setV] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={sub} title={title} />
      <TextField id="tutar" label="Kaç TL?" inputMode="decimal" autoFocus maxLength={12} placeholder="Örnek: 5000"
        value={v} onChange={(e) => setV(e.target.value)} style={{ fontSize: 30, fontWeight: 800 }} />
      {quick != null && <Chip onClick={() => setV(String(quick))}>Hepsini ödedi: {formatTL(quick)}</Chip>}
      {hint && <p style={{ margin: "0 4px", fontSize: 16, color: "var(--sessiz2)" }}>{hint}</p>}
      {error && <ErrorText>{error}</ErrorText>}
      <MainButton disabled={busy} onClick={async () => {
        const n = num(v);
        if (!(n > 0) || n > 100000000) { setError("Tutarı yaz. Örnek: 5000"); return; }
        setBusy(true);
        try { await onSave(n); } catch { setError("Kaydedemedim, tekrar dene."); setBusy(false); }
      }}>Kaydet</MainButton>
    </main>
  );
}

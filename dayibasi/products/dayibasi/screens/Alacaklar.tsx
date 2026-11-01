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
import { BackButton, BottomNav, Card, ContactButtons, DoneCard, ErrorText, InfoRows, MainButton, PageHeader, StatusPill, TextField } from "@/core/ui";
import { config } from "../config";
import { agoText, businessRate, eventRate, farmerAccounts, farmerRate, PUANTAJ, type FarmerAccount } from "../hesap";
import { HistoryLink, navItems } from "../nav";

const HESAP_VARSAYILAN = "Merhaba {ad}, hesabın: {kisi_gun} kişi-gün iş, toplam {tutar} TL, ödenen {odenen} TL, kalan {kalan} TL.";
const num = (s: string) => Number(s.replace(/\./g, "").replace(",", "."));
const tl = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
const SENT = "ko:hesap-gonderildi";

type View = { v: "list" } | { v: "card"; id: string } | { v: "form"; id?: string } | { v: "odeme"; id: string } | { v: "ucret"; id?: string };

export default function Alacaklar() {
  const biz = useBusiness();
  const setBiz = useSetBusiness();
  const [farmers, setFarmers] = useState<Person[] | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [tpl, setTpl] = useState(HESAP_VARSAYILAN);
  const [view, setView] = useState<View>({ v: "list" });
  const [done, setDone] = useState<{ message: string; undo?: () => Promise<void> } | null>(null);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    Promise.all([listPeople(biz.id, [config.farmers.kind]), listEvents(biz.id, PUANTAJ), listAllEntries(biz.id), listPlaces(biz.id)])
      .then(([f, e, l, p]) => { setFarmers(f); setEvents(e); setEntries(l); setPlaces(p); })
      .catch(() => setError("Bilgileri getiremedim."));
  }, [biz.id]);
  useEffect(load, [load]);
  useEffect(() => { getTemplate(biz.id, "hesap_dokumu", HESAP_VARSAYILAN).then(setTpl).catch(() => {}); }, [biz.id]);
  useEffect(() => { try { setSent(JSON.parse(localStorage.getItem(SENT) ?? "{}")); } catch { /* yok */ } }, []);

  const accounts = farmerAccounts(farmers ?? [], events, entries, biz).sort((a, b) => b.kalan - a.kalan);
  const find = (id?: string) => accounts.find((a) => a.farmer.id === id);
  const total = accounts.reduce((t, a) => t + Math.max(0, a.kalan), 0);

  const message = (a: FarmerAccount) => fillTemplate(tpl, {
    ad: a.farmer.full_name, kisi_gun: a.kisiGun, tutar: tl(a.tutar), odenen: tl(a.odenen), kalan: tl(Math.max(0, a.kalan)),
  });
  const markSent = (id: string) => {
    const n = { ...sent, [id]: new Date().toISOString().slice(0, 10) };
    setSent(n); try { localStorage.setItem(SENT, JSON.stringify(n)); } catch { /* yok */ }
  };

  // --- Çiftçi ekle / değiştir
  if (view.v === "form") {
    const a = find(view.id);
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

  // --- Ödeme aldım
  if (view.v === "odeme") {
    const a = find(view.id)!;
    return <Tutar title="Ödeme aldım" sub={a.farmer.full_name} hint={a.kalan > 0 ? `Kalan borcu: ${formatTL(a.kalan)}` : undefined}
      onCancel={() => setView({ v: "card", id: a.farmer.id })}
      onSave={async (n) => {
        const id = await addEntry(biz.id, a.farmer.id, "odeme", n);
        setDone({ message: `Kaydettim: ${a.farmer.full_name}, ${formatTL(n)} ödeme aldım.`, undo: () => deleteEntry(id) });
        setView({ v: "card", id: a.farmer.id }); load();
      }} />;
  }

  // --- Kişi başı ücret (işletmenin ya da tek çiftçinin)
  if (view.v === "ucret") {
    const a = find(view.id);
    const current = a ? farmerRate(a.farmer, biz) : businessRate(biz);
    return <Tutar title="Kişi başı ücret" sub={a ? `${a.farmer.full_name} için` : "Bütün çiftçiler için"} initial={String(current)}
      hint="Bundan sonraki kayıtlarda kullanılır. Eski kayıtların hesabı değişmez."
      onCancel={() => setView(a ? { v: "card", id: a.farmer.id } : { v: "list" })}
      onSave={async (n) => {
        if (a) {
          await updatePerson(a.farmer.id, { custom: { ...a.farmer.custom, daily_rate: String(n) } });
          setDone({ message: `${a.farmer.full_name} için kişi başı ücret ${formatTL(n)} oldu.` });
          setView({ v: "card", id: a.farmer.id });
        } else {
          const settings = { ...biz.settings, daily_rate: n };
          const { error } = await supabase().from("businesses").update({ settings }).eq("id", biz.id);
          if (error) throw error;
          setBiz({ ...biz, settings });
          setDone({ message: `Kişi başı ücret ${formatTL(n)} oldu.` });
          setView({ v: "list" });
        }
        load();
      }} />;
  }

  // --- Çiftçi kartı
  if (view.v === "card") {
    const a = find(view.id);
    if (a) {
      const f = a.farmer;
      const works = events.filter((e) => e.person_id === f.id).slice().reverse();
      const pays = entries.filter((e) => e.person_id === f.id && e.kind === "odeme")
        .sort((x, y) => y.occurred_on.localeCompare(x.occurred_on));
      const day = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
      const placeName = (id: string | null) => { const p = places.find((x) => x.id === id); return p && p.name !== f.full_name ? p.name : ""; };
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
          <Card>
            <InfoRows rows={[
              ["Yapılan iş", `${a.kisiGun} kişi-gün`], ["İşin tutarı", formatTL(a.tutar)], ["Ödenen", formatTL(a.odenen)],
              ["Kişi başı ücret", <button key="u" type="button" className="ui-link" style={{ minHeight: 0, padding: 0 }} onClick={() => { setDone(null); setView({ v: "ucret", id: f.id }); }}>{formatTL(farmerRate(f, biz))} · değiştir</button>],
            ]} />
          </Card>
          <MainButton onClick={() => { setDone(null); setView({ v: "odeme", id: f.id }); }}>+ Ödeme aldım</MainButton>
          {f.phone ? (
            <>
              <a className="ui-main-btn ikincil" style={{ textDecoration: "none" }} href={waLink(f.phone, message(a))} target="_blank" rel="noreferrer" onClick={() => markSent(f.id)}>
                {sent[f.id] ? "Hesabı tekrar gönder" : "Hesabını WhatsApp’tan gönder"}
              </a>
              <ContactButtons tel={telLink(f.phone)} wa={waLink(f.phone)} />
            </>
          ) : (
            <MainButton secondary onClick={() => setView({ v: "form", id: f.id })}>Telefonunu ekle (hesabı göndermek için)</MainButton>
          )}

          <h2 className="ui-section">Yapılan işler</h2>
          {works.length === 0 && <div className="ui-empty">Henüz iş kaydı yok.</div>}
          {works.map((e) => (
            <div key={e.id} className="ui-moneyrow">
              <b>{e.quantity} kişi{placeName(e.place_id) ? ` · ${placeName(e.place_id)}` : ""}<small>{day(e.occurred_on)} · kişi başı {formatTL(eventRate(e, f, biz))}</small></b>
              <strong>{formatTL((e.quantity ?? 0) * eventRate(e, f, biz))}</strong>
            </div>
          ))}
          <h2 className="ui-section">Ödemeler</h2>
          {pays.length === 0 && <div className="ui-empty">Henüz ödeme yok.</div>}
          {pays.map((e) => (
            <div key={e.id} className="ui-moneyrow"><b>Ödeme aldım<small>{day(e.occurred_on)}</small></b><strong>{formatTL(e.amount)}</strong></div>
          ))}
          <Card><InfoRows rows={[["Telefonu", f.phone ? prettyPhone(f.phone) : "Yok"], ["Köyü", f.custom?.koy || "Yok"]]} /></Card>
          <MainButton secondary onClick={() => { setDone(null); setView({ v: "form", id: f.id }); }}>Bilgileri değiştir</MainButton>
        </main>
      );
    }
  }

  // --- Liste
  return (
    <main className="ui-has-nav ui-stack">
      <PageHeader sub="Kim ne kadar borçlu" title="Alacaklarım" right={<HistoryLink />} />
      {done && <DoneCard message={done.message} />}
      {error && <ErrorText>{error}</ErrorText>}
      <div className="ui-total">
        <span>Sana borçlu olanların toplamı</span>
        <b>{formatTL(total)}</b>
      </div>
      {farmers === null && !error && <div className="ui-empty">Yükleniyor…</div>}
      {farmers?.length === 0 && <div className="ui-empty">Henüz çiftçi yok. Bugün ekranında tarla eklerken çiftçi de eklenir, ya da aşağıdan ekle.</div>}
      {accounts.map((a) => {
        const f = a.farmer;
        const borclu = a.kalan > 0;
        const aciklama = borclu
          ? `${a.sonOdeme ? `Son ödemesi ${agoText(a.sonOdeme)}.` : "Henüz ödeme yapmadı."} Toplam ${a.kisiGun} kişi-gün iş yapıldı.`
          : a.kisiGun ? "Hesabı kapandı, borcu yok." : "Henüz iş yapılmadı.";
        return (
          <div key={f.id} className="ui-card ui-stack" style={{ padding: 18, gap: 12 }}>
            <button type="button" onClick={() => { setDone(null); setView({ v: "card", id: f.id }); }}
              style={{ all: "unset", cursor: "pointer", display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 20, fontWeight: 800 }}>{f.full_name}</span>
                {borclu ? <span style={{ fontSize: 20, fontWeight: 800, color: "var(--tehlike)", whiteSpace: "nowrap" }}>{formatTL(a.kalan)}</span>
                  : <StatusPill status="tamam">{a.kisiGun ? "Ödedi" : "İş yok"}</StatusPill>}
              </span>
              <span style={{ fontSize: 16, color: "var(--sessiz)", lineHeight: 1.45 }}>{aciklama}</span>
            </button>
            {borclu && (f.phone
              ? <a className="ui-main-btn" style={{ minHeight: 58, fontSize: 18, borderRadius: 14, textDecoration: "none", ...(sent[f.id] ? { background: "var(--ana-acik)", color: "var(--ana-yazi)" } : {}) }}
                  href={waLink(f.phone, message(a))} target="_blank" rel="noreferrer" onClick={() => markSent(f.id)}>
                  {sent[f.id] ? "Hesap gönderildi ✓" : "Hesabını WhatsApp’tan gönder"}
                </a>
              : <MainButton secondary onClick={() => setView({ v: "form", id: f.id })}>Telefonunu ekle</MainButton>)}
          </div>
        );
      })}
      <MainButton secondary onClick={() => { setDone(null); setView({ v: "form" }); }}>+ Çiftçi ekle</MainButton>
      <button type="button" className="ui-link" onClick={() => { setDone(null); setView({ v: "ucret" }); }}>
        Kişi başı ücret: {formatTL(businessRate(biz))} · değiştir
      </button>
      <BottomNav items={navItems} current="/alacaklar" />
    </main>
  );
}

/** Tek alanlı tutar girişi (sayı klavyesi). */
function Tutar({ title, sub, hint, initial = "", onSave, onCancel }: {
  title: string; sub: string; hint?: string; initial?: string; onSave: (n: number) => Promise<void>; onCancel: () => void;
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

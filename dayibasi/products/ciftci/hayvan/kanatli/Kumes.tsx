"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { addEvent, deleteEvent, listEvents, updateEvent, type EventRow } from "@/core/events/api";
import { addLot, deleteLot, listLots, restoreLot, updateLot, type Lot } from "@/core/lots/api";
import { useOnActivate } from "@/core/shell/TabShell";
import { BackButton, Card, Chip, Counter, DoneCard, ErrorText, InfoRows, MainButton, PageHeader, StatusPill, TextField } from "@/core/ui";
import { addDays, dayText, dayYear, num, todayStr } from "../../kayit";
import { HistoryLink } from "../../nav";
import { ageDays, GUNLUK, isKumes, isSuru, suruStats, TARTIM } from "./kanatli";

type Done = { message: string; undo?: () => Promise<void> } | null;
type View = { v: "list" } | { v: "kumesForm"; edit?: Lot } | { v: "suruForm"; kumesId: string; edit?: Lot } | { v: "suru"; id: string } | { v: "gunluk"; id: string; day?: string };
const fmt = (n: number) => Math.round(n).toLocaleString("tr-TR");
const dec = (n: number, d = 2) => n.toLocaleString("tr-TR", { minimumFractionDigits: d, maximumFractionDigits: d });
const ageText = (d: number | null) => (d == null ? "" : d === 0 ? "bugün geldi" : `${d} günlük`);

/** Kümes: kümesler, sürü (dönem), bugünün kaydı (ölü, ayıklanan, yem çuvalı), tartım, sürü hesapları. */
export default function Kumes() {
  const biz = useBusiness();
  const [lots, setLots] = useState<Lot[] | null>(null);
  const [gunluk, setGunluk] = useState<EventRow[]>([]);
  const [tartim, setTartim] = useState<EventRow[]>([]);
  const [view, setView] = useState<View>({ v: "list" });
  const [done, setDone] = useState<Done>(null);

  const load = useCallback(() => {
    listLots(biz.id).then(setLots).catch(() => setLots([]));
    listEvents(biz.id, GUNLUK).then(setGunluk).catch(() => {});
    listEvents(biz.id, TARTIM).then(setTartim).catch(() => {});
  }, [biz.id]);
  useEffect(load, [load]);
  useOnActivate(load);

  const today = todayStr();
  const kumesler = (lots ?? []).filter(isKumes).sort((a, b) => a.name.localeCompare(b.name, "tr"));
  const sureler = (lots ?? []).filter(isSuru);
  const find = (id: string) => (lots ?? []).find((l) => l.id === id);
  const openOf = (k: Lot) => sureler.find((s) => s.data.kumes_id === k.id && s.status === "aktif");
  const kumesName = (s: Lot) => find(String(s.data.kumes_id ?? ""))?.name ?? "Kümes";
  const back = () => { setDone(null); setView({ v: "list" }); };
  const doneCard = done && <DoneCard message={done.message} onUndo={done.undo ? async () => { await done.undo!(); setDone(null); load(); } : undefined} />;

  // --- Kümes formu
  if (view.v === "kumesForm") return <KumesForm edit={view.edit} hasSuru={!!view.edit && sureler.some((s) => s.data.kumes_id === view.edit!.id)}
    onCancel={back}
    onDelete={view.edit ? async () => { const k = view.edit!; await deleteLot(k.id); setDone({ message: `Sildim: ${k.name}.`, undo: () => restoreLot(k) }); setView({ v: "list" }); load(); } : undefined}
    onSave={async (name, data, note) => {
      if (view.edit) { const b = { ...view.edit }; await updateLot(b.id, { name, note, data: { ...b.data, ...data } }); setDone({ message: `Değiştirdim: ${name}.`, undo: () => updateLot(b.id, b) }); }
      else { const k = await addLot(biz.id, { name, place_id: null, planted_on: null, initial_count: 0, source: null, note, data: { ...data, kanatli: "kumes" } }); setDone({ message: `Kümes eklendi: ${k.name}.`, undo: () => deleteLot(k.id) }); }
      setView({ v: "list" }); load();
    }} />;

  // --- Sürü formu
  if (view.v === "suruForm") {
    const k = find(view.kumesId);
    return <SuruForm edit={view.edit} kumesName={k?.name ?? "Kümes"} onCancel={() => setView(view.edit ? { v: "suru", id: view.edit.id } : { v: "list" })}
      onDelete={view.edit ? async () => {
        const s = view.edit!; const evs = [...gunluk, ...tartim].filter((e) => e.data.suru_id === s.id);
        for (const e of evs) await deleteEvent(e.id);
        await deleteLot(s.id);
        setDone({ message: `Sürü silindi: ${s.name}.`, undo: async () => { await restoreLot(s); for (const e of evs) await addEvent(biz.id, e); } });
        setView({ v: "list" }); load();
      } : undefined}
      onSave={async (v) => {
        if (view.edit) { const b = { ...view.edit }; await updateLot(b.id, { ...v, data: { ...b.data, ...v.data } }); setDone({ message: `Değiştirdim: ${v.name}.`, undo: () => updateLot(b.id, b) }); setView({ v: "suru", id: b.id }); }
        else {
          const s = await addLot(biz.id, { ...v, place_id: null, data: { ...v.data, kanatli: "suru", tur: "etlik", kumes_id: view.kumesId } });
          setDone({ message: `Sürü açıldı: ${k?.name}, ${fmt(s.initial_count)} civciv.`, undo: () => deleteLot(s.id) }); setView({ v: "suru", id: s.id });
        }
        load();
      }} />;
  }

  // --- Bugünün kaydı
  if (view.v === "gunluk") {
    const s = find(view.id);
    if (s) return <GunlukForm key={s.id} suru={s} kumes={kumesName(s)} initialDay={view.day ?? today} gunluk={gunluk} tartim={tartim} onCancel={() => setView({ v: "suru", id: s.id })}
      onSave={async (day, v) => {
        const undos: (() => Promise<void>)[] = [];
        if (v.bagKg && Number(s.data.bag_kg) !== v.bagKg) { const old = { ...s.data }; await updateLot(s.id, { data: { ...s.data, bag_kg: v.bagKg } }); undos.push(() => updateLot(s.id, { data: old })); }
        const data = { suru_id: s.id, dead: v.dead, culled: v.culled, bags: v.bags, bag_kg: v.bagKg ?? 0, note: v.note };
        const ex = gunluk.find((e) => e.data.suru_id === s.id && e.occurred_on === day);
        if (ex) { const old = { ...ex.data }; await updateEvent(ex.id, { data }); undos.push(() => updateEvent(ex.id, { data: old })); }
        else { const e = await addEvent(biz.id, { kind: GUNLUK, occurred_on: day, place_id: null, person_id: null, quantity: null, data }); undos.push(() => deleteEvent(e.id)); }
        if (v.weigh) { const e = await addEvent(biz.id, { kind: TARTIM, occurred_on: day, place_id: null, person_id: null, quantity: null, data: { suru_id: s.id, ...v.weigh } }); undos.push(() => deleteEvent(e.id)); }
        const parts = [`${v.dead} ölü`, v.culled ? `${v.culled} ayıklanan` : "", `${v.bags} çuval yem`, v.weigh ? `tartım ${fmt(v.weigh.avg_g)} gram` : ""].filter(Boolean).join(", ");
        setDone({ message: `Kaydettim: ${kumesName(s)}${day === today ? "" : ` (${dayText(day)})`}, ${parts}.`, undo: async () => { for (const u of undos.reverse()) await u(); } });
        setView({ v: "list" }); load();
      }} />;
  }

  // --- Sürü kartı
  if (view.v === "suru") {
    const s = find(view.id);
    if (s) {
      const st = suruStats(s, gunluk, tartim);
      const age = ageDays(s, today);
      const weighs = tartim.filter((e) => e.data.suru_id === s.id).sort((a, b) => b.occurred_on.localeCompare(a.occurred_on));
      const closed = s.status === "bitti";
      return (
        <main className="ui-stack">
          <BackButton onClick={back} label="Kümes" />
          <PageHeader sub={[kumesName(s), s.planted_on ? `giriş ${dayYear(s.planted_on)}` : "", closed ? "kapandı" : ageText(age)].filter(Boolean).join(" · ")} title={s.name} />
          {doneCard}
          <div className="ui-total">
            <span>Kalan hayvan</span><b>{fmt(st.alive)}</b>
            <div className="ui-total-row">
              <div><span>Kayıp (ölü + ayıklanan)</span><strong>%{dec(st.lossPct)}</strong></div>
              <div><span>Verilen yem</span><strong>{fmt(st.feedKg)} kg</strong></div>
            </div>
          </div>
          {!closed && <MainButton onClick={() => { setDone(null); setView({ v: "gunluk", id: s.id }); }}>Bugünün kaydı</MainButton>}
          <div className="ui-card"><InfoRows rows={[
            ["Giriş", `${fmt(s.initial_count)} civciv`],
            ["Ölü", fmt(st.dead)],
            ["Ayıklanan", fmt(st.culled)],
            ["Yem", `${fmt(st.feedBags)} çuval · ${fmt(st.feedKg)} kg`],
            ["Son tartım", st.lastWeigh ? `${fmt(Number(st.lastWeigh.data.avg_g))} gram · ${dayText(st.lastWeigh.occurred_on)}` : "Tartım yok"],
            ["Tahmini canlı ağırlık", st.liveKg != null ? `${fmt(st.liveKg)} kg` : "—"],
            ["Yemden yararlanma (tahmini)", st.fcr != null ? `${dec(st.fcr)} kg yem / 1 kg et` : "—"],
            ...(s.data.firma ? [["Firma", `${String(s.data.firma)}${s.data.sozlesme_no ? ` · sözleşme ${String(s.data.sozlesme_no)}` : ""}`] as [string, string]] : []),
            ...(s.source ? [["Civciv nereden", s.source] as [string, string]] : []),
          ]} /></div>
          {st.fcr != null && <p className="ui-note">Yemden yararlanma: verilen bütün yem ÷ (kalan hayvan × son tartım). Tartım sıklaştıkça doğrulaşır.</p>}

          <h2 className="ui-section">Günler</h2>
          {st.days.length === 0 && <p className="ui-note">Henüz günlük kayıt yok.</p>}
          {st.days.map((e) => (
            <Card key={e.id} onClick={() => { setDone(null); setView({ v: "gunluk", id: s.id, day: e.occurred_on }); }}>
              <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><b>{dayText(e.occurred_on)}</b>
                <span>{fmt(Number(e.data.dead ?? 0))} ölü{Number(e.data.culled) ? ` · ${fmt(Number(e.data.culled))} ayıklanan` : ""} · {fmt(Number(e.data.bags ?? 0))} çuval</span></span>
              {e.data.note ? <span className="ui-note" style={{ margin: 0 }}>{String(e.data.note)}</span> : null}
            </Card>
          ))}
          {weighs.length > 0 && <>
            <h2 className="ui-section">Tartımlar</h2>
            <div className="ui-card"><div className="ui-rows">{weighs.map((w) => <div key={w.id}><span>{dayText(w.occurred_on)}</span><span>{fmt(Number(w.data.avg_g))} gram{Number(w.data.n) ? ` (${fmt(Number(w.data.n))} hayvan)` : ""}</span></div>)}</div></div>
          </>}

          <MainButton secondary onClick={() => setView({ v: "suruForm", kumesId: String(s.data.kumes_id), edit: s })}>Sürü bilgilerini düzenle</MainButton>
          <MainButton secondary onClick={async () => {
            const to = closed ? "aktif" : "bitti";
            if (to === "aktif" && sureler.some((x) => x.id !== s.id && x.data.kumes_id === s.data.kumes_id && x.status === "aktif")) { setDone({ message: "Bu kümeste açık başka sürü var; önce onu kapat." }); return; }
            await updateLot(s.id, { status: to, data: { ...s.data, ...(to === "bitti" ? { closed_on: today } : {}) } });
            setDone({ message: to === "bitti" ? `Sürü kapandı: ${kumesName(s)}, kalan ${fmt(st.alive)}.` : "Sürü yeniden açıldı.", undo: () => updateLot(s.id, { status: s.status, data: s.data }) });
            load();
          }}>{closed ? "Sürüyü yeniden aç" : "Sürüyü kapat (dönem bitti)"}</MainButton>
        </main>
      );
    }
  }

  // --- Kümesler listesi
  return (
    <main className="ui-stack">
      <PageHeader sub={`${kumesler.length} kümes`} title="Kümes" right={<HistoryLink />} />
      {doneCard}
      {lots && kumesler.length === 0 && <p className="ui-note">Önce kümesini ekle. Sonra her dönem için bir sürü açıp her gün ölü ve yemi girersin.</p>}
      {kumesler.map((k) => {
        const s = openOf(k);
        const st = s ? suruStats(s, gunluk, tartim) : null;
        const entered = s && gunluk.some((e) => e.data.suru_id === s.id && e.occurred_on === today);
        const last = sureler.filter((x) => x.data.kumes_id === k.id && x.status === "bitti").sort((a, b) => String(b.data.closed_on ?? "").localeCompare(String(a.data.closed_on ?? "")))[0];
        return (
          <div key={k.id} className="ui-card ui-stack" style={{ gap: 10 }}>
            <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <b style={{ fontSize: "1.2rem" }}>{k.name}</b>
              {s ? <StatusPill status={entered ? "tamam" : "bekliyor"}>{entered ? "Bugün girildi" : "Bugün girilmedi"}</StatusPill> : <StatusPill status="bekliyor">Boş</StatusPill>}
            </span>
            {s && st ? <>
              <span className="ui-note" style={{ margin: 0 }}>{[ageText(ageDays(s, today)), `kalan ${fmt(st.alive)}`, `kayıp %${dec(st.lossPct, 1)}`].filter(Boolean).join(" · ")}</span>
              <MainButton onClick={() => { setDone(null); setView({ v: "gunluk", id: s.id }); }}>{entered ? "Bugünün kaydını düzelt" : "Bugünün kaydı"}</MainButton>
              <MainButton secondary onClick={() => { setDone(null); setView({ v: "suru", id: s.id }); }}>Sürü kartı</MainButton>
            </> : <>
              {last && <span className="ui-note" style={{ margin: 0 }}>Son sürü {last.data.closed_on ? `${dayText(String(last.data.closed_on))} kapandı` : "kapandı"}.</span>}
              <MainButton onClick={() => { setDone(null); setView({ v: "suruForm", kumesId: k.id }); }}>Yeni sürü aç</MainButton>
              {last && <MainButton secondary onClick={() => { setDone(null); setView({ v: "suru", id: last.id }); }}>Son sürünün kartı</MainButton>}
            </>}
            <button type="button" className="ui-plain" style={{ textAlign: "left" }} onClick={() => { setDone(null); setView({ v: "kumesForm", edit: k }); }}>Kümes bilgileri ›</button>
          </div>
        );
      })}
      <MainButton secondary onClick={() => { setDone(null); setView({ v: "kumesForm" }); }}>+ Kümes ekle</MainButton>
    </main>
  );
}

function KumesForm({ edit, hasSuru, onSave, onCancel, onDelete }: {
  edit?: Lot; hasSuru: boolean; onCancel: () => void; onDelete?: () => Promise<void>;
  onSave: (name: string, data: Record<string, unknown>, note: string | null) => Promise<void>;
}) {
  const [name, setName] = useState(edit?.name ?? "");
  const [m2, setM2] = useState(edit?.data.m2 ? String(edit.data.m2) : "");
  const [cap, setCap] = useState(edit?.data.capacity ? String(edit.data.capacity) : "");
  const [isl, setIsl] = useState(String(edit?.data.isletme_no ?? ""));
  const [kno, setKno] = useState(String(edit?.data.kumes_no ?? ""));
  const [note, setNote] = useState(edit?.note ?? "");
  const [error, setError] = useState("");
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub="Kümes" title={edit ? "Kümesi düzenle" : "Yeni kümes"} />
      <TextField id="k_ad" label="Kümesin adı" placeholder="Örnek: 1. kümes" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
      <TextField id="k_m2" label="Alanı, m² (isteğe bağlı)" inputMode="numeric" maxLength={6} value={m2} onChange={(e) => setM2(e.target.value.replace(/\D/g, ""))} />
      <TextField id="k_kap" label="Kaç hayvan alır? (isteğe bağlı)" inputMode="numeric" maxLength={7} value={cap} onChange={(e) => setCap(e.target.value.replace(/\D/g, ""))} />
      <TextField id="k_isl" label="Bakanlık işletme no (isteğe bağlı)" maxLength={40} value={isl} onChange={(e) => setIsl(e.target.value)} />
      <TextField id="k_no" label="Kümes / sürü no (isteğe bağlı)" maxLength={40} value={kno} onChange={(e) => setKno(e.target.value)} />
      <TextField id="k_not" label="Not (isteğe bağlı)" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      {onDelete && (hasSuru ? <p className="ui-note">Bu kümeste sürü kayıtları var; silmek için önce sürüleri sil.</p> : <MainButton className="tehlike" onClick={onDelete}>Kümesi sil</MainButton>)}
      <div className="ui-sticky-bottom"><MainButton onClick={async () => {
        if (!name.trim()) { setError("Kümesin adını yaz."); return; }
        await onSave(name.trim(), { m2: m2 ? Number(m2) : null, capacity: cap ? Number(cap) : null, isletme_no: isl.trim(), kumes_no: kno.trim() }, note.trim() || null);
      }}>Kaydet</MainButton></div>
    </main>
  );
}

function SuruForm({ edit, kumesName, onSave, onCancel, onDelete }: {
  edit?: Lot; kumesName: string; onCancel: () => void; onDelete?: () => Promise<void>;
  onSave: (v: { name: string; planted_on: string; initial_count: number; source: string | null; note: string | null; data: Record<string, unknown> }) => Promise<void>;
}) {
  const [day, setDay] = useState(edit?.planted_on ?? todayStr());
  const [count, setCount] = useState(edit ? String(edit.initial_count) : "");
  const [source, setSource] = useState(edit?.source ?? "");
  const [firma, setFirma] = useState(String(edit?.data.firma ?? ""));
  const [soz, setSoz] = useState(String(edit?.data.sozlesme_no ?? ""));
  const [gram, setGram] = useState(edit?.data.giris_g ? String(edit.data.giris_g) : "");
  const [note, setNote] = useState(edit?.note ?? "");
  const [error, setError] = useState("");
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={`${kumesName} · etlik`} title={edit ? "Sürüyü düzenle" : "Yeni sürü"} />
      <TextField id="s_gun" label="Civciv giriş günü" type="date" max={todayStr()} value={day} onChange={(e) => setDay(e.target.value)} />
      <TextField id="s_adet" label="Kaç civciv girdi?" inputMode="numeric" maxLength={7} value={count} onChange={(e) => setCount(e.target.value.replace(/\D/g, ""))} style={{ fontSize: "1.5rem", fontWeight: 800 }} />
      <TextField id="s_firma" label="Entegre firma (isteğe bağlı)" maxLength={60} value={firma} onChange={(e) => setFirma(e.target.value)} />
      <TextField id="s_soz" label="Sözleşme no (isteğe bağlı)" maxLength={40} value={soz} onChange={(e) => setSoz(e.target.value)} />
      <TextField id="s_kaynak" label="Civciv nereden geldi? Kuluçkahane (isteğe bağlı)" maxLength={40} value={source} onChange={(e) => setSource(e.target.value)} />
      <TextField id="s_gram" label="Giriş ağırlığı, ortalama gram (isteğe bağlı)" inputMode="numeric" maxLength={4} value={gram} onChange={(e) => setGram(e.target.value.replace(/\D/g, ""))} />
      <TextField id="s_not" label="Not (isteğe bağlı)" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      {onDelete && <MainButton className="tehlike" onClick={onDelete}>Sürüyü ve günlük kayıtlarını sil</MainButton>}
      <div className="ui-sticky-bottom"><MainButton onClick={async () => {
        const n = Number(count);
        if (!day) { setError("Giriş gününü seç."); return; }
        if (!(n > 0)) { setError("Kaç civciv girdiğini yaz."); return; }
        await onSave({ name: edit?.name ?? `${kumesName} · ${dayYear(day)}`, planted_on: day, initial_count: n, source: source.trim() || null, note: note.trim() || null,
          data: { firma: firma.trim(), sozlesme_no: soz.trim(), giris_g: gram ? Number(gram) : null } });
      }}>{edit ? "Kaydet" : "Sürüyü aç"}</MainButton></div>
    </main>
  );
}

function GunlukForm({ suru, kumes, initialDay, gunluk, tartim, onSave, onCancel }: {
  suru: Lot; kumes: string; initialDay: string; gunluk: EventRow[]; tartim: EventRow[]; onCancel: () => void;
  onSave: (day: string, v: { dead: number; culled: number; bags: number; bagKg: number | null; note: string; weigh: { n: number; avg_g: number } | null }) => Promise<void>;
}) {
  const today = todayStr(), yesterday = addDays(today, -1);
  const [day, setDay] = useState(initialDay);
  const ex = gunluk.find((e) => e.data.suru_id === suru.id && e.occurred_on === day);
  const [dead, setDead] = useState(0);
  const [culled, setCulled] = useState(0);
  const [bags, setBags] = useState(0);
  const [note, setNote] = useState("");
  useEffect(() => {
    setDead(Number(ex?.data.dead ?? 0)); setCulled(Number(ex?.data.culled ?? 0)); setBags(Number(ex?.data.bags ?? 0)); setNote(String(ex?.data.note ?? ""));
  }, [ex?.id, day]); // eslint-disable-line react-hooks/exhaustive-deps
  const savedKg = Number(suru.data.bag_kg) > 0 ? Number(suru.data.bag_kg) : null;
  const [bagKg, setBagKg] = useState(savedKg ? String(savedKg) : "");
  const [askKg, setAskKg] = useState(!savedKg);
  const [more, setMore] = useState(false);
  const [wN, setWN] = useState("");
  const [wG, setWG] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const weighedToday = tartim.some((e) => e.data.suru_id === suru.id && e.occurred_on === day);
  const age = ageDays({ ...suru, planted_on: suru.planted_on } as Lot, day);
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={[kumes, age != null ? `${age} günlük` : ""].filter(Boolean).join(" · ")} title="Bugünün kaydı" />
      <div className="ui-chips wrap">
        <Chip selected={day === today} onClick={() => setDay(today)}>Bugün</Chip>
        <Chip selected={day === yesterday} onClick={() => setDay(yesterday)}>Dün</Chip>
        {day !== today && day !== yesterday && <Chip selected>{dayText(day)}</Chip>}
      </div>
      {ex && <p className="ui-note">Bu günün kaydı var; değiştirip kaydedersen düzeltilir.</p>}

      <span className="ui-label">Ölü</span>
      <Counter value={dead} onChange={setDead} max={99999} />
      <span className="ui-label">Ayıklanan</span>
      <Counter value={culled} onChange={setCulled} max={99999} />
      <span className="ui-label">Verilen yem</span>
      <Counter value={bags} onChange={setBags} max={9999} unit=" çuval" />
      {askKg
        ? <TextField id="g_kg" label="Bir çuval kaç kilo? (bir kez sorulur)" inputMode="decimal" maxLength={5} value={bagKg} onChange={(e) => setBagKg(e.target.value)} />
        : <button type="button" className="ui-plain" style={{ textAlign: "left" }} onClick={() => setAskKg(true)}>Çuval {savedKg} kg · değiştir ›</button>}

      <button type="button" className="ui-plain" style={{ textAlign: "left" }} onClick={() => setMore(!more)}>{more ? "Daha az ‹" : "Daha fazla: tartım, not ›"}</button>
      {more && <div className="ui-stack">
        {weighedToday && <p className="ui-note">Bu gün tartım girilmiş; yeni tartım ayrıca eklenir.</p>}
        <TextField id="g_wg" label="Tartım: ortalama gram" inputMode="numeric" maxLength={5} value={wG} onChange={(e) => setWG(e.target.value.replace(/\D/g, ""))} />
        <TextField id="g_wn" label="Kaç hayvan tartıldı? (isteğe bağlı)" inputMode="numeric" maxLength={5} value={wN} onChange={(e) => setWN(e.target.value.replace(/\D/g, ""))} />
        <TextField id="g_not" label="Not (isteğe bağlı)" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>}

      {error && <ErrorText>{error}</ErrorText>}
      <div className="ui-sticky-bottom"><MainButton disabled={busy} onClick={async () => {
        const kg = bagKg ? num(bagKg) : null;
        if (bags > 0 && !(kg && kg > 0)) { setError("Bir çuvalın kaç kilo olduğunu yaz."); setAskKg(true); return; }
        setBusy(true);
        try { await onSave(day, { dead, culled, bags, bagKg: kg && kg > 0 ? kg : null, note: note.trim(), weigh: Number(wG) > 0 ? { n: Number(wN) || 0, avg_g: Number(wG) } : null }); }
        finally { setBusy(false); }
      }}>Kaydet</MainButton></div>
    </main>
  );
}

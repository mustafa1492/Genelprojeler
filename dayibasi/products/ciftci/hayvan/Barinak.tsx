"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { useOnActivate } from "@/core/shell/TabShell";
import { BackButton, Card, Chip, Counter, DoneCard, ErrorText, InfoRows, MainButton, PageHeader, StatusPill, TextField } from "@/core/ui";
import { addDays, dayText, dayYear, num, todayStr } from "../kayit";
import { HistoryLink } from "../nav";
import {
  addBarn, addHerd, addHerdDay, deleteBarn, deleteHerd, deleteHerdDay, listBarns, listHerdDays, listHerds, restoreBarn, restoreHerd, restoreHerdDay,
  updateBarn, updateHerd, updateHerdDay, type Barn, type Herd, type HerdDay, type Species,
} from "./api";
import { ageDays, herdStats, TURLER, type Tur } from "./hayvan";

type Done = { message: string; undo?: () => Promise<void> } | null;
type View = { v: "list" } | { v: "barnForm"; edit?: Barn } | { v: "herdForm"; barnId: string; edit?: Herd } | { v: "herd"; id: string } | { v: "gunluk"; id: string; day?: string };
const fmt = (n: number) => Math.round(n).toLocaleString("tr-TR");
const dec = (n: number, d = 2) => n.toLocaleString("tr-TR", { minimumFractionDigits: d, maximumFractionDigits: d });
const ageText = (d: number) => (d === 0 ? "bugün geldi" : `${d} günlük`);
const low = (s: string) => s.toLocaleLowerCase("tr");

/** Hayvan ortak ekranı: barınaklar (kümes/ağıl/ahır), sürü aç/kapat, bugünün kaydı (ölü, ayıklanan, yem), tartım, sürü kartı. */
export default function Barinak({ species }: { species: Species }) {
  const tur = TURLER[species];
  const biz = useBusiness();
  const [barns, setBarns] = useState<Barn[] | null>(null);
  const [herds, setHerds] = useState<Herd[]>([]);
  const [days, setDays] = useState<HerdDay[]>([]);
  const [view, setView] = useState<View>({ v: "list" });
  const [done, setDone] = useState<Done>(null);

  const load = useCallback(() => {
    listBarns(biz.id, species).then(setBarns).catch(() => setBarns([]));
    listHerds(biz.id, species).then(setHerds).catch(() => {});
    listHerdDays(biz.id).then(setDays).catch(() => {});
  }, [biz.id, species]);
  useEffect(load, [load]);
  useOnActivate(load);

  const today = todayStr();
  const list = barns ?? [];
  const barnName = (h: Herd) => list.find((b) => b.id === h.barn_id)?.name ?? tur.barn;
  const openOf = (b: Barn) => herds.find((h) => h.barn_id === b.id && h.status === "acik");
  const back = () => { setDone(null); setView({ v: "list" }); };
  const doneCard = done && <DoneCard message={done.message} onUndo={done.undo ? async () => { await done.undo!(); setDone(null); load(); } : undefined} />;

  if (view.v === "barnForm") return <BarnForm tur={tur} edit={view.edit} hasHerd={!!view.edit && herds.some((h) => h.barn_id === view.edit!.id)} onCancel={back}
    onDelete={view.edit ? async () => { const b = view.edit!; await deleteBarn(b.id); setDone({ message: `Sildim: ${b.name}.`, undo: () => restoreBarn(b) }); setView({ v: "list" }); load(); } : undefined}
    onSave={async (v) => {
      if (view.edit) { const old = { ...view.edit }; await updateBarn(old.id, { ...v, data: { ...old.data, ...v.data } }); setDone({ message: `Değiştirdim: ${v.name}.`, undo: () => updateBarn(old.id, old) }); }
      else { const b = await addBarn(biz.id, { ...v, species }); setDone({ message: `${tur.barn} eklendi: ${b.name}.`, undo: () => deleteBarn(b.id) }); }
      setView({ v: "list" }); load();
    }} />;

  if (view.v === "herdForm") {
    const b = list.find((x) => x.id === view.barnId);
    return <HerdForm tur={tur} edit={view.edit} barnName={b?.name ?? tur.barn} onCancel={() => setView(view.edit ? { v: "herd", id: view.edit.id } : { v: "list" })}
      onDelete={view.edit ? async () => {
        const h = view.edit!; const mine = days.filter((d) => d.herd_id === h.id);
        for (const d of mine) await deleteHerdDay(d.id);
        await deleteHerd(h.id);
        setDone({ message: `Sürü silindi: ${h.name}.`, undo: async () => { await restoreHerd(h); for (const d of mine) await restoreHerdDay(d); } });
        setView({ v: "list" }); load();
      } : undefined}
      onSave={async (v) => {
        if (view.edit) { const old = { ...view.edit }; await updateHerd(old.id, { ...v, data: { ...old.data, ...v.data } }); setDone({ message: `Değiştirdim: ${v.name}.`, undo: () => updateHerd(old.id, old) }); setView({ v: "herd", id: old.id }); }
        else {
          const h = await addHerd(biz.id, { ...v, barn_id: view.barnId, species, kind: tur.kinds[0] ?? null, status: "acik", closed_on: null });
          setDone({ message: `Sürü açıldı: ${b?.name}, ${fmt(h.initial_count)} ${tur.animal}.`, undo: () => deleteHerd(h.id) }); setView({ v: "herd", id: h.id });
        }
        load();
      }} />;
  }

  if (view.v === "gunluk") {
    const h = herds.find((x) => x.id === view.id);
    if (h) return <GunlukForm key={h.id} herd={h} barn={barnName(h)} initialDay={view.day ?? today} days={days} onCancel={() => setView({ v: "herd", id: h.id })}
      onSave={async (day, v) => {
        const undos: (() => Promise<void>)[] = [];
        if (v.bag_kg && Number(h.data.bag_kg) !== v.bag_kg) { const old = { ...h.data }; await updateHerd(h.id, { data: { ...h.data, bag_kg: v.bag_kg } }); undos.push(() => updateHerd(h.id, { data: old })); }
        const ex = days.find((d) => d.herd_id === h.id && d.day === day);
        if (ex) { const old = { ...ex }; await updateHerdDay(ex.id, v); undos.push(() => updateHerdDay(ex.id, old)); }
        else { const d = await addHerdDay(biz.id, { ...v, herd_id: h.id, day, data: {} }); undos.push(() => deleteHerdDay(d.id)); }
        const parts = [`${v.dead} ölü`, v.culled ? `${v.culled} ayıklanan` : "", `${fmt(v.feed_bags)} çuval yem`, v.avg_weight_g ? `tartım ${fmt(v.avg_weight_g)} gram` : ""].filter(Boolean).join(", ");
        setDone({ message: `Kaydettim: ${barnName(h)}${day === today ? "" : ` (${dayText(day)})`}, ${parts}.`, undo: async () => { for (const u of undos.reverse()) await u(); } });
        setView({ v: "list" }); load();
      }} />;
  }

  if (view.v === "herd") {
    const h = herds.find((x) => x.id === view.id);
    if (h) {
      const st = herdStats(h, days);
      const weighs = st.days.filter((d) => (d.avg_weight_g ?? 0) > 0);
      const closed = h.status === "kapandi";
      return (
        <main className="ui-stack">
          <BackButton onClick={back} label={tur.barn} />
          <PageHeader sub={[barnName(h), `giriş ${dayYear(h.started_on)}`, closed ? "kapandı" : ageText(ageDays(h, today))].join(" · ")} title={h.name} />
          {doneCard}
          <div className="ui-total">
            <span>Kalan hayvan</span><b>{fmt(st.alive)}</b>
            <div className="ui-total-row">
              <div><span>Kayıp (ölü + ayıklanan)</span><strong>%{dec(st.lossPct)}</strong></div>
              <div><span>Verilen yem</span><strong>{fmt(st.feedKg)} kg</strong></div>
            </div>
          </div>
          {!closed && <MainButton onClick={() => { setDone(null); setView({ v: "gunluk", id: h.id }); }}>Bugünün kaydı</MainButton>}
          <div className="ui-card"><InfoRows rows={[
            ["Giriş", `${fmt(h.initial_count)} ${tur.animal}`],
            ["Ölü", fmt(st.dead)],
            ["Ayıklanan", fmt(st.culled)],
            ["Yem", `${fmt(st.feedBags)} çuval · ${fmt(st.feedKg)} kg`],
            ["Son tartım", st.lastWeigh ? `${fmt(st.lastWeigh.avg_weight_g!)} gram · ${dayText(st.lastWeigh.day)}` : "Tartım yok"],
            ["Tahmini canlı ağırlık", st.liveKg != null ? `${fmt(st.liveKg)} kg` : "—"],
            ["Yemden yararlanma (tahmini)", st.fcr != null ? `${dec(st.fcr)} kg yem / 1 kg et` : st.liveKg != null && !st.feedComplete ? "Girişten beri yem kaydı eksik" : "—"],
            ...(h.data.firma ? [["Firma", `${String(h.data.firma)}${h.data.sozlesme_no ? ` · sözleşme ${String(h.data.sozlesme_no)}` : ""}`] as [string, string]] : []),
            ...(h.source ? [["Nereden geldi", h.source] as [string, string]] : []),
          ]} /></div>
          {st.liveKg != null && !st.feedComplete && <p className="ui-note">Uygulamaya sürünün ortasında başladıysan, önceki günlerin yemini "Sürü bilgilerini düzenle"den toplam olarak yaz; oran o zaman hesaplanır.</p>}
          {st.fcr != null && <p className="ui-note">Yemden yararlanma: verilen bütün yem ÷ (kalan hayvan × son tartım). Tartım sıklaştıkça doğrulaşır.</p>}

          <h2 className="ui-section">Günler</h2>
          {st.days.length === 0 && <p className="ui-note">Henüz günlük kayıt yok.</p>}
          {st.days.map((d) => (
            <Card key={d.id} onClick={() => { setDone(null); setView({ v: "gunluk", id: h.id, day: d.day }); }}>
              <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><b>{dayText(d.day)}</b>
                <span>{fmt(d.dead)} ölü{d.culled ? ` · ${fmt(d.culled)} ayıklanan` : ""} · {fmt(d.feed_bags)} çuval</span></span>
              {d.note ? <span className="ui-note" style={{ margin: 0 }}>{d.note}</span> : null}
            </Card>
          ))}
          {weighs.length > 0 && <>
            <h2 className="ui-section">Tartımlar</h2>
            <div className="ui-card"><div className="ui-rows">{weighs.map((w) => <div key={w.id}><span>{dayText(w.day)}</span><span>{fmt(w.avg_weight_g!)} gram{w.weighed_n ? ` (${fmt(w.weighed_n)} hayvan)` : ""}</span></div>)}</div></div>
          </>}

          <MainButton secondary onClick={() => setView({ v: "herdForm", barnId: String(h.barn_id), edit: h })}>Sürü bilgilerini düzenle</MainButton>
          <MainButton secondary onClick={async () => {
            if (closed && herds.some((x) => x.id !== h.id && x.barn_id === h.barn_id && x.status === "acik")) { setDone({ message: `Bu ${low(tur.barn)}te açık başka sürü var; önce onu kapat.` }); return; }
            const v = closed ? { status: "acik", closed_on: null } : { status: "kapandi", closed_on: today };
            await updateHerd(h.id, v);
            setDone({ message: closed ? "Sürü yeniden açıldı." : `Sürü kapandı: ${barnName(h)}, kalan ${fmt(st.alive)}.`, undo: () => updateHerd(h.id, { status: h.status, closed_on: h.closed_on }) });
            load();
          }}>{closed ? "Sürüyü yeniden aç" : "Sürüyü kapat (dönem bitti)"}</MainButton>
        </main>
      );
    }
  }

  return (
    <main className="ui-stack">
      <PageHeader sub={`${list.length} ${low(tur.barn)}`} title={tur.barns} right={<HistoryLink />} />
      {doneCard}
      {barns && list.length === 0 && <p className="ui-note">{species === "kanatli" ? `Önce ${low(tur.barn)} ekle. Sonra her dönem için bir sürü açıp her gün ölü ve yemi girersin.` : `${tur.barns} ekle; hayvanları eklerken nerede durduğunu seçersin. İstersen toplu sürü açıp günlük ölü ve yemi de girebilirsin.`}</p>}
      {list.map((b) => {
        const h = openOf(b);
        const st = h ? herdStats(h, days) : null;
        const entered = h && days.some((d) => d.herd_id === h.id && d.day === today);
        const last = herds.filter((x) => x.barn_id === b.id && x.status === "kapandi").sort((x, y) => (y.closed_on ?? "").localeCompare(x.closed_on ?? ""))[0];
        return (
          <div key={b.id} className="ui-card ui-stack" style={{ gap: 10 }}>
            <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <b style={{ fontSize: "1.2rem" }}>{b.name}</b>
              {h ? <StatusPill status={entered ? "tamam" : "bekliyor"}>{entered ? "Bugün girildi" : "Bugün girilmedi"}</StatusPill> : <StatusPill status="bekliyor">Boş</StatusPill>}
            </span>
            {h && st ? <>
              <span className="ui-note" style={{ margin: 0 }}>{[ageText(ageDays(h, today)), `kalan ${fmt(st.alive)}`, `kayıp %${dec(st.lossPct, 1)}`].join(" · ")}</span>
              <MainButton onClick={() => { setDone(null); setView({ v: "gunluk", id: h.id }); }}>{entered ? "Bugünün kaydını düzelt" : "Bugünün kaydı"}</MainButton>
              <MainButton secondary onClick={() => { setDone(null); setView({ v: "herd", id: h.id }); }}>Sürü kartı</MainButton>
            </> : <>
              {last && <span className="ui-note" style={{ margin: 0 }}>Son sürü {last.closed_on ? `${dayText(last.closed_on)} kapandı` : "kapandı"}.</span>}
              <MainButton onClick={() => { setDone(null); setView({ v: "herdForm", barnId: b.id }); }}>Yeni sürü aç</MainButton>
              {last && <MainButton secondary onClick={() => { setDone(null); setView({ v: "herd", id: last.id }); }}>Son sürünün kartı</MainButton>}
            </>}
            <button type="button" className="ui-plain" style={{ textAlign: "left" }} onClick={() => { setDone(null); setView({ v: "barnForm", edit: b }); }}>{tur.barn} bilgileri ›</button>
          </div>
        );
      })}
      <MainButton secondary onClick={() => { setDone(null); setView({ v: "barnForm" }); }}>+ {tur.barn} ekle</MainButton>
    </main>
  );
}

function BarnForm({ tur, edit, hasHerd, onSave, onCancel, onDelete }: {
  tur: Tur; edit?: Barn; hasHerd: boolean; onCancel: () => void; onDelete?: () => Promise<void>;
  onSave: (v: { name: string; area_m2: number | null; capacity: number | null; note: string | null; data: Record<string, unknown> }) => Promise<void>;
}) {
  const [name, setName] = useState(edit?.name ?? "");
  const [m2, setM2] = useState(edit?.area_m2 ? String(edit.area_m2) : "");
  const [cap, setCap] = useState(edit?.capacity ? String(edit.capacity) : "");
  const [isl, setIsl] = useState(String(edit?.data.isletme_no ?? ""));
  const [bno, setBno] = useState(String(edit?.data.barinak_no ?? ""));
  const [note, setNote] = useState(edit?.note ?? "");
  const [error, setError] = useState("");
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={tur.barn} title={edit ? `${tur.barn} bilgileri` : `Yeni ${low(tur.barn)}`} />
      <TextField id="b_ad" label="Adı" placeholder={`Örnek: 1. ${low(tur.barn)}`} maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
      <TextField id="b_m2" label="Alanı, m² (isteğe bağlı)" inputMode="numeric" maxLength={6} value={m2} onChange={(e) => setM2(e.target.value.replace(/\D/g, ""))} />
      <TextField id="b_kap" label="Kaç hayvan alır? (isteğe bağlı)" inputMode="numeric" maxLength={7} value={cap} onChange={(e) => setCap(e.target.value.replace(/\D/g, ""))} />
      <TextField id="b_isl" label="Bakanlık işletme no (isteğe bağlı)" maxLength={40} value={isl} onChange={(e) => setIsl(e.target.value)} />
      <TextField id="b_no" label={`${tur.barn} / sürü no (isteğe bağlı)`} maxLength={40} value={bno} onChange={(e) => setBno(e.target.value)} />
      <TextField id="b_not" label="Not (isteğe bağlı)" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      {onDelete && (hasHerd ? <p className="ui-note">Burada sürü kayıtları var; silmek için önce sürüleri sil.</p> : <MainButton className="tehlike" onClick={onDelete}>{tur.barn} sil</MainButton>)}
      <div className="ui-sticky-bottom"><MainButton onClick={async () => {
        if (!name.trim()) { setError("Adını yaz."); return; }
        await onSave({ name: name.trim(), area_m2: m2 ? Number(m2) : null, capacity: cap ? Number(cap) : null, note: note.trim() || null, data: { isletme_no: isl.trim(), barinak_no: bno.trim() } });
      }}>Kaydet</MainButton></div>
    </main>
  );
}

function HerdForm({ tur, edit, barnName, onSave, onCancel, onDelete }: {
  tur: Tur; edit?: Herd; barnName: string; onCancel: () => void; onDelete?: () => Promise<void>;
  onSave: (v: { name: string; started_on: string; initial_count: number; source: string | null; note: string | null; data: Record<string, unknown> }) => Promise<void>;
}) {
  const [day, setDay] = useState(edit?.started_on ?? todayStr());
  const [count, setCount] = useState(edit ? String(edit.initial_count) : "");
  const [source, setSource] = useState(edit?.source ?? "");
  const [firma, setFirma] = useState(String(edit?.data.firma ?? ""));
  const [soz, setSoz] = useState(String(edit?.data.sozlesme_no ?? ""));
  const [gram, setGram] = useState(edit?.data.giris_g ? String(edit.data.giris_g) : "");
  const [pFeed, setPFeed] = useState(edit?.data.prior_feed_kg ? String(edit.data.prior_feed_kg) : "");
  const [pDead, setPDead] = useState(edit?.data.prior_dead ? String(edit.data.prior_dead) : "");
  const [note, setNote] = useState(edit?.note ?? "");
  const [error, setError] = useState("");
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={[barnName, tur.kinds[0]].filter(Boolean).join(" · ")} title={edit ? "Sürüyü düzenle" : "Yeni sürü"} />
      <TextField id="h_gun" label="Giriş günü" type="date" max={todayStr()} value={day} onChange={(e) => setDay(e.target.value)} />
      <TextField id="h_adet" label={`Kaç ${tur.animal} girdi?`} inputMode="numeric" maxLength={7} value={count} onChange={(e) => setCount(e.target.value.replace(/\D/g, ""))} style={{ fontSize: "1.5rem", fontWeight: 800 }} />
      {tur.contract && <>
        <TextField id="h_firma" label="Entegre firma (isteğe bağlı)" maxLength={60} value={firma} onChange={(e) => setFirma(e.target.value)} />
        <TextField id="h_soz" label="Sözleşme no (isteğe bağlı)" maxLength={40} value={soz} onChange={(e) => setSoz(e.target.value)} />
      </>}
      <TextField id="h_kaynak" label={tur.species === "kanatli" ? "Civciv nereden geldi? Kuluçkahane (isteğe bağlı)" : "Nereden alındı? (isteğe bağlı)"} maxLength={60} value={source} onChange={(e) => setSource(e.target.value)} />
      <TextField id="h_gram" label="Giriş ağırlığı, ortalama gram (isteğe bağlı)" inputMode="numeric" maxLength={7} value={gram} onChange={(e) => setGram(e.target.value.replace(/\D/g, ""))} />
      <TextField id="h_pyem" label="Uygulamadan önce verilen yem, toplam kg (isteğe bağlı)" inputMode="decimal" maxLength={9} value={pFeed} onChange={(e) => setPFeed(e.target.value)} />
      <TextField id="h_pol" label="Uygulamadan önce ölen + ayıklanan (isteğe bağlı)" inputMode="numeric" maxLength={7} value={pDead} onChange={(e) => setPDead(e.target.value.replace(/\D/g, ""))} />
      <p className="ui-note">Sürünün ortasında başladıysan önceki günleri tek tek girmek yerine burada toplam yaz; kalan hayvan ve yem hesabına eklenir.</p>
      <TextField id="h_not" label="Not (isteğe bağlı)" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      {onDelete && <MainButton className="tehlike" onClick={onDelete}>Sürüyü ve günlük kayıtlarını sil</MainButton>}
      <div className="ui-sticky-bottom"><MainButton onClick={async () => {
        const n = Number(count);
        if (!day) { setError("Giriş gününü seç."); return; }
        if (!(n > 0)) { setError(`Kaç ${tur.animal} girdiğini yaz.`); return; }
        await onSave({ name: edit?.name ?? `${barnName} · ${dayYear(day)}`, started_on: day, initial_count: n, source: source.trim() || null, note: note.trim() || null,
          data: { ...(tur.contract ? { firma: firma.trim(), sozlesme_no: soz.trim() } : {}), giris_g: gram ? Number(gram) : null, prior_feed_kg: pFeed ? num(pFeed) : 0, prior_dead: pDead ? Number(pDead) : 0 } });
      }}>{edit ? "Kaydet" : "Sürüyü aç"}</MainButton></div>
    </main>
  );
}

type DayValues = { dead: number; culled: number; feed_bags: number; bag_kg: number | null; avg_weight_g: number | null; weighed_n: number | null; note: string | null };

function GunlukForm({ herd, barn, initialDay, days, onSave, onCancel }: {
  herd: Herd; barn: string; initialDay: string; days: HerdDay[]; onCancel: () => void; onSave: (day: string, v: DayValues) => Promise<void>;
}) {
  const today = todayStr(), yesterday = addDays(today, -1);
  const [day, setDay] = useState(initialDay);
  const ex = days.find((d) => d.herd_id === herd.id && d.day === day);
  const [dead, setDead] = useState(0);
  const [culled, setCulled] = useState(0);
  const [bags, setBags] = useState(0);
  const [note, setNote] = useState("");
  const [wG, setWG] = useState("");
  const [wN, setWN] = useState("");
  useEffect(() => {
    setDead(ex?.dead ?? 0); setCulled(ex?.culled ?? 0); setBags(ex?.feed_bags ?? 0); setNote(ex?.note ?? "");
    setWG(ex?.avg_weight_g ? String(ex.avg_weight_g) : ""); setWN(ex?.weighed_n ? String(ex.weighed_n) : "");
  }, [ex?.id, day]); // eslint-disable-line react-hooks/exhaustive-deps
  const savedKg = Number(herd.data.bag_kg) > 0 ? Number(herd.data.bag_kg) : null;
  const [bagKg, setBagKg] = useState(savedKg ? String(savedKg) : "");
  const [askKg, setAskKg] = useState(!savedKg);
  const [more, setMore] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={`${barn} · ${ageDays(herd, day)} günlük`} title="Bugünün kaydı" />
      <div className="ui-chips wrap">
        <Chip selected={day === today} onClick={() => setDay(today)}>Bugün</Chip>
        {yesterday >= herd.started_on && <Chip selected={day === yesterday} onClick={() => setDay(yesterday)}>Dün</Chip>}
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
        <TextField id="g_wg" label="Tartım: ortalama gram" inputMode="numeric" maxLength={7} value={wG} onChange={(e) => setWG(e.target.value.replace(/\D/g, ""))} />
        <TextField id="g_wn" label="Kaç hayvan tartıldı? (isteğe bağlı)" inputMode="numeric" maxLength={7} value={wN} onChange={(e) => setWN(e.target.value.replace(/\D/g, ""))} />
        <TextField id="g_not" label="Not (isteğe bağlı)" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>}

      {error && <ErrorText>{error}</ErrorText>}
      <div className="ui-sticky-bottom"><MainButton disabled={busy} onClick={async () => {
        const kg = bagKg ? num(bagKg) : null;
        if (bags > 0 && !(kg && kg > 0)) { setError("Bir çuvalın kaç kilo olduğunu yaz."); setAskKg(true); return; }
        setBusy(true);
        try {
          await onSave(day, { dead, culled, feed_bags: bags, bag_kg: kg && kg > 0 ? kg : null, avg_weight_g: Number(wG) > 0 ? Number(wG) : null, weighed_n: Number(wN) > 0 ? Number(wN) : null, note: note.trim() || null });
        } finally { setBusy(false); }
      }}>Kaydet</MainButton></div>
    </main>
  );
}

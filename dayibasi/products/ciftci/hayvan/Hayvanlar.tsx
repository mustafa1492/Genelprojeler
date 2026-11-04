"use client";
import { MASK, moneyHidden } from "@/core/ui/privacy";
import { useCallback, useEffect, useState } from "react";
import { useBusiness, useSetBusiness } from "@/core/auth/AuthGate";
import { addEvent, deleteEvent } from "@/core/events/api";
import { useOnActivate } from "@/core/shell/TabShell";
import { BackButton, Card, Chip, Counter, DoneCard, ErrorText, InfoRows, MainButton, PageHeader, StatusPill, TextField, WarningCard } from "@/core/ui";
import { supabase } from "@/core/supabase/client";
import { addDays, dayText, dayYear, GELIR, num, todayStr } from "../kayit";
import { HistoryLink } from "../nav";
import { listBarns, type Barn } from "./api";
import Barinak from "./Barinak";
import { TURLER } from "./hayvan";
import {
  addAnimal, addAnimalEvent, animalLabel, deleteAnimal, deleteAnimalEvent, durum, EV_LABEL, KINDS, kindsOf, listAnimalEvents, listAnimals, REPRO, restoreAnimal,
  restoreAnimalEvent, SURE_ADI, SURE_VARSAYILAN, sureOf, updateAnimal, type Animal, type AnimalEvent, type EvType, type Kind, type Sure,
} from "./kart";

type Sp = "kucukbas" | "buyukbas";
type Done = { message: string; undo?: () => Promise<void> } | null;
type View = { v: "list" } | { v: "barinak" } | { v: "sureler" } | { v: "form"; edit?: Animal } | { v: "kart"; id: string } | { v: "olay"; id: string; type?: EvType };
const tl = (n: number) => (moneyHidden() ? `${MASK} TL` : `${Math.round(n).toLocaleString("tr-TR")} TL`);
const low = (s: string) => s.toLocaleLowerCase("tr");

/** Büyükbaş / küçükbaş: küpe numaralı hayvan kartları, olaylar, yaklaşan işler, ilaç arınma uyarısı. Ahır/ağıl ve toplu sürü kaydı ortak Barinak ekranında. */
export default function Hayvanlar({ species }: { species: Sp }) {
  const tur = TURLER[species];
  const biz = useBusiness();
  const [animals, setAnimals] = useState<Animal[] | null>(null);
  const [events, setEvents] = useState<AnimalEvent[]>([]);
  const [barns, setBarns] = useState<Barn[]>([]);
  const [view, setView] = useState<View>({ v: "list" });
  const [done, setDone] = useState<Done>(null);
  const [q, setQ] = useState("");
  const [gone, setGone] = useState(false);

  const load = useCallback(() => {
    listAnimals(biz.id).then((r) => setAnimals(r.filter((a) => a.species === species))).catch(() => setAnimals([]));
    listAnimalEvents(biz.id).then(setEvents).catch(() => {});
    listBarns(biz.id, species).then(setBarns).catch(() => {});
  }, [biz.id, species]);
  useEffect(load, [load]);
  useOnActivate(load);

  const today = todayStr();
  const all = animals ?? [];
  const evOf = (id: string) => events.filter((e) => e.animal_id === id);
  const st = (a: Animal) => durum(a, evOf(a.id), sureOf(biz, a.kind), today);
  const go = (v: View) => { setDone(null); setView(v); };
  const doneCard = done && <DoneCard message={done.message} onUndo={done.undo ? async () => { await done.undo!(); setDone(null); load(); } : undefined} />;
  const tabs = (
    <div className="ui-chips wrap">
      <Chip selected={view.v !== "barinak"} onClick={() => go({ v: "list" })}>Hayvanlar</Chip>
      <Chip selected={view.v === "barinak"} onClick={() => go({ v: "barinak" })}>{tur.barns} ve sürü</Chip>
    </div>
  );

  if (view.v === "barinak") return <div className="ui-stack">{tabs}<Barinak species={species} /></div>;
  if (view.v === "sureler") return <Sureler species={species} onDone={(m) => { setDone({ message: m }); setView({ v: "list" }); }} />;

  if (view.v === "form") return <AnimalForm species={species} barns={barns} edit={view.edit} onCancel={() => setView(view.edit ? { v: "kart", id: view.edit.id } : { v: "list" })}
    onDelete={view.edit ? async () => {
      const a = view.edit!; const mine = evOf(a.id);
      for (const e of mine) await deleteAnimalEvent(e.id);
      await deleteAnimal(a.id);
      setDone({ message: `Sildim: ${animalLabel(a)}.`, undo: async () => { await restoreAnimal(a); for (const e of mine) await restoreAnimalEvent(e); } });
      setView({ v: "list" }); load();
    } : undefined}
    onSave={async (v) => {
      if (view.edit) { const old = { ...view.edit }; await updateAnimal(old.id, v); setDone({ message: `Değiştirdim: ${animalLabel({ ...old, ...v })}.`, undo: () => updateAnimal(old.id, old) }); setView({ v: "kart", id: old.id }); }
      else { const a = await addAnimal(biz.id, { ...v, species, mother_id: null, status: "var", left_on: null, data: {} }); setDone({ message: `Ekledim: ${KINDS[a.kind].label} ${animalLabel(a)}.`, undo: () => deleteAnimal(a.id) }); setView({ v: "kart", id: a.id }); }
      load();
    }} />;

  if (view.v === "olay") {
    const a = all.find((x) => x.id === view.id);
    if (a) return <OlayForm animal={a} initialType={view.type} onCancel={() => setView({ v: "kart", id: a.id })}
      onSave={async (type, day, data, note, young) => {
        const undos: (() => Promise<void>)[] = [];
        const e = await addAnimalEvent(biz.id, { animal_id: a.id, day, type, data, note }); undos.push(() => deleteAnimalEvent(e.id));
        let extra = "";
        if (type === "dogum") for (const y of young) {
          const c = await addAnimal(biz.id, { species, kind: a.kind, barn_id: a.barn_id, tag: y.tag || null, name: y.tag ? null : `${KINDS[a.kind].young} (${animalLabel(a)})`.slice(0, 40), sex: y.sex, breed: a.breed, born_on: day, mother_id: a.id, status: "var", left_on: null, note: null, data: {} });
          undos.push(() => deleteAnimal(c.id));
        }
        if (type === "dogum" && young.length) extra = `, ${young.length} ${KINDS[a.kind].young} kaydedildi`;
        if (type === "satis" || type === "olum") {
          const old = { status: a.status, left_on: a.left_on };
          await updateAnimal(a.id, { status: type === "satis" ? "satildi" : "oldu", left_on: day }); undos.push(() => updateAnimal(a.id, old));
        }
        if (type === "satis" && Number(data.price) > 0) {
          const g = await addEvent(biz.id, { kind: GELIR, occurred_on: day, place_id: null, person_id: null, quantity: Number(data.price),
            data: { type: "Hayvan satışı", qty: 1, unit: "baş", price: Number(data.price), buyer: data.buyer || null, received: Number(data.price), animal_id: a.id } });
          undos.push(() => deleteEvent(g.id)); extra = `, gelire ${tl(Number(data.price))} yazıldı`;
        }
        setDone({ message: `Kaydettim: ${animalLabel(a)}, ${low(EV_LABEL[type])}${type === "ilac" && data.drug ? ` (${String(data.drug)})` : ""}${extra}.`, undo: async () => { for (const u of undos.reverse()) await u(); } });
        setView({ v: "kart", id: a.id }); load();
      }} />;
  }

  if (view.v === "kart") {
    const a = all.find((x) => x.id === view.id);
    if (a) {
      const d = st(a); const evs = evOf(a.id);
      const mother = all.find((x) => x.id === a.mother_id);
      const kids = all.filter((x) => x.mother_id === a.id);
      const barn = barns.find((b) => b.id === a.barn_id);
      return (
        <main className="ui-stack">
          <BackButton onClick={() => go({ v: "list" })} label="Hayvanlar" />
          <PageHeader sub={[KINDS[a.kind].label + (a.sex === "erkek" ? ` (${low(KINDS[a.kind].male)})` : ""), barn?.name, a.status === "satildi" ? "satıldı" : a.status === "oldu" ? "öldü" : ""].filter(Boolean).join(" · ")} title={animalLabel(a)} />
          {doneCard}
          {d.milkUntil && <WarningCard text={`Sütü tanka katılmaz: ${dayText(d.milkUntil)} gününe kadar (${d.drug}).`} />}
          {d.meatUntil && <WarningCard text={`Kesime / satışa gitmez: ${dayText(d.meatUntil)} gününe kadar (${d.drug}).`} />}
          {a.status === "var" && <MainButton onClick={() => go({ v: "olay", id: a.id })}>Olay ekle</MainButton>}
          {d.reminders.length > 0 && <div className="ui-card"><InfoRows rows={d.reminders.sort((x, y) => x.day.localeCompare(y.day)).map((r) => [r.text, dayYear(r.day)] as [string, string])} /></div>}
          <div className="ui-card"><InfoRows rows={[
            ["Durum", d.line || (a.status === "var" ? "—" : a.status === "satildi" ? `Satıldı ${a.left_on ? dayText(a.left_on) : ""}` : `Öldü ${a.left_on ? dayText(a.left_on) : ""}`)],
            ["Doğum günü", a.born_on ? dayYear(a.born_on) : "—"],
            ...(a.breed ? [["Irk", a.breed] as [string, string]] : []),
            ...(d.lastKg ? [["Son tartım", `${d.lastKg.toLocaleString("tr-TR")} kg`] as [string, string]] : []),
            ...(mother ? [["Annesi", animalLabel(mother)] as [string, string]] : []),
            ...(kids.length ? [["Yavruları", kids.map(animalLabel).join(", ")] as [string, string]] : []),
            ...(a.note ? [["Not", a.note] as [string, string]] : []),
          ]} /></div>
          <h2 className="ui-section">Olaylar</h2>
          {evs.length === 0 && <p className="ui-note">Henüz olay yok.</p>}
          {evs.map((e) => (
            <Card key={e.id}>
              <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><b>{EV_LABEL[e.type]}</b><span>{dayText(e.day)}</span></span>
              {evText(e) && <span className="ui-note" style={{ margin: 0 }}>{evText(e)}</span>}
              <button type="button" className="ui-plain" style={{ textAlign: "left" }} onClick={async () => {
                await deleteAnimalEvent(e.id); setDone({ message: `Sildim: ${EV_LABEL[e.type]} (${dayText(e.day)}).`, undo: () => restoreAnimalEvent(e) }); load();
              }}>Bu kaydı sil</button>
            </Card>
          ))}
          <MainButton secondary onClick={() => go({ v: "form", edit: a })}>Hayvan bilgilerini düzenle</MainButton>
          {a.status !== "var" && <MainButton secondary onClick={async () => { const old = { status: a.status, left_on: a.left_on }; await updateAnimal(a.id, { status: "var", left_on: null }); setDone({ message: "Hayvan yeniden sürüde.", undo: () => updateAnimal(a.id, old) }); load(); }}>Yanlışlıkla mı? Sürüye geri al</MainButton>}
        </main>
      );
    }
  }

  // Liste
  const live = all.filter((a) => a.status === "var");
  const shown = (gone ? all.filter((a) => a.status !== "var") : live)
    .filter((a) => !q || low(animalLabel(a)).includes(low(q)))
    .sort((x, y) => animalLabel(x).localeCompare(animalLabel(y), "tr", { numeric: true }));
  const until = addDays(today, 7);
  const upcoming = live.flatMap((a) => { const d = st(a); return [
    ...d.reminders.filter((r) => r.day <= until).map((r) => ({ a, day: r.day, text: r.text })),
    ...(d.milkUntil ? [{ a, day: today, text: `Sütü tanka katılmaz (${dayText(d.milkUntil)} gününe kadar)` }] : []),
  ]; }).sort((x, y) => x.day.localeCompare(y.day));
  const counts = kindsOf(species).map((k) => `${live.filter((a) => a.kind === k).length} ${low(KINDS[k].label)}`).join(" · ");
  return (
    <main className="ui-stack">
      <PageHeader sub={counts} title={species === "buyukbas" ? "Büyükbaş" : "Küçükbaş"} right={<HistoryLink />} />
      {tabs}
      {doneCard}
      {upcoming.length > 0 && <>
        <h2 className="ui-section">Bu hafta</h2>
        {upcoming.map((u, i) => (
          <Card key={i} onClick={() => go({ v: "kart", id: u.a.id })}>
            <span style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <span><b>{animalLabel(u.a)}</b><br /><span>{u.text}</span></span>
              <StatusPill status={u.day < today ? "gecti" : u.day === today ? "yakin" : "bekliyor"}>{u.day < today ? `Geçti (${dayText(u.day)})` : u.day === today ? "Bugün" : dayText(u.day)}</StatusPill>
            </span>
          </Card>
        ))}
      </>}
      {animals && all.length === 0 && <p className="ui-note">Hayvanlarını küpe numarasıyla ekle. Doğum, tohumlama, ilaç gibi olayları girince uygulama sonraki tarihleri hesaplar ve burada hatırlatır.</p>}
      {all.length > 6 && <TextField id="h_ara" label="Küpe no ya da ad ile ara" value={q} onChange={(e) => setQ(e.target.value)} />}
      {shown.map((a) => { const d = st(a); return (
        <Card key={a.id} onClick={() => go({ v: "kart", id: a.id })}>
          <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><b>{animalLabel(a)}</b><span>{a.born_on && a.born_on > addDays(today, -365) ? KINDS[a.kind].young.replace(/^./, (c) => c.toLocaleUpperCase("tr")) : a.sex === "erkek" ? KINDS[a.kind].male : KINDS[a.kind].label}</span></span>
          {(d.line || d.milkUntil) && <span className="ui-note" style={{ margin: 0 }}>{[d.line, d.milkUntil ? "ilaçlı: süt tanka katılmaz" : ""].filter(Boolean).join(" · ")}</span>}
        </Card>
      ); })}
      <MainButton onClick={() => go({ v: "form" })}>+ Hayvan ekle</MainButton>
      {all.some((a) => a.status !== "var") && <button type="button" className="ui-plain" onClick={() => setGone(!gone)}>{gone ? "Sürüdekileri göster ›" : "Satılan ve ölenleri göster ›"}</button>}
      <button type="button" className="ui-plain" onClick={() => go({ v: "sureler" })}>Süreler (gebelik, kızgınlık, kuruya) ›</button>
    </main>
  );
}

function evText(e: AnimalEvent) {
  const d = e.data;
  const parts: string[] = [];
  if (e.type === "ilac") parts.push(String(d.drug ?? ""), Number(d.milk_days) ? `süt ${d.milk_days} gün` : "", Number(d.meat_days) ? `et ${d.meat_days} gün` : "");
  if (e.type === "asi") parts.push(String(d.vaccine ?? ""), d.next_on ? `sonraki ${dayText(String(d.next_on))}` : "");
  if (e.type === "tartim") parts.push(`${Number(d.kg).toLocaleString("tr-TR")} kg`);
  if (e.type === "satis") parts.push(Number(d.price) ? tl(Number(d.price)) : "", String(d.buyer ?? ""));
  if (e.type === "tohum") parts.push(String(d.sire ?? ""));
  if (e.type === "dogum" && Number(d.count)) parts.push(`${d.count} yavru`);
  if (e.type === "olum") parts.push(String(d.cause ?? ""));
  if (e.note) parts.push(e.note);
  return parts.filter(Boolean).join(" · ");
}

function AnimalForm({ species, barns, edit, onSave, onCancel, onDelete }: {
  species: Sp; barns: Barn[]; edit?: Animal; onCancel: () => void; onDelete?: () => Promise<void>;
  onSave: (v: { kind: Kind; barn_id: string | null; tag: string | null; name: string | null; sex: "disi" | "erkek"; breed: string | null; born_on: string | null; note: string | null }) => Promise<void>;
}) {
  const kinds = kindsOf(species);
  const [kind, setKind] = useState<Kind>(edit?.kind ?? kinds[0]);
  const [sex, setSex] = useState<"disi" | "erkek">(edit?.sex ?? "disi");
  const [tag, setTag] = useState(edit?.tag ?? "");
  const [name, setName] = useState(edit?.name ?? "");
  const [breed, setBreed] = useState(edit?.breed ?? "");
  const [born, setBorn] = useState(edit?.born_on ?? "");
  const [barn, setBarn] = useState<string | null>(edit?.barn_id ?? (barns.length === 1 ? barns[0].id : null));
  const [note, setNote] = useState(edit?.note ?? "");
  const [error, setError] = useState("");
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader title={edit ? "Hayvan bilgileri" : "Yeni hayvan"} />
      {kinds.length > 1 && <div className="ui-chips wrap">{kinds.map((k) => <Chip key={k} selected={kind === k} onClick={() => setKind(k)}>{KINDS[k].label}</Chip>)}</div>}
      <div className="ui-chips wrap">
        <Chip selected={sex === "disi"} onClick={() => setSex("disi")}>Dişi</Chip>
        <Chip selected={sex === "erkek"} onClick={() => setSex("erkek")}>Erkek ({low(KINDS[kind].male)})</Chip>
      </div>
      <TextField id="a_kupe" label="Küpe no" maxLength={30} value={tag} onChange={(e) => setTag(e.target.value.toLocaleUpperCase("tr"))} style={{ fontSize: "1.4rem", fontWeight: 800 }} />
      <TextField id="a_ad" label="Adı (isteğe bağlı)" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
      <TextField id="a_dogum" label="Doğum günü (isteğe bağlı)" type="date" max={todayStr()} value={born} onChange={(e) => setBorn(e.target.value)} />
      <TextField id="a_irk" label="Irkı (isteğe bağlı)" maxLength={40} value={breed} onChange={(e) => setBreed(e.target.value)} />
      {barns.length > 0 && <>
        <span className="ui-label">Nerede duruyor?</span>
        <div className="ui-chips wrap">{barns.map((b) => <Chip key={b.id} selected={barn === b.id} onClick={() => setBarn(barn === b.id ? null : b.id)}>{b.name}</Chip>)}</div>
      </>}
      <TextField id="a_not" label="Not (isteğe bağlı)" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
      {error && <ErrorText>{error}</ErrorText>}
      {onDelete && <MainButton className="tehlike" onClick={onDelete}>Hayvanı ve kayıtlarını sil</MainButton>}
      <div className="ui-sticky-bottom"><MainButton onClick={async () => {
        if (!tag.trim() && !name.trim()) { setError("Küpe numarasını ya da adını yaz."); return; }
        await onSave({ kind, sex, tag: tag.trim() || null, name: name.trim() || null, breed: breed.trim() || null, born_on: born || null, barn_id: barn, note: note.trim() || null });
      }}>Kaydet</MainButton></div>
    </main>
  );
}

type Young = { sex: "disi" | "erkek"; tag: string };

function OlayForm({ animal, initialType, onSave, onCancel }: {
  animal: Animal; initialType?: EvType; onCancel: () => void;
  onSave: (type: EvType, day: string, data: Record<string, unknown>, note: string | null, young: Young[]) => Promise<void>;
}) {
  const today = todayStr(), yesterday = addDays(today, -1);
  const types = (Object.keys(EV_LABEL) as EvType[]).filter((t) => animal.sex === "disi" || !REPRO.includes(t));
  const [type, setType] = useState<EvType | null>(initialType ?? null);
  const [day, setDay] = useState(today);
  const [f, setF] = useState<Record<string, string>>({});
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const [young, setYoung] = useState<Young[]>([{ sex: "disi", tag: "" }]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const yn = KINDS[animal.kind].young;
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={animalLabel(animal)} title={type ? EV_LABEL[type] : "Ne oldu?"} />
      {!type ? <div className="ui-chips wrap">{types.map((t) => <Chip key={t} onClick={() => setType(t)}>{EV_LABEL[t]}</Chip>)}</div> : <>
        <div className="ui-chips wrap">
          <Chip selected={day === today} onClick={() => setDay(today)}>Bugün</Chip>
          <Chip selected={day === yesterday} onClick={() => setDay(yesterday)}>Dün</Chip>
        </div>
        <TextField id="o_gun" label="Başka gün" type="date" max={today} value={day} onChange={(e) => setDay(e.target.value || today)} />
        {type === "dogum" && <>
          <span className="ui-label">Kaç {yn}?</span>
          <Counter value={young.length} min={0} max={6} onChange={(n) => setYoung(n > young.length ? [...young, ...Array.from({ length: n - young.length }, () => ({ sex: "disi" as const, tag: "" }))] : young.slice(0, n))} />
          {young.map((y, i) => (
            <div key={i} className="ui-card ui-stack" style={{ gap: 8 }}>
              <b>{i + 1}. {yn}</b>
              <div className="ui-chips wrap">
                <Chip selected={y.sex === "disi"} onClick={() => setYoung(young.map((z, j) => (j === i ? { ...z, sex: "disi" } : z)))}>Dişi</Chip>
                <Chip selected={y.sex === "erkek"} onClick={() => setYoung(young.map((z, j) => (j === i ? { ...z, sex: "erkek" } : z)))}>Erkek</Chip>
              </div>
              <TextField id={`o_y${i}`} label="Küpe no (sonra da yazılabilir)" maxLength={30} value={y.tag} onChange={(e) => setYoung(young.map((z, j) => (j === i ? { ...z, tag: e.target.value.toLocaleUpperCase("tr") } : z)))} />
            </div>
          ))}
          <p className="ui-note">Yavrular hayvan listesine eklenir, annesi bu hayvan olarak görünür.</p>
        </>}
        {type === "tohum" && <TextField id="o_sire" label={`${KINDS[animal.kind].male} / sperma (isteğe bağlı)`} maxLength={60} value={f.sire ?? ""} onChange={set("sire")} />}
        {type === "ilac" && <>
          <TextField id="o_ilac" label="İlacın adı" maxLength={60} value={f.drug ?? ""} onChange={set("drug")} />
          <TextField id="o_sut" label="Süt arınma süresi, gün (kutusunda yazar)" inputMode="numeric" maxLength={3} value={f.milk ?? ""} onChange={set("milk")} />
          <TextField id="o_et" label="Et arınma süresi, gün (kutusunda yazar)" inputMode="numeric" maxLength={3} value={f.meat ?? ""} onChange={set("meat")} />
          <p className="ui-note">Süre boyunca kartta ve listede "sütü tanka katılmaz / kesime gitmez" uyarısı çıkar.</p>
        </>}
        {type === "asi" && <>
          <TextField id="o_asi" label="Aşının adı" maxLength={60} value={f.vaccine ?? ""} onChange={set("vaccine")} />
          <TextField id="o_sonraki" label="Sonraki aşı günü (isteğe bağlı, hatırlatılır)" type="date" min={today} value={f.next ?? ""} onChange={set("next")} />
        </>}
        {type === "tartim" && <TextField id="o_kg" label="Ağırlık, kg" inputMode="decimal" maxLength={6} value={f.kg ?? ""} onChange={set("kg")} style={{ fontSize: "1.4rem", fontWeight: 800 }} />}
        {type === "satis" && <>
          <TextField id="o_fiyat" label="Satış fiyatı, TL (isteğe bağlı, gelire yazılır)" inputMode="numeric" maxLength={9} value={f.price ?? ""} onChange={set("price")} />
          <TextField id="o_alici" label="Kime? (isteğe bağlı)" maxLength={60} value={f.buyer ?? ""} onChange={set("buyer")} />
        </>}
        {type === "olum" && <TextField id="o_sebep" label="Sebebi (isteğe bağlı)" maxLength={60} value={f.cause ?? ""} onChange={set("cause")} />}
        <TextField id="o_not" label="Not (isteğe bağlı)" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
        <button type="button" className="ui-plain" style={{ textAlign: "left" }} onClick={() => setType(null)}>Başka olay seç ›</button>
      </>}
      {error && <ErrorText>{error}</ErrorText>}
      {type && <div className="ui-sticky-bottom"><MainButton disabled={busy} onClick={async () => {
        let data: Record<string, unknown> = {};
        if (type === "ilac") { if (!f.drug?.trim()) { setError("İlacın adını yaz."); return; } data = { drug: f.drug.trim(), milk_days: Number(f.milk) || 0, meat_days: Number(f.meat) || 0 }; }
        if (type === "asi") { if (!f.vaccine?.trim()) { setError("Aşının adını yaz."); return; } data = { vaccine: f.vaccine.trim(), next_on: f.next || null }; }
        if (type === "tartim") { const kg = num(f.kg ?? ""); if (!(kg > 0)) { setError("Ağırlığı yaz."); return; } data = { kg }; }
        if (type === "satis") data = { price: Number(f.price) || 0, buyer: f.buyer?.trim() || null };
        if (type === "tohum") data = { sire: f.sire?.trim() || null };
        if (type === "olum") data = { cause: f.cause?.trim() || null };
        if (type === "dogum") data = { count: young.length };
        setBusy(true);
        try { await onSave(type, day, data, note.trim() || null, type === "dogum" ? young.map((y) => ({ ...y, tag: y.tag.trim() })) : []); } finally { setBusy(false); }
      }}>Kaydet</MainButton></div>}
    </main>
  );
}

function Sureler({ species, onDone }: { species: Sp; onDone: (m: string) => void }) {
  const biz = useBusiness();
  const setBiz = useSetBusiness();
  const kinds = kindsOf(species);
  const [vals, setVals] = useState<Record<string, Record<string, string>>>(() => Object.fromEntries(kinds.map((k) => {
    const s = sureOf(biz, k); return [k, Object.fromEntries(Object.entries(s).map(([n, v]) => [n, v == null ? "" : String(v)]))];
  })));
  const [error, setError] = useState("");
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={() => onDone("Süreler değişmedi.")} label="Vazgeç" />
      <PageHeader title="Süreler" sub="gün olarak" />
      <p className="ui-note">Hatırlatmalar bu sürelerle hesaplanır. Veterinerinin söylediğine göre değiştirebilirsin. Boş bırakılan satır için hatırlatma yapılmaz.</p>
      {kinds.map((k) => (
        <div key={k} className="ui-card ui-stack" style={{ gap: 8 }}>
          <b>{KINDS[k].label}</b>
          {(Object.keys(SURE_ADI) as (keyof Sure)[]).map((n) => (
            <TextField key={n} id={`s_${k}_${n}`} label={`${SURE_ADI[n]} (önerilen ${SURE_VARSAYILAN[k][n] ?? "—"})`} inputMode="numeric" maxLength={3} value={vals[k][n]}
              onChange={(e) => setVals({ ...vals, [k]: { ...vals[k], [n]: e.target.value.replace(/\D/g, "") } })} />
          ))}
        </div>
      ))}
      {error && <ErrorText>{error}</ErrorText>}
      <div className="ui-sticky-bottom"><MainButton onClick={async () => {
        const cur = (biz.settings?.hayvan_sureler ?? {}) as Record<string, unknown>;
        const next = { ...cur, ...Object.fromEntries(kinds.map((k) => [k, Object.fromEntries((Object.keys(SURE_ADI) as (keyof Sure)[]).map((n) => [n, vals[k][n] ? Number(vals[k][n]) : null]))])) };
        for (const k of kinds) for (const n of ["gebelik", "dongu", "kontrol"] as const) if (!(Number((next[k] as Sure)[n]) > 0)) { setError(`${KINDS[k].label}: ${low(SURE_ADI[n])} boş olamaz.`); return; }
        const settings = { ...biz.settings, hayvan_sureler: next };
        const { error } = await supabase().from("businesses").update({ settings }).eq("id", biz.id);
        if (error) { setError("Kaydedemedim. İnterneti kontrol et; ayarı yalnız defter sahibi değiştirebilir."); return; }
        setBiz({ ...biz, settings }); onDone("Süreleri kaydettim.");
      }}>Kaydet</MainButton></div>
    </main>
  );
}

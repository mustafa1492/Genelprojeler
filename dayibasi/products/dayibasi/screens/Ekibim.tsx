"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { fillTemplate, telLink, waLink } from "@/core/messaging/links";
import { getTemplate } from "@/core/messaging/templates";
import { addPerson, deletePerson, listPeople, updatePerson, type Person, type PersonInput } from "@/core/people/api";
import { PersonForm } from "@/core/people/PersonForm";
import { listAnswers, setAnswer, tomorrowIstanbul, type Answer } from "@/core/rsvp/api";
import { BackButton, BottomNav, CallIconButton, Chip, DoneCard, ErrorText, MainButton, PageHeader, PersonRow, StatusPill } from "@/core/ui";
import { config } from "../config";
import { navItems } from "../nav";
import KisiKarti from "./KisiKarti";

const KIND = "isci";
const kind = config.people.kinds[KIND];
const YOKLAMA_VARSAYILAN = "Merhaba {ad}, yarın işe geliyor musun? Evet ya da Hayır yazman yeterli.";
type Undo = { message: string; run: () => Promise<void> } | null;
type View = { v: "list" } | { v: "card"; id: string } | { v: "form"; id?: string } | { v: "yoklama" };

const pill = (a: Answer) =>
  a === "evet" ? <StatusPill status="tamam">Geliyor</StatusPill>
  : a === "hayir" ? <StatusPill status="gecti">Gelmiyor</StatusPill>
  : <StatusPill status="bekliyor">Bekleniyor</StatusPill>;

export default function Ekibim() {
  const biz = useBusiness();
  const [people, setPeople] = useState<Person[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState("Hepsi");
  const [view, setView] = useState<View>({ v: "list" });
  const [done, setDone] = useState<Undo>(null);
  const [tpl, setTpl] = useState(YOKLAMA_VARSAYILAN);
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const tomorrow = tomorrowIstanbul();

  const load = useCallback(() => {
    setLoadError(false);
    Promise.all([listPeople(biz.id, [KIND]), listAnswers(biz.id, tomorrow)])
      .then(([p, a]) => { setPeople(p); setAnswers(a); })
      .catch(() => setLoadError(true));
  }, [biz.id, tomorrow]);
  useEffect(load, [load]);
  useEffect(() => { getTemplate(biz.id, "yoklama", YOKLAMA_VARSAYILAN).then(setTpl).catch(() => {}); }, [biz.id]);

  const find = (id?: string) => people?.find((p) => p.id === id);

  const save = async (input: PersonInput) => {
    const old = view.v === "form" ? find(view.id) : undefined;
    if (!old) {
      const p = await addPerson(biz.id, KIND, input);
      setDone({ message: `Kaydettim: ${p.full_name}.`, run: () => deletePerson(p.id) });
      setView({ v: "list" });
    } else {
      await updatePerson(old.id, input);
      setDone({ message: `Değiştirdim: ${input.full_name}.`,
        run: async () => { await updatePerson(old.id, { full_name: old.full_name, phone: old.phone, tags: old.tags, custom: old.custom, notes: old.notes }); } });
      setView({ v: "card", id: old.id });
    }
    load();
  };

  const remove = async (p: Person) => {
    await updatePerson(p.id, { active: false });
    setDone({ message: `${p.full_name} ekipten çıktı.`, run: async () => { await updatePerson(p.id, { active: true }); } });
    setView({ v: "list" });
    load();
  };

  const undo = async () => { if (!done) return; await done.run(); setDone(null); load(); };
  const mark = async (id: string, a: Answer) => {
    setAnswers({ ...answers, [id]: a });
    await setAnswer(biz.id, id, tomorrow, a).catch(() => {});
  };

  // --- Ekle / değiştir
  if (view.v === "form") {
    const p = find(view.id);
    return (
      <main>
        <PersonForm kindLabel={kind.label} tags={config.people.tags} customFields={config.people.customFields}
          person={p} onSave={save} onCancel={() => setView(p ? { v: "card", id: p.id } : { v: "list" })}
          onRemove={p ? () => remove(p) : undefined} />
      </main>
    );
  }

  // --- Kişi kartı
  if (view.v === "card") {
    const p = find(view.id);
    if (p) {
      return (
        <>
          {done && <main style={{ paddingBottom: 0 }}><DoneCard message={done.message} onUndo={undo} /></main>}
          <KisiKarti person={p} answer={answers[p.id] ?? null} onBack={() => { setDone(null); setView({ v: "list" }); }}
            onEdit={() => { setDone(null); setView({ v: "form", id: p.id }); }}
            onAnswer={(a) => setAnswers({ ...answers, [p.id]: a })} />
        </>
      );
    }
  }

  const all = people ?? [];
  const yes = all.filter((p) => answers[p.id] === "evet").length;
  const no = all.filter((p) => answers[p.id] === "hayir").length;
  const wait = all.length - yes - no;
  const stats = (
    <div className="ui-stats">
      <div className="tamam"><b>{yes}</b><span>geliyor</span></div>
      <div className="gecti"><b>{no}</b><span>gelmiyor</span></div>
      <div className="bekliyor"><b>{wait}</b><span>bekleniyor</span></div>
    </div>
  );

  // --- Akşam yoklaması
  if (view.v === "yoklama") {
    return (
      <main className="ui-stack">
        <BackButton onClick={() => setView({ v: "list" })} label={config.screens.ekip} />
        <PageHeader sub="Akşam yoklaması" title="Yarın kim geliyor?" />
        <p style={{ margin: "0 4px", fontSize: 17 }}>Her işçinin yanındaki <b>Sor</b>’a dokun, WhatsApp’ta mesaj hazır açılır. Cevap gelince <b>Geliyor</b> ya da <b>Gelmiyor</b>’a dokun.</p>
        {stats}
        {all.map((p) => (
          <div key={p.id} className="ui-card ui-stack" style={{ gap: 10 }}>
            <PersonRow name={p.full_name} sub={p.phone ? undefined : "Telefonu yok"}
              right={p.phone ? (
                <a className="ui-chip" style={{ textDecoration: "none", display: "flex", alignItems: "center", ...(sent[p.id] ? { background: "var(--ana-acik)", borderColor: "var(--ana)" } : {}) }}
                  href={waLink(p.phone, fillTemplate(tpl, { ad: p.full_name.split(" ")[0] }))} target="_blank" rel="noreferrer"
                  onClick={() => setSent({ ...sent, [p.id]: true })}>{sent[p.id] ? "Soruldu ✓" : "Sor"}</a>
              ) : undefined} />
            <div className="ui-seg">
              <button type="button" className="evet" aria-pressed={answers[p.id] === "evet"} onClick={() => mark(p.id, answers[p.id] === "evet" ? null : "evet")}>Geliyor</button>
              <button type="button" className="hayir" aria-pressed={answers[p.id] === "hayir"} onClick={() => mark(p.id, answers[p.id] === "hayir" ? null : "hayir")}>Gelmiyor</button>
            </div>
          </div>
        ))}
        <MainButton onClick={() => setView({ v: "list" })}>Bitti</MainButton>
      </main>
    );
  }

  // --- Liste
  const shown = all.filter((p) => filter === "Hepsi" || p.tags.includes(filter));
  const sub = people ? `${people.length} ${kind.label.toLocaleLowerCase("tr")}` : biz.name;

  return (
    <main className="ui-has-nav ui-stack">
      <PageHeader sub={sub} title={config.screens.ekip} />
      {done && <DoneCard message={done.message} onUndo={undo} />}

      {loadError && <ErrorText>Listeyi getiremedim. İnterneti kontrol et. <button type="button" className="ui-link" onClick={load}>Tekrar dene</button></ErrorText>}
      {people === null && !loadError && <div className="ui-empty">Yükleniyor…</div>}
      {people && people.length === 0 && (
        <>
          <div className="ui-empty">Ekibinde henüz kimse yok.<br />Aşağıdaki yeşil düğmeyle ilk {kind.label.toLocaleLowerCase("tr")}ni ekle.</div>
          <MainButton onClick={() => { setDone(null); setView({ v: "form" }); }}>+ {kind.label} ekle</MainButton>
        </>
      )}

      {people && people.length > 0 && (
        <>
          <MainButton onClick={() => { setDone(null); setView({ v: "yoklama" }); }}>Herkese sor: Yarın geliyor musun?</MainButton>
          {stats}
          <div className="ui-chips" role="group" aria-label="İşe göre süz">
            {["Hepsi", ...config.people.tags].map((t) => (
              <Chip key={t} selected={filter === t} onClick={() => setFilter(t)}>{t}</Chip>
            ))}
          </div>
          {shown.length === 0 && <div className="ui-empty">{filter} işi yapan kimse yok.</div>}
          {shown.map((p) => (
            <div key={p.id} className="ui-card row">
              <button type="button" onClick={() => { setDone(null); setView({ v: "card", id: p.id }); }}>
                <PersonRow name={p.full_name} sub={p.tags.join(", ") || "Dokun, bilgilerini gör"} right={pill(answers[p.id] ?? null)} />
              </button>
              {p.phone && <CallIconButton href={telLink(p.phone)} name={p.full_name} />}
            </div>
          ))}
          <MainButton secondary onClick={() => { setDone(null); setView({ v: "form" }); }}>+ {kind.label} ekle</MainButton>
        </>
      )}
      <BottomNav items={navItems} current="/ekip" />
    </main>
  );
}

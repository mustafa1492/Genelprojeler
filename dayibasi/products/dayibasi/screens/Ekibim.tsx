"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { fillTemplate, telLink, waLink } from "@/core/messaging/links";
import { getTemplate } from "@/core/messaging/templates";
import { addPerson, deletePerson, forgetPerson, listPeople, updatePerson, type Person, type PersonInput } from "@/core/people/api";
import { PersonForm } from "@/core/people/PersonForm";
import { ageOf, birthText, birthYear, displayName } from "@/core/people/birth";
import { listAnswers, setAnswer, tomorrowIstanbul, type Answer } from "@/core/rsvp/api";
import { BackButton, BottomNav, CallIconButton, Chip, DoneCard, ErrorText, MainButton, PageHeader, PersonRow, StatusPill, TextField } from "@/core/ui";
import { config } from "../config";
import { HistoryLink, navItems } from "../nav";
import KisiKarti from "./KisiKarti";

const KIND = "isci";
const GK = config.people.groupKey;
const NO_GROUP = "Grupsuz";
const groupOf = (p: Person) => (p.custom?.[GK] ?? "").trim();
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
  const [quickName, setQuickName] = useState("");
  const [quickBirth, setQuickBirth] = useState("");
  const [quickError, setQuickError] = useState("");
  const [answerFilter, setAnswerFilter] = useState<Answer | "bekliyor" | null>(null);
  const [removing, setRemoving] = useState(false);
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
  const groups = [...new Set((people ?? []).map(groupOf).filter(Boolean))].sort((a, b) => a.localeCompare(b, "tr"));

  const quickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = quickName.trim();
    setQuickError("");
    if (!name) return;
    if (!quickBirth) { setQuickError("Doğum tarihini seç. Aynı adlı kişileri ayırmak için gerekli."); return; }
    const same = (people ?? []).find((p) => p.full_name.toLocaleLowerCase("tr") === name.toLocaleLowerCase("tr") && p.custom?.dogum === quickBirth);
    if (same) { setQuickError(`${same.full_name} (${birthText(quickBirth)}) zaten ekipte.`); return; }
    const p = await addPerson(biz.id, KIND, { full_name: name, phone: null, tags: [], custom: { dogum: quickBirth }, notes: null });
    setQuickName(""); setQuickBirth("");
    const age = ageOf(quickBirth);
    setDone({ message: `Ekledim: ${p.full_name}.${age !== null && age < 18 ? ` Dikkat: ${age} yaşında, 18’den küçük.` : " Telefonu için ismine dokun."}`, run: () => deletePerson(p.id) });
    load();
  };

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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          onRemove={p ? () => remove(p) : undefined}
          onForget={p ? async () => { await forgetPerson(p.id); setDone(null); setView({ v: "list" }); load(); } : undefined} />
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
  const ansOf = (p: Person): "evet" | "hayir" | "bekliyor" => answers[p.id] ?? "bekliyor";
  const byAns = (a: "evet" | "hayir" | "bekliyor") => all.filter((p) => ansOf(p) === a);
  const yesL = byAns("evet"), noL = byAns("hayir"), waitL = byAns("bekliyor");
  const tomorrowText = new Date(tomorrow + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });
  const askText = (p: Person) => fillTemplate(tpl, { ad: p.full_name.split(" ")[0] });
  const shareText = `Yarın (${tomorrowText}) gelenler, ${yesL.length} kişi:\n` + yesL.map((p, i) => `${i + 1}. ${displayName(p, all)}`).join("\n");

  const statBtn = (key: "evet" | "hayir" | "bekliyor", cls: string, n: number, label: string) => (
    <button type="button" className={cls} aria-pressed={answerFilter === key}
      onClick={() => setAnswerFilter(answerFilter === key ? null : key)}><b>{n}</b><span>{label}</span></button>
  );

  // --- Bekleyenlere sor (WhatsApp, tek tek)
  if (view.v === "yoklama") {
    return (
      <main className="ui-stack">
        <BackButton onClick={() => setView({ v: "list" })} label={config.screens.ekip} />
        <PageHeader sub={`Yarın · ${tomorrowText}`} title="Bekleyenlere sor" />
        <p className="ui-note">Her kişinin yanındaki <b>Sor</b>’a dokun. WhatsApp’ta mesaj hazır açılır, gönder. Cevap gelince Ekibim’de işaretle.</p>
        {waitL.length === 0 && <div className="ui-empty">Herkes cevap verdi.</div>}
        {waitL.map((p) => (
          <div key={p.id} className="ui-card row" style={{ padding: "10px 12px 10px 0" }}>
            <button type="button" disabled><PersonRow name={displayName(p, all)} sub={p.phone ? undefined : "Telefonu yok"} /></button>
            {p.phone && (
              <a className="ui-segbtn" style={{ padding: "0 18px", flexShrink: 0, ...(sent[p.id] ? { background: "var(--ana-acik)" } : {}) }}
                href={waLink(p.phone, askText(p))} target="_blank" rel="noreferrer"
                onClick={() => setSent({ ...sent, [p.id]: true })}>{sent[p.id] ? "Soruldu ✓" : "Sor"}</a>
            )}
          </div>
        ))}
        <MainButton onClick={() => setView({ v: "list" })}>Bitti</MainButton>
      </main>
    );
  }

  // --- Liste: yarın durumuna göre bölünmüş
  const sections: { key: "evet" | "hayir" | "bekliyor"; title: string; list: Person[] }[] = [
    { key: "bekliyor", title: "Cevap bekleniyor", list: waitL },
    { key: "evet", title: "Geliyor", list: yesL },
    { key: "hayir", title: "Gelmiyor", list: noL },
  ];
  const visible = sections.filter((x) => (!answerFilter || x.key === answerFilter) && x.list.length);
  const sub = people ? `${people.length} ${kind.label.toLocaleLowerCase("tr")}` : biz.name;

  const row = (p: Person) => {
    const a = ansOf(p);
    return (
      <div key={p.id} className="ui-card row">
        <button type="button" disabled={removing} onClick={() => { setDone(null); setView({ v: "card", id: p.id }); }}>
          <PersonRow name={displayName(p, all)} sub={birthYear(p.custom?.dogum) || undefined} />
        </button>
        {removing ? <button type="button" className="ui-remove" onClick={() => remove(p)}>Çıkar</button> : (
          <div className="ui-yn" role="group" aria-label={`${p.full_name} yarın`}>
            <button type="button" className="evet" aria-pressed={a === "evet"} onClick={() => mark(p.id, a === "evet" ? null : "evet")}>Geliyor</button>
            <button type="button" className="hayir" aria-pressed={a === "hayir"} onClick={() => mark(p.id, a === "hayir" ? null : "hayir")}>Gelmiyor</button>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="ui-has-nav ui-stack">
      <PageHeader sub={sub} title={config.screens.ekip} right={<HistoryLink />} />
      {done && <DoneCard message={done.message} onUndo={undo} />}
      {loadError && <ErrorText>Listeyi getiremedim. İnterneti kontrol et. <button type="button" className="ui-link" onClick={load}>Tekrar dene</button></ErrorText>}
      {people === null && !loadError && <div className="ui-empty">Yükleniyor…</div>}

      {people && people.length > 0 && !removing && (
        <>
          <div className="ui-daylabel">Yarın · {tomorrowText}</div>
          <div className="ui-stats">
            {statBtn("evet", "tamam", yesL.length, "geliyor")}
            {statBtn("hayir", "gecti", noL.length, "gelmiyor")}
            {statBtn("bekliyor", "bekliyor", waitL.length, "bekleniyor")}
          </div>
          <div className="ui-seg">
            <button type="button" disabled={!waitL.length} onClick={() => { setDone(null); setView({ v: "yoklama" }); }}>Bekleyenlere sor ({waitL.length})</button>
            <a className={`ui-segbtn${yesL.length ? "" : " off"}`} href={yesL.length ? `https://wa.me/?text=${encodeURIComponent(shareText)}` : undefined}
              target="_blank" rel="noreferrer">Gelenleri paylaş</a>
          </div>
        </>
      )}

      {people && people.length === 0 && <div className="ui-empty">Ekibinde henüz kimse yok. Aşağıdan ilk kişiyi ekle.</div>}

      {visible.map(({ key, title, list }) => (
        <section key={key} className="ui-stack" style={{ gap: 8 }}>
          <h2 className={`ui-section ans-${key}`}>{title} <span>· {list.length}</span></h2>
          {list.map(row)}
        </section>
      ))}
      {answerFilter && <button type="button" className="ui-link" onClick={() => setAnswerFilter(null)}>Herkesi göster</button>}

      <form onSubmit={quickAdd} className="ui-card ui-stack" style={{ gap: 10 }}>
        <b>Ekibe ekle</b>
        <TextField id="quick_name" label="Adı soyadı" placeholder="Örnek: Ayşe Kaya" maxLength={100} autoComplete="off"
          value={quickName} onChange={(e) => setQuickName(e.target.value)} />
        <div className="ui-quickadd">
          <TextField id="quick_birth" label="Doğum tarihi" type="date" max={new Date().toISOString().slice(0, 10)}
            value={quickBirth} onChange={(e) => setQuickBirth(e.target.value)} />
          <button type="submit" disabled={!quickName.trim() || !quickBirth}>Ekle</button>
        </div>
        {quickError && <ErrorText>{quickError}</ErrorText>}
      </form>
      {people && people.length > 0 && (
        <button type="button" className={removing ? "ui-main-btn" : "ui-link"} onClick={() => { setRemoving(!removing); setDone(null); }}>
          {removing ? "Bitti" : "Ekipten birini çıkar…"}
        </button>
      )}
      <BottomNav items={navItems} current="/ekip" />
    </main>
  );
}

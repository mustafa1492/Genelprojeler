"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { fillTemplate, telLink, waLink } from "@/core/messaging/links";
import { getTemplate } from "@/core/messaging/templates";
import { addPerson, deletePerson, forgetPerson, listPeople, updatePerson, type Person, type PersonInput } from "@/core/people/api";
import { PersonForm } from "@/core/people/PersonForm";
import { ageOf, birthText, birthYear, displayName } from "@/core/people/birth";
import { listAnswers, setAnswer, tomorrowIstanbul, type Answer } from "@/core/rsvp/api";
import { addList, deleteList, listLists, toggleMember, updateList, type PersonList } from "@/core/lists/api";
import { BackButton, BottomNav, Chip, DoneCard, ErrorText, MainButton, PageHeader, PersonRow, TextField } from "@/core/ui";
import { config } from "../config";
import { HistoryLink, navItems } from "../nav";
import KisiKarti from "./KisiKarti";

const KIND = "isci";
const SCOPE = "ko:ekip-gorunum";
const ALL = "all";
const kind = config.people.kinds[KIND];
const YOKLAMA_VARSAYILAN = "Merhaba {ad}, yarın işe geliyor musun? Evet ya da Hayır yazman yeterli.";
type Undo = { message: string; run: () => Promise<void> } | null;
type View = { v: "list" } | { v: "card"; id: string } | { v: "form"; id?: string }
  | { v: "sorSec" } | { v: "yoklama"; ids: string[] } | { v: "uyeler" } | { v: "yeniListe" } | { v: "listeAyar" };

export default function Ekibim() {
  const biz = useBusiness();
  const [people, setPeople] = useState<Person[] | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [loadError, setLoadError] = useState(false);
  const [lists, setLists] = useState<PersonList[]>([]);
  const [scope, setScopeState] = useState<string>(ALL);
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
    Promise.all([listPeople(biz.id, [KIND]), listAnswers(biz.id, tomorrow), listLists(biz.id).catch(() => [] as PersonList[])])
      .then(([p, a, l]) => { setPeople(p); setAnswers(a); setLists(l); })
      .catch(() => setLoadError(true));
  }, [biz.id, tomorrow]);
  useEffect(load, [load]);
  useEffect(() => { getTemplate(biz.id, "yoklama", YOKLAMA_VARSAYILAN).then(setTpl).catch(() => {}); }, [biz.id]);

  const find = (id?: string) => people?.find((p) => p.id === id);
  useEffect(() => { try { const v = localStorage.getItem(SCOPE); if (v) setScopeState(v); } catch { /* yok */ } }, []);
  const setScope = (v: string) => { setScopeState(v); setAnswerFilter(null); setRemoving(false); try { localStorage.setItem(SCOPE, v); } catch { /* yok */ } };
  const curList = lists.find((l) => l.id === scope) ?? null;

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
    if (curList) await updateList(curList.id, { members: [...curList.members, p.id] });
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
    // listelerden de çıkar (geri al kişiyi ekibe döndürür; listeye tekrar eklemek tek dokunuş)
    for (const l of lists.filter((x) => x.members.includes(p.id))) await updateList(l.id, { members: l.members.filter((m) => m !== p.id) });
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
  const inScope = curList ? all.filter((p) => curList.members.includes(p.id)) : all;
  const ansOf = (p: Person): "evet" | "hayir" | "bekliyor" => answers[p.id] ?? "bekliyor";
  const byAns = (xs: Person[], a: "evet" | "hayir" | "bekliyor") => xs.filter((p) => ansOf(p) === a);
  const yesL = byAns(inScope, "evet"), noL = byAns(inScope, "hayir"), waitL = byAns(inScope, "bekliyor");
  const tomorrowText = new Date(tomorrow + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long" });
  const askText = (p: Person) => fillTemplate(tpl, { ad: p.full_name.split(" ")[0] });
  const shareText = `Yarın (${tomorrowText})${curList ? ` ${curList.name}` : ""} gelenler, ${yesL.length} kişi:\n` + yesL.map((p, i) => `${i + 1}. ${displayName(p, all)}`).join("\n");
  const listsOf = (p: Person) => lists.filter((l) => l.members.includes(p.id));

  const statBtn = (key: "evet" | "hayir" | "bekliyor", cls: string, n: number, label: string) => (
    <button type="button" className={cls} aria-pressed={answerFilter === key}
      onClick={() => setAnswerFilter(answerFilter === key ? null : key)}><b>{n}</b><span>{label}</span></button>
  );

  // --- "Geliyor musun?" kime sorulsun: liste(ler) ya da kişi seç
  if (view.v === "sorSec") return <SorSec all={all} lists={lists} answers={answers} tomorrowText={tomorrowText} preselect={curList?.id}
    onCancel={() => setView({ v: "list" })} onGo={(ids) => setView({ v: "yoklama", ids })} />;

  // --- Seçilenlere sor (WhatsApp sırayla)
  if (view.v === "yoklama") {
    const targets = view.ids.map((id) => find(id)).filter(Boolean) as Person[];
    return (
      <main className="ui-stack">
        <BackButton onClick={() => setView({ v: "list" })} label={config.screens.ekip} />
        <PageHeader sub={`Yarın · ${tomorrowText} · ${targets.filter((p) => sent[p.id]).length} / ${targets.filter((p) => p.phone).length} soruldu`} title="Geliyor musun?" />
        <p className="ui-note">Her kişinin yanındaki <b>Sor</b>’a dokun. WhatsApp’ta mesaj hazır açılır, gönder. Cevap gelince Ekibim’de işaretle.</p>
        {targets.map((p) => (
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

  // --- Yeni liste
  if (view.v === "yeniListe") return <ListeAdi title="Yeni liste" initial="" onCancel={() => setView({ v: "list" })}
    onSave={async (name) => {
      const l = await addList(biz.id, name, lists.length);
      setScope(l.id); setDone({ message: `“${name}” listesini açtım. Şimdi kişileri ekle.`, run: () => deleteList(l.id) });
      load(); setView({ v: "uyeler" });
    }} />;

  // --- Liste adı / sil
  if (view.v === "listeAyar" && curList) return <ListeAdi title="Listeyi düzenle" initial={curList.name} onCancel={() => setView({ v: "list" })}
    onSave={async (name) => { const old = curList.name; await updateList(curList.id, { name }); setDone({ message: `Liste adı “${name}” oldu.`, run: () => updateList(curList.id, { name: old }) }); load(); setView({ v: "list" }); }}
    onDelete={async () => {
      const copy = curList; await deleteList(copy.id); setScope(ALL);
      setDone({ message: `“${copy.name}” listesini sildim. Kişiler ekipte duruyor.`, run: async () => { const { mutate } = await import("@/core/offline/store"); await mutate({ kind: "insert", table: "lists", values: copy }); setScope(copy.id); } });
      load(); setView({ v: "list" });
    }} />;

  // --- Listeye kişi ekle / çıkar (havuzdan, tek dokunuş)
  if (view.v === "uyeler" && curList) return <Uyeler list={curList} all={all}
    onToggle={async (id) => { const members = await toggleMember(curList, id); setLists(lists.map((l) => (l.id === curList.id ? { ...l, members } : l))); }}
    onDone={() => { setView({ v: "list" }); load(); }} />;

  // --- Ana görünüm
  const sections: { key: "evet" | "hayir" | "bekliyor"; title: string; list: Person[] }[] = [
    { key: "bekliyor", title: "Cevap bekleniyor", list: waitL },
    { key: "evet", title: "Geliyor", list: yesL },
    { key: "hayir", title: "Gelmiyor", list: noL },
  ];
  const visible = sections.filter((x) => (!answerFilter || x.key === answerFilter) && x.list.length);

  const row = (p: Person, withYn: boolean) => {
    const a = ansOf(p);
    const ls = listsOf(p);
    return (
      <div key={p.id} className="ui-card row">
        <button type="button" disabled={removing} onClick={() => { setDone(null); setView({ v: "card", id: p.id }); }}>
          <PersonRow name={displayName(p, all)}
            sub={[birthYear(p.custom?.dogum), !curList && ls.length ? ls.map((l) => l.name).join(", ") : ""].filter(Boolean).join(" · ") || undefined} />
        </button>
        {removing
          ? <button type="button" className="ui-remove" onClick={async () => {
              if (curList) { const members = await toggleMember(curList, p.id); setLists(lists.map((l) => (l.id === curList.id ? { ...l, members } : l)));
                setDone({ message: `${p.full_name} “${curList.name}” listesinden çıktı.`, run: () => updateList(curList.id, { members: curList.members }) }); }
              else remove(p);
            }}>{curList ? "Listeden çıkar" : "Ekipten çıkar"}</button>
          : withYn && (
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
      <PageHeader sub={curList ? `${inScope.length} kişi · liste` : `${all.length} ${kind.label.toLocaleLowerCase("tr")} · bütün ekip`}
        title={curList ? curList.name : config.screens.ekip} right={<HistoryLink />} />

      <div className="ui-chips" role="tablist" aria-label="Liste seç">
        <Chip selected={!curList} onClick={() => setScope(ALL)}>Bütün ekip</Chip>
        {lists.map((l) => <Chip key={l.id} selected={curList?.id === l.id} onClick={() => setScope(l.id)}>{l.name} · {l.members.filter((m) => all.some((p) => p.id === m)).length}</Chip>)}
        <Chip onClick={() => setView({ v: "yeniListe" })}>+ Yeni liste</Chip>
      </div>

      {done && <DoneCard message={done.message} onUndo={undo} />}
      {loadError && <ErrorText>Listeyi getiremedim. İnterneti kontrol et. <button type="button" className="ui-link" onClick={load}>Tekrar dene</button></ErrorText>}
      {people === null && !loadError && <div className="ui-empty">Yükleniyor…</div>}

      {people && all.length > 0 && !removing && (
        <>
          <div className="ui-daylabel">Yarın · {tomorrowText}</div>
          <div className="ui-stats">
            {statBtn("evet", "tamam", yesL.length, "geliyor")}
            {statBtn("hayir", "gecti", noL.length, "gelmiyor")}
            {statBtn("bekliyor", "bekliyor", waitL.length, "bekleniyor")}
          </div>
          <div className="ui-seg">
            <button type="button" onClick={() => { setDone(null); setView({ v: "sorSec" }); }}>“Geliyor musun?” sor</button>
            <a className={`ui-segbtn${yesL.length ? "" : " off"}`} href={yesL.length ? `https://wa.me/?text=${encodeURIComponent(shareText)}` : undefined}
              target="_blank" rel="noreferrer">Gelenleri paylaş</a>
          </div>
        </>
      )}

      {curList && inScope.length === 0 && <div className="ui-empty">Bu liste boş. Aşağıdaki düğmeyle ekipten kişi ekle.</div>}
      {people && all.length === 0 && <div className="ui-empty">Ekibinde henüz kimse yok. Aşağıdan ilk kişiyi ekle.</div>}

      {visible.map(({ key, title, list }) => (
        <section key={key} className="ui-stack" style={{ gap: 8 }}>
          <h2 className={`ui-section ans-${key}`}>{title} <span>· {list.length}</span></h2>
          {list.map((p) => row(p, true))}
        </section>
      ))}
      {answerFilter && <button type="button" className="ui-link" onClick={() => setAnswerFilter(null)}>Herkesi göster</button>}

      {curList ? (
        <>
          <MainButton secondary onClick={() => setView({ v: "uyeler" })}>Listeye ekipten kişi ekle / çıkar</MainButton>
          <button type="button" className="ui-link" onClick={() => setView({ v: "listeAyar" })}>Listenin adını değiştir / listeyi sil</button>
        </>
      ) : null}

      <form onSubmit={quickAdd} className="ui-card ui-stack" style={{ gap: 10 }}>
        <b>{curList ? `Yeni kişi ekle (ekibe ve “${curList.name}” listesine)` : "Ekibe yeni kişi ekle"}</b>
        <TextField id="quick_name" label="Adı soyadı" placeholder="Örnek: Ayşe Kaya" maxLength={100} autoComplete="off"
          value={quickName} onChange={(e) => setQuickName(e.target.value)} />
        <div className="ui-quickadd">
          <TextField id="quick_birth" label="Doğum tarihi" type="date" max={new Date().toISOString().slice(0, 10)}
            value={quickBirth} onChange={(e) => setQuickBirth(e.target.value)} />
          <button type="submit" disabled={!quickName.trim() || !quickBirth}>Ekle</button>
        </div>
        {quickError && <ErrorText>{quickError}</ErrorText>}
      </form>
      {inScope.length > 0 && (
        <button type="button" className={removing ? "ui-main-btn" : "ui-link"} onClick={() => { setRemoving(!removing); setDone(null); }}>
          {removing ? "Bitti" : curList ? "Listeden birini çıkar…" : "Ekipten birini çıkar…"}
        </button>
      )}
      <BottomNav items={navItems} current="/ekip" />
    </main>
  );
}

/** Kime sorulsun: bir ya da birden çok liste, ya da bütün ekipten tek tek seçim. Aynı kişi bir kez. */
function SorSec({ all, lists, answers, tomorrowText, preselect, onCancel, onGo }: {
  all: Person[]; lists: PersonList[]; answers: Record<string, Answer>; tomorrowText: string; preselect?: string;
  onCancel: () => void; onGo: (ids: string[]) => void;
}) {
  const [mode, setMode] = useState<"liste" | "kisi">(lists.length ? "liste" : "kisi");
  const [selLists, setSelLists] = useState<string[]>(preselect ? [preselect] : []);
  const [selPeople, setSelPeople] = useState<string[]>([]);
  const [onlyWaiting, setOnlyWaiting] = useState(true);
  const [q, setQ] = useState("");
  const alive = new Set(all.map((p) => p.id));
  const base = mode === "liste"
    ? [...new Set(lists.filter((l) => selLists.includes(l.id)).flatMap((l) => l.members))].filter((id) => alive.has(id))
    : selPeople;
  const ids = base.filter((id) => !onlyWaiting || !answers[id]);
  const toggle = (arr: string[], set: (x: string[]) => void, id: string) => set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  const shown = all.filter((p) => !q || p.full_name.toLocaleLowerCase("tr").includes(q.toLocaleLowerCase("tr")));

  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub={`Yarın · ${tomorrowText}`} title="Kime sorayım?" />
      <div className="ui-tabs" role="tablist" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <button type="button" role="tab" aria-selected={mode === "liste"} onClick={() => setMode("liste")}>Listeden</button>
        <button type="button" role="tab" aria-selected={mode === "kisi"} onClick={() => setMode("kisi")}>Kişi seç</button>
      </div>
      {mode === "liste" && (
        lists.length === 0 ? <div className="ui-empty">Henüz liste yok. Ekibim’de “+ Yeni liste” ile aç ya da “Kişi seç”i kullan.</div> : (
          <>
            <p className="ui-note">Bir ya da birden çok liste seç. İki listede olan kişiye bir kez sorulur.</p>
            {lists.map((l) => (
              <button key={l.id} type="button" className="ui-choice" aria-pressed={selLists.includes(l.id)} onClick={() => toggle(selLists, setSelLists, l.id)}>
                <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span>{selLists.includes(l.id) ? "✓ " : ""}{l.name}</span>
                  <span style={{ color: "var(--sessiz2)" }}>{l.members.filter((m) => alive.has(m)).length} kişi</span>
                </span>
              </button>
            ))}
          </>
        )
      )}
      {mode === "kisi" && (
        <>
          <div className="ui-chips wrap">
            <Chip onClick={() => setSelPeople(all.map((p) => p.id))}>Hepsini seç</Chip>
            {selPeople.length > 0 && <Chip onClick={() => setSelPeople([])}>Temizle</Chip>}
          </div>
          {all.length > 12 && <TextField id="ara" label="Ara" placeholder="İsim yaz" value={q} onChange={(e) => setQ(e.target.value)} />}
          {shown.map((p) => (
            <button key={p.id} type="button" className="ui-choice" aria-pressed={selPeople.includes(p.id)} onClick={() => toggle(selPeople, setSelPeople, p.id)}>
              <PersonRow name={displayName(p, all)} sub={birthYear(p.custom?.dogum) || undefined}
                right={<span aria-hidden="true" style={{ fontSize: "1.4rem" }}>{selPeople.includes(p.id) ? "✓" : ""}</span>} />
            </button>
          ))}
        </>
      )}
      <label className="ui-check">
        <input type="checkbox" checked={onlyWaiting} onChange={(e) => setOnlyWaiting(e.target.checked)} />
        Sadece cevap vermeyenlere sor
      </label>
      <div className="ui-sticky-bottom">
        <MainButton disabled={!ids.length} onClick={() => onGo(ids)}>{ids.length ? `${ids.length} kişiye sor` : "Kişi seç"}</MainButton>
      </div>
    </main>
  );
}

/** Havuzdan listeye ekle/çıkar: dokun = ekle, tekrar dokun = çıkar. */
function Uyeler({ list, all, onToggle, onDone }: { list: PersonList; all: Person[]; onToggle: (id: string) => Promise<void>; onDone: () => void }) {
  const [q, setQ] = useState("");
  const shown = all.filter((p) => !q || p.full_name.toLocaleLowerCase("tr").includes(q.toLocaleLowerCase("tr")))
    .sort((a, b) => Number(list.members.includes(b.id)) - Number(list.members.includes(a.id)) || a.full_name.localeCompare(b.full_name, "tr"));
  const n = list.members.filter((m) => all.some((p) => p.id === m)).length;
  return (
    <main className="ui-stack" style={{ paddingBottom: 120 }}>
      <BackButton onClick={onDone} label={list.name} />
      <PageHeader sub={`${n} kişi seçili`} title={`“${list.name}” listesi`} />
      <p className="ui-note">Listeye almak istediğin kişiye dokun. Tekrar dokunursan listeden çıkar.</p>
      {all.length > 12 && <TextField id="ara_uye" label="Ara" placeholder="İsim yaz" value={q} onChange={(e) => setQ(e.target.value)} />}
      {shown.map((p) => (
        <button key={p.id} type="button" className="ui-choice" aria-pressed={list.members.includes(p.id)} onClick={() => onToggle(p.id)}>
          <PersonRow name={displayName(p, all)} sub={birthYear(p.custom?.dogum) || undefined}
            right={<span aria-hidden="true" style={{ fontSize: "1.4rem" }}>{list.members.includes(p.id) ? "✓" : "+"}</span>} />
        </button>
      ))}
      <div className="ui-sticky-bottom"><MainButton onClick={onDone}>Bitti · {n} kişi</MainButton></div>
    </main>
  );
}

function ListeAdi({ title, initial, onSave, onCancel, onDelete }: {
  title: string; initial: string; onSave: (name: string) => Promise<void>; onCancel: () => void; onDelete?: () => Promise<void>;
}) {
  const [name, setName] = useState(initial);
  return (
    <main className="ui-stack">
      <BackButton onClick={onCancel} label="Vazgeç" />
      <PageHeader sub="Liste" title={title} />
      <TextField id="liste_adi" label="Listenin adı" placeholder="Örnek: Manisa, Aydın, Sabah minibüsü" maxLength={60} autoFocus
        value={name} onChange={(e) => setName(e.target.value)} />
      <MainButton disabled={!name.trim()} onClick={() => onSave(name.trim())}>Kaydet</MainButton>
      {onDelete && <MainButton className="tehlike" onClick={onDelete}>Listeyi sil (kişiler ekipte kalır)</MainButton>}
    </main>
  );
}

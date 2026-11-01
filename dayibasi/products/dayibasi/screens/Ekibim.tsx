"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { addPerson, deletePerson, listPeople, updatePerson, type Person, type PersonInput } from "@/core/people/api";
import { PersonForm } from "@/core/people/PersonForm";
import { BottomNav, Card, Chip, DoneCard, ErrorText, MainButton, PageHeader, PersonRow } from "@/core/ui";
import { config } from "../config";
import { navItems } from "../nav";

const KIND = "isci";
const kind = config.people.kinds[KIND];
type Undo = { message: string; run: () => Promise<void> } | null;

export default function Ekibim() {
  const biz = useBusiness();
  const [people, setPeople] = useState<Person[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState("Hepsi");
  const [editing, setEditing] = useState<Person | "new" | null>(null);
  const [done, setDone] = useState<Undo>(null);

  const load = useCallback(() => {
    setLoadError(false);
    listPeople(biz.id, [KIND]).then(setPeople).catch(() => setLoadError(true));
  }, [biz.id]);
  useEffect(load, [load]);

  const save = async (input: PersonInput) => {
    if (editing === "new") {
      const p = await addPerson(biz.id, KIND, input);
      setDone({ message: `Kaydettim: ${p.full_name}.`, run: () => deletePerson(p.id) });
    } else if (editing) {
      const old = editing;
      await updatePerson(old.id, input);
      setDone({ message: `Değiştirdim: ${input.full_name}.`,
        run: async () => { await updatePerson(old.id, { full_name: old.full_name, phone: old.phone, tags: old.tags, custom: old.custom }); } });
    }
    setEditing(null);
    load();
  };

  const remove = async (p: Person) => {
    await updatePerson(p.id, { active: false });
    setDone({ message: `${p.full_name} ekipten çıktı.`, run: async () => { await updatePerson(p.id, { active: true }); } });
    setEditing(null);
    load();
  };

  const undo = async () => {
    if (!done) return;
    await done.run();
    setDone(null);
    load();
  };

  if (editing) {
    return (
      <main>
        <PersonForm kindLabel={kind.label} tags={config.people.tags} customFields={config.people.customFields}
          person={editing === "new" ? undefined : editing} onSave={save} onCancel={() => setEditing(null)}
          onRemove={editing === "new" ? undefined : () => remove(editing)} />
      </main>
    );
  }

  const shown = (people ?? []).filter((p) => filter === "Hepsi" || p.tags.includes(filter));
  const sub = people ? `${people.length} ${kind.label.toLocaleLowerCase("tr")}` : biz.name;

  return (
    <main className="ui-has-nav ui-stack">
      <PageHeader sub={sub} title={config.screens.ekip} />
      {done && <DoneCard message={done.message} onUndo={undo} />}
      <MainButton onClick={() => { setDone(null); setEditing("new"); }}>+ {kind.label} ekle</MainButton>

      {loadError && <ErrorText>Listeyi getiremedim. İnterneti kontrol et. <button type="button" className="ui-link" onClick={load}>Tekrar dene</button></ErrorText>}
      {people === null && !loadError && <div className="ui-empty">Yükleniyor…</div>}
      {people && people.length === 0 && (
        <div className="ui-empty">Ekibinde henüz kimse yok.<br />Yukarıdaki yeşil düğmeyle ilk {kind.label.toLocaleLowerCase("tr")}ni ekle.</div>
      )}

      {people && people.length > 0 && (
        <>
          <div className="ui-chips" role="group" aria-label="İşe göre süz">
            {["Hepsi", ...config.people.tags].map((t) => (
              <Chip key={t} selected={filter === t} onClick={() => setFilter(t)}>{t}</Chip>
            ))}
          </div>
          {shown.length === 0 && <div className="ui-empty">{filter} işi yapan kimse yok.</div>}
          {shown.map((p) => (
            <Card key={p.id} onClick={() => { setDone(null); setEditing(p); }}>
              <PersonRow name={p.full_name}
                sub={[p.tags.join(", "), p.custom?.koy].filter(Boolean).join(" · ") || "Dokun, bilgilerini ekle"} />
            </Card>
          ))}
        </>
      )}
      <BottomNav items={navItems} current="/ekip" />
    </main>
  );
}

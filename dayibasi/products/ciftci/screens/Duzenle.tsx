"use client";
import { useState } from "react";
import { useGo } from "@/core/shell/TabShell";
import { BackButton, PageHeader } from "@/core/ui";
import { CARDS, HAZIR, NAV_SLOTS, PERIODS, VARSAYILAN, useGorunum, type CardId } from "../gorunum";

/** Ekranımı düzenle: hazır görünümler, kâr dönemi, özet kartları (aç/kapa + yukarı/aşağı), alt çubuk. Kişiye özel. */
export default function Duzenle({ choices }: { choices: { id: string; label: string }[] }) {
  const go = useGo();
  const { g, setG } = useGorunum();
  const [done, setDone] = useState("");
  const say = (t: string) => { setDone(t); setTimeout(() => setDone(""), 2500); };

  // Açık kartlar sırasıyla, sonra kapalılar
  const order: CardId[] = [...g.cards, ...CARDS.map((c) => c.id).filter((id) => !g.cards.includes(id))];
  const label = (id: string) => CARDS.find((c) => c.id === id)!.label;
  const toggle = (id: CardId) => setG({ cards: g.cards.includes(id) ? g.cards.filter((c) => c !== id) : [...g.cards, id] });
  const move = (id: CardId, d: -1 | 1) => {
    const a = g.cards.slice(); const i = a.indexOf(id); const j = i + d;
    if (i < 0 || j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; setG({ cards: a });
  };
  const nav = Array.from({ length: NAV_SLOTS }, (_, i) => g.nav[i] ?? "");
  const setSlot = (i: number, id: string) => { const n = nav.slice(); const k = n.indexOf(id); if (k >= 0) n[k] = n[i]; n[i] = id; setG({ nav: n.filter(Boolean) }); };
  const active = HAZIR.find((h) => JSON.stringify(h.g) === JSON.stringify(g))?.id;

  return (
    <main className="ui-has-nav ui-stack">
      <BackButton onClick={() => go("ayarlar")} label="Ayarlar" />
      <PageHeader title="Ekranımı düzenle" sub="Sadece senin ekranın değişir" />

      <div className="mn-grp"><span>Hazır görünümler</span>
        <div className="mn-hazir">
          {HAZIR.map((h) => (
            <button key={h.id} type="button" aria-pressed={active === h.id} onClick={() => { setG(h.g); say(`"${h.label}" görünümü seçildi.`); }}>
              <b>{h.label}</b><small>{h.hint}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="mn-grp"><span>Kâr kartı neyi göstersin</span>
        <div className="mn-seg" role="group" aria-label="Kâr dönemi">
          {PERIODS.map((p) => <button key={p.id} type="button" aria-pressed={g.period === p.id} onClick={() => setG({ period: p.id })}>{p.label}</button>)}
        </div>
        <small style={{ color: "var(--sessiz2)", fontWeight: 600, marginLeft: 4 }}>{PERIODS.find((p) => p.id === g.period)!.hint}</small>
      </div>

      <div className="mn-grp"><span>Özette görünenler</span>
        <div className="mn-liste">
          {order.map((id) => {
            const on = g.cards.includes(id); const i = g.cards.indexOf(id);
            return (
              <label key={id}>
                <input type="checkbox" checked={on} onChange={() => toggle(id)} />
                <div>{label(id)}{!on && <small>Gizli</small>}</div>
                {on && (
                  <span className="mn-sira" onClick={(e) => e.preventDefault()}>
                    <button type="button" aria-label={`${label(id)}: yukarı`} disabled={i === 0} onClick={() => move(id, -1)}>↑</button>
                    <button type="button" aria-label={`${label(id)}: aşağı`} disabled={i === g.cards.length - 1} onClick={() => move(id, 1)}>↓</button>
                  </span>
                )}
              </label>
            );
          })}
        </div>
        <small style={{ color: "var(--sessiz2)", fontWeight: 600, marginLeft: 4 }}>İpucu: Özette bir karta uzun basınca da gizleyip yerini değiştirebilirsin.</small>
      </div>

      <div className="mn-grp"><span>Alt çubuk (4 yer + Menü)</span>
        <div className="mn-cubuk">
          {nav.map((id, i) => (
            <select key={i} aria-label={`Alt çubuk ${i + 1}. yer`} value={id} onChange={(e) => setSlot(i, e.target.value)}>
              {!id && <option value="">Boş</option>}
              {choices.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          ))}
          <span>Menü</span>
        </div>
        <small style={{ color: "var(--sessiz2)", fontWeight: 600, marginLeft: 4 }}>Bir yere dokun, oraya ne geleceğini seç. Menü hep sağda kalır.</small>
      </div>

      {done && <div className="ui-done" role="status"><span>{done}</span></div>}
      <button type="button" className="ui-link" onClick={() => { setG(VARSAYILAN); say("Varsayılan görünüme dönüldü."); }}>Varsayılana dön</button>
    </main>
  );
}

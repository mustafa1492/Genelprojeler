"use client";
import { useCallback, useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { useMembers } from "@/core/auth/members";
import { daysLeft, listDocs, type Doc } from "@/core/documents/api";
import { listDues, remaining, type Due } from "@/core/dues/api";
import { listEvents, type EventRow } from "@/core/events/api";
import { listExpenses, owed, type Expense } from "@/core/expenses/api";
import { isLow, listItems, type Item } from "@/core/inventory/api";
import { formatTL } from "@/core/ledger/api";
import { listPlaces, type Place } from "@/core/places/api";
import { MainButton, PageHeader } from "@/core/ui";
import { PrivacyButton } from "@/core/ui/privacy";
import { clearLocal, flush, status } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";
import { TabLink, useGo, useOnActivate } from "@/core/shell/TabShell";
import { inSeason, SeasonPicker, useSeason } from "../sezon";
import { config } from "../config";
import { dayText, dayYear, GELIR, harvestFrom, incomeOpen, ISLEM, todayStr } from "../kayit";
import { HistoryLink } from "../nav";

/** Özet: yılın kârı, hızlı ekle, uyarılar (hasat bekleme, vadeler, belgeler, biten stok), bağlantılar. */
export default function Ana() {
  const biz = useBusiness();
  const { nameOf } = useMembers(biz.id);
  const [exp, setExp] = useState<Expense[]>([]);
  const [ev, setEv] = useState<EventRow[]>([]);
  const [dues, setDues] = useState<Due[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const { selected: S } = useSeason();
  const go = useGo();
  const load = useCallback(() => {
    listExpenses(biz.id).then(setExp).catch(() => {});
    Promise.all([listEvents(biz.id, GELIR), listEvents(biz.id, ISLEM)]).then(([a, b]) => setEv([...a, ...b])).catch(() => {});
    listDues(biz.id).then(setDues).catch(() => {});
    listDocs(biz.id).then(setDocs).catch(() => {});
    listItems(biz.id).then(setItems).catch(() => {});
    listPlaces(biz.id).then(setPlaces).catch(() => {});
  }, [biz.id]);
  useEffect(load, [load]);
  useOnActivate(load);

  const today = todayStr();
  const [showAlerts, setShowAlerts] = useState(false);
  const [outMsg, setOutMsg] = useState("");
  const signOut = async () => {
    if (status().pending > 0) {
      await flush();
      if (status().pending > 0) { setOutMsg(`${status().pending} kayıt henüz gönderilmedi. İnternet gelince gönderilsin, sonra çıkış yap; yoksa bu kayıtlar kaybolur.`); return; }
    }
    clearLocal(); await supabase().auth.signOut(); location.href = "/";
  };
  const masraf = exp.filter((e) => inSeason(e.occurred_on, S)).reduce((t, e) => t + e.amount, 0);
  const gelir = ev.filter((e) => e.kind === GELIR && inSeason(e.occurred_on, S)).reduce((t, e) => t + Number(e.quantity ?? 0), 0);
  const place = (id: string | null) => places.find((p) => p.id === id)?.name ?? "Tarla";

  // Uyarılar
  const waits = ev.filter((e) => e.kind === ISLEM).map((e) => ({ e, h: harvestFrom(e) })).filter((x) => x.h && x.h > today);
  const lastWait = Object.values(waits.reduce<Record<string, { e: EventRow; h: string }>>((m, x) => {
    const k = x.e.place_id ?? ""; if (!m[k] || m[k].h < x.h!) m[k] = { e: x.e, h: x.h! }; return m; }, {}));
  const borc = dues.filter((d) => d.direction === "borc").reduce((t, d) => t + remaining(d), 0) + exp.reduce((t, e) => t + owed(e), 0);
  const alacak = dues.filter((d) => d.direction === "alacak").reduce((t, d) => t + remaining(d), 0) + ev.filter((e) => e.kind === GELIR).reduce((t, e) => t + incomeOpen(e), 0);
  const dueSoon = [
    ...dues.filter((d) => remaining(d) > 0 && d.due_on).map((d) => ({ who: d.party, dir: d.direction, left: remaining(d), due: d.due_on! })),
    ...ev.filter((e) => e.kind === GELIR && incomeOpen(e) > 0 && e.data.due_on).map((e) => ({ who: String(e.data.buyer || e.data.type), dir: "alacak" as const, left: incomeOpen(e), due: String(e.data.due_on) })),
  ].filter((x) => (Date.parse(x.due) - Date.parse(today)) / 86400000 <= config.remindDays.dues).sort((a, b) => a.due.localeCompare(b.due));
  const docSoon = docs.filter((d) => { const n = daysLeft(d.expires_on); return n !== null && n <= config.remindDays.documents; });
  const empty = items.filter(isLow);
  const recent = [...exp.map((e) => ({ at: e.created_at ?? e.occurred_on, t: `Masraf · ${e.category} ${formatTL(e.amount)}`, by: e.created_by, open: () => go("masraf", { duzenle: e.id }) })),
    ...ev.map((e) => ({ at: e.created_at ?? e.occurred_on, t: e.kind === GELIR ? `Gelir · ${String(e.data.type)} ${formatTL(Number(e.quantity))}` : `${place(e.place_id)} · ${String(e.data.type)}`, by: e.created_by,
      open: () => (e.kind === GELIR ? go("gelir", { duzenle: e.id }) : go("tarlalar", { islem: e.id })) }))]
    .sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);

  return (
    <main className="ui-has-nav ui-stack">
      <PageHeader sub={biz.name} title="Özet" right={<HistoryLink />} />
      <SeasonPicker onManage={() => go("sezonlar")} />
      <div className="ui-total">
        <PrivacyButton />
        <span>{S.name} sezonu kâr / zarar</span>
        <b>{formatTL(gelir - masraf)}</b>
        <div className="ui-total-row">
          <div><span>Gelir</span><strong>{formatTL(gelir)}</strong></div>
          <div><span>Masraf</span><strong>{formatTL(masraf)}</strong></div>
        </div>
      </div>

      <div className="ui-tiles">
        <TabLink to="masraf" params={{ yeni: 1 }}><b>+ Masraf</b><small>gübre, mazot, ilaç…</small></TabLink>
        <TabLink to="tarlalar"><b>+ Tarla işi</b><small>ilaçlama, sulama…</small></TabLink>
        <TabLink to="gelir" params={{ yeni: 1 }}><b>+ Gelir</b><small>satış, destek</small></TabLink>
        <TabLink to="depo"><b>Depo</b><small>{items.length} malzeme</small></TabLink>
      </div>

      {(() => {
        const n = lastWait.length + dueSoon.length + docSoon.length + (empty.length ? 1 : 0);
        if (!n) return null;
        const red = dueSoon.some((d) => d.due < today) || docSoon.some((d) => (daysLeft(d.expires_on) ?? 0) < 0);
        return (
          <div className={`ui-alerts${red ? " gecti" : ""}`}>
            <button type="button" aria-expanded={showAlerts} onClick={() => setShowAlerts(!showAlerts)}>
              <span>Uyarılar ({n})</span><span>{showAlerts ? "Kapat ▲" : "Gör ▼"}</span>
            </button>
            {showAlerts && <div className="list">
      {lastWait.map(({ e, h }) => (
                <div key={e.id} className="ui-warn yakin"><div className="ui-warn-row"><span><b>{place(e.place_id)}</b>: hasat en erken {dayYear(h)} ({String(e.data.product ?? "ilaç")}).</span></div></div>
              ))}
              {dueSoon.map((d, i) => (
                <TabLink key={i} to="vadeler" className={`ui-warn ${d.due < today ? "gecti" : "yakin"}`} style={{ textDecoration: "none" }}>
                  <div className="ui-warn-row"><span>{d.dir === "borc" ? "Ödenecek" : "Alınacak"}: <b>{d.who}</b> <span className="ui-money">{formatTL(d.left)}</span> · vade {dayText(d.due)}{d.due < today ? " (geçti)" : ""}</span></div>
                </TabLink>
              ))}
              {docSoon.map((d) => (
                <TabLink key={d.id} to="belgeler" className={`ui-warn ${(daysLeft(d.expires_on) ?? 0) < 0 ? "gecti" : "yakin"}`} style={{ textDecoration: "none" }}>
                  <div className="ui-warn-row"><span><b>{d.title}</b>: {(daysLeft(d.expires_on) ?? 0) < 0 ? "süresi geçti" : `${daysLeft(d.expires_on)} gün kaldı`} ({dayYear(d.expires_on!)})</span></div>
                </TabLink>
              ))}
              {empty.length > 0 && <TabLink to="depo" className="ui-warn yakin" style={{ textDecoration: "none" }}><div className="ui-warn-row"><span>Depoda biten / az kalan: {empty.map((i) => `${i.name} (${i.quantity.toLocaleString("tr-TR")} ${i.unit})`).join(", ")}</span></div></TabLink>}

            </div>}
          </div>
        );
      })()}

      <div className="ui-links">
        <TabLink to="rapor"><b>Sezon raporu</b><span>Gelir, masraf, tarla tarla kâr</span></TabLink>
        <TabLink to="vadeler"><b>Borç ve vadeler</b><span>Borç {formatTL(borc)} · Alacak {formatTL(alacak)}</span></TabLink>
        <TabLink to="belgeler"><b>Belgeler</b><span>{docs.length ? `${docs.length} belge` : "ÇKS, sigorta, kira…"}</span></TabLink>
        <TabLink to="kayitlar"><b>Kayıtlar</b><span>Bütün masraf, gelir, tarla işleri: ara, düzelt, sil</span></TabLink>
        <TabLink to="listeler"><b>Listeleri düzenle</b><span>Masraf türleri, tarla işleri, birimler… ekle / kaldır</span></TabLink>
        <TabLink to="aile"><b>Aile ve ortak defter</b><span>Kim girdi, davet</span></TabLink>
      </div>

      {recent.length > 0 && (
        <>
          <h2 className="ui-section">Son kayıtlar</h2>
          <div className="ui-card ui-rows">
            {recent.map((r, i) => <button key={i} type="button" className="ui-row-btn" onClick={r.open}><span>{r.t}</span><span>{nameOf(r.by)} ›</span></button>)}
          </div>
          <button type="button" className="ui-link" onClick={() => go("kayitlar")}>Bütün kayıtlar ›</button>
        </>
      )}
      {outMsg && <div className="ui-warn yakin"><div className="ui-warn-row"><span>{outMsg}</span></div></div>}
      <MainButton secondary onClick={signOut}>Çıkış yap</MainButton>
    </main>
  );
}

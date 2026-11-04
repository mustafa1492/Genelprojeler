"use client";
import { useCList } from "../lists";
import { useAddToList } from "@/core/settings/lists";
import { useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { useMembers } from "@/core/auth/members";
import { listEvents, type EventRow } from "@/core/events/api";
import { ExpenseScreen } from "@/core/expenses/ExpenseScreen";
import { formatTL } from "@/core/ledger/api";
import { listPlaces, type Place } from "@/core/places/api";
import { config } from "../config";
import { GELIR } from "../kayit";
import { HistoryLink } from "../nav";
import { useGo, useOnActivate } from "@/core/shell/TabShell";
import { inSeason, SeasonPicker, useSeason } from "../sezon";
import { listLots, type Lot } from "@/core/lots/api";
import { hasFidan, isFidanLot } from "../fidan";
import { closeInbox, InboxCard } from "./Fis";

/** Çiftçi masrafı: tarla seçimi, ayın geliriyle kâr, kim girdi. */
export default function Masraf() {
  const biz = useBusiness();
  const { nameOf } = useMembers(biz.id);
  const [places, setPlaces] = useState<Place[]>([]);
  const [income, setIncome] = useState<EventRow[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const load = () => {
    listPlaces(biz.id).then(setPlaces).catch(() => {});
    listEvents(biz.id, GELIR).then(setIncome).catch(() => {});
    if (hasFidan(biz)) listLots(biz.id).then((r) => setLots(r.filter(isFidanLot))).catch(() => {});
  };
  useEffect(load, [biz.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useOnActivate(load);
  const { selected: S } = useSeason();
  const cats = useCList("expense");
  const invUnits = useCList("inv_units");
  const isler = useCList("isler");
  const addIs = useAddToList("isler");
  const go = useGo();
  const gelirS = income.filter((e) => inSeason(e.occurred_on, S)).reduce((t, e) => t + Number(e.quantity ?? 0), 0);
  return (
    <ExpenseScreen categories={cats} onEditCategories={() => go("listeler", { liste: "expense" })} places={places} branches={isler} onAddBranch={addIs}
      inbox={(start) => <InboxCard onOpen={(x) => start(x.photo_path, x.note, x.place_id, (id) => { closeInbox(x.id, "islendi", id).catch(() => {}); })} />} headerRight={<HistoryLink />} memberName={nameOf}
      link={hasFidan(biz) ? { label: "Hangi fidan partisi? (isteğe bağlı)", key: "lot_id", param: "parti", options: lots.filter((l) => l.status === "aktif").map((l) => ({ id: l.id, name: l.name })) } : undefined}
      stock={{ categoryOf: (c) => (c === "Gübre" ? "Gübre" : c === "İlaç" ? "İlaç" : c.startsWith("Tohum") ? "Tohum" : null), units: invUnits }}
      period={S} periodPicker={<SeasonPicker onManage={() => go("sezonlar")} />}
      periodSummary={(total) => (
        <div className="ui-total">
          <span>{S.name} sezonu masraf</span><b>{formatTL(total)}</b>
          <div className="ui-total-row">
            <div><span>Sezon geliri</span><strong>{formatTL(gelirS)}</strong></div>
            <div><span>Kâr / zarar</span><strong>{formatTL(gelirS - total)}</strong></div>
          </div>
        </div>
      )}
    />
  );
}

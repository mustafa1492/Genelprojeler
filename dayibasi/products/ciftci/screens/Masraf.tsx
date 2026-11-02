"use client";
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

/** Çiftçi masrafı: tarla seçimi, ayın geliriyle kâr, kim girdi. */
export default function Masraf() {
  const biz = useBusiness();
  const { nameOf } = useMembers(biz.id);
  const [places, setPlaces] = useState<Place[]>([]);
  const [income, setIncome] = useState<EventRow[]>([]);
  const load = () => {
    listPlaces(biz.id).then(setPlaces).catch(() => {});
    listEvents(biz.id, GELIR).then(setIncome).catch(() => {});
  };
  useEffect(load, [biz.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useOnActivate(load);
  const { selected: S } = useSeason();
  const go = useGo();
  const gelirS = income.filter((e) => inSeason(e.occurred_on, S)).reduce((t, e) => t + Number(e.quantity ?? 0), 0);
  return (
    <ExpenseScreen categories={config.expenses.categories} places={places} headerRight={<HistoryLink />} memberName={nameOf}
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

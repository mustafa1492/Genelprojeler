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
import { HistoryLink, navItems } from "../nav";

/** Çiftçi masrafı: tarla seçimi, ayın geliriyle kâr, kim girdi. */
export default function Masraf() {
  const biz = useBusiness();
  const { nameOf } = useMembers(biz.id);
  const [places, setPlaces] = useState<Place[]>([]);
  const [income, setIncome] = useState<EventRow[]>([]);
  useEffect(() => {
    listPlaces(biz.id).then(setPlaces).catch(() => {});
    listEvents(biz.id, GELIR).then(setIncome).catch(() => {});
  }, [biz.id]);
  const gelir = (m: string) => income.filter((e) => e.occurred_on.startsWith(m)).reduce((t, e) => t + Number(e.quantity ?? 0), 0);
  return (
    <ExpenseScreen categories={config.expenses.categories} places={places} navItems={navItems} current="/ciftci/masraf" headerRight={<HistoryLink />} memberName={nameOf}
      summary={(m, total) => (
        <div className="ui-total">
          <span>Bu ay masraf</span><b>{formatTL(total)}</b>
          <div className="ui-total-row">
            <div><span>Bu ay gelir</span><strong>{formatTL(gelir(m))}</strong></div>
            <div><span>Fark</span><strong>{formatTL(gelir(m) - total)}</strong></div>
          </div>
        </div>
      )}
      summaryRows={(m, total) => [["Bu ay gelir", gelir(m)], ["Bu ay masraf", -total], ["Fark", gelir(m) - total], []]} />
  );
}

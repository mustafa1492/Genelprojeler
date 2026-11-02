"use client";
import { useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { listEvents, type EventRow } from "@/core/events/api";
import { ExpenseScreen } from "@/core/expenses/ExpenseScreen";
import { formatTL } from "@/core/ledger/api";
import { listPeople, type Person } from "@/core/people/api";
import { config } from "../config";
import { PUANTAJ, split } from "../hesap";
import { HistoryLink, navItems } from "../nav";

/** Dayıbaşı masrafı: çiftçiye yansıt + net kazanç (payın − masraflar). */
export default function Masraf() {
  const biz = useBusiness();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [farmers, setFarmers] = useState<Person[]>([]);
  useEffect(() => {
    listEvents(biz.id, PUANTAJ).then(setEvents).catch(() => {});
    listPeople(biz.id, [config.farmers.kind]).then(setFarmers).catch(() => {});
  }, [biz.id]);
  const pay = (m: string) => events.filter((e) => e.occurred_on.startsWith(m)).reduce((t, e) => t + (e.quantity ?? 0) * split(e, biz).fee, 0);

  return (
    <ExpenseScreen categories={config.expenses.categories} chargeTargets={farmers} navItems={navItems} current="/masraf" headerRight={<HistoryLink />}
      summary={(m, total) => (
        <div className="ui-total">
          <span>Net kazanç</span>
          <b>{formatTL(pay(m) - total)}</b>
          <div className="ui-total-row">
            <div><span>Senin payın</span><strong>{formatTL(pay(m))}</strong></div>
            <div><span>Masraflar</span><strong>{formatTL(total)}</strong></div>
          </div>
        </div>
      )}
      summaryRows={(m, total) => [["Senin payın (kayıtlardan)", pay(m)], ["Masraflar", -total], ["Net kazanç", pay(m) - total], []]} />
  );
}

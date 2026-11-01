import { mutate, query } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";

// Cari hesap hareketi: alacak / ödeme / avans. İnternetsiz de yazılır (core/offline).
export type LedgerKind = "alacak" | "odeme" | "avans";
export type LedgerEntry = { id: string; kind: LedgerKind; amount: number; occurred_on: string; note: string | null; created_at?: string; person_id?: string };

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });

export async function listEntries(personId: string) {
  const rows = await query<LedgerEntry>("ledger_entries", (r) => r.person_id === personId,
    () => supabase().from("ledger_entries").select("id, person_id, business_id, kind, amount, occurred_on, note, created_at").eq("person_id", personId));
  return rows.map((e) => ({ ...e, amount: Number(e.amount) }))
    .sort((a, b) => (b.occurred_on + (b.created_at ?? "")).localeCompare(a.occurred_on + (a.created_at ?? "")));
}

/** İşletmenin bütün hareketleri (alacak listesi için). */
export async function listAllEntries(businessId: string) {
  const rows = await query<LedgerEntry & { business_id: string }>("ledger_entries", (r) => r.business_id === businessId,
    () => supabase().from("ledger_entries").select("id, person_id, business_id, kind, amount, occurred_on, note, created_at").eq("business_id", businessId));
  return rows.map((e) => ({ ...e, amount: Number(e.amount) }));
}

export async function addEntry(businessId: string, personId: string, kind: LedgerKind, amount: number, note?: string) {
  const id = crypto.randomUUID();
  await mutate({ kind: "insert", table: "ledger_entries", values: {
    id, business_id: businessId, person_id: personId, kind, amount, note: note || null,
    occurred_on: today(), created_at: new Date().toISOString(),
  } });
  return id;
}

export async function deleteEntry(id: string) {
  await mutate({ kind: "delete", table: "ledger_entries", key: id });
}

export const formatTL = (n: number) => `${n.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} TL`;

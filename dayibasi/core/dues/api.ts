import { mutate, query } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";

// Borç ve vadeler: kredi, kooperatif, bayi, tüccar alacağı, çek/senet. direction: borc (ben borçluyum) / alacak.
export type Due = {
  id: string; business_id: string; direction: "borc" | "alacak"; party: string; kind: string;
  amount: number; paid_amount: number; due_on: string | null; note: string | null; data: Record<string, unknown>;
  created_by?: string | null; created_at?: string;
};
const cols = "id, business_id, direction, party, kind, amount, paid_amount, due_on, note, data, created_by, created_at";

export async function listDues(businessId: string) {
  const rows = await query<Due>("dues", (r) => r.business_id === businessId,
    () => supabase().from("dues").select(cols).eq("business_id", businessId));
  return rows.map((d) => ({ ...d, amount: Number(d.amount), paid_amount: Number(d.paid_amount ?? 0) }));
}
export async function addDue(businessId: string, d: Omit<Due, "id" | "business_id" | "paid_amount" | "data" | "created_at" | "created_by">) {
  const row = { id: crypto.randomUUID(), business_id: businessId, paid_amount: 0, data: {}, created_at: new Date().toISOString(), ...d };
  await mutate({ kind: "insert", table: "dues", values: row });
  return row as Due;
}
export const updateDue = (id: string, v: Partial<Due>) => mutate({ kind: "update", table: "dues", key: id, values: v });
export const deleteDue = (id: string) => mutate({ kind: "delete", table: "dues", key: id });
export const restoreDue = (d: Due) => mutate({ kind: "insert", table: "dues", values: d });
export const remaining = (d: Due) => Math.max(0, d.amount - d.paid_amount);

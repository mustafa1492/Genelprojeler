import { supabase } from "@/core/supabase/client";

// Cari hesap hareketi: alacak / ödeme / avans.
export type LedgerKind = "alacak" | "odeme" | "avans";
export type LedgerEntry = { id: string; kind: LedgerKind; amount: number; occurred_on: string; note: string | null };

export async function listEntries(personId: string) {
  const { data, error } = await supabase().from("ledger_entries")
    .select("id, kind, amount, occurred_on, note").eq("person_id", personId)
    .order("occurred_on", { ascending: false }).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((e) => ({ ...e, amount: Number(e.amount) })) as LedgerEntry[];
}

export async function addEntry(businessId: string, personId: string, kind: LedgerKind, amount: number, note?: string) {
  const { data, error } = await supabase().from("ledger_entries")
    .insert({ business_id: businessId, person_id: personId, kind, amount, note: note || null })
    .select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function deleteEntry(id: string) {
  const { error } = await supabase().from("ledger_entries").delete().eq("id", id);
  if (error) throw error;
}

export const formatTL = (n: number) => `${n.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} TL`;

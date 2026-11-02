import { mutate, query } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";

// Parti (lot): aynı anda dikilen fidan grubu. Geçmiş tarihli de girilebilir.
export type Lot = {
  id: string; business_id: string; name: string; place_id: string | null; planted_on: string | null;
  initial_count: number; source: string | null; status: "aktif" | "bitti"; note: string | null;
  data: Record<string, unknown>; created_by?: string | null; created_at?: string;
};
const cols = "id, business_id, name, place_id, planted_on, initial_count, source, status, note, data, created_by, created_at";

export async function listLots(businessId: string) {
  const rows = await query<Lot>("lots", (r) => r.business_id === businessId,
    () => supabase().from("lots").select(cols).eq("business_id", businessId));
  return rows.map((l) => ({ ...l, initial_count: Number(l.initial_count) }))
    .sort((a, b) => (b.planted_on ?? "").localeCompare(a.planted_on ?? "") || a.name.localeCompare(b.name, "tr"));
}
export async function addLot(businessId: string, l: Omit<Lot, "id" | "business_id" | "created_at" | "created_by" | "status"> & { status?: Lot["status"] }) {
  const row = { id: crypto.randomUUID(), business_id: businessId, status: "aktif", created_at: new Date().toISOString(), ...l };
  await mutate({ kind: "insert", table: "lots", values: row });
  return row as Lot;
}
export const updateLot = (id: string, v: Partial<Lot>) => mutate({ kind: "update", table: "lots", key: id, values: v });
export const deleteLot = (id: string) => mutate({ kind: "delete", table: "lots", key: id });
export const restoreLot = (l: Lot) => mutate({ kind: "insert", table: "lots", values: l });

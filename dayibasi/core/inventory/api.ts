import { mutate, query } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";

// Depo / envanter: malzemenin adı, türü, birimi, miktarı. Miktar uygulamadan − / + ile değişir.
export type Item = {
  id: string; business_id: string; name: string; category: string; unit: string; quantity: number;
  note: string | null; created_by?: string | null; created_at?: string;
};
const cols = "id, business_id, name, category, unit, quantity, note, created_by, created_at";

export async function listItems(businessId: string) {
  const rows = await query<Item>("inventory_items", (r) => r.business_id === businessId,
    () => supabase().from("inventory_items").select(cols).eq("business_id", businessId));
  return rows.map((i) => ({ ...i, quantity: Number(i.quantity) })).sort((a, b) => a.name.localeCompare(b.name, "tr"));
}
export async function addItem(businessId: string, i: Pick<Item, "name" | "category" | "unit" | "quantity" | "note">) {
  const row = { id: crypto.randomUUID(), business_id: businessId, created_at: new Date().toISOString(), ...i };
  await mutate({ kind: "insert", table: "inventory_items", values: row });
  return row as Item;
}
export const updateItem = (id: string, v: Partial<Item>) => mutate({ kind: "update", table: "inventory_items", key: id, values: v });
export const deleteItem = (id: string) => mutate({ kind: "delete", table: "inventory_items", key: id });
export const restoreItem = (i: Item) => mutate({ kind: "insert", table: "inventory_items", values: i });

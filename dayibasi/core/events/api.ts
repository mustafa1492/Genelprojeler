import { mutate, query } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";

// Kayıt defteri (puantaj, randevu, ziyaret...). İnternetsiz de yazılır.
export type EventRow = {
  id: string; business_id: string; kind: string; occurred_on: string;
  place_id: string | null; person_id: string | null; quantity: number | null;
  data: Record<string, unknown>; created_at?: string;
};
const cols = "id, business_id, kind, occurred_on, place_id, person_id, quantity, data, created_at";

export const todayIstanbul = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });

/** İşletmenin bu türdeki bütün kayıtları (isteğe bağlı: tek gün). */
export async function listEvents(businessId: string, kind: string, day?: string) {
  const rows = await query<EventRow>("events",
    (r) => r.business_id === businessId && r.kind === kind && (!day || r.occurred_on === day),
    () => {
      let q = supabase().from("events").select(cols).eq("business_id", businessId).eq("kind", kind);
      if (day) q = q.eq("occurred_on", day);
      return q;
    });
  return rows.map((e) => ({ ...e, quantity: e.quantity == null ? null : Number(e.quantity) }))
    .sort((a, b) => (a.occurred_on + (a.created_at ?? "")).localeCompare(b.occurred_on + (b.created_at ?? "")));
}

export async function addEvent(businessId: string, e: Omit<EventRow, "id" | "business_id" | "occurred_on" | "created_at"> & { occurred_on?: string }) {
  const row = { id: crypto.randomUUID(), business_id: businessId, occurred_on: todayIstanbul(), created_at: new Date().toISOString(), ...e };
  await mutate({ kind: "insert", table: "events", values: row });
  return row as EventRow;
}

export async function deleteEvent(id: string) {
  await mutate({ kind: "delete", table: "events", key: id });
}

export async function updateEvent(id: string, values: Partial<Omit<EventRow, "id" | "business_id">>) {
  await mutate({ kind: "update", table: "events", key: id, values });
}

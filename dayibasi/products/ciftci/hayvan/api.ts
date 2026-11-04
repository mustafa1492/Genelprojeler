import { mutate, query } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";

// Hayvan ortak iskeleti: barınak → sürü (dönem, toplu sayı) → günlük kayıt. Göç: 0018_hayvan.sql.
// Kanatlı, küçükbaş ve büyükbaş aynı tabloları kullanır (species). Küpe kartı / üreme döngüsü hayvancılık oturumunda ayrıca eklenecek.
export type Species = "kanatli" | "kucukbas" | "buyukbas";

export type Barn = {
  id: string; business_id: string; species: Species; name: string; area_m2: number | null; capacity: number | null;
  note: string | null; data: Record<string, unknown>; created_at?: string;
};
export type Herd = {
  id: string; business_id: string; barn_id: string | null; species: Species; kind: string | null; name: string;
  started_on: string; initial_count: number; source: string | null; status: "acik" | "kapandi"; closed_on: string | null;
  note: string | null; data: Record<string, unknown>; created_at?: string;
};
export type HerdDay = {
  id: string; business_id: string; herd_id: string; day: string; dead: number; culled: number; feed_bags: number; bag_kg: number | null;
  avg_weight_g: number | null; weighed_n: number | null; note: string | null; data: Record<string, unknown>; created_at?: string;
};

const BARN = "id, business_id, species, name, area_m2, capacity, note, data, created_at";
const HERD = "id, business_id, barn_id, species, kind, name, started_on, initial_count, source, status, closed_on, note, data, created_at";
const DAY = "id, business_id, herd_id, day, dead, culled, feed_bags, bag_kg, avg_weight_g, weighed_n, note, data, created_at";
const n = (v: unknown) => (v == null ? null : Number(v));

export async function listBarns(businessId: string, species: Species) {
  const rows = await query<Barn>("barns", (r) => r.business_id === businessId && r.species === species,
    () => supabase().from("barns").select(BARN).eq("business_id", businessId).eq("species", species));
  return rows.map((b) => ({ ...b, area_m2: n(b.area_m2), capacity: n(b.capacity) })).sort((a, b) => a.name.localeCompare(b.name, "tr"));
}
export async function listHerds(businessId: string, species: Species) {
  const rows = await query<Herd>("herds", (r) => r.business_id === businessId && r.species === species,
    () => supabase().from("herds").select(HERD).eq("business_id", businessId).eq("species", species));
  return rows.map((h) => ({ ...h, initial_count: Number(h.initial_count) })).sort((a, b) => b.started_on.localeCompare(a.started_on));
}
/** İşletmenin bütün günlük kayıtları (türe göre süzmek için sürü listesiyle eşleştirilir). */
export async function listHerdDays(businessId: string) {
  const rows = await query<HerdDay>("herd_days", (r) => r.business_id === businessId,
    () => supabase().from("herd_days").select(DAY).eq("business_id", businessId));
  return rows.map((d) => ({ ...d, dead: Number(d.dead), culled: Number(d.culled), feed_bags: Number(d.feed_bags), bag_kg: n(d.bag_kg), avg_weight_g: n(d.avg_weight_g), weighed_n: n(d.weighed_n) }))
    .sort((a, b) => b.day.localeCompare(a.day));
}

const ins = async <T extends { id: string }>(table: string, businessId: string, v: Omit<T, "id" | "business_id" | "created_at">) => {
  const row = { id: crypto.randomUUID(), business_id: businessId, created_at: new Date().toISOString(), ...v } as unknown as T;
  await mutate({ kind: "insert", table, values: row as unknown as Record<string, unknown> });
  return row;
};
const upd = (table: string) => (id: string, v: Record<string, unknown>) => mutate({ kind: "update", table, key: id, values: v });
const del = (table: string) => (id: string) => mutate({ kind: "delete", table, key: id });
const put = (table: string) => (row: { id: string }) => mutate({ kind: "insert", table, values: row as unknown as Record<string, unknown> });

export const addBarn = (b: string, v: Omit<Barn, "id" | "business_id" | "created_at">) => ins<Barn>("barns", b, v);
export const updateBarn = upd("barns"), deleteBarn = del("barns"), restoreBarn = put("barns");
export const addHerd = (b: string, v: Omit<Herd, "id" | "business_id" | "created_at">) => ins<Herd>("herds", b, v);
export const updateHerd = upd("herds"), deleteHerd = del("herds"), restoreHerd = put("herds");
export const addHerdDay = (b: string, v: Omit<HerdDay, "id" | "business_id" | "created_at">) => ins<HerdDay>("herd_days", b, v);
export const updateHerdDay = upd("herd_days"), deleteHerdDay = del("herd_days"), restoreHerdDay = put("herd_days");

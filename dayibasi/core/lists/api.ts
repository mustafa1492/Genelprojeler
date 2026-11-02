import { mutate, query } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";

// Kişi listeleri (ör. "Manisa", "Aydın"). Bir kişi birden çok listede olabilir. İnternetsiz de çalışır.
export type PersonList = { id: string; business_id: string; name: string; members: string[]; sort: number; created_at?: string };

export async function listLists(businessId: string) {
  const rows = await query<PersonList>("lists", (r) => r.business_id === businessId,
    () => supabase().from("lists").select("id, business_id, name, members, sort, created_at").eq("business_id", businessId));
  return rows.sort((a, b) => a.sort - b.sort || (a.created_at ?? "").localeCompare(b.created_at ?? ""));
}

export async function addList(businessId: string, name: string, sort = 0) {
  const row: PersonList = { id: crypto.randomUUID(), business_id: businessId, name, members: [], sort, created_at: new Date().toISOString() };
  await mutate({ kind: "insert", table: "lists", values: row });
  return row;
}

export const updateList = (id: string, values: Partial<Pick<PersonList, "name" | "members" | "sort">>) =>
  mutate({ kind: "update", table: "lists", key: id, values });

export const deleteList = (id: string) => mutate({ kind: "delete", table: "lists", key: id });

/** Kişiyi listeye ekle / çıkar (tek dokunuş). */
export async function toggleMember(list: PersonList, personId: string) {
  const members = list.members.includes(personId) ? list.members.filter((x) => x !== personId) : [...list.members, personId];
  await updateList(list.id, { members });
  return members;
}

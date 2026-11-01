import { getLocal, mutate, query } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";

// Kişi kartı verisi (işçi, çiftçi, müşteri...). Tür `kind` ile ayrılır.
export type Person = {
  id: string;
  business_id: string;
  kind: string;
  full_name: string;
  phone: string | null;
  tags: string[];
  custom: Record<string, string>;
  notes: string | null;
  active: boolean;
};
export type PersonInput = Pick<Person, "full_name" | "phone" | "tags" | "custom" | "notes">;

const cols = "id, business_id, kind, full_name, phone, tags, custom, notes, active";

export async function listPeople(businessId: string, kinds: string[]) {
  const rows = await query<Person>("people",
    (r) => r.business_id === businessId && kinds.includes(String(r.kind)),
    () => supabase().from("people").select(cols).eq("business_id", businessId).in("kind", kinds));
  return rows.filter((p) => p.active).sort((a, b) => a.full_name.localeCompare(b.full_name, "tr"));
}

export async function addPerson(businessId: string, kind: string, p: PersonInput) {
  const row: Person = { id: crypto.randomUUID(), business_id: businessId, kind, active: true, ...p };
  await mutate({ kind: "insert", table: "people", values: row });
  return row;
}

export async function updatePerson(id: string, p: Partial<PersonInput & { active: boolean }>) {
  await mutate({ kind: "update", table: "people", key: id, values: p });
}

export async function deletePerson(id: string) {
  await mutate({ kind: "delete", table: "people", key: id });
}

export const getPerson = (id: string) => getLocal("people", id) as Person | undefined;

/** KVKK: kişiyi ve ona ait her şeyi (geçmiş dahil) kalıcı siler. Geri alınamaz. */
export async function forgetPerson(id: string) {
  const { error } = await supabase().rpc("forget_person", { p_id: id });
  if (error) throw error;
  await query("people", (r) => r.id === id, async () => ({ data: [], error: null }));
}

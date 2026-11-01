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
  const { data, error } = await supabase().from("people").select(cols)
    .eq("business_id", businessId).in("kind", kinds).eq("active", true)
    .order("full_name");
  if (error) throw error;
  return data as Person[];
}

export async function addPerson(businessId: string, kind: string, p: PersonInput) {
  const { data, error } = await supabase().from("people")
    .insert({ business_id: businessId, kind, ...p }).select(cols).single();
  if (error) throw error;
  return data as Person;
}

export async function updatePerson(id: string, p: Partial<PersonInput & { active: boolean }>) {
  const { data, error } = await supabase().from("people").update(p).eq("id", id).select(cols).single();
  if (error) throw error;
  return data as Person;
}

export async function deletePerson(id: string) {
  const { error } = await supabase().from("people").delete().eq("id", id);
  if (error) throw error;
}

export async function getPerson(id: string) {
  const { data, error } = await supabase().from("people").select(cols).eq("id", id).single();
  if (error) throw error;
  return data as Person;
}

/** KVKK: kişiyi ve ona ait her şeyi (geçmiş dahil) kalıcı siler. Geri alınamaz. */
export async function forgetPerson(id: string) {
  const { error } = await supabase().rpc("forget_person", { p_id: id });
  if (error) throw error;
}

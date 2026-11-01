import { mutate, query } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";

// Yer kartı (tarla, adres...). Sahibi bir kişiye (çiftçi) bağlanabilir.
export type Place = { id: string; business_id: string; owner_person_id: string | null; name: string; custom: Record<string, string> };

export async function listPlaces(businessId: string) {
  return query<Place>("places", (r) => r.business_id === businessId,
    () => supabase().from("places").select("id, business_id, owner_person_id, name, custom").eq("business_id", businessId));
}

export async function addPlace(businessId: string, name: string, ownerId: string | null) {
  const row: Place = { id: crypto.randomUUID(), business_id: businessId, owner_person_id: ownerId, name, custom: {} };
  await mutate({ kind: "insert", table: "places", values: row });
  return row;
}

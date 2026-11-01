import { mutate, query } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";

// Yoklama: "Yarın geliyor musun?" cevapları. null = bekleniyor.
export type Answer = "evet" | "hayir" | null;

/** Europe/Istanbul'a göre yarının tarihi (YYYY-MM-DD). */
export function tomorrowIstanbul() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
  const d = new Date(today + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export async function listAnswers(businessId: string, forDate: string) {
  const rows = await query<{ person_id: string; answer: Answer }>("rsvps",
    (r) => r.business_id === businessId && r.for_date === forDate,
    () => supabase().from("rsvps").select("business_id, person_id, for_date, answer").eq("business_id", businessId).eq("for_date", forDate));
  return Object.fromEntries(rows.map((r) => [r.person_id, r.answer])) as Record<string, Answer>;
}

export async function setAnswer(businessId: string, personId: string, forDate: string, answer: Answer) {
  await mutate({ kind: "upsert", table: "rsvps", onConflict: "person_id,for_date",
    values: { business_id: businessId, person_id: personId, for_date: forDate, answer, updated_at: new Date().toISOString() } });
}

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
  const { data, error } = await supabase().from("rsvps").select("person_id, answer")
    .eq("business_id", businessId).eq("for_date", forDate);
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((r) => [r.person_id, r.answer as Answer])) as Record<string, Answer>;
}

export async function setAnswer(businessId: string, personId: string, forDate: string, answer: Answer) {
  const { error } = await supabase().from("rsvps").upsert(
    { business_id: businessId, person_id: personId, for_date: forDate, answer, updated_at: new Date().toISOString() },
    { onConflict: "person_id,for_date" },
  );
  if (error) throw error;
}

import { mutate, query } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";

// Kâğıt / belge + bitiş tarihi (ÇKS, sigorta, kira sözleşmesi, ruhsat…).
export type Doc = {
  id: string; business_id: string; subject_type: "asset" | "person" | "business"; subject_id: string | null;
  title: string; expires_on: string | null; file_path: string | null; notes: string | null; created_by?: string | null; created_at?: string;
};
const cols = "id, business_id, subject_type, subject_id, title, expires_on, file_path, notes, created_by, created_at";

export async function listDocs(businessId: string) {
  return query<Doc>("documents", (r) => r.business_id === businessId,
    () => supabase().from("documents").select(cols).eq("business_id", businessId));
}
export async function addDoc(businessId: string, d: Pick<Doc, "title" | "expires_on" | "notes">) {
  const row = { id: crypto.randomUUID(), business_id: businessId, subject_type: "business", subject_id: null, file_path: null, created_at: new Date().toISOString(), ...d };
  await mutate({ kind: "insert", table: "documents", values: row });
  return row as Doc;
}
export const updateDoc = (id: string, v: Partial<Doc>) => mutate({ kind: "update", table: "documents", key: id, values: v });
export const deleteDoc = (id: string) => mutate({ kind: "delete", table: "documents", key: id });
export const restoreDoc = (d: Doc) => mutate({ kind: "insert", table: "documents", values: d });

/** Bitişe kaç gün kaldı (geçtiyse eksi). */
export function daysLeft(d: string | null) {
  if (!d) return null;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
  return Math.round((Date.parse(d) - Date.parse(today)) / 86400000);
}

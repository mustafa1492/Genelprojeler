import { supabase } from "@/core/supabase/client";

// İşlem geçmişi (veritabanı tetikleyicisi tutar). Her satır undo_activity ile geri alınabilir.
export type Activity = {
  id: number;
  table_name: string;
  action: "insert" | "update" | "delete";
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  undo_of: number | null;
  undone_at: string | null;
  created_at: string;
  user_id?: string | null;
};

export async function listActivity(businessId: string, limit = 100) {
  const { data, error } = await supabase().from("activity_log")
    .select("id, table_name, action, old_data, new_data, undo_of, undone_at, created_at, user_id")
    .eq("business_id", businessId).order("id", { ascending: false }).limit(limit);
  if (error) throw error;
  return data as Activity[];
}

const undoErrors: Record<string, string> = {
  sonradan_degisti: "Bundan sonra aynı kayıtta başka bir değişiklik yapılmış. Önce üstteki yeni işlemleri geri al.",
  zaten_geri_alindi: "Bu işlem zaten geri alınmış.",
  izin_yok: "Bu işlemi geri alma iznin yok.",
  yok: "Bu işlem bulunamadı.",
};

/** Geri alır. Başarılıysa null, değilse Türkçe açıklama döner. */
export async function undoActivity(id: number): Promise<string | null> {
  const { error } = await supabase().rpc("undo_activity", { p_id: id });
  if (!error) return null;
  return undoErrors[error.message] ?? "Geri alamadım. İlgili kayıt silinmiş olabilir ya da internet yok.";
}

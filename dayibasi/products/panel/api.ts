// Yönetim paneli veri katmanı: veritabanı fonksiyonları (admin_*) ve hesap fonksiyonu (admin-users).
import { supabase } from "@/core/supabase/client";

export type Col = { name: string; type: string; nullable: boolean; has_default: boolean };
export type Row = Record<string, unknown>;
export type User = { id: string; email: string; created_at: string; last_sign_in_at: string | null; is_admin: boolean; businesses: { id: string; name: string; product: string; role: string }[] };
export type Member = { user_id: string; email: string; display_name: string | null; role: string; created_at: string };

const msg = (e: { message?: string } | null) => {
  const m = e?.message ?? "";
  if (m.includes("izin_yok")) return "Yetkin yok.";
  if (m.includes("violates foreign key")) return "Bu kayda bağlı başka kayıtlar var.";
  if (m.includes("violates check")) return "Değer kurala uymuyor (çok uzun ya da geçersiz).";
  if (m.includes("not-null")) return "Zorunlu alan boş.";
  if (m.includes("duplicate key")) return "Bu kayıt zaten var.";
  if (m.includes("invalid input syntax")) return "Bir alanın biçimi yanlış (sayı, tarih ya da kimlik).";
  return m || "Olmadı, tekrar dene.";
};
async function rpc<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase().rpc(fn, args);
  if (error) throw new Error(msg(error));
  return data as T;
}
export const isAdmin = () => rpc<boolean>("is_platform_admin");
export const columns = (table: string) => rpc<Col[]>("admin_columns", { p_table: table });
export const rows = (table: string, business?: string | null) => rpc<Row[]>("admin_rows", { p_table: table, p_business: business ?? null });
export const save = (table: string, row: Row) => rpc<Row>("admin_save", { p_table: table, p_row: row });
export const remove = (table: string, id: string) => rpc<string>("admin_delete", { p_table: table, p_id: id });
export const members = (business: string) => rpc<Member[]>("admin_members", { p_business: business });
export const setMember = (business: string, user: string, role: "sahip" | "calisan" | "cikar", name?: string) =>
  rpc<string>("admin_member_set", { p_business: business, p_user: user, p_role: role, p_name: name ?? null });
export const users = () => rpc<User[]>("admin_users");
export const setConfig = (key: string, value: unknown) => rpc<string>("admin_config_set", { p_key: key, p_value: value === undefined ? null : value });
export async function config(): Promise<Record<string, unknown>> {
  const { data, error } = await supabase().from("app_config").select("key, value");
  if (error) throw new Error(msg(error));
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
}

/** Hesap işlemleri (sunucudaki admin-users fonksiyonu; gizli anahtar orada). */
export async function account(body: Record<string, unknown>) {
  const { data, error } = await supabase().functions.invoke("admin-users", { body });
  if (error) {
    let m = "Olmadı.";
    try { const j = await (error as { context?: Response }).context?.json(); m = j?.error ?? m; } catch { /* yok */ }
    throw new Error(m);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export const userName = (email: string) => (email.endsWith("@kullanici.dayibasi.app") ? email.split("@")[0] : email);
export const when = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("tr-TR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }) : "—");

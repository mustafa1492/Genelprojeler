import { mutate, query } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";

// Masraflar (dayıbaşı + çiftçi defteri ortak). Veresiye: on_credit + vendor, ödenen kısım paid_amount.
export type Expense = {
  id: string; business_id: string; occurred_on: string; category: string; amount: number;
  note: string | null; vendor: string | null; paid_amount: number; on_credit: boolean;
  charge_to: string | null; place_id: string | null; photo_path: string | null;
  data: Record<string, unknown>; created_at?: string;
};
export type ExpenseInput = Omit<Expense, "id" | "business_id" | "created_at" | "paid_amount" | "data"> & { paid_amount?: number; data?: Record<string, unknown> };

const cols = "id, business_id, occurred_on, category, amount, note, vendor, paid_amount, on_credit, charge_to, place_id, photo_path, data, created_at";
const num = (e: Expense) => ({ ...e, amount: Number(e.amount), paid_amount: Number(e.paid_amount ?? 0) });

export async function listExpenses(businessId: string) {
  const rows = await query<Expense>("expenses", (r) => r.business_id === businessId,
    () => supabase().from("expenses").select(cols).eq("business_id", businessId));
  return rows.map(num).sort((a, b) => (b.occurred_on + (b.created_at ?? "")).localeCompare(a.occurred_on + (a.created_at ?? "")));
}

export async function addExpense(businessId: string, e: ExpenseInput) {
  const row: Expense = { id: crypto.randomUUID(), business_id: businessId, created_at: new Date().toISOString(), paid_amount: 0, data: {}, ...e } as Expense;
  await mutate({ kind: "insert", table: "expenses", values: row });
  return row;
}
export const updateExpense = (id: string, v: Partial<ExpenseInput>) => mutate({ kind: "update", table: "expenses", key: id, values: v });
export const deleteExpense = (id: string) => mutate({ kind: "delete", table: "expenses", key: id });
export const restoreExpense = (e: Expense) => mutate({ kind: "insert", table: "expenses", values: e });

/** Veresiyeden kalan borç. */
export const owed = (e: Expense) => (e.on_credit ? Math.max(0, e.amount - e.paid_amount) : 0);

/**
 * Bir yere (vendor) ödeme yap: en eski veresiyeden başlayarak kapatır.
 * Geri alma için eski paid_amount değerlerini döndürür.
 */
export async function payVendor(expenses: Expense[], vendor: string, amount: number) {
  const open = expenses.filter((e) => e.vendor === vendor && owed(e) > 0).sort((a, b) => a.occurred_on.localeCompare(b.occurred_on));
  const before: { id: string; paid_amount: number }[] = [];
  let left = amount;
  for (const e of open) {
    if (left <= 0) break;
    const pay = Math.min(left, owed(e));
    before.push({ id: e.id, paid_amount: e.paid_amount });
    await updateExpense(e.id, { paid_amount: e.paid_amount + pay });
    left -= pay;
  }
  return { before, rest: left };
}

// --- Fiş fotoğrafı (internet ister). Yol: <business_id>/<uuid>.jpg, gizli kova "receipts".
async function shrink(file: File, max = 1600): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((res) => c.toBlob((b) => res(b ?? file), "image/jpeg", 0.8));
  } catch { return file; }
}
export async function uploadReceipt(businessId: string, file: File) {
  const blob = await shrink(file);
  const path = `${businessId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase().storage.from("receipts").upload(path, blob, { contentType: "image/jpeg" });
  if (error) throw error;
  return path;
}
export async function receiptUrl(path: string) {
  const { data } = await supabase().storage.from("receipts").createSignedUrl(path, 600);
  return data?.signedUrl ?? null;
}

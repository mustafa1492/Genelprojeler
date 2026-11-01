"use client";
import { supabase } from "@/core/supabase/client";

/**
 * İnternetsiz çalışma: yerel ayna + giden kutusu.
 * - Her yazma önce telefondaki aynaya uygulanır, giden kutusuna girer, sonra gönderilmeye çalışılır.
 * - İnternet yoksa kutuda bekler; internet gelince sırayla gönderilir.
 * - Okumalar: kutu boşsa ve internet varsa sunucudan tazelenir, yoksa aynadan okunur.
 * Ürünlerden bağımsızdır; tablo adı ve satır anahtarı ile çalışır.
 */

type Row = Record<string, unknown>;
export type Op =
  | { kind: "insert"; table: string; values: Row }
  | { kind: "update"; table: string; key: string; values: Row }
  | { kind: "delete"; table: string; key: string }
  | { kind: "upsert"; table: string; values: Row; onConflict: string };
type Failed = { op: Op; reason: string; at: string };

const MIRROR = "ko:mirror", OUTBOX = "ko:outbox", FAILED = "ko:failed";

const read = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* dolu / kapalı */ } };

let mirror: Record<string, Record<string, Row>> = {};
let outbox: Op[] = [];
let failed: Failed[] = [];
let loaded = false;
const load = () => {
  if (loaded || typeof window === "undefined") return;
  mirror = read(MIRROR, {}); outbox = read(OUTBOX, []); failed = read(FAILED, []); loaded = true;
};
const save = () => { write(MIRROR, mirror); write(OUTBOX, outbox); write(FAILED, failed); notify(); };

// --- durum dinleyicileri (ekrandaki "bekleyen" şeridi için)
const listeners = new Set<() => void>();
export const subscribe = (f: () => void) => { listeners.add(f); return () => { listeners.delete(f); }; };
const notify = () => listeners.forEach((f) => f());
export const status = () => { load(); return { pending: outbox.length, failed: failed.length, failedItems: failed }; };
export const clearFailed = () => { failed = []; save(); };

/** Satır anahtarı: çoğu tabloda id, yoklamada kişi + tarih. */
export const keyOf = (table: string, r: Row) => (table === "rsvps" ? `${r.person_id}|${r.for_date}` : String(r.id));
const matchFromKey = (table: string, key: string) => {
  if (table === "rsvps") { const [person_id, for_date] = key.split("|"); return { person_id, for_date }; }
  return { id: key };
};

/** Ağ hatası mı (yeniden denenir) yoksa veri hatası mı (bırakılır)? */
export const isNetworkError = (e: { message?: string; code?: string } | null | undefined) =>
  !!e && (!e.code || e.code === "") && /fetch|network|load failed|timed? ?out/i.test(e.message ?? "");

function applyLocal(op: Op) {
  const t = (mirror[op.table] ??= {});
  if (op.kind === "insert" || op.kind === "upsert") { const k = keyOf(op.table, op.values); t[k] = { ...t[k], ...op.values }; }
  else if (op.kind === "update") { if (t[op.key]) t[op.key] = { ...t[op.key], ...op.values }; }
  else delete t[op.key];
}

async function send(op: Op) {
  const sb = supabase().from(op.table);
  if (op.kind === "insert") return (await sb.insert(op.values)).error;
  if (op.kind === "upsert") return (await sb.upsert(op.values, { onConflict: op.onConflict })).error;
  if (op.kind === "update") return (await sb.update(op.values).match(matchFromKey(op.table, op.key))).error;
  return (await sb.delete().match(matchFromKey(op.table, op.key))).error;
}

let flushing: Promise<void> | null = null;
/** Bekleyenleri sırayla gönder. İnternet yoksa ilkinde durur. */
export function flush(): Promise<void> {
  load();
  if (flushing) return flushing;
  flushing = (async () => {
    while (outbox.length) {
      if (typeof navigator !== "undefined" && navigator.onLine === false) break;
      const op = outbox[0];
      let err: { message?: string; code?: string } | null = null;
      try { err = await send(op); } catch (e) { err = { message: String(e), code: "" }; }
      if (err && isNetworkError(err)) break;
      outbox.shift();
      if (err) failed.push({ op, reason: err.message ?? "", at: new Date().toISOString() });
      save();
    }
  })().finally(() => { flushing = null; });
  return flushing;
}

/** Yaz: aynaya uygula, kutuya koy, göndermeyi dene. Hiçbir zaman ağ yüzünden hata atmaz. */
export async function mutate(op: Op) {
  load();
  applyLocal(op);
  outbox.push(op);
  save();
  await flush();
}

/**
 * Oku: `filter` ile aynadan süz. Kutu boşsa ve internet varsa önce sunucudan tazele
 * (`fetch` sunucu sorgusu, sonucu aynada bu süzgecin kapsadığı satırların yerine geçer).
 */
export async function query<T extends Row>(table: string, filter: (r: Row) => boolean, fetch: () => PromiseLike<{ data: T[] | null; error: unknown }>) {
  load();
  await flush();
  if (outbox.length === 0) {
    try {
      const { data, error } = await fetch();
      if (!error && data) {
        const t: Record<string, Row> = {};
        for (const [k, r] of Object.entries(mirror[table] ?? {})) if (!filter(r)) t[k] = r;
        for (const r of data) t[keyOf(table, r)] = r;
        mirror[table] = t;
        save();
      }
    } catch { /* internet yok: aynadan oku */ }
  }
  return Object.values(mirror[table] ?? {}).filter(filter) as T[];
}

export const getLocal = (table: string, key: string) => { load(); return mirror[table]?.[key]; };

/** Uygulama açılınca ve internet gelince bekleyenleri gönder. */
export function startSync() {
  if (typeof window === "undefined") return () => {};
  load();
  const go = () => { flush(); };
  window.addEventListener("online", go);
  const t = setInterval(go, 30000);
  go();
  return () => { window.removeEventListener("online", go); clearInterval(t); };
}

/** Çıkışta bu telefondaki kopyayı sil (paylaşılan telefon). Bekleyen varsa silmez. */
export function clearLocal() {
  load();
  if (outbox.length) return false;
  mirror = {}; failed = []; save();
  return true;
}

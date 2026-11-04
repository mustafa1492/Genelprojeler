"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { mutate, query } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";

/**
 * Kişiye özel görünüm ayarları (defter başına). İnternetsiz de çalışır: yerel aynadan okunur,
 * değişiklik giden kutusuyla gönderilir. Ürün kendi ayar şeklini ve varsayılanını verir.
 */
type Prefs = Record<string, unknown>;
type Ctx = { prefs: Prefs; set: (patch: Prefs) => void; replace: (p: Prefs) => void };
const PrefsCtx = createContext<Ctx>({ prefs: {}, set: () => {}, replace: () => {} });

const applyLarge = (on: boolean) => { if (typeof document !== "undefined") document.documentElement.classList.toggle("buyuk-yazi", on); };

export function PrefsProvider({ businessId, children }: { businessId: string; children: React.ReactNode }) {
  const [uid, setUid] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Prefs>({});
  useEffect(() => {
    let live = true;
    supabase().auth.getSession().then(async ({ data }) => {
      const id = data.session?.user.id; if (!id || !live) return;
      setUid(id);
      const rows = await query<{ user_id: string; business_id: string; prefs: Prefs }>("user_prefs",
        (r) => r.user_id === id && r.business_id === businessId,
        () => supabase().from("user_prefs").select("user_id,business_id,prefs").eq("user_id", id).eq("business_id", businessId));
      if (live && rows[0]?.prefs) setPrefs(rows[0].prefs);
    });
    return () => { live = false; };
  }, [businessId]);
  useEffect(() => { applyLarge(prefs.buyukYazi === true); }, [prefs.buyukYazi]);

  const save = useCallback((p: Prefs) => {
    setPrefs(p);
    if (uid) void mutate({ kind: "upsert", table: "user_prefs", onConflict: "user_id,business_id",
      values: { user_id: uid, business_id: businessId, prefs: p, updated_at: new Date().toISOString() } });
  }, [uid, businessId]);
  const ctx: Ctx = { prefs, set: (patch) => save({ ...prefs, ...patch }), replace: save };
  return <PrefsCtx.Provider value={ctx}>{children}</PrefsCtx.Provider>;
}

export const usePrefs = () => useContext(PrefsCtx);

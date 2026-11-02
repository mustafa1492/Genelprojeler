"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/core/supabase/client";

export type Member = { user_id: string; display_name: string | null; role: string; email: string };
const KEY = (b: string) => `ko:uyeler:${b}`;

/** İşletmenin üyeleri ve "kim girdi" adı. İnternetsizde son bilinen liste. */
export function useMembers(businessId: string) {
  const [members, setMembers] = useState<Member[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY(businessId)) ?? "[]"); } catch { return []; }
  });
  const [me, setMe] = useState<string | null>(null);
  const reload = () => {
    supabase().rpc("business_members", { p_business: businessId }).then(({ data }) => {
      if (data) { setMembers(data as Member[]); try { localStorage.setItem(KEY(businessId), JSON.stringify(data)); } catch { /* yok */ } }
    });
  };
  useEffect(() => {
    reload();
    supabase().auth.getSession().then(({ data }) => setMe(data.session?.user.id ?? null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);
  const nameOf = (id: string | null | undefined) => {
    if (!id) return me ? "Sen" : "";
    if (id === me) return "Sen";
    const m = members.find((x) => x.user_id === id);
    return m?.display_name || m?.email || "Aile";
  };
  return { members, me, nameOf, reload };
}

export async function setMyName(businessId: string, userId: string, name: string) {
  const { error } = await supabase().from("memberships").update({ display_name: name }).eq("business_id", businessId).eq("user_id", userId);
  if (error) throw error;
}
export async function createInvite(businessId: string) {
  const { data, error } = await supabase().rpc("create_invite", { p_business: businessId });
  if (error) throw error;
  return data as string;
}

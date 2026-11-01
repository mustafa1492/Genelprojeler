import { supabase } from "@/core/supabase/client";

/** İşletmenin kendi şablonu varsa o, yoksa ortak varsayılan. */
export async function getTemplate(businessId: string, key: string, fallback: string) {
  const { data } = await supabase().from("message_templates").select("business_id, body").eq("key", key);
  const own = data?.find((t) => t.business_id === businessId);
  return (own ?? data?.find((t) => t.business_id === null))?.body ?? fallback;
}

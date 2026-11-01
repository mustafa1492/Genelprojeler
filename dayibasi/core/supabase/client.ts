import { createBrowserClient } from "@supabase/ssr";

// Tarayıcı tarafı Supabase istemcisi (ürünlerden bağımsız).
export function supabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

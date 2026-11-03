import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Tarayıcı tarafı Supabase istemcisi (ürünlerden bağımsız). Tek örnek kullanılır.
let client: SupabaseClient | null = null;
let chain: Promise<unknown> = Promise.resolve();
async function tabLock<R>(_name: string, _timeout: number, fn: () => Promise<R>): Promise<R> {
  const run = chain.then(fn, fn);
  chain = run.catch(() => undefined);
  return run;
}
export function supabase() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      // iPhone Safari'de tarayıcı kilidi (navigator.locks) bazen bırakılmıyor, giriş "Bekle…"de kalıyordu.
      // Sekme içi basit kilit yeterli: aynı anda tek oturum yenilemesi.
      { auth: { lock: tabLock } },
    );
  }
  return client;
}

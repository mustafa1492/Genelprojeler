import Link from "next/link";
import { clearLocal, status } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";
import type { NavItem } from "@/core/ui";
import { config } from "./config";

const ic = (d: React.ReactNode) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);

export const navItems: NavItem[] = [
  { href: "/", label: config.screens.bugun, icon: ic(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2m-7.1-17.1 1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4" /></>) },
  { href: "/ekip", label: config.screens.ekip, icon: ic(<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>) },
  { href: "/arabalar", label: config.screens.arac, icon: ic(<><path d="M3 17V7a2 2 0 0 1 2-2h11l5 5v7" /><circle cx="7.5" cy="17.5" r="2" /><circle cx="17.5" cy="17.5" r="2" /><path d="M9.5 17.5h6" /></>) },
  { href: "/alacaklar", label: "Alacaklar", icon: ic(<><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /></>) },
];

/** Başlıktaki "Geçmiş" düğmesi. */
export const HistoryLink = () => (
  <Link href="/gecmis" className="ui-history">
    {ic(<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>)}
    Geçmiş
  </Link>
);

/** Çıkış: telefondaki kopyayı da siler. Gönderilmemiş kayıt varsa uyarır. */
export const SignOutLink = () => (
  <button type="button" className="ui-link" style={{ fontSize: 15, color: "var(--sessiz2)" }} onClick={async () => {
    if (status().pending > 0) { window.dispatchEvent(new Event("online")); return; }
    clearLocal(); await supabase().auth.signOut(); location.href = "/";
  }}>Çıkış yap</button>
);

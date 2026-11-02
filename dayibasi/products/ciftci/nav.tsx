import Link from "next/link";
import type { NavItem } from "@/core/ui";
import { BASE } from "./config";

const ic = (d: React.ReactNode) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);

export const navItems: NavItem[] = [
  { href: BASE, label: "Özet", icon: ic(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></>) },
  { href: `${BASE}/tarlalar`, label: "Tarlalar", icon: ic(<><path d="M3 20h18" /><path d="M5 20c0-6 3-9 7-11" /><path d="M12 9c4 2 7 5 7 11" /><path d="M12 3v6" /></>) },
  { href: `${BASE}/masraf`, label: "Masraf", icon: ic(<><path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 .7V2l-1 .7-3-2-3 2-3-2-3 2-3-2z" /><path d="M8 8h8M8 12h8M8 16h5" /></>) },
  { href: `${BASE}/gelir`, label: "Gelir", icon: ic(<><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 12h.01M18 12h.01" /></>) },
  { href: `${BASE}/depo`, label: "Depo", icon: ic(<><path d="M3 9 12 4l9 5v11H3z" /><path d="M7 20v-7h10v7" /><path d="M7 16h10" /></>) },
];

export const HistoryLink = () => (
  <Link href={`${BASE}/gecmis`} className="ui-history">
    {ic(<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>)}
    Geçmiş
  </Link>
);

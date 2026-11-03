import { useBusiness } from "@/core/auth/AuthGate";
// Yetki: ekran başına 0 yok, 1 görür, 2 değiştirir (veritabanındaki my_perms). Asıl koruma veritabanında (RLS).
export function useRole() {
  const b = useBusiness();
  const role = b.role ?? "sahip";
  const lvl = (scr: string) => (b.perms ? (b.perms[scr] ?? 0) : role === "calisan" ? (["tarlalar", "takvim", "depo", "fis"].includes(scr) ? 2 : scr === "belgeler" || scr === "uyeler" ? 1 : 0) : 2);
  const money = lvl("masraf") >= 1;
  return { role, money, worker: !money, lvl, sees: (s: string) => lvl(s) >= 1, writes: (s: string) => lvl(s) >= 2 };
}

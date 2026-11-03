import { useBusiness } from "@/core/auth/AuthGate";
// Çalışan modu: rol "calisan" ise para (masraf, gelir, kâr, borç, rapor) görünmez. Asıl koruma veritabanında (RLS).
export function useRole() {
  const b = useBusiness();
  const role = b.role ?? "sahip";
  return { role, money: role !== "calisan", worker: role === "calisan" };
}

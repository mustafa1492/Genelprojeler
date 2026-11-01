// Doğum tarihi yardımcıları (aynı adlı kişileri ayırmak ve yaşı görmek için).
export function ageOf(dogum?: string | null) {
  if (!dogum) return null;
  const b = new Date(dogum + "T12:00:00"), t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
  return a;
}
export const birthText = (dogum?: string | null) =>
  dogum ? new Date(dogum + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : "";
/** Listede adın yanına: "1985" */
export const birthYear = (dogum?: string | null) => (dogum ? dogum.slice(0, 4) : "");

type Named = { id: string; full_name: string; custom?: Record<string, string> };
/** Aynı adlı başka biri varsa adın yanına doğum yılını ekler: "Ayşe Kaya (1985)". */
export function displayName(p: Named, all: Named[], short = false) {
  const base = short ? p.full_name.split(" ")[0] : p.full_name;
  const twin = all.some((o) => o.id !== p.id && (short ? o.full_name.split(" ")[0] : o.full_name) === base);
  const y = p.custom?.dogum?.slice(0, 4);
  return twin && y ? `${base} (${y})` : base;
}

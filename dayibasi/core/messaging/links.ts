// Telefon ve WhatsApp bağlantıları (ücretsiz wa.me yöntemi).

/** 0532 111 22 33 / 532... / +90532... → 905321112233 */
export function intlPhone(phone: string, country = "90") {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith(country) && d.length > 10) return d;
  if (d.startsWith("0")) d = d.slice(1);
  return country + d;
}

export const telLink = (phone: string) => `tel:+${intlPhone(phone)}`;
export const waLink = (phone: string, text?: string) =>
  `https://wa.me/${intlPhone(phone)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

/** "Merhaba {ad}" + {ad: "Ayşe"} → "Merhaba Ayşe" */
export const fillTemplate = (body: string, vars: Record<string, string | number>) =>
  body.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));

/** 05321112233 → 0532 111 22 33 (okunaklı gösterim) */
export function prettyPhone(phone: string) {
  const d = intlPhone(phone).slice(2);
  return d.length === 10 ? `0${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8)}` : phone;
}

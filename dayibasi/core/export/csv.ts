// Excel'in açtığı CSV: Türkçe Excel için ";" ayırıcı ve UTF-8 BOM (ğ, ş, ı düzgün görünsün).
type Cell = string | number | null | undefined;

const esc = (v: Cell) => {
  if (v == null) return "";
  if (typeof v === "number") return String(v).replace(".", ","); // Türkçe ondalık
  const s = String(v);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** "2026-10-12" → "12.10.2026" (Excel Türkçe tarih) */
export const trDate = (d?: string | null) => (d ? `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)}` : "");

export function toCsv(rows: Cell[][]) {
  return "﻿" + rows.map((r) => r.map(esc).join(";")).join("\r\n");
}

/** Dosyayı telefona / bilgisayara indirir (iPhone'da Paylaş menüsü açılır). */
export function downloadCsv(filename: string, rows: Cell[][]) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

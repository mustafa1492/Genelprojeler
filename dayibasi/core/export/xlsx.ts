// Gerçek Excel (.xlsx). Kütüphane yalnız indirirken yüklenir (sayfa ağırlaşmasın).
type Cell = string | number | null | undefined;
export type Sheet = { name: string; rows: Cell[][]; widths?: number[] };

export async function downloadXlsx(filename: string, sheets: Sheet[]) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(s.rows.map((r) => r.map((c) => (c == null ? "" : c))));
    const w = s.widths ?? s.rows[0]?.map((_, i) => Math.min(40, Math.max(8, ...s.rows.map((r) => String(r[i] ?? "").length + 2))));
    if (w) ws["!cols"] = w.map((wch) => ({ wch }));
    XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31));
  }
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

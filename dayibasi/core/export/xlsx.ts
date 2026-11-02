// Güzel Excel (.xlsx): renkli başlık, sabit başlık satırı, para biçimi, kalın toplamlar, otomatik sütun genişliği.
// Kütüphane yalnız indirirken yüklenir (uygulama ağırlaşmasın).
type Cell = string | number | null | undefined;
export type Sheet = { name: string; rows: Cell[][]; title?: string; widths?: number[] };

const GREEN = "FF2E6A2B", LIGHT = "FFE1EFDA", BORDER = "FFCFD8CD";
const isMoneyHeader = (h: Cell) => typeof h === "string" && /\(TL\)|Tutar|Toplam|TL$/i.test(h);
const isTotalRow = (r: Cell[]) => typeof r[0] === "string" && /^(Toplam|Net|Kâr|Fark|Genel toplam)/i.test(r[0]);

export async function downloadXlsx(filename: string, sheets: Sheet[]) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Defter"; wb.created = new Date();

  for (const sh of sheets) {
    const ws = wb.addWorksheet(sh.name.slice(0, 31), { views: [{ state: "frozen", ySplit: sh.title ? 2 : 1 }] });
    let headerRowNo = 1;
    if (sh.title) {
      const t = ws.addRow([sh.title]);
      t.font = { bold: true, size: 14, color: { argb: GREEN } };
      t.height = 24;
      headerRowNo = 2;
    }
    const header = sh.rows[0] ?? [];
    const money = header.map(isMoneyHeader);
    sh.rows.forEach((r, i) => {
      const row = ws.addRow(r.map((c) => (c == null ? "" : c)));
      if (i === 0) {
        row.eachCell((c) => {
          c.font = { bold: true, color: { argb: "FFFFFFFF" } };
          c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN } };
          c.alignment = { vertical: "middle", wrapText: true };
        });
        row.height = 22;
        return;
      }
      // Başlık benzeri ara satırlar (ör. "Tür | Toplam") ve boş satırlar
      const sub = r.length > 1 && r.every((c) => typeof c === "string" && c !== "") && !money.some((m, j) => m && typeof r[j] === "number");
      row.eachCell((c, col) => {
        const v = r[col - 1];
        if (typeof v === "number" && (money[col - 1] || isTotalRow(r) || (r.length === 2 && col === 2))) c.numFmt = '#,##0.00 "TL"';
        else if (typeof v === "number") c.numFmt = "#,##0.##";
        c.border = { bottom: { style: "thin", color: { argb: BORDER } } };
      });
      if (isTotalRow(r)) row.eachCell((c) => { c.font = { bold: true }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } }; c.border = { top: { style: "thin", color: { argb: GREEN } } }; });
      else if (sub && i > 0) row.eachCell((c) => { c.font = { bold: true, color: { argb: GREEN } }; });
      else if (i % 2 === 0) row.eachCell((c) => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF6F9F5" } }; });
    });
    // Sütun genişlikleri
    const n = Math.max(...sh.rows.map((r) => r.length), 1);
    for (let j = 0; j < n; j++) {
      const w = sh.widths?.[j] ?? Math.min(45, Math.max(10, ...sh.rows.map((r) => String(r[j] ?? "").length + (typeof r[j] === "number" ? 6 : 2))));
      ws.getColumn(j + 1).width = w;
    }
    if (sh.rows.length > 2 && header.length > 1) ws.autoFilter = { from: { row: headerRowNo, column: 1 }, to: { row: headerRowNo, column: header.length } };
    ws.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9 };
  }

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

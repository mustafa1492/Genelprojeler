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

// ===================================================================================
// Tablo kitabı: her sayfa gerçek bir Excel tablosu (süzme, sıralama, şeritli satır, Toplam satırı).
// Tarihler gerçek tarih, paralar sayı (biçimli), döviz karşılıkları formül: TL'yi değiştirince güncellenir.
// ===================================================================================
export type ColType = "text" | "date" | "tl" | "usd" | "eur" | "kur" | "num" | "pct";
export type Col = { h: string; t?: ColType; w?: number; sum?: boolean };
/** Hücre: değer ya da formül ({ f: "=D5/E5", v: önbellek sonucu }). Formülde {r} o satırın numarasıdır, {C:Başlık} o başlığın sütun harfi. */
export type XCell = string | number | Date | null | undefined | { f: string; v?: number | string | null };
export type TableSheet = { name: string; title?: string; info?: string[]; cols: Col[]; rows: XCell[][]; totals?: boolean; tableName?: string };
/** Serbest sayfa (Özet gibi): satır satır, istenen hücre biçimiyle. */
export type FreeSheet = { name: string; free: true; widths?: number[]; rows: { cells: XCell[]; style?: "title" | "info" | "head" | "total" | "section"; fmt?: (ColType | undefined)[] }[] };

const FMT: Record<ColType, string | undefined> = {
  text: undefined, date: "dd.mm.yyyy", tl: '#,##0.00 "₺"', usd: '"$"#,##0.00', eur: '#,##0.00 "€"', kur: "0.0000", num: "#,##0.##", pct: "0%",
};
const colLetter = (n: number) => { let s = ""; for (n += 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s; return s; };
/** "2026-03-05" → Excel tarihi (yerel öğlen, saat dilimi kaymasın). */
export const xDate = (iso?: string | null): Date | null => (iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10), 12)) : null);
const asciiName = (s: string) => "T_" + s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i").replace(/[^A-Za-z0-9]/g, "_");

export async function downloadBook(filename: string, sheets: (TableSheet | FreeSheet)[], meta?: { title?: string }) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Çiftçi Defteri"; wb.created = new Date(); if (meta?.title) wb.title = meta.title;
  const used = new Set<string>();

  for (const sh of sheets) {
    const ws = wb.addWorksheet(sh.name.slice(0, 31), { properties: { tabColor: { argb: GREEN } } });
    ws.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } };
    ws.headerFooter = { oddFooter: `&L${sh.name}&RSayfa &P / &N` };

    if ("free" in sh) {
      sh.rows.forEach((r) => {
        const row = ws.addRow(r.cells.map((c) => cellValue(c)));
        row.eachCell({ includeEmpty: false }, (c, col) => {
          const t = r.fmt?.[col - 1]; if (t && FMT[t]) c.numFmt = FMT[t]!;
          if (r.style === "title") { c.font = { bold: true, size: 16, color: { argb: GREEN } }; }
          else if (r.style === "info") { c.font = { italic: true, color: { argb: "FF59665D" } }; }
          else if (r.style === "section") { c.font = { bold: true, size: 12, color: { argb: GREEN } }; }
          else if (r.style === "head") { c.font = { bold: true, color: { argb: "FFFFFFFF" } }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN } }; c.alignment = { vertical: "middle", wrapText: true }; }
          else if (r.style === "total") { c.font = { bold: true }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } }; c.border = { top: { style: "thin", color: { argb: GREEN } } }; }
          else c.border = { bottom: { style: "thin", color: { argb: BORDER } } };
        });
        if (r.style === "title") row.height = 26;
        if (r.style === "head") row.height = 22;
      });
      (sh.widths ?? []).forEach((w, i) => { ws.getColumn(i + 1).width = w; });
      continue;
    }

    // Başlık ve açıklama satırları
    let r0 = 1;
    if (sh.title) { const t = ws.addRow([sh.title]); t.font = { bold: true, size: 14, color: { argb: GREEN } }; t.height = 24; r0++; }
    for (const line of sh.info ?? []) { const t = ws.addRow([line]); t.font = { italic: true, color: { argb: "FF59665D" } }; r0++; }
    if (r0 > 1) { ws.addRow([]); r0++; }
    const head = r0;                       // tablo başlık satırı
    const letters = Object.fromEntries(sh.cols.map((c, i) => [c.h, colLetter(i)]));
    const fill = (f: string, rowNo: number) => f.replace(/\{r\}/g, String(rowNo)).replace(/\{C:([^}]+)\}/g, (_, h) => letters[h] ?? "A");
    const rows = sh.rows.map((r, i) => sh.cols.map((_, j) => {
      const v = r[j];
      if (v && typeof v === "object" && !(v instanceof Date)) return { formula: fill(v.f, head + 1 + i).replace(/^=/, ""), result: v.v ?? undefined };
      return v == null ? null : v;
    }));
    ws.views = [{ state: "frozen", ySplit: head, xSplit: 0 }];

    if (rows.length) {
      let name = sh.tableName ?? asciiName(sh.name); while (used.has(name)) name += "_"; used.add(name);
      const sums = sh.cols.map((c) => c.sum ?? (c.t === "tl" || c.t === "usd" || c.t === "eur"));
      // Toplamın önbellek sonucu: formülü hesaplamayan önizlemelerde (telefon, WhatsApp) de görünsün
      const colSum = (j: number) => sh.rows.reduce((t, r) => { const v = r[j]; const n = typeof v === "number" ? v : v && typeof v === "object" && !(v instanceof Date) && typeof v.v === "number" ? v.v : 0; return t + n; }, 0);
      ws.addTable({
        name, ref: `A${head}`, headerRow: true, totalsRow: sh.totals !== false,
        style: { theme: "TableStyleMedium7", showRowStripes: true },
        columns: sh.cols.map((c, j) => ({ name: c.h, filterButton: true,
          ...(j === 0 ? { totalsRowLabel: "Toplam" } : sums[j] ? { totalsRowFunction: "sum" as const, totalsRowResult: colSum(j) } : {}) })),
        rows: rows as never,
      });
    } else {
      const hr = ws.addRow(sh.cols.map((c) => c.h));
      hr.eachCell((c) => { c.font = { bold: true, color: { argb: "FFFFFFFF" } }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN } }; });
      ws.addRow(["(kayıt yok)"]).font = { italic: true, color: { argb: "FF59665D" } };
    }
    // Biçimler ve genişlikler
    const last = head + rows.length + (rows.length && sh.totals !== false ? 1 : 0);
    sh.cols.forEach((c, j) => {
      const col = ws.getColumn(j + 1);
      const f = c.t ? FMT[c.t] : undefined;
      for (let r = head + 1; r <= last; r++) { const cell = ws.getCell(r, j + 1); if (f) cell.numFmt = f; cell.alignment = c.t === "text" ? { wrapText: true, vertical: "middle" } : { vertical: "middle" }; }
      const longest = Math.max(c.h.length + 4, ...sh.rows.slice(0, 500).map((r) => { const v = r[j]; return v instanceof Date ? 11 : v && typeof v === "object" ? 14 : String(v ?? "").length + (typeof v === "number" ? 6 : 2); }));
      col.width = c.w ?? Math.min(c.t === "text" ? 42 : 20, Math.max(c.t === "date" ? 12 : 9, longest));
    });
    ws.getRow(head).height = 22;
    ws.getRow(head).alignment = { vertical: "middle", wrapText: true };
    // Renkler hücrelere de yazılır: tablo biçimini tanımayan programlarda (LibreOffice, bazı telefon uygulamaları) da aynı görünsün
    if (rows.length) {
      const n = sh.cols.length;
      for (let j = 1; j <= n; j++) {
        const h = ws.getCell(head, j);
        h.font = { bold: true, color: { argb: "FFFFFFFF" } }; h.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREEN } };
        for (let r = head + 1; r <= head + rows.length; r++) {
          const c = ws.getCell(r, j);
          if ((r - head) % 2 === 0) c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F6EE" } };
          c.border = { bottom: { style: "hair", color: { argb: BORDER } } };
        }
        if (sh.totals !== false) {
          const t = ws.getCell(last, j);
          t.font = { bold: true }; t.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } }; t.border = { top: { style: "thin", color: { argb: GREEN } } };
        }
      }
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function cellValue(c: XCell) {
  if (c && typeof c === "object" && !(c instanceof Date)) return { formula: c.f.replace(/^=/, ""), result: c.v ?? undefined };
  return c == null ? null : c;
}

/** Tablo sayfasında başlık satırının numarası (formüllerde başka sayfaya başvurmak için). */
export const headRowOf = (sh: Pick<TableSheet, "title" | "info">) => { const n = (sh.title ? 1 : 0) + (sh.info?.length ?? 0); return n ? n + 2 : 1; };
/** Başka sayfadaki bir sütunun veri aralığı: 'Masraflar'!$F$5:$F$40 */
export const rangeOf = (sh: TableSheet, header: string) => {
  const j = sh.cols.findIndex((c) => c.h === header); const L = colLetter(Math.max(0, j)); const h = headRowOf(sh);
  return `'${sh.name.slice(0, 31)}'!$${L}$${h + 1}:$${L}$${h + Math.max(1, sh.rows.length)}`;
};

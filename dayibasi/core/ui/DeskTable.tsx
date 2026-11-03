"use client";
// Bilgisayarda (geniş ekran) liste yerine tablo. Telefonda gizli (CSS: .only-desk).
export type DeskCol<T> = { label: string; cell: (r: T) => React.ReactNode; num?: boolean; width?: string };
export function DeskTable<T>({ rows, cols, onRow, rowKey, empty }: { rows: T[]; cols: DeskCol<T>[]; onRow?: (r: T) => void; rowKey: (r: T) => string; empty?: string }) {
  return (
    <div className="masa only-desk">
      <table>
        <thead><tr>{cols.map((c) => <th key={c.label} className={c.num ? "num" : ""} style={c.width ? { width: c.width } : undefined}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => <tr key={rowKey(r)} onClick={onRow ? () => onRow(r) : undefined} className={onRow ? "tik" : ""}>{cols.map((c) => <td key={c.label} className={c.num ? "num" : ""}>{c.cell(r)}</td>)}</tr>)}
          {!rows.length && <tr><td colSpan={cols.length} className="bos">{empty ?? "Kayıt yok."}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
export const Tag = ({ tone, children }: { tone: "yesil" | "sari" | "kirmizi" | "gri"; children: React.ReactNode }) => <span className={`etiket ${tone}`}>{children}</span>;

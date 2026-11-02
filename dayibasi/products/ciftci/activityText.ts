import type { Activity } from "@/core/activity/api";
import { formatTL } from "@/core/ledger/api";

// Çiftçi defteri geçmiş cümleleri.
type Row = Record<string, unknown>;
const s = (v: unknown) => (v == null ? "" : String(v));
const verb = (a: Activity) => (a.action === "insert" ? "eklendi" : a.action === "delete" ? "silindi" : "değişti");

export function describe(a: Activity, names: Record<string, string>): string {
  const d = (a.new_data ?? a.old_data ?? {}) as Row;
  const o = (a.old_data ?? {}) as Row;
  const data = (d.data ?? {}) as Row;
  const place = names[s(d.place_id)] || "";
  switch (a.table_name) {
    case "expenses":
      if (a.action === "update" && Number(o.paid_amount) !== Number(d.paid_amount)) return `Veresiye ödendi: ${s(d.vendor)}, ${formatTL(Number(d.paid_amount) - Number(o.paid_amount))}`;
      return `Masraf ${verb(a)}: ${s(d.category)} ${formatTL(Number(d.amount))}${place ? ` (${place})` : ""}`;
    case "events":
      if (d.kind === "gelir") return `Gelir ${verb(a)}: ${s(data.type)} ${formatTL(Number(d.quantity))}`;
      if (d.kind === "verim") return `Verim ${verb(a)}: ${place} ${s(data.year)}, ${Number(d.quantity).toLocaleString("tr-TR")} ${s(data.unit)}`;
      return `${place || "Tarla"}: ${s(data.type)}${data.product ? ` (${s(data.product)})` : ""} ${verb(a)}`;
    case "places": return `Tarla ${verb(a)}: ${s(d.name)}`;
    case "dues":
      if (a.action === "update" && Number(o.paid_amount) !== Number(d.paid_amount)) return `${d.direction === "borc" ? "Ödeme" : "Tahsilat"}: ${s(d.party)}, ${formatTL(Number(d.paid_amount) - Number(o.paid_amount))}`;
      return `${d.direction === "borc" ? "Borç" : "Alacak"} ${verb(a)}: ${s(d.party)} ${formatTL(Number(d.amount))}`;
    case "inventory_items":
      if (a.action === "update" && Number(o.quantity) !== Number(d.quantity)) return `Depo: ${s(d.name)} ${Number(o.quantity).toLocaleString("tr-TR")} → ${Number(d.quantity).toLocaleString("tr-TR")} ${s(d.unit)}`;
      return `Depo ${verb(a)}: ${s(d.name)}`;
    case "documents": return `Belge ${verb(a)}: ${s(d.title)}`;
    default: return "Bir değişiklik yapıldı";
  }
}

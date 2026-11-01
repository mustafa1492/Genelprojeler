import type { Activity } from "@/core/activity/api";
import { formatTL } from "@/core/ledger/api";
import { config } from "./config";

// Geçmiş satırlarını dayıbaşının anlayacağı cümleye çevirir.
type Row = Record<string, unknown>;
const s = (v: unknown) => (v == null ? "" : String(v));

const fieldNames: Record<string, string> = {
  full_name: "adı", phone: "telefonu", tags: "işleri", custom: "bilgileri", notes: "notu",
  amount: "tutarı", label: "plakası", capacity: "kişi sayısı", expires_on: "bitiş tarihi", title: "adı", quantity: "kişi sayısı",
};

export function describe(a: Activity, names: Record<string, string>): string {
  const d = (a.new_data ?? a.old_data ?? {}) as Row;
  const o = (a.old_data ?? {}) as Row;
  const who = names[s(d.person_id)] || "Bir kişi";

  switch (a.table_name) {
    case "people": {
      const name = s(d.full_name);
      const kind = (config.people.kinds as Record<string, { label: string }>)[s(d.kind)]?.label.toLocaleLowerCase("tr") ?? "kişi";
      if (a.action === "insert") return `${name} eklendi (${kind})`;
      if (a.action === "delete") return `${name} silindi`;
      if (o.active === true && d.active === false) return `${name} ekipten çıkarıldı`;
      if (o.active === false && d.active === true) return `${name} ekibe geri alındı`;
      const changed = Object.keys(d).filter((k) => JSON.stringify(d[k]) !== JSON.stringify(o[k]) && fieldNames[k]).map((k) => fieldNames[k]);
      if (o.full_name !== d.full_name) return `${s(o.full_name)} → ${name} olarak değişti`;
      return `${name}: ${changed.join(", ") || "bilgileri"} değişti`;
    }
    case "ledger_entries": {
      const what = d.kind === "avans" ? "avans" : d.kind === "odeme" ? "ödeme" : "alacak";
      const amount = formatTL(Number(d.amount));
      if (a.action === "insert") return `${who}: ${amount} ${what} yazıldı`;
      if (a.action === "delete") return `${who}: ${amount} ${what} silindi`;
      return `${who}: ${what} ${formatTL(Number(o.amount))} → ${amount} oldu`;
    }
    case "rsvps": {
      const ans = (v: unknown) => (v === "evet" ? "Geliyor" : v === "hayir" ? "Gelmiyor" : "Bekleniyor");
      if (a.action === "delete") return `${who}: yoklama cevabı silindi`;
      return `${who}: yarın “${ans(d.answer)}” işaretlendi`;
    }
    case "assets": return `${s(d.label)} arabası ${a.action === "insert" ? "eklendi" : a.action === "delete" ? "silindi" : "değişti"}`;
    case "documents": return `${s(d.title)} kâğıdı ${a.action === "insert" ? "eklendi" : a.action === "delete" ? "silindi" : "değişti"}`;
    case "places": return `${s(d.name)} tarlası ${a.action === "insert" ? "eklendi" : a.action === "delete" ? "silindi" : "değişti"}`;
    case "events": return `Bugünün kaydı ${a.action === "insert" ? "eklendi" : a.action === "delete" ? "silindi" : "değişti"}`;
    default: return "Bir değişiklik yapıldı";
  }
}

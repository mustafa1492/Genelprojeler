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
      // (çiftçide "ödeme" = alınan, işçide = verilen; cümle ikisinde de doğru okunur)
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
    case "events": {
      const day = new Date(s(d.occurred_on) + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
      return `${who === "Bir kişi" ? "Tarla" : who}: ${day}, ${s(d.quantity)} kişi kaydı ${a.action === "insert" ? "eklendi" : a.action === "delete" ? "silindi" : "değişti"}`;
    }
    case "expenses": {
      const what = `${s(d.category)} ${formatTL(Number(d.amount))}`;
      if (a.action === "insert") return `Masraf: ${what}${d.on_credit ? ` (veresiye: ${s(d.vendor)})` : ""}`;
      if (a.action === "delete") return `Masraf silindi: ${what}`;
      if (Number(o.paid_amount) !== Number(d.paid_amount)) return `Veresiye ödendi: ${s(d.vendor)}, ${formatTL(Number(d.paid_amount) - Number(o.paid_amount))}`;
      return `Masraf değişti: ${what}`;
    }
    case "lists": {
      if (a.action === "insert") return `“${s(d.name)}” listesi açıldı`;
      if (a.action === "delete") return `“${s(d.name)}” listesi silindi`;
      const om = (o.members as string[] | undefined) ?? [], nm = (d.members as string[] | undefined) ?? [];
      const added = nm.filter((x) => !om.includes(x)), removed = om.filter((x) => !nm.includes(x));
      if (added.length === 1 && !removed.length) return `${names[added[0]] ?? "Bir kişi"} “${s(d.name)}” listesine eklendi`;
      if (removed.length === 1 && !added.length) return `${names[removed[0]] ?? "Bir kişi"} “${s(d.name)}” listesinden çıktı`;
      if (o.name !== d.name) return `Liste adı “${s(o.name)}” → “${s(d.name)}”`;
      return `“${s(d.name)}” listesi değişti`;
    }
    default: return "Bir değişiklik yapıldı";
  }
}

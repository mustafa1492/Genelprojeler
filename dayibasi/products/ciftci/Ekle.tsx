"use client";
import { useGo } from "@/core/shell/TabShell";
import { useRole } from "./rol";

/** Alt çubuktaki "＋ Ekle": her ekrandan tek dokunuşla yeni kayıt. Sadece kişinin yazabildikleri çıkar. */
const ISLER: { id: string; label: string; alt: string; emoji: string; to: string; params?: Record<string, number>; perm: string }[] = [
  { id: "masraf", label: "Masraf", alt: "Ne için harcadın?", emoji: "🧾", to: "masraf", params: { yeni: 1 }, perm: "masraf" },
  { id: "gelir", label: "Gelir", alt: "Satış, destek", emoji: "💰", to: "gelir", params: { yeni: 1 }, perm: "gelir" },
  { id: "tarla", label: "Tarla işi", alt: "İlaç, gübre, sulama", emoji: "🌾", to: "tarlalar", perm: "tarlalar" },
  { id: "fis", label: "Fiş fotoğrafı", alt: "Sonra işlenir", emoji: "📷", to: "fis", perm: "fis" },
  { id: "hatirlat", label: "Hatırlatma", alt: "Takvime not", emoji: "🔔", to: "takvim", params: { yeni: 1 }, perm: "takvim" },
  { id: "fidan", label: "Fidan", alt: "Sayım, satış", emoji: "🌱", to: "fidan", perm: "fidan" },
];

export function EkleSayfasi({ tabs, close }: { tabs: { id: string }[]; close: () => void }) {
  const go = useGo();
  const { lvl } = useRole();
  const list = ISLER.filter((x) => tabs.some((t) => t.id === x.to) && lvl(x.perm) >= 2);
  if (list.length === 0) return <p className="ui-note">Bu defterde kayıt ekleme yetkin yok.</p>;
  return (
    <div className="ui-ekle">
      {list.map((x) => (
        <button key={x.id} type="button" onClick={() => { close(); go(x.to, x.params); }}>
          <em aria-hidden="true">{x.emoji}</em>{x.label}<small>{x.alt}</small>
        </button>
      ))}
    </div>
  );
}

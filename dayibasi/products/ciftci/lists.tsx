"use client";
import { useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { ListEditor, resolveList } from "@/core/settings/lists";
import { useGo, useTabParams, useBack } from "@/core/shell/TabShell";
import { useEffect } from "react";
import { BackButton, PageHeader } from "@/core/ui";
import { config } from "./config";
import { hasFidan } from "./fidan";
import { useAppConfig } from "@/core/appConfig";

// Çiftçi defterinin düzenlenebilir listeleri (anahtar → başlık + hazır maddeler).
export const LISTS = {
  expense: { title: "Masraf türleri", defaults: config.expenses.categories },
  operations: { title: "Tarla işleri", defaults: config.operations },
  income: { title: "Gelir türleri", defaults: config.incomeKinds },
  units: { title: "Ölçü birimleri (verim, satış)", defaults: config.units },
  inv_categories: { title: "Depo türleri", defaults: config.inventory.categories },
  inv_units: { title: "Depo birimleri", defaults: config.inventory.units },
  due_kinds: { title: "Borç / alacak türleri", defaults: config.dueKinds },
  documents: { title: "Belge önerileri", defaults: config.documents },
  bakim: { title: "Fidan bakım türleri", defaults: ["Budama", "Güve kontrolü", "İlaçlama", "Gübreleme", "Sulama", "Yaprak hastalığı kontrolü", "Diğer"], fidan: true },
  sources: { title: "Fidan kaynakları", defaults: ["Çelik", "Fide", "Tohum", "Hazır fidan"], fidan: true },
  makineler: { title: "Makineler (traktör, pulluk…)", defaults: [] as string[] },
  makine_isleri: { title: "Makine bakım işleri", defaults: ["Yağ değişimi", "Yağ filtresi", "Hava filtresi", "Mazot filtresi", "Gres yağlama", "Lastik", "Tamir", "Diğer"] },
  isler: { title: "İşler (fidan, buğday…)", defaults: [] as string[] },
  fire: { title: "Fire (kayıp) sebepleri", defaults: ["Kuraklık", "Güve", "Kök çürüklüğü", "Don", "Hastalık", "Bilinmiyor"], fidan: true },
} as const;
export type ListKey = keyof typeof LISTS;

/** Etkin liste (hazırlar − kaldırılanlar + eklenenler). Masraf türlerinde eski "expense_categories" de dahil. */
/** İşler listesi: fidan modülü açıksa "Fidan" hazır gelir. */
const defaultsOf = (key: ListKey, fidan: boolean): readonly string[] => (key === "isler" ? (fidan ? ["Fidan"] : []) : LISTS[key].defaults);

export function useCList(key: ListKey) {
  const biz = useBusiness();
  const cfg = useAppConfig();
  if (key === "isler") return resolveList(biz, key, defaultsOf(key, hasFidan(biz)));
  const legacy = key === "expense" && Array.isArray(biz.settings?.expense_categories) ? (biz.settings!.expense_categories as string[]) : [];
  // Yönetim panelinde "hazır liste" değiştirildiyse onu kullan
  const over = cfg[`liste:${key}`];
  return resolveList(biz, key, Array.isArray(over) && over.length ? (over as string[]) : LISTS[key].defaults, legacy);
}

/** Bir listenin "Düzenle" ekranını açar. */
export function EditListScreen({ k, onDone }: { k: ListKey; onDone: () => void }) {
  const biz = useBusiness();
  const legacy = k === "expense" && Array.isArray(biz.settings?.expense_categories) ? (biz.settings!.expense_categories as string[]) : [];
  const over = useAppConfig()[`liste:${k}`];
  return <ListEditor title={LISTS[k].title} listKey={k} defaults={k !== "isler" && Array.isArray(over) && over.length ? (over as string[]) : defaultsOf(k, hasFidan(biz))} legacyAdded={legacy} legacyKey={k === "expense" ? "expense_categories" : undefined} onDone={onDone} />;
}

/** Bütün listeler tek yerde. */
export default function Listeler() {
  const biz = useBusiness();
  const go = useGo();
  const back = useBack();
  const [k, setK] = useState<ListKey | null>(null);
  const [from, setFrom] = useState<string | null>(null);
  const tp = useTabParams();
  useEffect(() => { if (tp.p.liste) { setK(String(tp.p.liste) as ListKey); setFrom(tp.p.geri ? String(tp.p.geri) : "masraf"); } }, [tp.n]); // eslint-disable-line react-hooks/exhaustive-deps
  if (k) return <EditListScreen k={k} onDone={() => { setK(null); if (from) { setFrom(null); back(from); } }} />;
  const keys = (Object.keys(LISTS) as ListKey[]).filter((x) => !("fidan" in LISTS[x]) || hasFidan(biz));
  return (
    <main className="ui-stack">
      <BackButton onClick={() => back()} label="Geri" />
      <PageHeader sub="Kullanmadığını kaldır, ihtiyacın olanı ekle" title="Listeleri düzenle" />
      <div className="ui-links">
        {keys.map((x) => {
          const n = resolveList(biz, x, defaultsOf(x, hasFidan(biz))).length;
          return <a key={x} href="#" onClick={(e) => { e.preventDefault(); setK(x); }}><b>{LISTS[x].title}</b><span>{n} seçenek</span></a>;
        })}
      </div>
    </main>
  );
}

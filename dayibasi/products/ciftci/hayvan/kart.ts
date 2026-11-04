import type { Business } from "@/core/auth/AuthGate";
import { mutate, query } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";
import { addDays, dayText } from "../kayit";

// Hayvan kartı (küpe no ile tek tek hayvan) ve olaylar. Göç: 0019_hayvan_kart.sql.
export type Kind = "inek" | "koyun" | "keci";
export type Animal = {
  id: string; business_id: string; species: "kucukbas" | "buyukbas"; kind: Kind; barn_id: string | null; tag: string | null; name: string | null;
  sex: "disi" | "erkek"; breed: string | null; born_on: string | null; mother_id: string | null; status: "var" | "satildi" | "oldu"; left_on: string | null;
  note: string | null; data: Record<string, unknown>; created_at?: string;
};
export type EvType = "dogum" | "kizgin" | "tohum" | "gebe" | "bos" | "kuru" | "ilac" | "asi" | "tartim" | "satis" | "olum" | "not";
export type AnimalEvent = { id: string; business_id: string; animal_id: string; day: string; type: EvType; data: Record<string, unknown>; note: string | null; created_at?: string };

const A = "id, business_id, species, kind, barn_id, tag, name, sex, breed, born_on, mother_id, status, left_on, note, data, created_at";
const E = "id, business_id, animal_id, day, type, data, note, created_at";

export const listAnimals = async (b: string) => (await query<Animal>("animals", (r) => r.business_id === b, () => supabase().from("animals").select(A).eq("business_id", b)));
export const listAnimalEvents = async (b: string) => (await query<AnimalEvent>("animal_events", (r) => r.business_id === b, () => supabase().from("animal_events").select(E).eq("business_id", b)))
  .sort((x, y) => (y.day + (y.created_at ?? "")).localeCompare(x.day + (x.created_at ?? "")));

const ins = async <T>(table: string, b: string, v: Record<string, unknown>) => {
  const row = { id: crypto.randomUUID(), business_id: b, created_at: new Date().toISOString(), ...v };
  await mutate({ kind: "insert", table, values: row });
  return row as T;
};
export const addAnimal = (b: string, v: Omit<Animal, "id" | "business_id" | "created_at">) => ins<Animal>("animals", b, v);
export const updateAnimal = (id: string, v: Record<string, unknown>) => mutate({ kind: "update", table: "animals", key: id, values: v });
export const deleteAnimal = (id: string) => mutate({ kind: "delete", table: "animals", key: id });
export const restoreAnimal = (a: Animal) => mutate({ kind: "insert", table: "animals", values: a });
export const addAnimalEvent = (b: string, v: Omit<AnimalEvent, "id" | "business_id" | "created_at">) => ins<AnimalEvent>("animal_events", b, v);
export const deleteAnimalEvent = (id: string) => mutate({ kind: "delete", table: "animal_events", key: id });
export const restoreAnimalEvent = (e: AnimalEvent) => mutate({ kind: "insert", table: "animal_events", values: e });

export const KINDS: Record<Kind, { label: string; male: string; young: string; species: "kucukbas" | "buyukbas" }> = {
  inek: { label: "İnek", male: "Boğa", young: "buzağı", species: "buyukbas" },
  koyun: { label: "Koyun", male: "Koç", young: "kuzu", species: "kucukbas" },
  keci: { label: "Keçi", male: "Teke", young: "oğlak", species: "kucukbas" },
};
export const kindsOf = (s: "kucukbas" | "buyukbas") => (Object.keys(KINDS) as Kind[]).filter((k) => KINDS[k].species === s);

export const EV_LABEL: Record<EvType, string> = {
  dogum: "Doğurdu", kizgin: "Kızgın", tohum: "Tohumlandı / katıldı", gebe: "Gebe çıktı", bos: "Boş çıktı", kuru: "Kuruya ayrıldı",
  ilac: "İlaç", asi: "Aşı", tartim: "Tartım", satis: "Satıldı", olum: "Öldü", not: "Not",
};
export const REPRO: EvType[] = ["dogum", "kizgin", "tohum", "gebe", "bos", "kuru"];

/**
 * Varsayılan süreler (gün). VETERİNERE SORULACAK (hayvancilik-sorular.md); kullanıcı "Süreler" ekranından değiştirir (settings.hayvan_sureler).
 * gebelik: tohumdan doğuma · dongu: kızgınlık aralığı · kontrol: tohumdan gebelik kontrolüne · kuruya: doğumdan kaç gün önce · dogumSonrasi: doğumdan tohuma en erken.
 */
export type Sure = { gebelik: number; dongu: number; kontrol: number; kuruya: number | null; dogumSonrasi: number | null };
export const SURE_VARSAYILAN: Record<Kind, Sure> = {
  inek: { gebelik: 280, dongu: 21, kontrol: 35, kuruya: 60, dogumSonrasi: 45 },
  koyun: { gebelik: 150, dongu: 17, kontrol: 35, kuruya: null, dogumSonrasi: null },
  keci: { gebelik: 150, dongu: 21, kontrol: 35, kuruya: null, dogumSonrasi: null },
};
export const SURE_ADI: Record<keyof Sure, string> = {
  gebelik: "Gebelik süresi", dongu: "Kızgınlık aralığı", kontrol: "Tohumdan kaç gün sonra gebelik kontrolü", kuruya: "Doğumdan kaç gün önce kuruya", dogumSonrasi: "Doğumdan kaç gün sonra tohumlanabilir",
};
export const sureOf = (b: Business, k: Kind): Sure => ({ ...SURE_VARSAYILAN[k], ...((b.settings?.hayvan_sureler as Record<string, Partial<Sure>> | undefined)?.[k] ?? {}) });

export const animalLabel = (a: Animal) => [a.tag, a.name].filter(Boolean).join(" · ") || "Küpesiz";

export type Hatirlatma = { day: string; text: string };
export type Durum = { line: string; reminders: Hatirlatma[]; milkUntil: string | null; meatUntil: string | null; drug: string | null; lastKg: number | null };

/** Bir hayvanın durumu: üreme, arınma, yaklaşan işler. evs: bu hayvanın olayları (yeniden eskiye). */
export function durum(a: Animal, evs: AnimalEvent[], s: Sure, today: string): Durum {
  const asc = evs.slice().sort((x, y) => (x.day + (x.created_at ?? "")).localeCompare(y.day + (y.created_at ?? "")));
  const last = (t: EvType, after = "") => [...asc].reverse().find((e) => e.type === t && e.day >= after) ?? null;
  const rem: Hatirlatma[] = [];
  let line = "";
  // Arınma: ilacın süt / et bekleme süresi
  let milkUntil: string | null = null, meatUntil: string | null = null, drug: string | null = null;
  for (const e of asc.filter((x) => x.type === "ilac")) {
    const m = Number(e.data.milk_days) > 0 ? addDays(e.day, Number(e.data.milk_days)) : null;
    const t = Number(e.data.meat_days) > 0 ? addDays(e.day, Number(e.data.meat_days)) : null;
    if (m && m > today && (!milkUntil || m > milkUntil)) { milkUntil = m; drug = String(e.data.drug ?? "ilaç"); }
    if (t && t > today && (!meatUntil || t > meatUntil)) { meatUntil = t; drug = drug ?? String(e.data.drug ?? "ilaç"); }
  }
  for (const e of asc.filter((x) => x.type === "asi" && x.data.next_on)) {
    const nextAsi = asc.some((y) => y.type === "asi" && y.day > e.day && y.data.vaccine === e.data.vaccine);
    if (!nextAsi) rem.push({ day: String(e.data.next_on), text: `${String(e.data.vaccine ?? "Aşı")} aşısı zamanı` });
  }
  const lastKg = Number([...asc].reverse().find((e) => e.type === "tartim")?.data.kg) || null;
  if (a.status !== "var" || a.sex !== "disi") return { line, reminders: a.status === "var" ? rem : [], milkUntil, meatUntil, drug, lastKg };

  const birth = last("dogum");
  const service = last("tohum", birth?.day ?? "");
  if (service) {
    const bos = last("bos", service.day), gebe = last("gebe", service.day);
    const due = addDays(service.day, s.gebelik);
    if (bos) { line = `Boş çıktı (${dayText(bos.day)})`; rem.push({ day: addDays(service.day, s.dongu * Math.max(1, Math.ceil((Date.parse(today) - Date.parse(service.day)) / 86400000 / s.dongu))), text: "Kızgınlık bekleniyor" }); }
    else {
      line = `${gebe ? "Gebe" : "Tohumlandı"} · doğum ${dayText(due)}`;
      if (!gebe) {
        const k = addDays(service.day, s.dongu);
        if (k >= addDays(today, -3)) rem.push({ day: k, text: "Kızgınlık kontrolü (tutmadıysa kızgına gelir)" });
        rem.push({ day: addDays(service.day, s.kontrol), text: "Gebelik kontrolü" });
      }
      if (s.kuruya && !last("kuru", service.day)) rem.push({ day: addDays(due, -s.kuruya), text: "Kuruya ayır" });
      rem.push({ day: due, text: "Doğum bekleniyor" });
    }
  } else if (birth) {
    line = `Son doğum ${dayText(birth.day)}`;
    if (s.dogumSonrasi) rem.push({ day: addDays(birth.day, s.dogumSonrasi), text: "Tohumlamaya uygun (kızgınlığı takip et)" });
  }
  return { line, reminders: rem, milkUntil, meatUntil, drug, lastKg };
}

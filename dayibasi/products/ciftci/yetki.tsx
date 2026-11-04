"use client";
// Yetkiler: ekran listesi, hazır roller ve üye yetki düzenleyici (uygulamada Aile sayfası ve yönetim panelinde ortak).
import { useState } from "react";

export const SCREENS: { key: string; label: string; hint: string }[] = [
  { key: "tarlalar", label: "Tarlalar ve tarla işleri", hint: "tarla bilgileri, ilaçlama, sulama, verim" },
  { key: "masraf", label: "Masraflar", hint: "masraf tutarları, veresiye" },
  { key: "gelir", label: "Gelirler", hint: "satışlar, alacaklar" },
  { key: "fidan", label: "Fidan", hint: "partiler, sayım, sipariş, maliyet" },
  { key: "kumes", label: "Kümes", hint: "kümes, sürü, günlük ölü ve yem" },
  { key: "depo", label: "Depo", hint: "gübre, ilaç, tohum stoku" },
  { key: "takvim", label: "Takvim ve hatırlatmalar", hint: "" },
  { key: "rapor", label: "Sezon raporu ve kâr", hint: "kâr / zarar, PDF, Excel" },
  { key: "vadeler", label: "Borç ve vadeler", hint: "kredi, bayi, çek…" },
  { key: "belgeler", label: "Belgeler", hint: "ÇKS, sigorta, kira…" },
  { key: "kayitlar", label: "Bütün kayıtlar listesi", hint: "" },
  { key: "fis", label: "Fiş yükleme", hint: "fotoğraf gönderir, sahibi onaylar" },
  { key: "gecmis", label: "İşlem geçmişi", hint: "kim ne yaptı, geri alma" },
  { key: "ayarlar", label: "Listeler ve sezonlar", hint: "masraf türleri, sezon tarihleri" },
  { key: "uyeler", label: "Üyeler ve davet", hint: "kimin neyi göreceğini değiştirme" },
];
export type Level = "yok" | "gor" | "yaz";
export type Perms = { preset?: "yonetici" | "aile" | "calisan" | "ozel"; ekran?: Record<string, Level> };
export const PRESETS: { key: NonNullable<Perms["preset"]>; label: string; hint: string }[] = [
  { key: "yonetici", label: "Yönetici", hint: "her şeyi görür ve değiştirir, üyeleri yönetir" },
  { key: "aile", label: "Aile", hint: "her şeyi görür ve değiştirir, üyeleri yönetemez" },
  { key: "calisan", label: "Çalışan", hint: "tarla işi, depo, takvim, fiş; para göremez" },
  { key: "ozel", label: "Özel", hint: "ekran ekran sen seçersin" },
];
const CALISAN: Record<string, Level> = { tarlalar: "yaz", takvim: "yaz", depo: "yaz", fis: "yaz", belgeler: "gor", uyeler: "gor" };
/** Hazır rolün ekran izinleri (Özel'e geçerken başlangıç olarak). Veritabanındaki perm_level ile aynı. */
export function presetLevels(p: Perms["preset"]): Record<string, Level> {
  if (p === "yonetici") return Object.fromEntries(SCREENS.map((s) => [s.key, "yaz"]));
  if (p === "aile") return Object.fromEntries(SCREENS.map((s) => [s.key, s.key === "uyeler" ? "gor" : "yaz"]));
  if (p === "calisan") return Object.fromEntries(SCREENS.map((s) => [s.key, CALISAN[s.key] ?? "yok"]));
  return {};
}
export const presetOf = (perms: Perms | null | undefined, role: string) => perms?.preset ?? (role === "calisan" ? "calisan" : "yonetici");
export const presetLabel = (p: string) => PRESETS.find((x) => x.key === p)?.label ?? p;

/** Üye yetkisi düzenleyici: hazır rol seç ya da "Özel" ile ekran ekran Yok / Görür / Değiştirir. */
export function PermEditor({ value, role, onSave, busy }: { value: Perms | null | undefined; role: string; onSave: (p: Perms) => Promise<void> | void; busy?: boolean }) {
  const [preset, setPreset] = useState<NonNullable<Perms["preset"]>>(presetOf(value, role));
  const [ekran, setEkran] = useState<Record<string, Level>>(() => (value?.preset === "ozel" ? { ...(value.ekran ?? {}) } : presetLevels(presetOf(value, role))));
  const changed = preset !== presetOf(value, role) || (preset === "ozel" && JSON.stringify(ekran) !== JSON.stringify(value?.ekran ?? {}));
  return (
    <div className="yetki">
      <div className="yetki-roller">
        {PRESETS.map((p) => (
          <button key={p.key} type="button" className={preset === p.key ? "on" : ""} onClick={() => { setPreset(p.key); if (p.key !== "ozel") setEkran(presetLevels(p.key)); }}>
            <b>{p.label}</b><small>{p.hint}</small>
          </button>
        ))}
      </div>
      <table className="yetki-tablo">
        <thead><tr><th>Ekran</th><th>Yok</th><th>Görür</th><th>Değiştirir</th></tr></thead>
        <tbody>{SCREENS.map((s) => {
          const v = (preset === "ozel" ? ekran[s.key] : presetLevels(preset)[s.key]) ?? "yok";
          return (
            <tr key={s.key}>
              <td><b>{s.label}</b>{s.hint && <small>{s.hint}</small>}</td>
              {(["yok", "gor", "yaz"] as Level[]).map((l) => (
                <td key={l}><input type="radio" name={`y_${s.key}`} aria-label={`${s.label}: ${l}`} checked={v === l} disabled={preset !== "ozel"}
                  onChange={() => setEkran({ ...ekran, [s.key]: l })} /></td>
              ))}
            </tr>
          );
        })}</tbody>
      </table>
      {preset !== "ozel" && <small className="yetki-not">Tek tek seçmek için “Özel”e geç.</small>}
      <button type="button" className="yetki-kaydet" disabled={!changed || busy} onClick={() => onSave({ preset, ekran: preset === "ozel" ? ekran : {} })}>{busy ? "Bekle…" : "Yetkiyi kaydet"}</button>
    </div>
  );
}

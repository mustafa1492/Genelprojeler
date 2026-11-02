"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useBusiness, useSetBusiness } from "@/core/auth/AuthGate";
import { supabase } from "@/core/supabase/client";
import { Chip } from "@/core/ui";
import { thisYear, todayStr } from "./kayit";

// Sezonlar: kullanıcı kendi açar (ör. "2025-26 Zeytin", 1 Eylül 2025 – 31 Ağustos 2026). businesses.settings.seasons
export type Season = { id: string; name: string; start: string; end: string };

/** Hiç sezon yoksa geçici: takvim yılı. */
const fallback = (): Season[] => { const y = thisYear(); return [{ id: `yil-${y}`, name: y, start: `${y}-01-01`, end: `${y}-12-31` }]; };
export const inSeason = (d: string, s: Season) => d >= s.start && d <= s.end;

type Ctx = { seasons: Season[]; real: boolean; selected: Season; select: (id: string) => void; save: (list: Season[]) => Promise<void> };
const SeasonCtx = createContext<Ctx | null>(null);
const KEY = (b: string) => `ko:sezon:${b}`;

export function SeasonProvider({ children }: { children: React.ReactNode }) {
  const biz = useBusiness();
  const setBiz = useSetBusiness();
  const stored = (Array.isArray(biz.settings?.seasons) ? biz.settings!.seasons : []) as Season[];
  const seasons = (stored.length ? stored : fallback()).slice().sort((a, b) => b.start.localeCompare(a.start));
  const current = seasons.find((s) => inSeason(todayStr(), s)) ?? seasons[0];
  const [sel, setSel] = useState<string>(current.id);
  useEffect(() => { try { const v = localStorage.getItem(KEY(biz.id)); if (v && seasons.some((s) => s.id === v)) setSel(v); } catch { /* yok */ } }, [biz.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const select = (id: string) => { setSel(id); try { localStorage.setItem(KEY(biz.id), id); } catch { /* yok */ } };
  const save = async (list: Season[]) => {
    const settings = { ...biz.settings, seasons: list };
    const { error } = await supabase().from("businesses").update({ settings }).eq("id", biz.id);
    if (error) throw error;
    setBiz({ ...biz, settings });
  };
  const selected = seasons.find((s) => s.id === sel) ?? current;
  return <SeasonCtx.Provider value={{ seasons, real: stored.length > 0, selected, select, save }}>{children}</SeasonCtx.Provider>;
}

export const useSeason = () => useContext(SeasonCtx)!;

/** Sezon seçici (bütün sekmelerde ortak seçim). */
export function SeasonPicker({ onManage }: { onManage?: () => void }) {
  const { seasons, selected, select, real } = useSeason();
  return (
    <div className="ui-chips" role="group" aria-label="Sezon seç">
      {seasons.map((s) => <Chip key={s.id} selected={s.id === selected.id} onClick={() => select(s.id)}>{s.name}</Chip>)}
      {onManage && <Chip onClick={onManage}>{real ? "Sezonlar…" : "+ Sezon aç"}</Chip>}
    </div>
  );
}

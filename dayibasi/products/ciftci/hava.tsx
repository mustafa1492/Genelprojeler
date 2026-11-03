"use client";
// Hava durumu (Open-Meteo, ücretsiz, anahtarsız). Tarlanın köyü/ilçesi bir kez aranıp koordinatı kaydedilir.
import { useEffect, useState } from "react";

export type Spot = { name: string; lat: number; lon: number; area: string };
type Day = { date: string; code: number; max: number; min: number; rain: number; prob: number; wind: number };

export async function searchPlace(q: string): Promise<Spot[]> {
  const u = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.trim())}&count=8&language=tr&countryCode=TR`;
  const r = await fetch(u); if (!r.ok) throw new Error("ara");
  const j = (await r.json()) as { results?: { name: string; latitude: number; longitude: number; admin1?: string; admin2?: string }[] };
  return (j.results ?? []).map((x) => ({ name: x.name, lat: x.latitude, lon: x.longitude, area: [x.admin2?.replace(/ İlçesi$/, ""), x.admin1].filter((a) => a && a !== x.name).join(", ") }));
}

async function forecast(lat: number, lon: number): Promise<Day[]> {
  const key = `ko:hava:${lat.toFixed(2)},${lon.toFixed(2)}`;
  try { const c = JSON.parse(localStorage.getItem(key) ?? "null"); if (c && Date.now() - c.at < 3600_000) return c.days; } catch { /* yok */ }
  const u = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=Europe%2FIstanbul&forecast_days=5`;
  const r = await fetch(u); if (!r.ok) throw new Error("hava");
  const d = (await r.json()).daily;
  const days: Day[] = d.time.map((t: string, i: number) => ({ date: t, code: d.weather_code[i], max: Math.round(d.temperature_2m_max[i]), min: Math.round(d.temperature_2m_min[i]),
    rain: d.precipitation_sum[i] ?? 0, prob: d.precipitation_probability_max[i] ?? 0, wind: Math.round(d.wind_speed_10m_max[i] ?? 0) }));
  try { localStorage.setItem(key, JSON.stringify({ at: Date.now(), days })); } catch { /* yok */ }
  return days;
}

const icon = (c: number) => (c === 0 ? "☀️" : c <= 2 ? "🌤️" : c === 3 ? "☁️" : c <= 48 ? "🌫️" : c <= 67 ? "🌧️" : c <= 77 ? "❄️" : c <= 82 ? "🌦️" : c <= 86 ? "🌨️" : "⛈️");
const dayName = (d: string, i: number) => (i === 0 ? "Bugün" : i === 1 ? "Yarın" : new Date(d + "T12:00:00").toLocaleDateString("tr-TR", { weekday: "short" }));

/** Genel uyarılar (tarım önerisi değil, hava bilgisinden): don, yağmur, rüzgâr. */
function warnings(days: Day[]) {
  const w: string[] = [];
  const frost = days.slice(0, 3).find((d) => d.min <= 0);
  if (frost) w.push(`Don riski: ${dayName(frost.date, days.indexOf(frost))} en düşük ${frost.min}°C.`);
  const rain = days.slice(0, 2).find((d) => d.prob >= 60 || d.rain >= 5);
  if (rain) w.push(`${dayName(rain.date, days.indexOf(rain))} yağmur bekleniyor (%${rain.prob}, ${rain.rain.toLocaleString("tr-TR")} mm). İlaçlama ve gübre için hesaba kat.`);
  const wind = days.slice(0, 2).find((d) => d.wind >= 30);
  if (wind) w.push(`${dayName(wind.date, days.indexOf(wind))} rüzgârlı (${wind.wind} km/sa). İlaçlamada ilaç savrulabilir.`);
  return w;
}

export function Weather({ lat, lon, title }: { lat: number; lon: number; title: string }) {
  const [days, setDays] = useState<Day[] | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => { let on = true; forecast(lat, lon).then((d) => on && setDays(d)).catch(() => on && setErr(true)); return () => { on = false; }; }, [lat, lon]);
  if (err) return <div className="ui-card"><span className="ui-note" style={{ margin: 0 }}>{title}: hava durumu alınamadı (internet lazım).</span></div>;
  if (!days) return <div className="ui-card"><span className="ui-note" style={{ margin: 0 }}>{title}: hava durumu yükleniyor…</span></div>;
  const w = warnings(days);
  return (
    <div className="ui-card ui-stack hava" style={{ gap: 8 }}>
      <b>Hava · {title}</b>
      <div className="hava-gunler">
        {days.map((d, i) => (
          <div key={d.date}><span>{dayName(d.date, i)}</span><em aria-hidden="true">{icon(d.code)}</em><b>{d.max}°</b><small>{d.min}°</small>{d.prob >= 30 && <small>☂ %{d.prob}</small>}</div>
        ))}
      </div>
      {w.map((x, i) => <span key={i} className="hava-uyari">{x}</span>)}
    </div>
  );
}

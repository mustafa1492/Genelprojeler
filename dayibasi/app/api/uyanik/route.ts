// Veritabanı uyumasın: Supabase ücretsiz planda 7 gün istek gelmezse projeyi duraklatır.
// Vercel zamanlayıcısı (vercel.json → crons) bu adresi her gün bir kez çağırır; adres veritabanından tek satır okur.
// Elle denemek için: /api/uyanik → { ok: true } dönmeli. Gizli bilgi kullanmaz (herkese açık anahtar, herkese açık tablo).
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const at = new Date().toISOString();
  if (!url || !key) return NextResponse.json({ ok: false, at, hata: "ayar_yok" }, { status: 500 });
  try {
    const r = await fetch(`${url}/rest/v1/app_config?select=key&limit=1`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" });
    return NextResponse.json({ ok: r.ok, at, durum: r.status }, { status: r.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, at, hata: "ulasilamadi" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

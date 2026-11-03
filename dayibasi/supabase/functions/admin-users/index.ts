// Yönetim paneli: hesap aç, şifre değiştir, e-posta/kullanıcı adı değiştir, sil, yönetici yap.
// Sadece platform yöneticisi çağırabilir. Gizli anahtar (service role) yalnız burada, sunucuda.
const URL_ = Deno.env.get("SUPABASE_URL")!;
const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ORIGINS = ["https://genelprojeler.vercel.app"];
const cors = (o: string | null) => ({
  "Access-Control-Allow-Origin": o && (ORIGINS.includes(o) || /^https:\/\/genelprojeler-[a-z0-9-]+\.vercel\.app$/.test(o) || o.startsWith("http://localhost")) ? o : ORIGINS[0],
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});
const svc = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };
const DOMAIN = "kullanici.dayibasi.app";
const ascii = (x: string) => x.trim().toLocaleLowerCase("tr").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u").replace(/\s+/g, "");
const toEmail = (x: string) => { const v = x.trim().toLocaleLowerCase("tr"); return v.includes("@") ? v : `${ascii(v)}@${DOMAIN}`; };

Deno.serve(async (req) => {
  const h = { ...cors(req.headers.get("origin")), "Content-Type": "application/json" };
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  const out = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: h });
  try {
    // Çağıran kim, yönetici mi?
    const token = (req.headers.get("authorization") ?? "").replace(/^Bearer /, "");
    const me = await fetch(`${URL_}/auth/v1/user`, { headers: { apikey: KEY, Authorization: `Bearer ${token}` } });
    if (!me.ok) return out({ error: "giris_yok" }, 401);
    const uid = (await me.json()).id as string;
    const adm = await fetch(`${URL_}/rest/v1/platform_admins?user_id=eq.${uid}&select=user_id`, { headers: svc });
    if (!adm.ok || !(await adm.json()).length) return out({ error: "izin_yok" }, 403);

    const b = await req.json();
    const a = String(b.action ?? "");
    const pw = (p: unknown) => typeof p === "string" && p.length >= 8 && p.length <= 72;
    const auth = (path: string, method: string, body?: unknown) => fetch(`${URL_}/auth/v1/admin/${path}`, { method, headers: svc, body: body ? JSON.stringify(body) : undefined });

    if (a === "create") {
      if (!b.username || !pw(b.password)) return out({ error: "Kullanıcı adı ve en az 8 karakter şifre gerekli." }, 400);
      const r = await auth("users", "POST", { email: toEmail(String(b.username)), password: b.password, email_confirm: true });
      const j = await r.json();
      if (!r.ok) return out({ error: j.msg ?? j.message ?? "Açılamadı (bu ad kullanılıyor olabilir)." }, 400);
      if (b.business_id) {
        await fetch(`${URL_}/rest/v1/memberships`, { method: "POST", headers: { ...svc, Prefer: "resolution=merge-duplicates" },
          body: JSON.stringify({ business_id: b.business_id, user_id: j.id, role: b.role === "calisan" ? "calisan" : "sahip", display_name: b.name || null }) });
      }
      return out({ id: j.id, email: j.email });
    }
    if (!b.user_id || !/^[0-9a-f-]{36}$/.test(String(b.user_id))) return out({ error: "hesap_yok" }, 400);
    if (a === "password") {
      if (!pw(b.password)) return out({ error: "Şifre en az 8 karakter olmalı." }, 400);
      const r = await auth(`users/${b.user_id}`, "PUT", { password: b.password });
      return r.ok ? out({ ok: true }) : out({ error: "Değiştirilemedi." }, 400);
    }
    if (a === "email") {
      const r = await auth(`users/${b.user_id}`, "PUT", { email: toEmail(String(b.username ?? "")), email_confirm: true });
      return r.ok ? out({ ok: true }) : out({ error: "Değiştirilemedi (bu ad kullanılıyor olabilir)." }, 400);
    }
    if (a === "ban") {
      const r = await auth(`users/${b.user_id}`, "PUT", { ban_duration: b.on ? "876000h" : "none" });
      return r.ok ? out({ ok: true }) : out({ error: "Değiştirilemedi." }, 400);
    }
    if (a === "delete") {
      if (b.user_id === uid) return out({ error: "Kendi hesabını silemezsin." }, 400);
      const r = await auth(`users/${b.user_id}`, "DELETE");
      return r.ok ? out({ ok: true }) : out({ error: "Silinemedi (hesabın kayıtları olabilir; önce engelle)." }, 400);
    }
    if (a === "admin") {
      if (b.user_id === uid && !b.on) return out({ error: "Kendi yöneticiliğini kaldıramazsın." }, 400);
      const r = b.on
        ? await fetch(`${URL_}/rest/v1/platform_admins`, { method: "POST", headers: { ...svc, Prefer: "resolution=ignore-duplicates" }, body: JSON.stringify({ user_id: b.user_id }) })
        : await fetch(`${URL_}/rest/v1/platform_admins?user_id=eq.${b.user_id}`, { method: "DELETE", headers: svc });
      return r.ok ? out({ ok: true }) : out({ error: "Değiştirilemedi." }, 400);
    }
    return out({ error: "bilinmeyen" }, 400);
  } catch (e) {
    return out({ error: "hata", detail: String(e).slice(0, 200) }, 500);
  }
});

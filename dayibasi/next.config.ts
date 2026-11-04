import type { NextConfig } from "next";

// Güvenlik başlıkları: başka sitenin bizi çerçeve içinde açması, dışarıdan script yüklenmesi,
// verinin başka adrese gönderilmesi engellenir. Bağlanılan tek dış adres Supabase.
const sb = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${sb}`,
  "font-src 'self' data:",
  `connect-src 'self' ${sb} ${sb.replace("https://", "wss://")} https://api.open-meteo.com https://geocoding-api.open-meteo.com https://cbsapi.tkgm.gov.tr`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const config: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "Content-Security-Policy", value: csp },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=(self)" },
      ],
    }];
  },
};
export default config;

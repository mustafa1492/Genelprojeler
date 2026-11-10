// İnternetsiz açılış: sayfalar ve uygulama dosyaları telefonda saklanır.
// Veriler (Supabase) burada saklanmaz; onları core/offline yönetir.
const CACHE = "dayibasi-v2";
const PAGES = ["/", "/ciftci", "/ekip", "/arabalar", "/alacaklar", "/gecmis", "/kvkk", "/sifre"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PAGES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;

  // Değişmeyen dosyalar (adlarında sürüm var): önce telefondan
  if (url.pathname.startsWith("/_next/static/") || /\.(png|svg|ico|woff2?)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res;
    })));
    return;
  }

  // Sayfalar: önce internetten (en yeni sürüm), olmazsa telefondan
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match(req, { ignoreSearch: true }))
      .then((hit) => hit || caches.match(url.pathname)).then((hit) => hit || caches.match("/"))),
  );
});

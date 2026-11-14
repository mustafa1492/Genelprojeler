"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/**
 * Sekmeli kabuk: ziyaret edilen her sekme açık kalır (yalnız görünürlüğü değişir),
 * böylece sekme değiştirince yarım kalan form ve kaydırma yeri kaybolmaz.
 * Alt menü her ekranda görünür. Etkin sekmeye tekrar dokununca o sekme başa döner.
 */
/** side: bilgisayarda yan menüde ikinci grupta görünür (telefonda gizli). */
export type ShellTab = { id: string; label: string; /** alt çubukta görünen kısa ad */ short?: string; icon?: React.ReactNode; path: string; inNav: boolean; side?: boolean; group?: string; emoji?: string; readOnly?: boolean; render: () => React.ReactNode };
type Params = Record<string, string | number | boolean>;
type Ctx = { active: string; go: (id: string, params?: Params) => void; back: (fallback?: string) => void; params: (id: string) => { p: Params; n: number } };

const ShellCtx = createContext<Ctx>({ active: "", go: () => {}, back: () => {}, params: () => ({ p: {}, n: 0 }) });
const TabIdCtx = createContext<string>("");

/**
 * navIds: telefonda alt çubukta görünecek sekmeler (sırayla); yoksa inNav olanlar.
 * menu: verilirse alt çubuğun sağında "Menü" tuşu çıkar, alttan açılan bir sayfa gösterir.
 * add: verilirse alt çubuğun ortasında "＋ Ekle" tuşu çıkar (her ekrandan tek dokunuşla yeni kayıt); bilgisayarda yan menünün başında.
 */
export function TabShell({ tabs, initial, initialParams, brand, navIds, menu, add }: { tabs: ShellTab[]; initial: string; initialParams?: Params; brand?: React.ReactNode; navIds?: string[]; menu?: (close: () => void) => React.ReactNode; add?: (close: () => void) => React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [active, setActive] = useState(initial);
  const [visited, setVisited] = useState<string[]>([initial]);
  const [resets, setResets] = useState<Record<string, number>>({});
  const [params, setParams] = useState<Record<string, { p: Params; n: number }>>({ [initial]: { p: initialParams ?? {}, n: 1 } });
  const scrolls = useRef<Record<string, number>>({});

  // Gezinti geçmişi: "Geri" bir önceki ekrana döner (Ayarlar → Aile → Geri = Ayarlar)
  const hist = useRef<string[]>([]);
  const go = useCallback((id: string, p?: Params, isBack?: boolean) => {
    const t = tabs.find((x) => x.id === id);
    if (!t) return;
    setMenuOpen(false); setAddOpen(false);
    if (!isBack && id !== active) { hist.current.push(active); if (hist.current.length > 40) hist.current.shift(); }
    scrolls.current[active] = window.scrollY;
    if (p) setParams((s) => ({ ...s, [id]: { p, n: (s[id]?.n ?? 0) + 1 } }));
    setVisited((v) => (v.includes(id) ? v : [...v, id]));
    setActive(id);
    try { history.replaceState(null, "", t.path); } catch { /* yok */ }
    requestAnimationFrame(() => window.scrollTo(0, p ? 0 : scrolls.current[id] ?? 0));
  }, [tabs, active]);

  const back = useCallback((fallback = "ozet") => {
    let prev: string | undefined;
    do { prev = hist.current.pop(); } while (prev !== undefined && (prev === active || !tabs.some((x) => x.id === prev)));
    const to = prev ?? fallback;
    if (to !== active) go(to, undefined, true);
  }, [tabs, active, go]);

  const navTap = (id: string) => {
    if (id === active) { setResets((r) => ({ ...r, [id]: (r[id] ?? 0) + 1 })); scrolls.current[id] = 0; window.scrollTo(0, 0); }
    else go(id);
  };

  // Klavye açılınca (görünen alan küçülünce) alt menüyü ve sabit düğmeyi gizle
  useEffect(() => {
    const vv = window.visualViewport; if (!vv) return;
    const f = () => document.documentElement.classList.toggle("klavye", window.innerHeight - vv.height > 150);
    vv.addEventListener("resize", f); f();
    return () => { vv.removeEventListener("resize", f); document.documentElement.classList.remove("klavye"); };
  }, []);
  useEffect(() => {
    const onPop = () => { const t = tabs.find((x) => x.path === location.pathname); if (t) setActive(t.id); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [tabs]);

  const ctx: Ctx = { active, go: (id, p) => go(id, p), back, params: (id) => params[id] ?? { p: {}, n: 0 } };
  const navTabs = navIds ? navIds.map((id) => tabs.find((t) => t.id === id)).filter((t): t is ShellTab => !!t) : tabs.filter((t) => t.inNav);
  const navActive = navTabs.some((t) => t.id === active) ? active : "";
  useEffect(() => {
    if (!menuOpen && !addOpen) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenuOpen(false); setAddOpen(false); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [menuOpen, addOpen]);
  const half = Math.ceil(navTabs.length / 2);
  const navLink = (t: ShellTab) => (
    <a key={t.id} href={t.path} className="m" aria-current={navActive === t.id ? "page" : undefined}
      onClick={(e) => { e.preventDefault(); navTap(t.id); }}>
      {t.icon ?? <em className="ui-nav-emoji" aria-hidden="true">{t.emoji ?? "•"}</em>}<span>{t.short ?? t.label}</span>
    </a>
  );

  return (
    <ShellCtx.Provider value={ctx}>
      <div className="tab-shell">
        {tabs.filter((t) => visited.includes(t.id)).map((t) => (
          <section key={`${t.id}:${resets[t.id] ?? 0}`} hidden={t.id !== active} aria-hidden={t.id !== active} data-ro={t.readOnly ? "" : undefined}>
            {t.readOnly && <p className="salt-okunur-not">Bu bölümü sadece görebilirsin, değiştiremezsin.</p>}
            <TabIdCtx.Provider value={t.id}>{t.render()}</TabIdCtx.Provider>
          </section>
        ))}
      </div>
      <nav className="ui-nav" aria-label="Ana menü">
        {(add ? navTabs.slice(0, half) : navTabs).map(navLink)}
        {add && (
          <button type="button" className="m ui-nav-ekle" aria-expanded={addOpen} onClick={() => { setMenuOpen(false); setAddOpen((o) => !o); }}>
            <b aria-hidden="true">＋</b><span>Ekle</span>
          </button>
        )}
        {add && navTabs.slice(half).map(navLink)}
        {menu && (
          <button type="button" className="m ui-nav-menu" aria-expanded={menuOpen} aria-current={!navActive && !menuOpen ? "page" : undefined} onClick={() => { setAddOpen(false); setMenuOpen((o) => !o); }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="6" rx="1.5" /><rect x="4" y="14" width="6" height="6" rx="1.5" /><rect x="14" y="14" width="6" height="6" rx="1.5" /></svg>
            <span>Menü</span>
          </button>
        )}
        {/* Bilgisayar: gruplu yan menü (telefonda gizli) */}
        <div className="ui-nav-desk">
          {brand && <div className="ui-nav-brand">{brand}</div>}
          {add && <button type="button" className="ui-nav-desk-ekle" aria-expanded={addOpen} onClick={() => setAddOpen((o) => !o)}>＋ Yeni kayıt</button>}
          {[...new Set(tabs.filter((t) => t.group).map((t) => t.group!))].map((g) => (
            <div key={g} className="ui-nav-grp">
              <div className="ui-nav-gl">{g}</div>
              {tabs.filter((t) => t.group === g).map((t) => (
                <a key={t.id} href={t.path} aria-current={active === t.id ? "page" : undefined}
                  onClick={(e) => { e.preventDefault(); if (t.inNav) navTap(t.id); else go(t.id); }}>
                  <em aria-hidden="true">{t.emoji}</em><span>{t.label}</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </nav>
      {add && addOpen && (
        <div className="ui-sheet-bg ekle" onClick={() => setAddOpen(false)}>
          <div className="ui-sheet" role="dialog" aria-modal="true" aria-label="Ne eklemek istiyorsun?" onClick={(e) => e.stopPropagation()}>
            <div className="ui-sheet-bas"><b>Ne eklemek istiyorsun?</b><button type="button" aria-label="Kapat" onClick={() => setAddOpen(false)}>✕</button></div>
            {add(() => setAddOpen(false))}
          </div>
        </div>
      )}
      {menu && menuOpen && (
        <div className="ui-sheet-bg" onClick={() => setMenuOpen(false)}>
          <div className="ui-sheet" role="dialog" aria-modal="true" aria-label="Menü" onClick={(e) => e.stopPropagation()}>
            <div className="ui-sheet-bas"><b>Menü</b><button type="button" aria-label="Kapat" onClick={() => setMenuOpen(false)}>✕</button></div>
            {menu(() => setMenuOpen(false))}
          </div>
        </div>
      )}
    </ShellCtx.Provider>
  );
}

/** Bir önceki ekrana dön (geçmiş boşsa Özet). */
export const useBack = () => useContext(ShellCtx).back;

/** Başka sekmeye geç (isteğe bağlı parametreyle, ör. {yeni: 1}). */
export const useGo = () => useContext(ShellCtx).go;

/** Bu sekmeye gelen parametreler; `n` her yeni gidişte artar (aynı parametreyle tekrar gelince de tetiklenir). */
export function useTabParams() {
  const ctx = useContext(ShellCtx);
  const id = useContext(TabIdCtx);
  return ctx.params(id);
}

/** Sekme her öne geldiğinde (ilk açılış hariç) çalışır: veriyi tazelemek için. */
export function useOnActivate(fn: () => void) {
  const ctx = useContext(ShellCtx);
  const id = useContext(TabIdCtx);
  const first = useRef(true);
  const isActive = ctx.active === id;
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (isActive) fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);
}

/** Sekmeye giden bağlantı (sayfa yenilenmez). */
export function TabLink({ to, params, className, style, children }: { to: string; params?: Params; className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  const go = useGo();
  return <a href="#" className={className} style={style} onClick={(e) => { e.preventDefault(); go(to, params); }}>{children}</a>;
}

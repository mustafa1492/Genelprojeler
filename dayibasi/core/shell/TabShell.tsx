"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/**
 * Sekmeli kabuk: ziyaret edilen her sekme açık kalır (yalnız görünürlüğü değişir),
 * böylece sekme değiştirince yarım kalan form ve kaydırma yeri kaybolmaz.
 * Alt menü her ekranda görünür. Etkin sekmeye tekrar dokununca o sekme başa döner.
 */
export type ShellTab = { id: string; label: string; icon?: React.ReactNode; path: string; inNav: boolean; render: () => React.ReactNode };
type Params = Record<string, string | number | boolean>;
type Ctx = { active: string; go: (id: string, params?: Params) => void; params: (id: string) => { p: Params; n: number } };

const ShellCtx = createContext<Ctx>({ active: "", go: () => {}, params: () => ({ p: {}, n: 0 }) });
const TabIdCtx = createContext<string>("");

export function TabShell({ tabs, initial, initialParams }: { tabs: ShellTab[]; initial: string; initialParams?: Params }) {
  const [active, setActive] = useState(initial);
  const [visited, setVisited] = useState<string[]>([initial]);
  const [resets, setResets] = useState<Record<string, number>>({});
  const [params, setParams] = useState<Record<string, { p: Params; n: number }>>({ [initial]: { p: initialParams ?? {}, n: 1 } });
  const scrolls = useRef<Record<string, number>>({});

  const go = useCallback((id: string, p?: Params) => {
    const t = tabs.find((x) => x.id === id);
    if (!t) return;
    scrolls.current[active] = window.scrollY;
    if (p) setParams((s) => ({ ...s, [id]: { p, n: (s[id]?.n ?? 0) + 1 } }));
    setVisited((v) => (v.includes(id) ? v : [...v, id]));
    setActive(id);
    try { history.replaceState(null, "", t.path); } catch { /* yok */ }
    requestAnimationFrame(() => window.scrollTo(0, p ? 0 : scrolls.current[id] ?? 0));
  }, [tabs, active]);

  const navTap = (id: string) => {
    if (id === active) { setResets((r) => ({ ...r, [id]: (r[id] ?? 0) + 1 })); scrolls.current[id] = 0; window.scrollTo(0, 0); }
    else go(id);
  };

  useEffect(() => {
    const onPop = () => { const t = tabs.find((x) => x.path === location.pathname); if (t) setActive(t.id); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [tabs]);

  const ctx: Ctx = { active, go, params: (id) => params[id] ?? { p: {}, n: 0 } };
  const navTabs = tabs.filter((t) => t.inNav);
  const navActive = tabs.find((t) => t.id === active)?.inNav ? active : "";

  return (
    <ShellCtx.Provider value={ctx}>
      <div className="tab-shell">
        {tabs.filter((t) => visited.includes(t.id)).map((t) => (
          <section key={`${t.id}:${resets[t.id] ?? 0}`} hidden={t.id !== active} aria-hidden={t.id !== active}>
            <TabIdCtx.Provider value={t.id}>{t.render()}</TabIdCtx.Provider>
          </section>
        ))}
      </div>
      <nav className="ui-nav" aria-label="Ana menü">
        {navTabs.map((t) => (
          <a key={t.id} href={t.path} aria-current={navActive === t.id ? "page" : undefined}
            onClick={(e) => { e.preventDefault(); navTap(t.id); }}>
            {t.icon}<span>{t.label}</span>
          </a>
        ))}
      </nav>
    </ShellCtx.Provider>
  );
}

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

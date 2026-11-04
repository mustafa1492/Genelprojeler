"use client";
// Web yönetim paneli (bilgisayar için): hesaplar, defterler, her defterin bütün kayıtları, ayarlar, genel ayarlar, işlem geçmişi.
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/core/supabase/client";
import { toEmail } from "@/core/auth/AuthGate";
import { clearLocal } from "@/core/offline/store";
import { LISTS } from "@/products/ciftci/lists";
import { account, config, isAdmin, members, setPerms, rows, save, remove, setConfig, setMember, userName, users, when, type Member, type Row, type User } from "./api";
import { TableEditor } from "./TableEditor";
import { PermEditor, presetLabel, presetOf, SCREENS, type Perms } from "@/products/ciftci/yetki";

type Sec = "ozet" | "hesaplar" | "defterler" | "defter" | "genel" | "gecmis";
type Biz = { id: string; name: string; product: string; settings: Record<string, unknown> | null; created_at: string };

export default function Panel() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [admin, setAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    supabase().auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase().auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => { if (session) isAdmin().then(setAdmin).catch(() => setAdmin(false)); else setAdmin(null); }, [session]);
  if (session === undefined) return <div className="pn-center">Yükleniyor…</div>;
  if (!session) return <Login />;
  if (admin === null) return <div className="pn-center">Yükleniyor…</div>;
  if (!admin) return <div className="pn-center"><p>Bu hesabın yönetici yetkisi yok.</p><button className="pn-btn ghost" onClick={async () => { clearLocal(); await supabase().auth.signOut(); }}>Çıkış yap</button></div>;
  return <Shell email={session.user.email ?? ""} />;
}

function Login() {
  const [u, setU] = useState(""); const [p, setP] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  return (
    <div className="pn-center">
      <form className="pn-card pn-login" onSubmit={async (e) => { e.preventDefault(); setBusy(true); setErr(""); const { error } = await supabase().auth.signInWithPassword({ email: toEmail(u), password: p }); setBusy(false); if (error) setErr("Kullanıcı adı ya da şifre yanlış."); }}>
        <img src="/icon-192.png" alt="" width={56} height={56} />
        <h1>Çiftçi Defteri · Yönetim</h1>
        <label className="pn-field"><span>Kullanıcı adı / e-posta</span><input className="pn-input" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" /></label>
        <label className="pn-field"><span>Şifre</span><input className="pn-input" type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" /></label>
        {err && <div className="pn-err">{err}</div>}
        <button className="pn-btn" disabled={busy}>{busy ? "Bekle…" : "Giriş yap"}</button>
      </form>
    </div>
  );
}

function Shell({ email }: { email: string }) {
  const [sec, setSec] = useState<Sec>("ozet");
  const [bizs, setBizs] = useState<Biz[]>([]);
  const [us, setUs] = useState<User[]>([]);
  const [cur, setCur] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const load = useCallback(() => {
    rows("businesses").then((r) => setBizs(r as unknown as Biz[])).catch((e) => setErr(e.message));
    users().then(setUs).catch((e) => setErr(e.message));
  }, []);
  useEffect(load, [load]);
  const open = (id: string) => { setCur(id); setSec("defter"); };
  const nav: [Sec, string][] = [["ozet", "Genel bakış"], ["hesaplar", "Hesaplar"], ["defterler", "Defterler"], ["genel", "Genel ayarlar"], ["gecmis", "İşlem geçmişi"]];
  return (
    <div className="pn">
      <aside className="pn-side">
        <div className="pn-brand"><img src="/icon-192.png" alt="" width={36} height={36} /><b>Yönetim</b></div>
        {nav.map(([k, l]) => <button key={k} type="button" className={sec === k ? "on" : ""} onClick={() => setSec(k)}>{l}</button>)}
        <div className="pn-side-sub">Defterler</div>
        {bizs.map((b) => <button key={b.id} type="button" className={sec === "defter" && cur === b.id ? "on" : ""} onClick={() => open(b.id)}>{b.name}<small>{b.product === "ciftci" ? "çiftçi" : "dayıbaşı"}</small></button>)}
        <div className="pn-side-foot"><span>{userName(email)}</span><a href="/ciftci">Uygulamaya dön</a><button type="button" onClick={async () => { clearLocal(); await supabase().auth.signOut(); }}>Çıkış</button></div>
      </aside>
      <main className="pn-main">
        {err && <div className="pn-err">{err}</div>}
        {sec === "ozet" && <Ozet bizs={bizs} us={us} open={open} />}
        {sec === "hesaplar" && <Hesaplar us={us} bizs={bizs} reload={load} />}
        {sec === "defterler" && <Defterler bizs={bizs} us={us} reload={load} open={open} />}
        {sec === "defter" && cur && <Defter key={cur} biz={bizs.find((b) => b.id === cur)!} us={us} reload={load} onDeleted={() => { setCur(null); setSec("defterler"); load(); }} />}
        {sec === "genel" && <Genel />}
        {sec === "gecmis" && <Gecmis bizs={bizs} us={us} />}
      </main>
    </div>
  );
}

/* ---------- Genel bakış ---------- */
function Ozet({ bizs, us, open }: { bizs: Biz[]; us: User[]; open: (id: string) => void }) {
  const [log, setLog] = useState<Row[]>([]);
  useEffect(() => { rows("activity_log").then((r) => setLog(r.slice(0, 15))).catch(() => {}); }, []);
  const last7 = us.filter((u) => u.last_sign_in_at && Date.now() - Date.parse(u.last_sign_in_at) < 7 * 864e5).length;
  return (
    <div className="pn-stack">
      <h1>Genel bakış</h1>
      <div className="pn-kpis">
        <div className="pn-card"><span>Defter</span><b>{bizs.length}</b><small>{bizs.filter((b) => b.product === "ciftci").length} çiftçi · {bizs.filter((b) => b.product !== "ciftci").length} dayıbaşı</small></div>
        <div className="pn-card"><span>Hesap</span><b>{us.length}</b><small>son 7 günde giren {last7}</small></div>
        <div className="pn-card"><span>Yönetici</span><b>{us.filter((u) => u.is_admin).length}</b><small>&nbsp;</small></div>
      </div>
      <div className="pn-grid2">
        <div className="pn-card">
          <h2>Defterler</h2>
          <table className="pn-table"><tbody>{bizs.map((b) => <tr key={b.id} onClick={() => open(b.id)}><td><b>{b.name}</b></td><td>{b.product === "ciftci" ? "Çiftçi defteri" : "Dayıbaşı"}</td><td>{when(b.created_at)}</td></tr>)}</tbody></table>
        </div>
        <div className="pn-card">
          <h2>Son işlemler</h2>
          <table className="pn-table"><tbody>{log.map((l) => <tr key={String(l.id)}><td>{when(String(l.created_at))}</td><td>{bizs.find((b) => b.id === l.business_id)?.name ?? "—"}</td><td>{String(l.table_name)} · {String(l.action)}</td><td>{userName(us.find((u) => u.id === l.user_id)?.email ?? "")}</td></tr>)}</tbody></table>
        </div>
      </div>
    </div>
  );
}

/* ---------- Hesaplar ---------- */
function Hesaplar({ us, bizs, reload }: { us: User[]; bizs: Biz[]; reload: () => void }) {
  const [q, setQ] = useState("");
  const [nu, setNu] = useState({ username: "", password: "", business_id: "", role: "sahip", name: "" });
  const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  const run = async (f: () => Promise<unknown>, ok: string) => { setErr(""); setMsg(""); try { await f(); setMsg(ok); reload(); } catch (e) { setErr((e as Error).message); } };
  const list = us.filter((u) => !q || u.email.includes(q.toLocaleLowerCase("tr")));
  return (
    <div className="pn-stack">
      <h1>Hesaplar</h1>
      {msg && <div className="pn-ok">{msg}</div>}{err && <div className="pn-err">{err}</div>}
      <div className="pn-card pn-stack">
        <h2>Yeni hesap aç</h2>
        <div className="pn-row">
          <label className="pn-field"><span>Kullanıcı adı (ya da e-posta)</span><input className="pn-input" value={nu.username} onChange={(e) => setNu({ ...nu, username: e.target.value })} placeholder="ör. ahmetyilmaz" /></label>
          <label className="pn-field"><span>Şifre (en az 8)</span><input className="pn-input" value={nu.password} onChange={(e) => setNu({ ...nu, password: e.target.value })} /></label>
          <label className="pn-field"><span>Deftere ekle (isteğe bağlı)</span><select className="pn-input" value={nu.business_id} onChange={(e) => setNu({ ...nu, business_id: e.target.value })}><option value="">—</option>{bizs.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
          <label className="pn-field"><span>Rol</span><select className="pn-input" value={nu.role} onChange={(e) => setNu({ ...nu, role: e.target.value })}><option value="sahip">Sahip / aile</option><option value="calisan">Çalışan</option></select></label>
          <label className="pn-field"><span>Görünen ad</span><input className="pn-input" value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} placeholder="ör. Ahmet" /></label>
        </div>
        <div><button className="pn-btn" onClick={() => run(async () => { await account({ action: "create", ...nu, business_id: nu.business_id || undefined }); setNu({ username: "", password: "", business_id: "", role: "sahip", name: "" }); }, "Hesap açıldı.")}>Hesabı aç</button></div>
      </div>
      <div className="pn-bar"><input className="pn-input" placeholder="Ara…" value={q} onChange={(e) => setQ(e.target.value)} /><span className="pn-muted">{list.length} hesap</span></div>
      <div className="pn-table-wrap">
        <table className="pn-table">
          <thead><tr><th>Kullanıcı</th><th>Defterleri</th><th>Açıldı</th><th>Son giriş</th><th>İşlemler</th></tr></thead>
          <tbody>{list.map((u) => (
            <tr key={u.id} className="static">
              <td><b>{userName(u.email)}</b>{u.is_admin && <span className="pn-tag">yönetici</span>}</td>
              <td>{u.businesses.map((b) => `${b.name}${b.role === "calisan" ? " (çalışan)" : ""}`).join(", ") || "—"}</td>
              <td>{when(u.created_at)}</td><td>{when(u.last_sign_in_at)}</td>
              <td className="pn-actions">
                <button onClick={() => { const p = prompt(`${userName(u.email)} için yeni şifre (en az 8):`); if (p) run(() => account({ action: "password", user_id: u.id, password: p }), "Şifre değişti."); }}>Şifre</button>
                <button onClick={() => { const n = prompt("Yeni kullanıcı adı ya da e-posta:", userName(u.email)); if (n) run(() => account({ action: "email", user_id: u.id, username: n }), "Kullanıcı adı değişti."); }}>Ad</button>
                <button onClick={() => run(() => account({ action: "admin", user_id: u.id, on: !u.is_admin }), u.is_admin ? "Yöneticilik kaldırıldı." : "Yönetici yapıldı.")}>{u.is_admin ? "Yöneticiliği al" : "Yönetici yap"}</button>
                <button onClick={() => { if (confirm(`${userName(u.email)} giriş yapamasın mı? (Sonra geri açabilirsin.)`)) run(() => account({ action: "ban", user_id: u.id, on: true }), "Hesap engellendi."); }}>Engelle</button>
                <button onClick={() => run(() => account({ action: "ban", user_id: u.id, on: false }), "Engel kalktı.")}>Engeli kaldır</button>
                <button className="danger" onClick={() => { if (confirm(`${userName(u.email)} hesabı KALICI silinsin mi? Defterleri silinmez.`)) run(() => account({ action: "delete", user_id: u.id }), "Hesap silindi."); }}>Sil</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Defterler ---------- */
function Defterler({ bizs, us, reload, open }: { bizs: Biz[]; us: User[]; reload: () => void; open: (id: string) => void }) {
  const [nb, setNb] = useState({ name: "", product: "ciftci", owner: "" });
  const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  return (
    <div className="pn-stack">
      <h1>Defterler</h1>
      {msg && <div className="pn-ok">{msg}</div>}{err && <div className="pn-err">{err}</div>}
      <div className="pn-card pn-stack">
        <h2>Yeni defter</h2>
        <div className="pn-row">
          <label className="pn-field"><span>Defter adı</span><input className="pn-input" value={nb.name} onChange={(e) => setNb({ ...nb, name: e.target.value })} placeholder="ör. Yılmaz ailesi" /></label>
          <label className="pn-field"><span>Ürün</span><select className="pn-input" value={nb.product} onChange={(e) => setNb({ ...nb, product: e.target.value })}><option value="ciftci">Çiftçi defteri</option><option value="dayibasi">Dayıbaşı</option></select></label>
          <label className="pn-field"><span>Sahibi (hesap)</span><select className="pn-input" value={nb.owner} onChange={(e) => setNb({ ...nb, owner: e.target.value })}><option value="">—</option>{us.map((u) => <option key={u.id} value={u.id}>{userName(u.email)}</option>)}</select></label>
        </div>
        <div><button className="pn-btn" disabled={!nb.name.trim()} onClick={async () => {
          setErr(""); setMsg("");
          try { const b = await save("businesses", { name: nb.name.trim(), product: nb.product, settings: {} }); if (nb.owner) await setMember(String(b.id), nb.owner, "sahip"); setMsg("Defter açıldı."); setNb({ name: "", product: "ciftci", owner: "" }); reload(); }
          catch (e) { setErr((e as Error).message); }
        }}>Defteri aç</button></div>
      </div>
      <div className="pn-table-wrap">
        <table className="pn-table">
          <thead><tr><th>Defter</th><th>Ürün</th><th>Üyeler</th><th>Modüller</th><th>Açıldı</th></tr></thead>
          <tbody>{bizs.map((b) => (
            <tr key={b.id} onClick={() => open(b.id)}>
              <td><b>{b.name}</b></td><td>{b.product === "ciftci" ? "Çiftçi defteri" : "Dayıbaşı"}</td>
              <td>{us.filter((u) => u.businesses.some((x) => x.id === b.id)).map((u) => userName(u.email)).join(", ") || "—"}</td>
              <td>{((b.settings?.modules as string[]) ?? []).join(", ") || "—"}</td><td>{when(b.created_at)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Tek defter ---------- */
const TABS = [
  ["bilgi", "Bilgiler ve üyeler"], ["ayar", "Listeler, sezonlar, modüller"], ["places", "Tarlalar"], ["expenses", "Masraflar"], ["gelir", "Gelirler"],
  ["islem", "Tarla işleri"], ["verim", "Verim"], ["hatirlat", "Hatırlatmalar"], ["inventory_items", "Depo"], ["dues", "Borç / alacak"],
  ["documents", "Belgeler"], ["lots", "Fidan partileri"], ["barns", "Barınaklar"], ["herds", "Sürüler"], ["herd_days", "Hayvan günlük kayıt"], ["receipt_inbox", "Fiş kutusu"], ["events", "Bütün olaylar"], ["people", "Kişiler (dayıbaşı)"], ["ledger_entries", "Cari (dayıbaşı)"],
] as const;

function Defter({ biz, us, reload, onDeleted }: { biz: Biz; us: User[]; reload: () => void; onDeleted: () => void }) {
  const [tab, setTab] = useState<string>("bilgi");
  const [places, setPlaces] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => { rows("places", biz.id).then((r) => setPlaces(r.map((p) => ({ id: String(p.id), name: String(p.name) })))).catch(() => {}); }, [biz.id, tab]);
  const fx = { business_id: biz.id };
  const ev = (kind: string) => ({ fixed: { ...fx, kind, data: {} }, filter: (r: Row) => r.kind === kind });
  const lk = { place_id: places };
  if (!biz) return null;
  return (
    <div className="pn-stack">
      <h1>{biz.name}</h1>
      <div className="pn-tabs">{TABS.filter(([k]) => biz.product === "ciftci" ? !["people", "ledger_entries"].includes(k) : true).map(([k, l]) => <button key={k} type="button" className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}</div>
      {tab === "bilgi" && <Bilgi biz={biz} us={us} reload={reload} onDeleted={onDeleted} />}
      {tab === "ayar" && <Ayarlar biz={biz} reload={reload} />}
      {tab === "gelir" && <TableEditor key="g" table="events" business={biz.id} lookups={lk} {...ev("gelir")} />}
      {tab === "islem" && <TableEditor key="i" table="events" business={biz.id} lookups={lk} {...ev("islem")} />}
      {tab === "verim" && <TableEditor key="v" table="events" business={biz.id} lookups={lk} {...ev("verim")} />}
      {tab === "hatirlat" && <TableEditor key="h" table="events" business={biz.id} lookups={lk} {...ev("hatirlat")} />}
      {["places", "expenses", "inventory_items", "dues", "documents", "lots", "barns", "herds", "herd_days", "receipt_inbox", "events", "people", "ledger_entries"].includes(tab) &&
        <TableEditor key={tab} table={tab} business={biz.id} fixed={tab === "places" ? { ...fx, custom: {} } : tab === "documents" ? { ...fx, subject_type: "business" } : fx} lookups={lk} />}
    </div>
  );
}

function Bilgi({ biz, us, reload, onDeleted }: { biz: Biz; us: User[]; reload: () => void; onDeleted: () => void }) {
  const [ms, setMs] = useState<Member[]>([]);
  const [name, setName] = useState(biz.name);
  const [add, setAdd] = useState({ user: "", role: "sahip", name: "" });
  const [openP, setOpenP] = useState<string | null>(null);
  const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  const loadM = useCallback(() => { members(biz.id).then(setMs).catch((e) => setErr(e.message)); }, [biz.id]);
  useEffect(loadM, [loadM]);
  const run = async (f: () => Promise<unknown>, ok: string) => { setErr(""); setMsg(""); try { await f(); setMsg(ok); loadM(); reload(); } catch (e) { setErr((e as Error).message); } };
  return (
    <div className="pn-stack">
      {msg && <div className="pn-ok">{msg}</div>}{err && <div className="pn-err">{err}</div>}
      <div className="pn-grid2">
        <div className="pn-card pn-stack">
          <h2>Defter</h2>
          <label className="pn-field"><span>Adı</span><input className="pn-input" value={name} onChange={(e) => setName(e.target.value)} /></label>
          <div className="pn-muted">Ürün: {biz.product === "ciftci" ? "Çiftçi defteri" : "Dayıbaşı"} · Açıldı: {when(biz.created_at)}</div>
          <div><button className="pn-btn" disabled={!name.trim() || name === biz.name} onClick={() => run(() => save("businesses", { id: biz.id, name: name.trim() }), "Adı değişti.")}>Kaydet</button></div>
          <hr />
          <h2>Defteri sil</h2>
          <p className="pn-muted">Defterin bütün kayıtları (tarlalar, masraflar, gelirler…) kalıcı olarak silinir. Önce "Bütün verimi indir" ile yedek almanı öneririm.</p>
          <div><button className="pn-btn danger" onClick={() => { const t = prompt(`Silmek için defterin adını aynen yaz: ${biz.name}`); if (t === biz.name) run(async () => { await remove("businesses", biz.id); onDeleted(); }, "Defter silindi."); else if (t !== null) setErr("Ad tutmadı, silinmedi."); }}>Defteri kalıcı sil</button></div>
        </div>
        <div className="pn-card pn-stack">
          <h2>Üyeler</h2>
          <table className="pn-table"><tbody>{ms.map((m) => (
            <tr key={m.user_id} className="static"><td><b>{m.display_name || userName(m.email)}</b><div className="pn-muted">{userName(m.email)}</div></td><td>{presetLabel(presetOf(m.perms as Perms, m.role))}</td>
              <td className="pn-actions">
                <button onClick={() => setOpenP(openP === m.user_id ? null : m.user_id)}>{openP === m.user_id ? "Kapat" : "Yetki"}</button>
                <button onClick={() => { const n = prompt("Görünen ad:", m.display_name ?? ""); if (n !== null) run(() => setMember(biz.id, m.user_id, m.role as "sahip", n), "Ad değişti."); }}>Ad</button>
                <button className="danger" onClick={() => { if (confirm("Defterden çıkarılsın mı?")) run(() => setMember(biz.id, m.user_id, "cikar"), "Çıkarıldı."); }}>Çıkar</button>
              </td></tr>
          ))}</tbody></table>
          {openP && (() => { const m = ms.find((x) => x.user_id === openP); if (!m) return null; return (
            <div className="pn-card"><h2>{m.display_name || userName(m.email)}: yetkiler</h2>
              <PermEditor key={m.user_id} value={m.perms as Perms} role={m.role} onSave={(pp) => run(async () => { await setPerms(biz.id, m.user_id, pp); setOpenP(null); }, "Yetki kaydedildi.")} />
            </div>); })()}
          <div className="pn-row">
            <label className="pn-field"><span>Hesap ekle</span><select className="pn-input" value={add.user} onChange={(e) => setAdd({ ...add, user: e.target.value })}><option value="">—</option>{us.filter((u) => !ms.some((m) => m.user_id === u.id)).map((u) => <option key={u.id} value={u.id}>{userName(u.email)}</option>)}</select></label>
            <label className="pn-field"><span>Rol</span><select className="pn-input" value={add.role} onChange={(e) => setAdd({ ...add, role: e.target.value })}><option value="sahip">Sahip / aile</option><option value="calisan">Çalışan</option></select></label>
            <label className="pn-field"><span>Görünen ad</span><input className="pn-input" value={add.name} onChange={(e) => setAdd({ ...add, name: e.target.value })} /></label>
          </div>
          <div><button className="pn-btn" disabled={!add.user} onClick={() => run(async () => { await setMember(biz.id, add.user, add.role as "sahip", add.name); setAdd({ user: "", role: "sahip", name: "" }); }, "Üye eklendi.")}>Ekle</button></div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Defter ayarları: listeler, sezonlar, modüller, fidan ---------- */
type LS = { added?: string[]; hidden?: string[] };
type Season = { id: string; name: string; start: string; end: string };
function Ayarlar({ biz, reload }: { biz: Biz; reload: () => void }) {
  const [st, setSt] = useState<Record<string, unknown>>(biz.settings ?? {});
  const [raw, setRaw] = useState(false);
  const [rawText, setRawText] = useState(JSON.stringify(biz.settings ?? {}, null, 2));
  const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  const lists = (st.lists ?? {}) as Record<string, LS>;
  const seasons = (Array.isArray(st.seasons) ? st.seasons : []) as Season[];
  const mods = (Array.isArray(st.modules) ? st.modules : []) as string[];
  const persist = async (next: Record<string, unknown>) => {
    setErr(""); setMsg("");
    try { await save("businesses", { id: biz.id, settings: next }); setSt(next); setRawText(JSON.stringify(next, null, 2)); setMsg("Kaydedildi."); reload(); } catch (e) { setErr((e as Error).message); }
  };
  const setList = (k: string, v: LS) => persist({ ...st, lists: { ...lists, [k]: v } });
  return (
    <div className="pn-stack">
      {msg && <div className="pn-ok">{msg}</div>}{err && <div className="pn-err">{err}</div>}
      <div className="pn-bar"><span className="pn-muted">Her değişiklik hemen kaydedilir ve uygulamaya yansır.</span><button className="pn-btn ghost" onClick={() => setRaw(!raw)}>{raw ? "Düzenli görünüm" : "Ham JSON"}</button></div>
      {raw ? (
        <div className="pn-card pn-stack">
          <textarea className="pn-input mono" rows={24} value={rawText} onChange={(e) => setRawText(e.target.value)} />
          <div><button className="pn-btn" onClick={() => { try { persist(JSON.parse(rawText)); } catch { setErr("Geçerli JSON değil."); } }}>Kaydet</button></div>
        </div>
      ) : (
        <>
          <div className="pn-card pn-stack">
            <h2>Modüller</h2>
            <label className="pn-check"><input type="checkbox" checked={mods.includes("fidan")} onChange={(e) => persist({ ...st, modules: e.target.checked ? [...mods, "fidan"] : mods.filter((m) => m !== "fidan") })} /> Fidan (şimşir) modülü</label>
            <label className="pn-check"><input type="checkbox" checked={mods.includes("kanatli")} onChange={(e) => persist({ ...st, modules: e.target.checked ? [...mods, "kanatli"] : mods.filter((m) => m !== "kanatli") })} /> Kümes (kanatlı) modülü</label>
            <label className="pn-check"><input type="checkbox" checked={mods.includes("buyukbas")} onChange={(e) => persist({ ...st, modules: e.target.checked ? [...mods, "buyukbas"] : mods.filter((m) => m !== "buyukbas") })} /> Büyükbaş modülü</label>
            <label className="pn-check"><input type="checkbox" checked={mods.includes("kucukbas")} onChange={(e) => persist({ ...st, modules: e.target.checked ? [...mods, "kucukbas"] : mods.filter((m) => m !== "kucukbas") })} /> Küçükbaş modülü</label>
          </div>
          <div className="pn-card pn-stack">
            <h2>Bu defterde açık bölümler</h2>
            <p className="pn-muted">Kapattığın bölüm bu defterde kimsede görünmez (yöneticide de). Kayıtlar silinmez, açınca geri gelir.</p>
            <div className="pn-row">{SCREENS.filter((x) => !["uyeler", "ayarlar"].includes(x.key)).map((x) => {
              const hid = ((st.hidden_screens as string[]) ?? []);
              return <label key={x.key} className="pn-check"><input type="checkbox" checked={!hid.includes(x.key)} onChange={(e) => persist({ ...st, hidden_screens: e.target.checked ? hid.filter((h) => h !== x.key) : [...hid, x.key] })} /> {x.label}</label>;
            })}</div>
          </div>
          <div className="pn-card pn-stack">
            <h2>Sezonlar</h2>
            <table className="pn-table"><thead><tr><th>Ad</th><th>Başlangıç</th><th>Bitiş</th><th></th></tr></thead>
              <tbody>{seasons.map((s, i) => (
                <tr key={s.id} className="static">
                  <td><input className="pn-input" defaultValue={s.name} onBlur={(e) => e.target.value !== s.name && persist({ ...st, seasons: seasons.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} /></td>
                  <td><input className="pn-input" type="date" defaultValue={s.start} onBlur={(e) => e.target.value !== s.start && persist({ ...st, seasons: seasons.map((x, j) => (j === i ? { ...x, start: e.target.value } : x)) })} /></td>
                  <td><input className="pn-input" type="date" defaultValue={s.end} onBlur={(e) => e.target.value !== s.end && persist({ ...st, seasons: seasons.map((x, j) => (j === i ? { ...x, end: e.target.value } : x)) })} /></td>
                  <td className="pn-actions"><button className="danger" onClick={() => confirm("Sezon silinsin mi? (Kayıtlar silinmez.)") && persist({ ...st, seasons: seasons.filter((_, j) => j !== i) })}>Sil</button></td>
                </tr>
              ))}</tbody></table>
            <div><button className="pn-btn ghost" onClick={() => { const y = new Date().getFullYear(); persist({ ...st, seasons: [...seasons, { id: crypto.randomUUID(), name: String(y + 1), start: `${y + 1}-01-01`, end: `${y + 1}-12-31` }] }); }}>+ Sezon ekle</button></div>
          </div>
          <div className="pn-card pn-stack">
            <h2>Listeler</h2>
            <p className="pn-muted">Hazır gelenleri gizleyebilir, yenilerini ekleyebilirsin. Uygulamadaki seçim düğmeleri bunlardan oluşur.</p>
            <div className="pn-lists">
              {(Object.keys(LISTS) as (keyof typeof LISTS)[]).map((k) => {
                const L = LISTS[k]; const cur = lists[k] ?? {};
                const defs = k === "isler" ? (mods.includes("fidan") ? ["Fidan"] : []) : [...L.defaults];
                return (
                  <div key={k} className="pn-list">
                    <b>{L.title}</b>
                    <div className="pn-chips">
                      {defs.map((d) => { const h = cur.hidden?.includes(d); return <button key={d} className={h ? "off" : ""} title={h ? "Gizli: tıkla, geri getir" : "Tıkla, gizle"} onClick={() => setList(k, { ...cur, hidden: h ? (cur.hidden ?? []).filter((x) => x !== d) : [...(cur.hidden ?? []), d] })}>{d}</button>; })}
                      {(cur.added ?? []).map((a) => <button key={a} className="mine" title="Tıkla, kaldır" onClick={() => setList(k, { ...cur, added: (cur.added ?? []).filter((x) => x !== a) })}>{a} ✕</button>)}
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); const f = e.currentTarget; const v = (f.elements.namedItem("v") as HTMLInputElement).value.trim(); if (v && !(cur.added ?? []).includes(v)) setList(k, { ...cur, added: [...(cur.added ?? []), v] }); f.reset(); }}>
                      <input name="v" className="pn-input" placeholder="Yeni ekle…" maxLength={40} />
                    </form>
                  </div>
                );
              })}
            </div>
          </div>
          {mods.includes("fidan") && (
            <div className="pn-card pn-stack">
              <h2>Fidan ayarları</h2>
              <div className="pn-row">
                <label className="pn-field"><span>Boy sınıfları (virgülle)</span><input className="pn-input" defaultValue={((st.fidan_sizes as string[]) ?? []).join(", ")} onBlur={(e) => persist({ ...st, fidan_sizes: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></label>
                <label className="pn-field"><span>Kâr oranı (%)</span><input className="pn-input" inputMode="decimal" defaultValue={st.fidan_margin == null ? "" : String(st.fidan_margin)} onBlur={(e) => persist({ ...st, fidan_margin: e.target.value.trim() ? Number(e.target.value.replace(",", ".")) : null })} /></label>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------- Genel ayarlar (bütün uygulama) ---------- */
function Genel() {
  const [c, setC] = useState<Record<string, unknown> | null>(null);
  const [msg, setMsg] = useState(""); const [err, setErr] = useState("");
  const load = () => config().then(setC).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, []);
  const put = async (k: string, v: unknown) => { setErr(""); setMsg(""); try { await setConfig(k, v); setMsg("Kaydedildi."); load(); } catch (e) { setErr((e as Error).message); } };
  if (!c) return <div className="pn-muted">Yükleniyor…</div>;
  const duyuru = (c.duyuru ?? {}) as { text?: string; on?: boolean; tone?: string };
  return (
    <div className="pn-stack">
      <h1>Genel ayarlar</h1>
      {msg && <div className="pn-ok">{msg}</div>}{err && <div className="pn-err">{err}</div>}
      <div className="pn-card pn-stack">
        <h2>Duyuru</h2>
        <p className="pn-muted">Açıkken herkesin uygulamasının üstünde görünür (ör. “Bu gece 23:00’te kısa bakım var”).</p>
        <textarea className="pn-input" rows={3} maxLength={300} defaultValue={duyuru.text ?? ""} id="duyuru_text" />
        <div className="pn-row">
          <label className="pn-field"><span>Renk</span><select className="pn-input" defaultValue={duyuru.tone ?? "bilgi"} id="duyuru_tone"><option value="bilgi">Bilgi (yeşil)</option><option value="uyari">Uyarı (sarı)</option><option value="acil">Acil (kırmızı)</option></select></label>
        </div>
        <div className="pn-bar">
          <button className="pn-btn" onClick={() => put("duyuru", { text: (document.getElementById("duyuru_text") as HTMLTextAreaElement).value.trim(), tone: (document.getElementById("duyuru_tone") as HTMLSelectElement).value, on: true })}>Yayınla</button>
          <button className="pn-btn ghost" onClick={() => put("duyuru", { ...duyuru, on: false })}>Kaldır</button>
          <span className="pn-muted">Şu an: {duyuru.on ? "yayında" : "kapalı"}</span>
        </div>
      </div>
      <div className="pn-card pn-stack">
        <h2>Yeni defter açma</h2>
        <label className="pn-check"><input type="checkbox" checked={c.yeni_defter_kapali === true} onChange={(e) => put("yeni_defter_kapali", e.target.checked)} /> Yeni hesaplar kendi defterini açamasın (defteri sadece yönetici açar)</label>
      </div>
      <div className="pn-card pn-stack">
        <h2>Yeni defterlere hazır gelen listeler</h2>
        <p className="pn-muted">Boş bırakılırsa uygulamanın kendi listesi kullanılır. Her satıra bir madde.</p>
        <div className="pn-lists">
          {(Object.keys(LISTS) as (keyof typeof LISTS)[]).filter((k) => k !== "isler").map((k) => {
            const v = (c[`liste:${k}`] as string[] | undefined) ?? null;
            return (
              <div key={k} className="pn-list">
                <b>{LISTS[k].title}</b>
                <textarea className="pn-input" rows={5} defaultValue={(v ?? [...LISTS[k].defaults]).join("\n")} onBlur={(e) => {
                  const arr = e.target.value.split("\n").map((x) => x.trim()).filter(Boolean);
                  const same = arr.join("|") === [...LISTS[k].defaults].join("|");
                  if (same && v === null) return;
                  put(`liste:${k}`, same ? undefined : arr);
                }} />
                {v && <button className="pn-btn ghost" onClick={() => put(`liste:${k}`, undefined)}>Uygulamanın listesine dön</button>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="pn-card pn-stack">
        <h2>Bütün ayarlar (ham)</h2>
        <pre className="pn-pre">{JSON.stringify(c, null, 2)}</pre>
      </div>
    </div>
  );
}

/* ---------- İşlem geçmişi ---------- */
function Gecmis({ bizs, us }: { bizs: Biz[]; us: User[] }) {
  const [b, setB] = useState<string>("");
  const lookups = useMemo(() => ({ business_id: bizs.map((x) => ({ id: x.id, name: x.name })), user_id: us.map((u) => ({ id: u.id, name: userName(u.email) })) }), [bizs, us]);
  return (
    <div className="pn-stack">
      <h1>İşlem geçmişi</h1>
      <div className="pn-bar"><select className="pn-input" value={b} onChange={(e) => setB(e.target.value)}><option value="">Bütün defterler</option>{bizs.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></div>
      <TableEditor key={b} table="activity_log" business={b || null} readOnly lookups={lookups} />
    </div>
  );
}

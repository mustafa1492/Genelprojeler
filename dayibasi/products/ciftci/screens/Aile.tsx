"use client";
import { useGo } from "@/core/shell/TabShell";
import { useEffect, useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { createInvite, setMemberRole, setMyName, useMembers } from "@/core/auth/members";
import { useRole } from "../rol";
import { PermEditor, presetLabel, presetOf, type Perms } from "../yetki";
import { clearLocal } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";
import { BackButton, Chip, DoneCard, ErrorText, MainButton, PageHeader, TextField } from "@/core/ui";

/** Aile / ortak defter: üyeler, adın, davet kodu. */
export default function Aile() {
  const biz = useBusiness();
  const go = useGo();
  const { members, me, reload } = useMembers(biz.id);
  const mine = members.find((m) => m.user_id === me);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [role, setRole] = useState<"sahip" | "calisan">("sahip");
  const { writes } = useRole();
  const manage = writes("uyeler");
  const money = manage;
  const [list, setList] = useState<{ user_id: string; display_name: string | null; role: string; perms: Perms; email: string }[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const loadList = () => { supabase().rpc("member_list", { p_business: biz.id }).then(({ data }) => { if (data) setList(data as typeof list); }); };
  useEffect(loadList, [biz.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const roleText = (r: string) => (r === "calisan" ? "Çalışan" : "Aile");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const link = typeof location !== "undefined" ? location.origin : "";
  const invite = `${biz.name} defterine katılmak için:\n1) ${link} adresini aç\n2) Yeni hesap aç (ya da giriş yap)\n3) "Davet kodum var"a dokun, kodu yaz: ${code}\n(Kod 7 gün geçerli, bir kez kullanılır.)${role === "calisan" ? "\nÇalışan olarak katılırsın: tarla işi, depo, verim ve fiş girebilirsin." : ""}`;

  return (
    <main className="ui-stack">
      <BackButton onClick={() => go("ozet")} label="Özet" />
      <PageHeader sub={biz.name} title="Aile ve ortak defter" />
      {msg && <DoneCard message={msg} />}
      <p className="ui-note">Ailenden biri kendi hesabıyla bu deftere katılabilir; her kaydın yanında kimin girdiği yazar. Her üyenin hangi bölümü <b>görüp</b> hangisini <b>değiştirebileceğini</b> sen seçersin.</p>
      <div className="ui-stack" style={{ gap: 8 }}>
        {list.map((m) => (
          <div key={m.user_id} className="ui-card ui-stack" style={{ gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
              <b style={{ minWidth: 0 }}>{m.display_name || m.email}<small style={{ display: "block", color: "var(--sessiz2)", fontWeight: 600 }}>{m.user_id === me ? "Sen · " : ""}{presetLabel(presetOf(m.perms, m.role))}</small></b>
              {manage && m.user_id !== me && (
                <span style={{ display: "flex", gap: 6 }}>
                  <button type="button" className="ui-chip" onClick={() => setOpen(open === m.user_id ? null : m.user_id)}>{open === m.user_id ? "Kapat" : "Yetkiyi değiştir"}</button>
                  <button type="button" className="ui-chip" onClick={async () => { if (!confirm(`${m.display_name || m.email} defterden çıkarılsın mı?`)) return; setError(""); try { await setMemberRole(biz.id, m.user_id, "cikar"); setMsg(`${m.display_name || m.email} defterden çıkarıldı.`); loadList(); reload(); } catch { setError("Çıkaramadım, internet lazım."); } }}>Çıkar</button>
                </span>
              )}
            </div>
            {open === m.user_id && (
              <PermEditor value={m.perms} role={m.role} busy={busy} onSave={async (pp) => {
                setBusy(true); setError("");
                const { error } = await supabase().rpc("set_member_perms", { p_business: biz.id, p_user: m.user_id, p_perms: pp });
                setBusy(false);
                if (error) { setError(error.message.includes("son_yonetici") ? "Defterde en az bir yönetici kalmalı." : "Kaydedemedim, internet lazım."); return; }
                setMsg(`${m.display_name || m.email}: ${presetLabel(pp.preset!)} yetkisi kaydedildi. Uygulamayı yeniden açınca geçerli olur.`); setOpen(null); loadList();
              }} />
            )}
          </div>
        ))}
      </div>

      <h2 className="ui-section">Adın (kayıtlarda görünür)</h2>
      <div className="ui-quickadd">
        <TextField id="a_ad" label="Adın" placeholder={mine?.display_name || "Örnek: Mustafa"} maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
        <button type="button" disabled={!name.trim() || !me} onClick={async () => {
          try { await setMyName(biz.id, me!, name.trim()); setMsg(`Adın “${name.trim()}” oldu.`); setName(""); reload(); } catch { setError("Kaydedemedim, internet lazım."); }
        }}>Kaydet</button>
      </div>

      {money && <h2 className="ui-section">Birini davet et</h2>}
      {money && !code && (
        <div className="ui-chips wrap">
          <Chip selected={role === "sahip"} onClick={() => setRole("sahip")}>Aileden biri (her şeyi görür)</Chip>
          <Chip selected={role === "calisan"} onClick={() => setRole("calisan")}>Çalışan (para görmez)</Chip>
        </div>
      )}
      {!money ? null : !code ? (
        <MainButton onClick={async () => { setError(""); try { setCode(await createInvite(biz.id, role)); } catch { setError("Kod oluşturamadım, internet lazım."); } }}>Davet kodu oluştur</MainButton>
      ) : (
        <div className="ui-card ui-stack" style={{ gap: 10, alignItems: "center" }}>
          <span className="ui-note" style={{ margin: 0 }}>Davet kodu ({roleText(role)})</span>
          <b className="ui-code">{code}</b>
          <a className="ui-main-btn" style={{ textDecoration: "none" }} href={`https://wa.me/?text=${encodeURIComponent(invite)}`} target="_blank" rel="noreferrer">WhatsApp’tan gönder</a>
        </div>
      )}
      {error && <ErrorText>{error}</ErrorText>}
      <button type="button" className="ui-link" onClick={async () => { clearLocal(); await supabase().auth.signOut(); location.href = "/"; }}>Çıkış yap</button>
    </main>
  );
}

"use client";
import { useGo } from "@/core/shell/TabShell";
import { useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { createInvite, setMemberRole, setMyName, useMembers } from "@/core/auth/members";
import { useRole } from "../rol";
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
  const { money } = useRole();
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
      <p className="ui-note">Ailenden biri kendi hesabıyla bu deftere katılabilir; her kaydın yanında kimin girdiği yazar. <b>Çalışan</b> olarak katılan para ile ilgili hiçbir şeyi (masraf, gelir, kâr, borç) göremez; tarla işi, depo, verim ve fiş girer.</p>
      <div className="ui-stack" style={{ gap: 8 }}>
        {members.map((m) => (
          <div key={m.user_id} className="ui-moneyrow">
            <b style={{ minWidth: 0 }}>{m.display_name || m.email}<small>{m.user_id === me ? `Sen · ${roleText(m.role)}` : roleText(m.role)}</small></b>
            {money && m.user_id !== me && (
              <span style={{ display: "flex", gap: 6 }}>
                <button type="button" className="ui-chip" onClick={async () => { setError(""); try { await setMemberRole(biz.id, m.user_id, m.role === "calisan" ? "sahip" : "calisan"); setMsg(`${m.display_name || m.email} artık ${m.role === "calisan" ? "Aile" : "Çalışan"}.`); reload(); } catch { setError("Değiştiremedim, internet lazım."); } }}>{m.role === "calisan" ? "Aile yap" : "Çalışan yap"}</button>
                <button type="button" className="ui-chip" onClick={async () => { if (!confirm(`${m.display_name || m.email} defterden çıkarılsın mı?`)) return; setError(""); try { await setMemberRole(biz.id, m.user_id, "cikar"); setMsg(`${m.display_name || m.email} defterden çıkarıldı.`); reload(); } catch { setError("Çıkaramadım, internet lazım."); } }}>Çıkar</button>
              </span>
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

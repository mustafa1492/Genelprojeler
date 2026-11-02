"use client";
import { useState } from "react";
import { useBusiness } from "@/core/auth/AuthGate";
import { createInvite, setMyName, useMembers } from "@/core/auth/members";
import { clearLocal } from "@/core/offline/store";
import { supabase } from "@/core/supabase/client";
import { BackButton, Card, DoneCard, ErrorText, InfoRows, MainButton, PageHeader, TextField } from "@/core/ui";
import { BASE } from "../config";

/** Aile / ortak defter: üyeler, adın, davet kodu. */
export default function Aile() {
  const biz = useBusiness();
  const { members, me, reload } = useMembers(biz.id);
  const mine = members.find((m) => m.user_id === me);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const link = typeof location !== "undefined" ? location.origin : "";
  const invite = `${biz.name} defterine katılmak için:\n1) ${link} adresini aç\n2) Yeni hesap aç (ya da giriş yap)\n3) "Davet kodum var"a dokun, kodu yaz: ${code}\n(Kod 7 gün geçerli, bir kez kullanılır.)`;

  return (
    <main className="ui-stack">
      <BackButton onClick={() => (location.href = BASE)} label="Özet" />
      <PageHeader sub={biz.name} title="Aile ve ortak defter" />
      {msg && <DoneCard message={msg} />}
      <p className="ui-note">Ailenden biri kendi hesabıyla bu deftere katılabilir. Herkes aynı kayıtları görür; her kaydın yanında kimin girdiği yazar.</p>
      <Card><InfoRows rows={members.map((m) => [m.display_name || m.email, m.user_id === me ? "Sen" : "Üye"] as [string, string])} /></Card>

      <h2 className="ui-section">Adın (kayıtlarda görünür)</h2>
      <div className="ui-quickadd">
        <TextField id="a_ad" label="Adın" placeholder={mine?.display_name || "Örnek: Mustafa"} maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
        <button type="button" disabled={!name.trim() || !me} onClick={async () => {
          try { await setMyName(biz.id, me!, name.trim()); setMsg(`Adın “${name.trim()}” oldu.`); setName(""); reload(); } catch { setError("Kaydedemedim, internet lazım."); }
        }}>Kaydet</button>
      </div>

      <h2 className="ui-section">Birini davet et</h2>
      {!code ? (
        <MainButton onClick={async () => { setError(""); try { setCode(await createInvite(biz.id)); } catch { setError("Kod oluşturamadım, internet lazım."); } }}>Davet kodu oluştur</MainButton>
      ) : (
        <div className="ui-card ui-stack" style={{ gap: 10, alignItems: "center" }}>
          <span className="ui-note" style={{ margin: 0 }}>Davet kodu</span>
          <b className="ui-code">{code}</b>
          <a className="ui-main-btn" style={{ textDecoration: "none" }} href={`https://wa.me/?text=${encodeURIComponent(invite)}`} target="_blank" rel="noreferrer">WhatsApp’tan gönder</a>
        </div>
      )}
      {error && <ErrorText>{error}</ErrorText>}
      <button type="button" className="ui-link" onClick={async () => { clearLocal(); await supabase().auth.signOut(); location.href = "/"; }}>Çıkış yap</button>
    </main>
  );
}

"use client";
import { useState } from "react";
import { BottomNav, Card, PageHeader, ChoiceButton, Counter, DoneCard, MainButton, StatusPill, WarningCard } from "@/core/ui";
import { useBusiness } from "@/core/auth/AuthGate";
import { navItems } from "../nav";

// Şimdilik örnek verilerle (Supabase bağlantısı giriş ekranından sonra gelecek).
const tarlalar = ["Hasan Ağa", "Fatma Hanım", "Mehmet Bey"];
const arabalar = ["45 ABC 101", "45 DEF 202"];
type Kayit = { tarla: string; kisi: number; araba: string };

export default function Bugun() {
  useBusiness();
  const bugun = new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", weekday: "long", timeZone: "Europe/Istanbul" });
  const [kayitlar, setKayitlar] = useState<Kayit[]>([
    { tarla: "Hasan Ağa", kisi: 14, araba: "45 ABC 101" },
    { tarla: "Fatma Hanım", kisi: 4, araba: "45 DEF 202" },
  ]);
  const [adim, setAdim] = useState(0); // 0 kapalı, 1 tarla, 2 kişi, 3 araba
  const [tarla, setTarla] = useState(tarlalar[0]);
  const [kisi, setKisi] = useState(10);
  const [onay, setOnay] = useState("");
  const [uyariKapandi, setUyariKapandi] = useState(false);

  const kaydet = (araba: string) => {
    setKayitlar([...kayitlar, { tarla, kisi, araba }]);
    setOnay(`Kaydettim: ${tarla}, ${kisi} kişi, ${araba} arabası.`);
    setAdim(0);
  };
  const toplam = kayitlar.reduce((t, k) => t + k.kisi, 0);

  return (
    <main className="ui-has-nav" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
<PageHeader sub={bugun} title="Bugün" right={<span className="ui-pill ornek">Örnek</span>} />

      {adim === 0 && (
        <>
          {!uyariKapandi && (
            <WarningCard text="45 DEF 202 arabasının izin kâğıdının süresi geçmiş. Bu arabayla işçi taşıma, ceza yazılır."
              action="Kâğıdı yeniledim" onAction={() => setUyariKapandi(true)} />
          )}
          {onay && <DoneCard message={onay} onUndo={() => { setKayitlar(kayitlar.slice(0, -1)); setOnay(""); }} />}
          <Card>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--sessiz2)" }}>Bugün işe giden</div>
            <div style={{ fontSize: 40, fontWeight: 800 }}>{toplam} kişi</div>
          </Card>
          {kayitlar.map((k, i) => (
            <Card key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{k.tarla}</div>
                  <div style={{ fontSize: 15, color: "var(--sessiz2)" }}>{k.araba}</div>
                </div>
                <StatusPill status="tamam">{k.kisi} kişi</StatusPill>
              </div>
            </Card>
          ))}
          <MainButton onClick={() => { setOnay(""); setAdim(1); }}>+ Bugünün kaydını ekle</MainButton>
        </>
      )}

      {adim === 1 && (
        <>
          <h2 style={{ fontSize: 24, margin: "4px 4px 0" }}>Hangi tarlaya gittiniz?</h2>
          {tarlalar.map((t) => (
            <ChoiceButton key={t} selected={t === tarla} onClick={() => { setTarla(t); setAdim(2); }}>{t}</ChoiceButton>
          ))}
          <MainButton secondary onClick={() => setAdim(0)}>Vazgeç</MainButton>
        </>
      )}

      {adim === 2 && (
        <>
          <h2 style={{ fontSize: 24, margin: "4px 4px 0" }}>{tarla}: kaç kişi gitti?</h2>
          <Card><Counter value={kisi} onChange={setKisi} min={1} max={60} unit="kişi" /></Card>
          <MainButton onClick={() => setAdim(3)}>Devam</MainButton>
          <MainButton secondary onClick={() => setAdim(1)}>Geri</MainButton>
        </>
      )}

      {adim === 3 && (
        <>
          <h2 style={{ fontSize: 24, margin: "4px 4px 0" }}>Hangi arabayla?</h2>
          {arabalar.map((a) => (
            <ChoiceButton key={a} onClick={() => kaydet(a)}>{a}</ChoiceButton>
          ))}
          <MainButton secondary onClick={() => setAdim(2)}>Geri</MainButton>
        </>
      )}

      <BottomNav items={navItems} current="/" />
    </main>
  );
}

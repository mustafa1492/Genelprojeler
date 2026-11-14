"use client";
import { useEffect, useRef, useState } from "react";
import { dinle, sesVarMi } from "@/core/expenses/ses";

/** "🎤 Söyleyerek yaz": telefonun ses tanımasıyla bir cümle alır. Desteklemeyen tarayıcıda hiç görünmez. Küçük, ikincil seçenek. */
export function SesDugmesi({ ornek, onMetin }: { ornek: string; onMetin: (metin: string) => void }) {
  const [var_, setVar] = useState(false);
  useEffect(() => setVar(sesVarMi()), []);
  const [durum, setDurum] = useState<"bos" | "dinliyor" | { hata: string }>("bos");
  const dur = useRef<(() => void) | null>(null);
  useEffect(() => () => dur.current?.(), []);
  if (!var_) return null;
  if (durum === "dinliyor") return (
    <div className="ui-ses dinliyor" role="status"><span aria-hidden="true">🎤</span>Dinliyorum… şimdi söyle
      <button type="button" className="ui-link inline" onClick={() => { dur.current?.(); setDurum("bos"); }}>Vazgeç</button></div>
  );
  return (
    <>
      <button type="button" className="ui-ses" onClick={() => {
        setDurum("dinliyor");
        dur.current = dinle((m) => { setDurum("bos"); onMetin(m); },
          (n) => setDurum({ hata: n === "izin" ? "Mikrofon izni verilmedi. Telefonun ayarından bu siteye mikrofon izni verebilirsin." : n === "internet" ? "Ses için internet lazım. Elle yazabilirsin." : "Duyamadım. Tekrar dene ya da elle yaz." }));
      }}><span aria-hidden="true">🎤</span>Söyleyerek yaz<small>Örnek: “{ornek}”</small></button>
      {typeof durum === "object" && <p className="ui-note" role="status">{durum.hata}</p>}
    </>
  );
}

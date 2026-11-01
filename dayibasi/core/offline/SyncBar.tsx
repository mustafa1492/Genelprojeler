"use client";
import { useEffect, useState } from "react";
import { clearFailed, flush, status, subscribe } from "./store";

/** Üstte ince şerit: internet yok / gönderilmeyi bekleyen kayıt / gönderilemeyen kayıt. */
export function SyncBar() {
  const [st, setSt] = useState(() => ({ pending: 0, failed: 0, online: true }));
  useEffect(() => {
    const up = () => setSt({ ...status(), online: navigator.onLine });
    up();
    const un = subscribe(up);
    window.addEventListener("online", up); window.addEventListener("offline", up);
    return () => { un(); window.removeEventListener("online", up); window.removeEventListener("offline", up); };
  }, []);

  if (st.failed) {
    return (
      <div className="ui-sync gecti" role="alert">
        <span>{st.failed} kayıt gönderilemedi (bilgi hatalı ya da kayıt silinmiş). Geçmiş’ten kontrol et.</span>
        <button type="button" onClick={clearFailed}>Tamam</button>
      </div>
    );
  }
  if (!st.online || st.pending) {
    return (
      <div className="ui-sync yakin" role="status">
        <span>
          {!st.online ? "İnternet yok. " : ""}
          {st.pending ? `${st.pending} kayıt telefonda bekliyor, internet gelince kendiliğinden gönderilecek.` : "Yaptıkların telefonda saklanır."}
        </span>
        {st.online && st.pending > 0 && <button type="button" onClick={() => flush()}>Şimdi gönder</button>}
      </div>
    );
  }
  return null;
}

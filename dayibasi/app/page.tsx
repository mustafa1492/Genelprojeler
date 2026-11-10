import type { Metadata } from "next";
import { aciklama, baslik, ogResim, TanitimSayfasi } from "./tanitim/Tanitim";
import { GirisliyseUygulamaya } from "./tanitim/GirisliyseUygulamaya";

// Ana sayfa: tanıtım sitesi. Giriş yapmış kişi (ör. ana ekrana eklenmiş eski uygulama) doğrudan uygulamaya gider.
export const metadata: Metadata = {
  title: baslik,
  description: aciklama,
  openGraph: { title: baslik, description: aciklama, siteName: "Çiftçi Defteri", locale: "tr_TR", type: "website", images: [ogResim] },
};

export default function Page() {
  return <><GirisliyseUygulamaya /><TanitimSayfasi /></>;
}

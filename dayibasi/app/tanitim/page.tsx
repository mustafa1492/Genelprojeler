import type { Metadata } from "next";
import { aciklama, baslik, ogResim, TanitimSayfasi } from "./Tanitim";

// Ana sayfanın (/) kopyası; girişli kullanıcılar da buradan siteyi görebilsin diye yönlendirme yok.
export const metadata: Metadata = {
  title: baslik,
  description: aciklama,
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
  openGraph: { title: baslik, description: aciklama, siteName: "Çiftçi Defteri", locale: "tr_TR", type: "website", images: [ogResim] },
};

export default function Page() {
  return <TanitimSayfasi />;
}

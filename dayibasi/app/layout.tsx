import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { RegisterSW } from "@/core/offline/RegisterSW";

const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Çiftçi Defteri",
  description: "Tarla, masraf, gelir ve hasat defteri",
  openGraph: { title: "Çiftçi Defteri", description: "Tarla, masraf, gelir ve hasat defteri", siteName: "Çiftçi Defteri", locale: "tr_TR", type: "website" },
  appleWebApp: { capable: true, title: "Çiftçi Defteri", statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png", icon: "/icon-192.png" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, themeColor: "#2E6A2B" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={manrope.className}>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}

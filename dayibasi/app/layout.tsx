import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { RegisterSW } from "@/core/offline/RegisterSW";

const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Dayıbaşı",
  description: "Ekip, araba ve alacak takibi",
  appleWebApp: { capable: true, title: "Dayıbaşı", statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png", icon: "/icon-192.png" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#2E6A2B" };

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

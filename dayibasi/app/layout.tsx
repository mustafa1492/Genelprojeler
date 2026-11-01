import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["500", "600", "700", "800"] });

export const metadata: Metadata = { title: "Dayıbaşı", description: "Ekip, araba ve alacak takibi" };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#3B6B2C" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={manrope.className}>{children}</body>
    </html>
  );
}

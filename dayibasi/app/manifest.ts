import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dayıbaşı",
    short_name: "Dayıbaşı",
    description: "Ekip, araba ve alacak takibi",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F3EE",
    theme_color: "#3B6B2C",
    lang: "tr",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

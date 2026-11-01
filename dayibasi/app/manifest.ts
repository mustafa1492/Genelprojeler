import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dayıbaşı",
    short_name: "Dayıbaşı",
    description: "Ekip, araba ve alacak takibi",
    start_url: "/",
    display: "standalone",
    background_color: "#EEF2ED",
    theme_color: "#2E6A2B",
    lang: "tr",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

import type { Metadata } from "next";
import Panel from "@/products/panel/Panel";
import "@/products/panel/panel.css";

export const metadata: Metadata = { title: "Yönetim · Çiftçi Defteri", robots: { index: false, follow: false } };
export default function Page() { return <Panel />; }

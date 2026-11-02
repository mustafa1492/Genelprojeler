import { AuthGate } from "@/core/auth/AuthGate";
import { config } from "@/products/ciftci/config";

export const metadata = { title: "Çiftçi Defteri" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthGate product={config.product} texts={config.texts} otherHomes={{ dayibasi: "/" }}>{children}</AuthGate>;
}

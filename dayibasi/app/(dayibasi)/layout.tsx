import { AuthGate } from "@/core/auth/AuthGate";
import { config } from "@/products/dayibasi/config";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthGate product={config.product} texts={config.texts} otherHomes={{ ciftci: "/ciftci" }}>{children}</AuthGate>;
}

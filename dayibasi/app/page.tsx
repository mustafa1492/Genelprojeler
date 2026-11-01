import { AuthGate } from "@/core/auth/AuthGate";
import { config } from "@/products/dayibasi/config";
import Bugun from "@/products/dayibasi/screens/Bugun";

export default function Page() {
  return (
    <AuthGate product={config.product} texts={config.texts}>
      <Bugun />
    </AuthGate>
  );
}

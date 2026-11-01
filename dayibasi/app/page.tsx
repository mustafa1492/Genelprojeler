import { config } from "@/products/dayibasi/config";

export default function Home() {
  return (
    <main>
      <h1>{config.screens.bugun}</h1>
      <p>Kurulum tamam. Ekranlar sırayla gelecek.</p>
    </main>
  );
}

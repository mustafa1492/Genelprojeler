import { PageHeader } from "@/core/ui";

// TASLAK: Bir avukata / KVKK danışmanına gösterilmeden yayına alınmamalı.
export default function Page() {
  return (
    <main className="ui-stack" style={{ fontSize: "0.944rem", lineHeight: 1.5 }}>
      <PageHeader sub="Aydınlatma metni (taslak)" title="Kişisel veriler" />
      <div className="ui-card ui-stack" style={{ gap: 10 }}>
        <p style={{ margin: 0 }}><b>Ne tutuyoruz?</b> Dayıbaşının girdiği işçi, şoför ve çiftçilerin adı, telefonu, köyü, yaptığı işler, çalıştığı günler, avans ve ödemeleri.</p>
        <p style={{ margin: 0 }}><b>Neden?</b> Dayıbaşının ekibini, arabalarını ve alacaklarını takip edebilmesi için.</p>
        <p style={{ margin: 0 }}><b>Kim görür?</b> Yalnızca o bilgiyi giren dayıbaşı. Başka dayıbaşı göremez, kimseyle paylaşılmaz, satılmaz.</p>
        <p style={{ margin: 0 }}><b>Nerede durur?</b> Avrupa’daki (Frankfurt) güvenli sunucularda.</p>
        <p style={{ margin: 0 }}><b>Silinmesini istersen:</b> Dayıbaşına söyle; kişi kartından “Bilgilerini tamamen sil” ile hepsi kalıcı olarak silinir.</p>
      </div>
      <a className="ui-link" href="/" style={{ textAlign: "center" }}>Geri dön</a>
    </main>
  );
}

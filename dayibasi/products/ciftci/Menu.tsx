"use client";
import { useGo } from "@/core/shell/TabShell";
import { MODULLER, useModul } from "./modul";

type T = { id: string; label: string; emoji?: string };

const URETIM = ["tarlalar", "fidan", "depo", "makineler"];
const PARA: [string, string][] = [["masraf", "Masraf"], ["gelir", "Gelir"], ["rapor", "Sezon raporu ve kâr"], ["vadeler", "Borç ve vadeler"]];
const DEFTER: [string, string][] = [["takvim", "Takvim ve hatırlatmalar"], ["kayitlar", "Kayıtlar ve geçmiş"], ["belgeler", "Belgeler"], ["fotograflar", "Fotoğraflar (fişler)"]];

/** Alt çubuktaki "Menü" tuşunun açtığı sayfa: bütün bölümler gruplu. Sadece kişinin görebildikleri çıkar. */
export default function Menu({ tabs }: { tabs: T[] }) {
  const go = useGo();
  const has = (id: string) => tabs.some((t) => t.id === id);
  const tab = (id: string) => tabs.find((t) => t.id === id)!;
  const uretim = URETIM.filter(has);
  const para = PARA.filter(([id]) => has(id));
  const defter = DEFTER.filter(([id]) => has(id));
  const link = (id: string, label: string) => (
    <a key={id} href="#" onClick={(e) => { e.preventDefault(); go(id); }}><div>{label}</div><i aria-hidden="true">›</i></a>
  );
  const { modul, moduller, sec } = useModul();
  return (
    <>
      {moduller.length > 1 && <button type="button" className="mn-bolum" onClick={sec}><span><small>Şu an açık bölüm</small><b>{MODULLER[modul].ad}</b></span><em>Bölüm değiştir ⇄</em></button>}
      {uretim.length > 0 && (
        <div className="mn-grp"><span>Tarla ve üretim</span>
          <div className="mn-kare">
            {uretim.map((id) => <a key={id} href="#" onClick={(e) => { e.preventDefault(); go(id); }}><em aria-hidden="true">{tab(id).emoji}</em>{tab(id).label}</a>)}
          </div>
        </div>
      )}
      {para.length > 0 && <div className="mn-grp"><span>Para</span><div className="mn-liste">{para.map(([id, l]) => link(id, l))}</div></div>}
      {defter.length > 0 && <div className="mn-grp"><span>Defter</span><div className="mn-liste">{defter.map(([id, l]) => link(id, l))}</div></div>}
      <button type="button" className="mn-ayar" onClick={() => go("ayarlar")}>
        <span aria-hidden="true">⚙️</span>Ayarlar<small>aile, listeler, görünüm</small>
      </button>
    </>
  );
}

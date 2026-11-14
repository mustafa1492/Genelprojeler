"use client";
import { useState } from "react";
import { Pick, TextField } from "@/core/ui";
import { katalogAdi, URUNLER } from "./urunler";

const BASKA = "__baska__";

/** Ürün seçimi: önce ortak listeden; listede yoksa "Başka ürün" ile yazılır. Eski serbest yazılar olduğu gibi gösterilir. */
export function UrunSec({ id, label, value, onChange, bos = "Seçilmedi" }: { id: string; label: string; value: string; onChange: (v: string) => void; bos?: string }) {
  const resmi = katalogAdi(value);
  const [yazSecildi, setYaz] = useState(false);
  const yaz = yazSecildi || (!!value.trim() && !resmi);   // listede olmayan eski yazı da düzenlenebilir görünür
  const options = [
    { value: null, label: bos },
    ...URUNLER.map((u) => ({ value: u.ad, label: u.ad, hint: u.grup })),
    { value: BASKA, label: "Başka ürün (kendim yazayım)" },
  ];
  return (
    <div className="ui-stack" style={{ gap: 8 }}>
      <Pick label={label} options={options} value={yaz ? BASKA : resmi}
        onChange={(v) => { if (v === BASKA) { setYaz(true); } else { setYaz(false); onChange(v ?? ""); } }} />
      {yaz && <TextField id={id} label="Ürünün adı" placeholder="Örnek: Kekik" maxLength={40} value={value} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

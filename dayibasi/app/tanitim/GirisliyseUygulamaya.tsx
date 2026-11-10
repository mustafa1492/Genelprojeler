"use client";
import { useEffect } from "react";

/** Oturum çerezi varsa (giriş yapılmış) ana sayfadan uygulamaya geç. Sitenin kendisi /tanitim'de de açılır. */
export function GirisliyseUygulamaya() {
  useEffect(() => {
    if (/(^|; )sb-[^=]+-auth-token(\.0)?=/.test(document.cookie)) location.replace("/ciftci");
  }, []);
  return null;
}

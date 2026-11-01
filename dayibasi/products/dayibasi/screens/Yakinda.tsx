"use client";
import { BottomNav, PageHeader } from "@/core/ui";
import { navItems } from "../nav";

export default function Yakinda({ title, sub, href }: { title: string; sub: string; href: string }) {
  return (
    <main className="ui-has-nav ui-stack">
      <PageHeader sub={sub} title={title} />
      <div className="ui-empty">Bu bölüm yakında gelecek.</div>
      <BottomNav items={navItems} current={href} />
    </main>
  );
}

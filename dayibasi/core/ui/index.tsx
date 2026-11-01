"use client";
import Link from "next/link";
import "./ui.css";

type Btn = React.ButtonHTMLAttributes<HTMLButtonElement>;

/** Ekranın tek büyük ana düğmesi. */
export function MainButton({ secondary, className = "", ...p }: Btn & { secondary?: boolean }) {
  return <button type="button" className={`ui-main-btn ${secondary ? "ikincil" : ""} ${className}`} {...p} />;
}

/** Listeden seçim düğmesi (tarla, araba...). */
export function ChoiceButton({ selected, ...p }: Btn & { selected?: boolean }) {
  return <button type="button" className="ui-choice" aria-pressed={!!selected} {...p} />;
}

/** Yuvarlak etiket seçimi (Zeytin, Budama...). */
export function Chip({ selected, ...p }: Btn & { selected?: boolean }) {
  return <button type="button" className="ui-chip" aria-pressed={!!selected} {...p} />;
}

/** − / + sayaç: klavyesiz sayı girişi. */
export function Counter({ value, onChange, min = 0, max = 999, step = 1, unit }: {
  value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number; unit?: string;
}) {
  return (
    <div className="ui-counter">
      <button type="button" aria-label="Azalt" disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))}>−</button>
      <output aria-live="polite">{value}{unit && <small>{unit}</small>}</output>
      <button type="button" aria-label="Artır" disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))}>+</button>
    </div>
  );
}

export type Status = "tamam" | "yakin" | "gecti" | "bekliyor";

/** Durum etiketi: renk her zaman yazıyla birlikte. */
export function StatusPill({ status, children }: { status: Status; children: React.ReactNode }) {
  return <span className={`ui-pill ${status}`}>{children}</span>;
}

/** Uyarı kartı: simge + düz cümle + yapılacak iş. */
export function WarningCard({ level = "gecti", text, action, onAction }: {
  level?: "gecti" | "yakin"; text: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className={`ui-warn ${level}`} role="alert">
      <div className="ui-warn-row">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
        </svg>
        <span>{text}</span>
      </div>
      {action && <MainButton onClick={onAction}>{action}</MainButton>}
    </div>
  );
}

/** Sayfa başlığı: üstte küçük alt yazı, altında büyük başlık, sağda isteğe bağlı düğme. */
export function PageHeader({ sub, title, right }: { sub?: string; title: string; right?: React.ReactNode }) {
  return (
    <header className="ui-header">
      <div>
        {sub && <small>{sub}</small>}
        <h1>{title}</h1>
      </div>
      {right}
    </header>
  );
}

/** Kişi satırı: baş harfler + ad + alt yazı + sağda etiket. */
export function PersonRow({ name, sub, right }: { name: string; sub?: string; right?: React.ReactNode }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toLocaleUpperCase("tr")).join("");
  return (
    <div className="ui-person">
      <div className="ui-avatar" aria-hidden="true">{initials}</div>
      <div className="ui-person-text">
        <b>{name}</b>
        {sub && <span>{sub}</span>}
      </div>
      {right}
    </div>
  );
}

/** İşlemden sonra düz cümleyle onay + geri alma. */
export function DoneCard({ message, onUndo }: { message: string; onUndo?: () => void }) {
  return (
    <div className="ui-done" role="status">
      <span aria-hidden="true">✓</span>
      <p>{message}</p>
      {onUndo && <button type="button" onClick={onUndo}>Geri al</button>}
    </div>
  );
}

export function Card({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return onClick
    ? <button type="button" className="ui-card" onClick={onClick}>{children}</button>
    : <div className="ui-card">{children}</div>;
}

export type NavItem = { href: string; label: string; icon: React.ReactNode };

/** Alt menü (4 sekme). */
export function BottomNav({ items, current }: { items: NavItem[]; current: string }) {
  return (
    <nav className="ui-nav" aria-label="Ana menü">
      {items.map((it) => (
        <Link key={it.href} href={it.href} aria-current={current === it.href ? "page" : undefined}>
          {it.icon}
          <span>{it.label}</span>
        </Link>
      ))}
    </nav>
  );
}

/** Yazı kutusu (yalnızca gerçekten gerekince). */
export function TextField({ label, ...p }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="ui-field">
      {label}
      <input {...p} />
    </label>
  );
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  return <div className="ui-error" role="alert">{children}</div>;
}

const phoneIcon = <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />;
const waIcon = <path d="M3 21l1.6-4.7A8.5 8.5 0 1 1 8 19.6L3 21z" />;
export const Icon = ({ d, size = 24 }: { d: React.ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);

/** Büyük "Ara" ve "WhatsApp" düğmeleri. */
export function ContactButtons({ tel, wa }: { tel: string; wa: string }) {
  return (
    <div className="ui-contact">
      <a className="ara" href={tel}><Icon d={phoneIcon} />Ara</a>
      <a className="wa" href={wa} target="_blank" rel="noreferrer"><Icon d={waIcon} />WhatsApp</a>
    </div>
  );
}

/** Kartın yanındaki yuvarlak hızlı arama düğmesi. */
export function CallIconButton({ href, name }: { href: string; name: string }) {
  return <a className="ui-iconbtn" href={href} aria-label={`${name} ara`} onClick={(e) => e.stopPropagation()}><Icon d={phoneIcon} /></a>;
}

export function BackButton({ onClick, label = "Geri" }: { onClick: () => void; label?: string }) {
  return <button type="button" className="ui-back" onClick={onClick}><Icon d={<path d="m15 18-6-6 6-6" />} />{label}</button>;
}

/** Bilgi satırları: sol etiket, sağ değer. */
export function InfoRows({ rows }: { rows: [string, React.ReactNode][] }) {
  return <div className="ui-rows">{rows.map(([k, v]) => <div key={k}><span>{k}</span><span>{v}</span></div>)}</div>;
}

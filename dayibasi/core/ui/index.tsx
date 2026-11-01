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

/** Uyarı kartı: "İzin kâğıdının süresi geçmiş" + yapılacak iş. */
export function WarningCard({ level = "gecti", title, text, action, onAction }: {
  level?: "gecti" | "yakin"; title: string; text?: string; action?: string; onAction?: () => void;
}) {
  return (
    <div className={`ui-warn ${level}`} role="alert">
      <b>{title}</b>
      {text && <p>{text}</p>}
      {action && <MainButton secondary onClick={onAction}>{action}</MainButton>}
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

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="ui-card">{children}</div>;
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

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-surface/70 border border-line/10 shadow-sm ${className}`}>{children}</div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-sage text-white active:bg-[#4d664b]",
  secondary: "bg-sage-soft text-ink active:bg-sage-soft-active",
  ghost: "bg-transparent text-ink-soft active:bg-line/5",
  danger: "bg-clay-soft text-rust-text active:bg-clay-soft-active",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-medium transition-colors disabled:opacity-40 ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    // pr-16 reserves room for the fixed launcher button in the top-right
    // corner of the app shell — without it, a long title (e.g.
    // "Post-Therapy Check-In") runs underneath and clips behind it.
    <div className="pl-5 pr-16 pt-6 pb-2">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
    </div>
  );
}

export function Pill({
  active,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      aria-pressed={active}
      className={`whitespace-nowrap shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active ? "bg-sage text-white" : "bg-surface/70 text-ink-soft border border-line/5"
      }`}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * A destructive action that requires a second tap to confirm — first tap
 * turns the button into "Confirm delete?" for a few seconds; tapping again
 * while armed actually deletes. Reverts on its own if left alone.
 */
export function ConfirmDeleteButton({
  onConfirm,
  label = "Delete",
  className = "",
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "children"> & {
  onConfirm: () => void;
  label?: string;
}) {
  const [armed, setArmed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return (
    <button
      onClick={() => {
        if (armed) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setArmed(false);
          onConfirm();
          return;
        }
        setArmed(true);
        timeoutRef.current = setTimeout(() => setArmed(false), 3000);
      }}
      className={`${armed ? "font-medium text-rust-text" : "text-ink-soft"} ${className}`}
      {...rest}
    >
      {armed ? "Tap again to confirm" : label}
    </button>
  );
}

import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ScanLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const link = "rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground";
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <ScanLine className="h-4 w-4" aria-hidden />
          </span>
          LabelLens
        </Link>
        <nav className="flex items-center gap-1" aria-label="Main">
          <Link to="/history" className={cn(link, "hidden sm:inline-flex")} activeProps={{ className: "text-foreground" }}>
            History
          </Link>
          {email ? (
            <>
              <span className="hidden max-w-40 truncate text-sm text-muted-foreground sm:inline" title={email}>{email}</span>
              <button type="button" onClick={handleLogout} className={link}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={link} activeProps={{ className: "text-foreground" }}>
                Log in
              </Link>
              <Link to="/signup" className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 py-8 text-center text-xs text-muted-foreground">
      LabelLens is an informational tool and not medical advice. Analysis covers personal-care ingredients only.
    </footer>
  );
}

export function Page({ title, eyebrow, intro, children, wide }: { title: string; eyebrow?: string; intro?: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <main className={cn("mx-auto w-full px-4 py-10 sm:px-6 sm:py-14 animate-in fade-in slide-in-from-bottom-2 duration-500", wide ? "max-w-5xl" : "max-w-3xl")}>
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
      <h1 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">{title}</h1>
      {intro && <div className="mt-3 max-w-2xl text-base text-muted-foreground">{intro}</div>}
      <div className="mt-8">{children}</div>
    </main>
  );
}

export function DemoBadge({ children = "Demo data" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-warning/40 bg-warning/15 px-2.5 py-0.5 text-xs font-medium text-warning-foreground">
      {children}
    </span>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <div role="note" className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
      {children}
    </div>
  );
}

export function Steps({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Add label", "Review", "Results"];
  return (
    <ol className="mb-8 flex items-center gap-2 text-xs sm:text-sm" aria-label="Progress">
      {steps.map((s, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <li key={s} className="flex items-center gap-2">
            <span
              aria-current={active ? "step" : undefined}
              className={cn(
                "grid h-6 w-6 place-items-center rounded-full border text-xs font-semibold",
                active && "border-primary bg-primary text-primary-foreground",
                done && "border-primary bg-accent text-primary",
                !active && !done && "border-border text-muted-foreground",
              )}
            >
              {n}
            </span>
            <span className={active ? "font-medium text-foreground" : "text-muted-foreground"}>{s}</span>
            {n < 3 && <span className="mx-1 h-px w-6 bg-border sm:w-10" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

export function CategoryToggle({ value, onChange }: { value: "food" | "personal-care"; onChange: (v: "food" | "personal-care") => void }) {
  const opts = [
    { v: "food" as const, label: "Food" },
    { v: "personal-care" as const, label: "Personal care" },
  ];
  return (
    <div role="radiogroup" aria-label="Product category" className="inline-flex rounded-full border border-border bg-card p-1">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            "rounded-full px-4 py-2 text-sm font-medium transition-colors",
            value === o.v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-soft transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
export const inputCls =
  "w-full rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40";

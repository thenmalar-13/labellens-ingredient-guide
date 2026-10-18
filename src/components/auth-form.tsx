import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Notice, btnPrimary, inputCls } from "@/components/site";

type Status = { kind: "idle" } | { kind: "error"; message: string } | { kind: "success"; message: string };

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus({ kind: "idle" });
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setStatus({
          kind: "success",
          message: "Account created. Check your inbox for a confirmation link — you'll need to click it before logging in.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:py-20 animate-in fade-in duration-500">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <h1 className="font-display text-3xl font-semibold text-foreground">{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{isSignup ? "Save scans and revisit results anytime." : "Log in to see your saved scans."}</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {isSignup && (
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
              <input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
            <input id="password" type="password" required minLength={8} autoComplete={isSignup ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
          </div>
          <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
            {loading ? (isSignup ? "Creating account…" : "Logging in…") : isSignup ? "Sign up" : "Log in"}
          </button>
          {status.kind === "error" && (
            <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{status.message}</p>
          )}
          {status.kind === "success" && (
            <p role="status" className="rounded-xl border border-primary/40 bg-accent px-4 py-3 text-sm text-foreground">{status.message}</p>
          )}
        </form>
        {!isSignup && (
          <p className="mt-4 text-center text-sm">
            <Link to="/forgot-password" className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Forgot your password?</Link>
          </p>
        )}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignup ? "Already have an account? " : "New to LabelLens? "}
          <Link to={isSignup ? "/login" : "/signup"} className="font-medium text-primary underline-offset-4 hover:underline">{isSignup ? "Log in" : "Sign up"}</Link>
        </p>
      </div>
    </main>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus({ kind: "idle" });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setStatus({ kind: "success", message: "If an account exists for that email, we've sent a password reset link. Check your inbox." });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:py-20 animate-in fade-in duration-500">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <h1 className="font-display text-3xl font-semibold text-foreground">Reset your password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter your account email and we'll send you a reset link.</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="reset-email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
            <input id="reset-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
            {loading ? "Sending…" : "Send reset link"}
          </button>
          {status.kind === "error" && (
            <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{status.message}</p>
          )}
          {status.kind === "success" && (
            <p role="status" className="rounded-xl border border-primary/40 bg-accent px-4 py-3 text-sm text-foreground">{status.message}</p>
          )}
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">Log in</Link>
        </p>
      </div>
    </main>
  );
}

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setStatus({ kind: "error", message: "Passwords don't match." });
      return;
    }
    setLoading(true);
    setStatus({ kind: "idle" });
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setStatus({ kind: "success", message: "Password updated. You're now logged in." });
      setTimeout(() => navigate({ to: "/" }), 1200);
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:py-20 animate-in fade-in duration-500">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <h1 className="font-display text-3xl font-semibold text-foreground">Choose a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground">This page only works when opened from the reset link in your email.</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-foreground">New password</label>
            <input id="new-password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-foreground">Confirm new password</label>
            <input id="confirm-password" type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputCls} />
          </div>
          <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
            {loading ? "Updating…" : "Update password"}
          </button>
          {status.kind === "error" && (
            <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{status.message}</p>
          )}
          {status.kind === "success" && (
            <p role="status" className="rounded-xl border border-primary/40 bg-accent px-4 py-3 text-sm text-foreground">{status.message}</p>
          )}
        </form>
      </div>
    </main>
  );
}

export { Notice };

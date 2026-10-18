import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Notice, btnPrimary, inputCls } from "@/components/site";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [submitted, setSubmitted] = useState(false);
  const isSignup = mode === "signup";
  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:py-20 animate-in fade-in duration-500">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <h1 className="font-display text-3xl font-semibold text-foreground">{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{isSignup ? "Save scans and revisit results anytime." : "Log in to see your saved scans."}</p>
        <div className="mt-5"><Notice><strong>UI only.</strong> Accounts aren't connected yet — nothing you enter is sent or saved.</Notice></div>
        <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
          {isSignup && (
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
              <input id="name" autoComplete="name" className={inputCls} />
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
            <input id="email" type="email" required autoComplete="email" className={inputCls} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
            <input id="password" type="password" required minLength={8} autoComplete={isSignup ? "new-password" : "current-password"} className={inputCls} />
          </div>
          <button type="submit" className={`${btnPrimary} w-full`}>{isSignup ? "Sign up" : "Log in"}</button>
          {submitted && <p role="status" className="text-center text-sm text-muted-foreground">Sign-in isn't connected yet — this is a design preview.</p>}
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignup ? "Already have an account? " : "New to LabelLens? "}
          <Link to={isSignup ? "/login" : "/signup"} className="font-medium text-primary underline-offset-4 hover:underline">{isSignup ? "Log in" : "Sign up"}</Link>
        </p>
      </div>
    </main>
  );
}

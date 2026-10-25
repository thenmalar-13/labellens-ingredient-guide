import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AlertTriangle, BookOpen, ExternalLink, Gauge, Target } from "lucide-react";
import type { ReactNode } from "react";
import { Notice, Page, Steps, btnGhost, btnPrimary } from "@/components/site";
import { resetDraft, useDraft } from "@/lib/scan-store";
import { useSessionState } from "@/hooks/use-session";
import { createScan } from "@/lib/scans.functions";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results — LabelLens" },
      { name: "description", content: "Ingredient purpose, evidence summary, concerns, confidence and sources." },
      { property: "og:title", content: "Results — LabelLens" },
      { property: "og:description", content: "Ingredient purpose, evidence summary, concerns, confidence and sources." },
    ],
  }),
  component: ResultsPage,
});

function Field({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{icon}{label}</dt>
      <dd className="mt-1 text-sm text-muted-foreground italic">{children}</dd>
    </div>
  );
}

function ResultsPage() {
  const draft = useDraft();
  const session = useSessionState();
  const queryClient = useQueryClient();
  const saveScan = useServerFn(createScan);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const items = draft.ingredients;

  const saveMutation = useMutation({
    mutationFn: (vars: { category: "food" | "personal-care"; ingredients: string[] }) => saveScan({ data: vars }),
    onSuccess: () => {
      setSaveState("saved");
      queryClient.invalidateQueries({ queryKey: ["scans"] });
    },
    onError: () => setSaveState("error"),
  });

  if (items.length === 0) {
    return (
      <Page title="No results yet" intro="Add and review an ingredient list first.">
        <Link to="/paste" className={btnPrimary}>Paste ingredients</Link>
      </Page>
    );
  }

  return (
    <Page wide eyebrow={draft.category === "food" ? "Food" : "Personal care"} title={`${items.length} ingredient${items.length === 1 ? "" : "s"} reviewed`}>
      <Steps current={3} />
      <Notice>
        <strong>Preview layout only.</strong> Ingredient analysis isn't connected yet, so no purpose, evidence, concern, or confidence information is shown. Nothing on this page is a scientific assessment.
      </Notice>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((name, i) => (
          <article key={i} className="rounded-2xl border border-border bg-card p-5 shadow-soft animate-in fade-in slide-in-from-bottom-1 duration-500" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
            <header className="flex items-start justify-between gap-3">
              <h2 className="font-display text-xl font-semibold text-foreground">{name}</h2>
              <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">Not analyzed</span>
            </header>
            <dl className="mt-4 grid gap-4">
              <Field icon={<Target className="h-3.5 w-3.5" aria-hidden />} label="Purpose">Awaiting analysis</Field>
              <Field icon={<BookOpen className="h-3.5 w-3.5" aria-hidden />} label="Evidence summary">Awaiting analysis</Field>
              <Field icon={<AlertTriangle className="h-3.5 w-3.5" aria-hidden />} label="Potential concerns">Awaiting analysis</Field>
              <div className="grid grid-cols-2 gap-4">
                <Field icon={<Gauge className="h-3.5 w-3.5" aria-hidden />} label="Confidence">
                  <span className="mt-1 flex gap-1 not-italic" aria-label="Confidence not available">
                    {[0, 1, 2].map((d) => <span key={d} className="h-1.5 w-6 rounded-full bg-muted" />)}
                  </span>
                </Field>
                <Field icon={<ExternalLink className="h-3.5 w-3.5" aria-hidden />} label="Sources">None yet</Field>
              </div>
            </dl>
          </article>
        ))}
      </div>
      <section aria-label="Save this scan" className="mt-8 rounded-2xl border border-border bg-card p-5">
        {session === "signed-in" ? (
          saveState === "saved" ? (
            <p className="text-sm text-foreground" role="status">
              Saved to your history. <Link to="/history" className="font-medium text-primary underline underline-offset-2">View history</Link>
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  className={btnPrimary}
                  disabled={saveMutation.isPending}
                  onClick={() => saveMutation.mutate({ category: draft.category, ingredients: items })}
                >
                  {saveMutation.isPending ? "Saving…" : "Save scan"}
                </button>
                <p className="text-sm text-muted-foreground">Saves the ingredient list you reviewed, private to your account.</p>
              </div>
              {saveState === "error" && (
                <p role="alert" className="mt-3 text-sm text-destructive">
                  Couldn't save this scan — nothing was saved. Please try again.
                </p>
              )}
            </>
          )
        ) : session === "signed-out" ? (
          <p className="text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-primary underline underline-offset-2">Sign in</Link>{" "}
            to save this scan to your private history. Without an account, scans stay on this page only.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground" role="status">Checking your sign-in status…</p>
        )}
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Link to="/review" className={btnGhost}>Edit ingredients</Link>
        <Link to="/" onClick={() => resetDraft()} className={btnPrimary}>Start a new scan</Link>
      </div>
    </Page>
  );
}

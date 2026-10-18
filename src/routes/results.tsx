import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, BookOpen, ExternalLink, Gauge, Target } from "lucide-react";
import type { ReactNode } from "react";
import { DemoBadge, Notice, Page, Steps, btnGhost, btnPrimary } from "@/components/site";
import { resetDraft, useDraft } from "@/lib/scan-store";

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
  const items = draft.ingredients;

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
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Link to="/review" className={btnGhost}>Edit ingredients</Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="self-center"><DemoBadge>Saving requires an account</DemoBadge></span>
          <Link to="/" onClick={() => resetDraft()} className={btnPrimary}>Start a new scan</Link>
        </div>
      </div>
    </Page>
  );
}

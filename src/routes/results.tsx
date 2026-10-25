import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AlertTriangle, BookOpen, ExternalLink, Gauge, RefreshCw, Target } from "lucide-react";
import type { ReactNode } from "react";
import { Notice, Page, Steps, btnGhost, btnPrimary } from "@/components/site";
import { resetDraft, useDraft } from "@/lib/scan-store";
import { useSessionState } from "@/hooks/use-session";
import { analyzeScan, createScan } from "@/lib/scans.functions";
import type { Confidence, IngredientAnalysis, ScanAnalysis } from "@/lib/analysis";

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

function ConfidenceBar({ value }: { value: Confidence }) {
  const filled = value === "high" ? 3 : value === "moderate" ? 2 : value === "low" ? 1 : 0;
  const label = value === "high" ? "High" : value === "moderate" ? "Moderate" : value === "low" ? "Low" : "None";
  return (
    <span className="mt-1 flex items-center gap-2 not-italic" aria-label={`Confidence: ${label}`}>
      <span className="flex gap-1">
        {[0, 1, 2].map((d) => (
          <span
            key={d}
            className={
              d < filled ? "h-1.5 w-6 rounded-full bg-primary" : "h-1.5 w-6 rounded-full bg-muted"
            }
          />
        ))}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </span>
  );
}

function IngredientCard({ item, index }: { item: IngredientAnalysis; index: number }) {
  return (
    <article
      key={index}
      className="rounded-2xl border border-border bg-card p-5 shadow-soft animate-in fade-in slide-in-from-bottom-1 duration-500"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <header className="flex items-start justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-foreground">{item.name}</h2>
        <span
          className={
            item.matched
              ? "shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-primary"
              : "shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
          }
        >
          {item.matched ? "Analyzed" : "Not in reference"}
        </span>
      </header>
      <dl className="mt-4 grid gap-4">
        <Field icon={<Target className="h-3.5 w-3.5" aria-hidden />} label="Function(s)">
          {item.functions.length > 0 ? item.functions.join(", ") : "Unknown"}
        </Field>
        <Field icon={<BookOpen className="h-3.5 w-3.5" aria-hidden />} label="Summary">{item.summary}</Field>
        <Field icon={<AlertTriangle className="h-3.5 w-3.5" aria-hidden />} label="Potential concerns">
          <ul className="list-disc pl-4">
            {item.potentialConcerns.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field icon={<Gauge className="h-3.5 w-3.5" aria-hidden />} label="Confidence">
            <ConfidenceBar value={item.confidence} />
            <p className="mt-1 text-xs text-muted-foreground not-italic">{item.confidenceNotes}</p>
          </Field>
          <Field icon={<ExternalLink className="h-3.5 w-3.5" aria-hidden />} label="Sources">
            <ul className="not-italic">
              {item.sources.map((s, i) => (
                <li key={i}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 hover:text-primary/80"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </Field>
        </div>
      </dl>
    </article>
  );
}

function Field({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-sm text-muted-foreground">{children}</dd>
    </div>
  );
}

function ResultsPage() {
  const draft = useDraft();
  const session = useSessionState();
  const queryClient = useQueryClient();
  const runAnalysis = useServerFn(analyzeScan);
  const saveScan = useServerFn(createScan);
  const [analysis, setAnalysis] = useState<ScanAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const items = draft.ingredients;

  const analysisQuery = useQuery({
    queryKey: ["analysis", draft.category, items],
    queryFn: () => runAnalysis({ data: { category: draft.category, ingredients: items } }),
    enabled: items.length > 0 && analysis === null && error === null && draft.savedResults === null,
    retry: 1,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  useEffect(() => {
    if (draft.savedResults) setAnalysis(draft.savedResults);
  }, [draft.savedResults]);

  useEffect(() => {
    if (analysisQuery.data) setAnalysis(analysisQuery.data);
  }, [analysisQuery.data]);

  useEffect(() => {
    if (analysisQuery.error) {
      setError("Could not analyze these ingredients right now. Please try again.");
    }
  }, [analysisQuery.error]);

  const retryAnalysis = () => {
    setError(null);
    setAnalysis(null);
    queryClient.invalidateQueries({ queryKey: ["analysis", draft.category, items] });
  };

  const saveMutation = useMutation({
    mutationFn: (vars: { category: "food" | "personal-care"; ingredients: string[]; results: ScanAnalysis | null }) =>
      saveScan({ data: vars }),
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

  const isFood = draft.category === "food";
  const loading = analysisQuery.isPending && !analysis && !error;

  return (
    <Page wide eyebrow={isFood ? "Food" : "Personal care"} title={`${items.length} ingredient${items.length === 1 ? "" : "s"} reviewed`}>
      <Steps current={3} />

      {isFood && (
        <Notice>
          <strong>Food analysis is not yet supported.</strong> LabelLens analyzes personal-care ingredients today. Food ingredient analysis is a separate regulatory domain that we have not connected yet — no function, concern, or confidence is shown for food ingredients below.
        </Notice>
      )}

      {!isFood && (
        <Notice>
          Ingredient analysis uses a curated public dataset (EU CosIng function classifications) with best-effort PubChem enrichment. <strong>Potential concerns describe what would need to be true for a concern to exist — they are not risk verdicts.</strong> An ingredient list alone cannot prove a whole product safe or toxic.
        </Notice>
      )}

      {loading && (
        <div className="mt-8" role="status" aria-live="polite">
          <p className="text-sm text-muted-foreground">Analyzing {items.length} ingredient{items.length === 1 ? "" : "s"}…</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {items.slice(0, 6).map((name, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl border border-border bg-secondary/50" />
            ))}
          </div>
        </div>
      )}

      {error && !loading && (
        <div role="alert" className="mt-8 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p>{error}</p>
          <button type="button" onClick={retryAnalysis} className="mt-2 inline-flex items-center gap-1.5 font-medium underline underline-offset-2">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Try again
          </button>
        </div>
      )}

      {analysis && !loading && !error && (
        <>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {analysis.ingredients.map((item, i) => (
              <IngredientCard key={i} item={item} index={i} />
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
                      onClick={() =>
                        saveMutation.mutate({
                          category: draft.category,
                          ingredients: items,
                          results: analysis,
                        })
                      }
                    >
                      {saveMutation.isPending ? "Saving…" : "Save scan"}
                    </button>
                    <p className="text-sm text-muted-foreground">Saves the ingredient list and analysis, private to your account.</p>
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
                to save this scan (ingredients and analysis) to your private history. Without an account, results stay on this page only.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground" role="status">Checking your sign-in status…</p>
            )}
          </section>
        </>
      )}

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Link to="/review" className={btnGhost}>Edit ingredients</Link>
        <Link to="/" onClick={() => resetDraft()} className={btnPrimary}>Start a new scan</Link>
      </div>
    </Page>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ClipboardList, ListChecks, BookOpen, ShieldCheck } from "lucide-react";
import { btnGhost, btnPrimary } from "@/components/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LabelLens — Understand what's in your products" },
      { name: "description", content: "Scan or paste an ingredient label for food and personal care products and see what each ingredient does, with sources." },
      { property: "og:title", content: "LabelLens — Understand what's in your products" },
      { property: "og:description", content: "Scan or paste an ingredient label and learn what each ingredient does, with sources." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-24">
        <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-3 duration-700">
          <p className="mb-4 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Ingredient clarity for food & personal care
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] text-foreground sm:text-6xl">
            Read the label.<br />
            <span className="text-primary">Understand the evidence.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            LabelLens turns an ingredient list into plain-language explanations: what each ingredient is for, what research says, and how confident that summary is — with links to sources.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/scan" className={btnPrimary}>
              <Camera className="h-4 w-4" aria-hidden /> Scan a label
            </Link>
            <Link to="/paste" className={btnGhost}>
              <ClipboardList className="h-4 w-4" aria-hidden /> Paste ingredients
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-secondary/60">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-3 sm:px-6">
          {[
            { icon: Camera, t: "1. Add a label", d: "Upload a photo of the ingredient panel or paste the text directly." },
            { icon: ListChecks, t: "2. Review the list", d: "Check, edit, or remove ingredients so the analysis is based on accurate input." },
            { icon: BookOpen, t: "3. See the evidence", d: "Purpose, evidence summary, potential concerns, confidence, and sources for each item." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <Icon className="h-6 w-6 text-primary" aria-hidden />
              <h2 className="mt-4 font-display text-xl font-semibold text-foreground">{t}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-6xl items-start gap-4 px-4 py-14 sm:px-6">
        <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden />
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-semibold text-foreground">Built to be honest about uncertainty</h2>
          <p className="mt-2 text-muted-foreground">
            Every summary will show a confidence level and its sources. LabelLens is informational and doesn't replace advice from a doctor, dietitian, or dermatologist.
          </p>
        </div>
      </section>
    </main>
  );
}

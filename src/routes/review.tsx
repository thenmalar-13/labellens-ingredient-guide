import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { CategoryToggle, Notice, Page, Steps, btnGhost, btnPrimary, inputCls } from "@/components/site";
import { parseIngredients, setDraft, useDraft } from "@/lib/scan-store";

export const Route = createFileRoute("/review")({
  head: () => ({
    meta: [
      { title: "Review ingredients — LabelLens" },
      { name: "description", content: "Check and edit the ingredient list before analysis." },
      { property: "og:title", content: "Review ingredients — LabelLens" },
      { property: "og:description", content: "Check and edit the ingredient list before analysis." },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const draft = useDraft();
  const navigate = useNavigate();
  const [newItem, setNewItem] = useState("");
  const items = draft.ingredients;

  const update = (i: number, v: string) => setDraft({ ingredients: items.map((x, j) => (j === i ? v : x)) });
  const remove = (i: number) => setDraft({ ingredients: items.filter((_, j) => j !== i) });
  const add = () => {
    const parsed = parseIngredients(newItem);
    if (parsed.length) setDraft({ ingredients: [...items, ...parsed] });
    setNewItem("");
  };

  if (!draft.source) {
    return (
      <Page title="Nothing to review yet" intro="Start by scanning a label or pasting an ingredient list.">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/scan" className={btnPrimary}>Scan a label</Link>
          <Link to="/paste" className={btnGhost}>Paste ingredients</Link>
        </div>
      </Page>
    );
  }

  return (
    <Page eyebrow="Review" title="Check the ingredient list" intro="Fix spelling, remove anything that isn't an ingredient, and add anything that's missing.">
      <Steps current={2} />
      <div className="grid gap-8 md:grid-cols-[1fr_220px]">
        <div>
          {draft.source === "photo" && (
            <div className="mb-6">
              <Notice>
                Automatic text reading from photos isn't connected yet. Please type the ingredients from your photo below.
              </Notice>
            </div>
          )}
          <ul className="space-y-2" aria-label="Ingredients">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 pl-3 animate-in fade-in duration-300">
                <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="w-6 text-xs text-muted-foreground">{i + 1}</span>
                <input
                  value={item}
                  onChange={(e) => update(i, e.target.value)}
                  aria-label={`Ingredient ${i + 1}`}
                  className="min-w-0 flex-1 rounded-lg bg-transparent px-2 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
                <button type="button" onClick={() => remove(i)} aria-label={`Remove ${item || "ingredient"}`} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-destructive">
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
            {items.length === 0 && <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No ingredients yet — add them below.</li>}
          </ul>
          <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); add(); }}>
            <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add ingredient(s), comma separated" aria-label="Add ingredient" className={inputCls} />
            <button type="submit" className={btnGhost} aria-label="Add"><Plus className="h-4 w-4" aria-hidden /></button>
          </form>
        </div>
        <aside className="space-y-4">
          {draft.imagePreview && <img src={draft.imagePreview} alt="Your label photo" className="w-full rounded-xl border border-border object-cover" />}
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Product type</p>
            <CategoryToggle value={draft.category} onChange={(category) => setDraft({ category })} />
          </div>
        </aside>
      </div>
      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Link to={draft.source === "photo" ? "/scan" : "/paste"} className={btnGhost}>Back</Link>
        <button type="button" disabled={items.filter((x) => x.trim()).length === 0} className={btnPrimary} onClick={() => { setDraft({ ingredients: items.map((x) => x.trim()).filter(Boolean) }); navigate({ to: "/results" }); }}>
          See results
        </button>
      </div>
    </Page>
  );
}

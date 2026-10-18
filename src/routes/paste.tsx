import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CategoryToggle, Page, Steps, btnPrimary, inputCls } from "@/components/site";
import { parseIngredients, setDraft, useDraft } from "@/lib/scan-store";

export const Route = createFileRoute("/paste")({
  head: () => ({
    meta: [
      { title: "Paste ingredients — LabelLens" },
      { name: "description", content: "Paste an ingredient list from a food or personal care product." },
      { property: "og:title", content: "Paste ingredients — LabelLens" },
      { property: "og:description", content: "Paste an ingredient list from a food or personal care product." },
    ],
  }),
  component: PastePage,
});

function PastePage() {
  const draft = useDraft();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const count = parseIngredients(text).length;

  return (
    <Page eyebrow="Paste ingredients" title="Paste the ingredient list" intro="Copy it from the packaging or a product website. Separate items with commas or new lines.">
      <Steps current={1} />
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-foreground">Product type</p>
        <CategoryToggle value={draft.category} onChange={(category) => setDraft({ category })} />
      </div>
      <label htmlFor="ingredients" className="mb-2 block text-sm font-medium text-foreground">Ingredients</label>
      <textarea
        id="ingredients"
        rows={8}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={draft.category === "food" ? "e.g. Water, cane sugar, citric acid, natural flavours" : "e.g. Aqua, glycerin, sodium lauroyl sarcosinate, fragrance"}
        className={inputCls}
      />
      <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">{count} ingredient{count === 1 ? "" : "s"} detected</p>
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          disabled={count === 0}
          className={btnPrimary}
          onClick={() => { setDraft({ source: "paste", ingredients: parseIngredients(text) }); navigate({ to: "/review" }); }}
        >
          Continue to review
        </button>
      </div>
    </Page>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, ClipboardList, Camera } from "lucide-react";
import { DemoBadge, Notice, Page, btnPrimary } from "@/components/site";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Scan history — LabelLens" },
      { name: "description", content: "Your past label scans in one place." },
      { property: "og:title", content: "Scan history — LabelLens" },
      { property: "og:description", content: "Your past label scans in one place." },
    ],
  }),
  component: HistoryPage,
});

// Demo rows only — illustrate the layout; no analysis content.
const demoRows = [
  { id: "1", name: "Example product A", category: "Food", source: "photo", count: 12, date: "Example date" },
  { id: "2", name: "Example product B", category: "Personal care", source: "paste", count: 18, date: "Example date" },
  { id: "3", name: "Example product C", category: "Food", source: "paste", count: 6, date: "Example date" },
];

function HistoryPage() {
  return (
    <Page eyebrow="History" title="Your scans" intro="Saved scans will appear here once accounts are connected.">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <DemoBadge>Demo data</DemoBadge>
        <span className="text-sm text-muted-foreground">These rows are placeholders to show the layout.</span>
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {demoRows.map((r) => {
          const Icon = r.source === "photo" ? Camera : ClipboardList;
          return (
            <li key={r.id} className="flex items-center gap-4 p-4 opacity-90">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-primary"><Icon className="h-4 w-4" aria-hidden /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{r.name}</p>
                <p className="text-sm text-muted-foreground">{r.category} · {r.count} ingredients · {r.date}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
            </li>
          );
        })}
      </ul>
      <div className="mt-8"><Notice>History isn't saved yet. Scans you do now are kept only until you leave the page.</Notice></div>
      <div className="mt-8"><Link to="/scan" className={btnPrimary}>Scan a label</Link></div>
    </Page>
  );
}

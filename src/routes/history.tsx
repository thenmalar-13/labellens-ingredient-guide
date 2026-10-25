import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Camera, ChevronRight, ClipboardList, RefreshCw, Trash2 } from "lucide-react";
import { Notice, Page, btnGhost, btnPrimary } from "@/components/site";
import { useSessionState } from "@/hooks/use-session";
import { deleteScan, listScans, type ScanSummary } from "@/lib/scans.functions";
import { setDraft } from "@/lib/scan-store";
import type { ScanAnalysis } from "@/lib/analysis";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Scan history — LabelLens" },
      { name: "description", content: "Your saved label scans, private to your account." },
      { property: "og:title", content: "Scan history — LabelLens" },
      { property: "og:description", content: "Your saved label scans, private to your account." },
    ],
  }),
  component: HistoryPage,
});

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "Unknown date" : d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

function summarize(ingredients: string[]) {
  const preview = ingredients.slice(0, 3).join(", ");
  const rest = ingredients.length - 3;
  return rest > 0 ? `${preview} +${rest} more` : preview;
}

function HistoryPage() {
  const session = useSessionState();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchScans = useServerFn(listScans);
  const removeScan = useServerFn(deleteScan);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const scansQuery = useQuery({
    queryKey: ["scans"],
    queryFn: () => fetchScans(),
    enabled: session === "signed-in",
  });

  const deleteMutation = useMutation({
    mutationFn: (vars: { id: string }) => removeScan({ data: vars }),
    onSuccess: (result, vars) => {
      if (result.deleted === 0) {
        setDeleteError("This scan could not be deleted — it may already be gone. Refreshing your history.");
      }
      setConfirmId(null);
      queryClient.invalidateQueries({ queryKey: ["scans"] });
    },
    onError: () => {
      setConfirmId(null);
      setDeleteError("Could not delete this scan. Please try again.");
    },
  });

  function reopen(scan: ScanSummary) {
    setDraft({
      source: "paste",
      category: scan.category,
      ingredients: scan.ingredients,
      imageName: null,
      imagePreview: null,
      savedResults: scan.results as ScanAnalysis | null,
    });
    navigate({ to: "/results" });
  }

  if (session === "loading") {
    return (
      <Page title="Your scans" intro="Checking your sign-in status…">
        <p className="text-sm text-muted-foreground" role="status">Loading…</p>
      </Page>
    );
  }

  if (session === "signed-out") {
    return (
      <Page title="Your scans" intro="Your scan history is private to your account. Sign in to see your saved scans.">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/login" className={btnPrimary}>Log in</Link>
          <Link to="/signup" className={btnGhost}>Sign up</Link>
        </div>
      </Page>
    );
  }

  const scans = scansQuery.data ?? [];

  return (
    <Page
      eyebrow="History"
      title="Your scans"
      intro="Scans you save are kept here, visible only to your account. Each saved scan stores the ingredient list and, for personal-care products, the completed analysis."
    >
      {scansQuery.isPending && <p className="text-sm text-muted-foreground" role="status">Loading your scans…</p>}

      {scansQuery.isError && (
        <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p>Couldn't load your saved scans.</p>
          <button type="button" onClick={() => scansQuery.refetch()} className="mt-2 inline-flex items-center gap-1.5 font-medium underline underline-offset-2">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Try again
          </button>
        </div>
      )}

      {scansQuery.isSuccess && scans.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-medium text-foreground">No saved scans yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Scan or paste a label, then choose “Save scan” on the results page.</p>
          <div className="mt-6"><Link to="/scan" className={btnPrimary}>Scan a label</Link></div>
        </div>
      )}

      {scans.length > 0 && (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {scans.map((scan) => {
            const Icon = scan.category === "food" ? Camera : ClipboardList;
            return (
              <li key={scan.id} className="p-2">
                {confirmId === scan.id ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 p-2">
                    <p className="text-sm font-medium text-foreground" role="alert">Delete this scan permanently?</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-full bg-destructive px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-destructive/90 disabled:opacity-50"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate({ id: scan.id })}
                      >
                        {deleteMutation.isPending ? "Deleting…" : "Delete"}
                      </button>
                      <button type="button" className={btnGhost + " px-4 py-1.5"} onClick={() => { setConfirmId(null); setDeleteError(null); }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-2">
                    <button
                      type="button"
                      onClick={() => reopen(scan)}
                      className="flex min-w-0 flex-1 items-center gap-4 rounded-xl px-2 py-2 text-left transition-colors hover:bg-secondary"
                      aria-label={`Reopen scan from ${formatDate(scan.createdAt)}`}
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-primary"><Icon className="h-4 w-4" aria-hidden /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-foreground">{summarize(scan.ingredients)}</span>
                        <span className="block text-sm text-muted-foreground">
                          {scan.category === "food" ? "Food" : "Personal care"} · {scan.ingredients.length} ingredient{scan.ingredients.length === 1 ? "" : "s"} · {formatDate(scan.createdAt)}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDeleteError(null); setConfirmId(scan.id); }}
                      aria-label={`Delete scan from ${formatDate(scan.createdAt)}`}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {deleteError && (
        <p role="alert" className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{deleteError}</p>
      )}

      <div className="mt-8">
        <Notice>Ingredient analysis isn't connected yet, so saved scans store your reviewed ingredient list only. No analysis results are saved.</Notice>
      </div>
      <div className="mt-8"><Link to="/scan" className={btnPrimary}>Scan a label</Link></div>
    </Page>
  );
}

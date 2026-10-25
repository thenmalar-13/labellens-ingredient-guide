import { useSyncExternalStore } from "react";

export type Category = "food" | "personal-care";

export interface ScanDraft {
  source: "photo" | "paste" | null;
  category: Category;
  imageName: string | null;
  imagePreview: string | null;
  ingredients: string[];
  /** Saved analysis restored from history, used to avoid re-running on reopen. */
  savedResults: import("@/lib/analysis").ScanAnalysis | null;
}

const initial: ScanDraft = {
  source: null,
  category: "food",
  imageName: null,
  imagePreview: null,
  ingredients: [],
  savedResults: null,
};

let state: ScanDraft = initial;
const listeners = new Set<() => void>();

export function setDraft(patch: Partial<ScanDraft>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function resetDraft() {
  setDraft(initial);
}

export function useDraft() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => initial,
  );
}

/** Split raw label text into a clean, de-duplicated ingredient list. */
export function parseIngredients(raw: string): string[] {
  const cleaned = raw.replace(/^\s*ingredients?\s*:\s*/i, "");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of cleaned.split(/[,;\n•]+/)) {
    const item = part.replace(/\.$/, "").trim();
    const key = item.toLowerCase();
    if (item && !seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

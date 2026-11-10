import { useSyncExternalStore } from "react";

export type Category = "food" | "personal-care";

export interface ScanDraft {
  source: "photo" | "paste" | null;
  category: Category;
  imageName: string | null;
  imagePreview: string | null;
  imageFile: File | null;
  ocrText: string | null;
  ocrConfidence: number | null;
  ocrError: string | null;
  ocrUncertainSegments: string[];
  ingredients: string[];
  /** Saved analysis restored from history, used to avoid re-running on reopen. */
  savedResults: import("@/lib/analysis").ScanAnalysis | null;
}

const initial: ScanDraft = {
  source: null,
  category: "food",
  imageName: null,
  imagePreview: null,
  imageFile: null,
  ocrText: null,
  ocrConfidence: null,
  ocrError: null,
  ocrUncertainSegments: [],
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

const INGREDIENTS_HEADING = /\bingredients?\s*(?:list)?\s*[:\-–—]?\s*/i;
const NEXT_SECTION = /(?:^|\n)\s*(?:directions?|how\s+to\s+use|warnings?|cautions?|storage|expiry|expires?|expiration|best\s+before|use\s+before|mfg\.?|manufactured\s+by|marketed\s+by|batch(?:\s+(?:no\.?|number))?|net\s+(?:wt\.?|weight)|benefits?|features?|product\s+claims?|claims?)\s*[:\-–—]?/i;
const INLINE_SECTION_LABEL = /\b(?:directions?|how\s+to\s+use|warnings?|cautions?|storage|expiry|expires?|expiration|best\s+before|use\s+before|mfg\.?|manufactured\s+by|marketed\s+by|batch(?:\s+(?:no\.?|number))?|net\s+(?:wt\.?|weight)|benefits?|features?|product\s+claims?|claims?)\s*[:\-–—]/i;

/** Return only the ingredient section of full-page OCR text, or null if no heading was recognized. */
export function extractIngredientSection(raw: string): string | null {
  const heading = INGREDIENTS_HEADING.exec(raw);
  if (!heading || heading.index > 0 && !/[\n\r:|•]/.test(raw.slice(0, heading.index).slice(-1))) {
    return null;
  }

  let section = raw.slice(heading.index + heading[0].length);
  const nextSection = NEXT_SECTION.exec(section);
  const inlineLabel = INLINE_SECTION_LABEL.exec(section);
  const stopAt = [nextSection?.index, inlineLabel?.index]
    .filter((index): index is number => index !== undefined)
    .reduce((earliest, index) => Math.min(earliest, index), section.length);
  section = section.slice(0, stopAt);

  return section
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Parse ingredient-only OCR/review text without treating line wraps as separators. */
export function parseOcrIngredients(raw: string): string[] {
  const section = extractIngredientSection(raw) ?? raw;
  const parts: string[] = [];
  let current = "";
  let depth = 0;

  for (const char of section) {
    if (char === "(" || char === "[" || char === "{") depth += 1;
    if (char === ")" || char === "]" || char === "}") depth = Math.max(0, depth - 1);

    if (depth === 0 && /[,;•]/.test(char)) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current);

  const seen = new Set<string>();
  return parts
    .map((part) => part.replace(/^\s*ingredients?\s*:\s*/i, "").replace(/[.\s]+$/, "").trim())
    .filter((item) => {
      const key = item.toLocaleLowerCase();
      if (!item || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

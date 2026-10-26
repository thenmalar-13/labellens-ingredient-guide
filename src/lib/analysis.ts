import {
  findPersonalCareIngredient,
  type IngredientEntry,
} from "@/lib/ingredients-data";
import type { ScanCategory } from "@/lib/scans.functions";

export type Confidence = "high" | "moderate" | "low" | "none";

export interface IngredientSource {
  /** Human-readable label, e.g. "CosIng", "PubChem". */
  label: string;
  /** Fully-qualified, verifiable URL. */
  url: string;
}

export interface IngredientAnalysis {
  /** Display name (canonical INCI when known, else the user's text). */
  name: string;
  /** Matched against the curated dataset. */
  matched: boolean;
  /** Cosmetic function(s). Empty when not matched. */
  functions: string[];
  /** Honest, classification-level summary. Never a safety verdict. */
  summary: string;
  /**
   * Potential concerns framed honestly. A hazard is *what could* cause harm
   * under some condition; risk is whether it actually does in this product.
   * An ingredient list alone cannot establish either, so concerns are
   * phrased as questions/conditions, never as verdicts.
   */
  potentialConcerns: string[];
  /** Confidence in the analysis. */
  confidence: Confidence;
  /** Why confidence is what it is. */
  confidenceNotes: string;
  /** Verifiable source links. */
  sources: IngredientSource[];
}

export interface ScanAnalysis {
  category: ScanCategory;
  /** Per-ingredient analysis, same order as input. */
  ingredients: IngredientAnalysis[];
  /** ISO timestamp of analysis. */
  analyzedAt: string;
  /** A standing disclaimer. */
  disclaimer: string;
}

export const ANALYSIS_DISCLAIMER =
  "LabelLens is informational, not medical or regulatory advice. An ingredient list cannot prove a whole product safe or toxic. Potential concerns describe what would need to be true for a concern to exist — they are not risk verdicts. Concentration, formulation, and exposure determine real-world effects.";

/** Build a CosIng search link for an ingredient name (keyless, public). */
export function cosingSearchUrl(name: string): string {
  const q = encodeURIComponent(name.trim() || "ingredients");
  return `https://ec.europa.eu/growth/tools-databases/cosing/details?search=${q}`;
}

/** Build a PubChem compound page URL from a CID. */
export function pubchemCompoundUrl(cid: number): string {
  return `https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`;
}

/** Build a PubChem search URL for a name (no CID). */
export function pubchemSearchUrl(name: string): string {
  return `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(name.trim())}`;
}

/**
 * Look up a PubChem CID via the keyless PUG REST API.
 * Returns null on any failure (network, parse, no result) — callers fall back.
 * Pure-ish: only the network call is a side effect; no mutation.
 */
export async function resolvePubChemCid(name: string): Promise<number | null> {
  const q = name.trim();
  if (!q) return null;
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(q)}/cids/JSON`;
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      // Don't let a slow upstream hang the whole analysis.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { IdentifierList?: { CID?: number[] } };
    const cid = data?.IdentifierList?.CID?.[0];
    return typeof cid === "number" ? cid : null;
  } catch {
    return null;
  }
}

/** Compose the honest "potential concerns" lines for a matched ingredient. */
export function concernsFor(entry: IngredientEntry): string[] {
  const concerns: string[] = [];
  const f = entry.functions;

  if (f.includes("Preservative")) {
    concerns.push(
      "Preservatives can cause sensitization in some individuals at sufficient concentration. Whether that concentration is present here cannot be determined from an ingredient list.",
    );
  }
  if (f.includes("Surfactant")) {
    concerns.push(
      "Surfactants can be irritating depending on concentration and contact time. Rinse-off use generally reduces exposure compared with leave-on.",
    );
  }
  if (f.includes("Fragrance")) {
    concerns.push(
      "Fragrance ingredients are among the most common contact allergens. This compound is a declared EU fragrance allergen and must be listed when present above threshold.",
    );
  }
  if (f.includes("UV filter")) {
    concerns.push(
      "UV filters have jurisdiction-specific concentration limits and approval status; whether this product complies cannot be verified from an ingredient list alone.",
    );
  }
  if (f.includes("pH adjuster") || f.includes("Buffering agent")) {
    concerns.push(
      "Acids and bases adjust pH; irritation depends on the final product pH, which an ingredient list does not reveal.",
    );
  }
  if (f.includes("Antioxidant")) {
    concerns.push(
      "Antioxidants can oxidize on storage; formulation and packaging determine stability, not the ingredient name alone.",
    );
  }
  if (entry.name === "Retinol") {
    concerns.push(
      "Retinol effects are concentration-dependent and a frequent irritant at higher strengths; concentration is not shown on an ingredient list.",
    );
  }
  if (entry.name === "Urea") {
    concerns.push(
      "Urea is a humectant at low concentrations and a keratolytic at higher ones; the role here depends on the unstated concentration.",
    );
  }
  if (entry.name === "Salicylic Acid") {
    concerns.push(
      "Salicylic acid is an exfoliant/anti-dandruff active with concentration-dependent effects and regulatory limits.",
    );
  }
  if (entry.name === "Alcohol Denat.") {
    concerns.push(
      "Denatured alcohol can be drying and irritating at higher concentrations, especially in leave-on products.",
    );
  }
  if (entry.name === "Propylene Glycol") {
    concerns.push(
      "Propylene glycol is a common contact sensitizer in some individuals; risk depends on concentration and individual susceptibility.",
    );
  }
  if (entry.name === "Oxybenzone") {
    concerns.push(
      "Oxybenzone is restricted or banned in some jurisdictions over environmental concerns; check local regulations.",
    );
  }
  if (entry.name === "Talc") {
    concerns.push(
      "Cosmetic talc has faced regulatory scrutiny; source and purity are not determinable from an ingredient list.",
    );
  }
  if (entry.name === "Hydrolyzed Wheat Protein") {
    concerns.push(
      "Hydrolyzed wheat protein is a concern for those with wheat/gluten allergy; check with a clinician if relevant.",
    );
  }

  if (concerns.length === 0) {
    concerns.push(
      "No specific hazard pattern is flagged for this function class. Absence of a flagged concern is not a safety guarantee.",
    );
  }
  return concerns;
}

/** Confidence heuristic for a matched ingredient. */
export function confidenceFor(entry: IngredientEntry): { confidence: Confidence; notes: string } {
  const fns = entry.functions;
  if (fns.length === 0) {
    return { confidence: "none", notes: "No cosmetic function classified." };
  }
  // Single, unambiguous, widely-used class.
  if (fns.length === 1) {
    return {
      confidence: "high",
      notes: "Single, well-established cosmetic function from public CosIng-style classification.",
    };
  }
  if (fns.length === 2) {
    return {
      confidence: "moderate",
      notes: "Multiple possible functions; the dominant role depends on the unstated concentration and formulation.",
    };
  }
  return {
    confidence: "low",
    notes: "Several possible functions; the role in this specific product cannot be inferred from the ingredient list.",
  };
}

/** Analyze a single personal-care ingredient. Pure except for the optional PubChem call. */
export async function analyzePersonalCareIngredient(
  rawName: string,
  fetchCid: (name: string) => Promise<number | null> = resolvePubChemCid,
): Promise<IngredientAnalysis> {
  const entry = findPersonalCareIngredient(rawName);
  const sources: IngredientSource[] = [];

  if (!entry) {
    // Unknown — honest insufficient-evidence state, no fabrication.
    const name = rawName.trim() || "Unknown ingredient";
    sources.push({ label: "CosIng search", url: cosingSearchUrl(name) });
    sources.push({ label: "PubChem search", url: pubchemSearchUrl(name) });
    return {
      name,
      matched: false,
      functions: [],
      summary:
        "This ingredient is not in LabelLens' curated personal-care reference. No function or concern is inferred.",
      potentialConcerns: [
        "No information available. The name may be a trade name, a fragrance compound, or outside the curated dataset.",
      ],
      confidence: "none",
      confidenceNotes: "No match in the curated dataset; no analysis produced.",
      sources,
    };
  }

  // Resolve a CID: prefer the curated one, else ask PubChem.
  let cid: number | null = entry.pubchemCid ?? null;
  if (cid === null) {
    cid = await fetchCid(entry.name);
  }

  sources.push({ label: "CosIng search", url: cosingSearchUrl(entry.name) });
  if (cid !== null) {
    sources.push({ label: "PubChem compound", url: pubchemCompoundUrl(cid) });
  } else {
    sources.push({ label: "PubChem search", url: pubchemSearchUrl(entry.name) });
  }

  const { confidence, notes } = confidenceFor(entry);

  return {
    name: entry.name,
    matched: true,
    functions: entry.functions,
    summary: entry.notes,
    potentialConcerns: concernsFor(entry),
    confidence,
    confidenceNotes: notes,
    sources,
  };
}

/**
 * Analyze a full ingredient list for a given category.
 * - personal-care: real curated analysis with optional PubChem enrichment.
 * - food: not supported yet; returns a clear, honest status per ingredient.
 */
export async function analyzeScan(
  category: ScanCategory,
  ingredients: string[],
  fetchCid: (name: string) => Promise<number | null> = resolvePubChemCid,
): Promise<ScanAnalysis> {
  const cleaned = ingredients.map((s) => s.trim()).filter(Boolean);

  if (category === "food") {
    return {
      category,
      ingredients: cleaned.map((name) => ({
        name,
        matched: false,
        functions: [],
        summary:
          "Food-specific analysis is not yet supported by LabelLens. No function, concern, or confidence is shown for food ingredients.",
        potentialConcerns: [
          "Food ingredient analysis is a separate regulatory and scientific domain that LabelLens has not connected yet.",
        ],
        confidence: "none" as Confidence,
        confidenceNotes: "Food category is not analyzed.",
        sources: [{ label: "FDA Food Additives search", url: "https://www.accessdata.fda.gov/scripts/fdcc/?set=FoodAdditives" }],
      })),
      analyzedAt: new Date().toISOString(),
      disclaimer: ANALYSIS_DISCLAIMER,
    };
  }

  const analyzed = await Promise.all(
    cleaned.map((name) => analyzePersonalCareIngredient(name, fetchCid)),
  );
  return {
    category,
    ingredients: analyzed,
    analyzedAt: new Date().toISOString(),
    disclaimer: ANALYSIS_DISCLAIMER,
  };
}

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  analyzePersonalCareIngredient,
  analyzeScan,
  cosingSearchUrl,
  pubchemCompoundUrl,
  resolvePubChemCid,
} from "@/lib/analysis";
import { findPersonalCareIngredient } from "@/lib/ingredients-data";

/** Stub the global fetch used by resolvePubChemCid. */
function stubFetch(impl: () => Promise<Response>) {
  vi.stubGlobal("fetch", vi.fn(impl));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ingredient matching", () => {
  it("matches a known INCI name and reports CosIng-style functions", () => {
    const glycerin = findPersonalCareIngredient("Glycerin");
    expect(glycerin).toBeDefined();
    expect(glycerin!.functions.length).toBeGreaterThan(0);
    expect(glycerin!.functions).toContain("Humectant");
  });

  it("matches aliases case-insensitively (aqua → Aqua)", () => {
    expect(findPersonalCareIngredient("AQUA")?.name).toBe("Aqua");
    expect(findPersonalCareIngredient("glycerine")?.name).toBe("Glycerin");
  });

  it("matches INCI qualifiers like concentrations via a contains match", () => {
    expect(findPersonalCareIngredient("Glycerin (5%)")?.name).toBe("Glycerin");
  });
});

describe("unknown ingredients — insufficient evidence, never invented", () => {
  it("returns an unmatched state with no functions and search-link-only sources", async () => {
    stubFetch(() => Promise.reject(new Error("offline")));
    const result = await analyzePersonalCareIngredient("Zzq fictional compound");

    expect(result.matched).toBe(false);
    expect(result.functions).toEqual([]);
    expect(result.confidence).toBe("none");
    expect(result.confidenceNotes).toMatch(/no match/i);
    expect(result.summary).toMatch(/not in LabelLens/i);
    // Sources must be real search links only — no fabricated compound pages.
    expect(result.sources.map((s) => s.url)).toEqual([
      cosingSearchUrl("Zzq fictional compound"),
      expect.stringContaining("pubchem.ncbi.nlm.nih.gov"),
    ]);
    expect(result.sources.every((s) => s.label.includes("search"))).toBe(true);
  });

  it("does not fetch PubChem for unmatched ingredients", async () => {
    const fetchMock = vi.fn(() => Promise.reject(new Error("offline")));
    vi.stubGlobal("fetch", fetchMock);
    await analyzePersonalCareIngredient("Zzq fictional compound");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("source validation", () => {
  it("produces only absolute https source URLs", async () => {
    stubFetch(() => Promise.reject(new Error("offline")));
    for (const name of ["Aqua", "Glycerin", "Salicylic Acid"]) {
      const result = await analyzePersonalCareIngredient(name);
      expect(result.sources.length).toBeGreaterThan(0);
      for (const source of result.sources) {
        expect(source.label.length).toBeGreaterThan(0);
        expect(() => new URL(source.url)).not.toThrow();
        expect(source.url.startsWith("https://")).toBe(true);
      }
    }
  });

  it("uses the curated PubChem compound page when a CID is known, else a search page", async () => {
    stubFetch(() => Promise.reject(new Error("offline")));
    const withCid = await analyzePersonalCareIngredient("Glycerin");
    expect(withCid.sources.some((s) => s.url === pubchemCompoundUrl(753))).toBe(true);

    const withoutCid = await analyzePersonalCareIngredient("Zzq fictional compound");
    expect(withoutCid.sources.some((s) => s.url.includes("#query="))).toBe(true);
  });
});

describe("PubChem enrichment with graceful fallback", () => {
  it("resolves a CID from the keyless PUG REST API", async () => {
    stubFetch(() =>
      Promise.resolve(
        new Response(JSON.stringify({ IdentifierList: { CID: [2231] } }), { status: 200 }),
      ),
    );
    await expect(resolvePubChemCid("glucose")).resolves.toBe(2231);
  });

  it("returns null on HTTP error, bad payload, or network failure", async () => {
    stubFetch(() => Promise.resolve(new Response("{}", { status: 404 })));
    await expect(resolvePubChemCid("glucose")).resolves.toBeNull();

    stubFetch(() =>
      Promise.resolve(new Response(JSON.stringify({ IdentifierList: {} }), { status: 200 })),
    );
    await expect(resolvePubChemCid("glucose")).resolves.toBeNull();

    stubFetch(() => Promise.reject(new Error("offline")));
    await expect(resolvePubChemCid("glucose")).resolves.toBeNull();
  });

  it("falls back to a PubChem search link when enrichment fails, and analysis still completes", async () => {
    // "Cetearyl Alcohol" has no curated CID; a failed live lookup leaves a search link.
    const result = await analyzePersonalCareIngredient("Cetearyl Alcohol");
    expect(result.matched).toBe(true);
    expect(result.sources.some((s) => s.url.includes("#query="))).toBe(true);
  });

  it("links the enriched compound page when fetchCid succeeds", async () => {
    const result = await analyzePersonalCareIngredient("Aqua", async () => 962);
    expect(result.sources.some((s) => s.url === pubchemCompoundUrl(962))).toBe(true);
  });
});

describe("full analysis run", () => {
  it("analyzes a personal-care list in input order, mixed known/unknown", async () => {
    stubFetch(() => Promise.reject(new Error("offline")));
    const run = await analyzeScan("personal-care", ["Aqua", "Zzq fictional compound", "glycerine"]);
    expect(run.category).toBe("personal-care");
    expect(run.ingredients.map((i) => i.name)).toEqual([
      "Aqua",
      "Zzq fictional compound",
      "Glycerin",
    ]);
    expect(run.ingredients[0].matched).toBe(true);
    expect(run.ingredients[1].matched).toBe(false);
    expect(run.ingredients[2].matched).toBe(true);
    expect(run.disclaimer).toMatch(/not medical or regulatory advice/i);
  });

  it("keeps food clearly unsupported: no functions, no confidence, honest note", async () => {
    stubFetch(() => {
      throw new Error("must not fetch for food");
    });
    const run = await analyzeScan("food", ["Wheat flour", "Salt"]);
    for (const item of run.ingredients) {
      expect(item.matched).toBe(false);
      expect(item.functions).toEqual([]);
      expect(item.confidence).toBe("none");
      expect(item.summary).toMatch(/not yet supported/i);
    }
  });

  it("produces a JSON-serializable results payload suitable for scan-history persistence", async () => {
    stubFetch(() => Promise.reject(new Error("offline")));
    const run = await analyzeScan("personal-care", ["Aqua", "Glycerin"]);
    // createScan persists `results` as JSON in the scans table — it must round-trip.
    const roundTrip = JSON.parse(JSON.stringify(run)) as typeof run;
    expect(roundTrip).toEqual(run);
  });
});

describe("concern framing — hazard conditions, never verdicts", () => {
  it("flags known concern patterns without asserting a product is unsafe", async () => {
    stubFetch(() => Promise.reject(new Error("offline")));
    const result = await analyzePersonalCareIngredient("Glycerin");
    for (const concern of result.potentialConcerns) {
      expect(concern.length).toBeGreaterThan(0);
    }
    expect(result.potentialConcerns.join(" ")).not.toMatch(/\b(toxic|unsafe|harmful)\b/i);
  });
});

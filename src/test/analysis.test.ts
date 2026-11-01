import { afterEach, describe, expect, it, vi } from "vitest";
import {
  analyzePersonalCareIngredient,
  analyzeScan,
  cosingSearchUrl,
  pubchemCompoundUrl,
  resolvePubChemCid,
  resolveVerifiedPubChemCid,
  verifyPubChemCid,
} from "@/lib/analysis";
import {
  findPersonalCareIngredient,
  normalizeIngredientName,
} from "@/lib/ingredients-data";

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

  it("matches INCI qualifiers by stripping parenthetical qualifiers", () => {
    expect(findPersonalCareIngredient("Glycerin (5%)")?.name).toBe("Glycerin");
  });
});

describe("matcher regressions — no substring false matches", () => {
  it("does not match White Tea Extract to Triethanolamine via the alias 'tea'", () => {
    expect(findPersonalCareIngredient("White Tea Extract")).toBeUndefined();
    expect(findPersonalCareIngredient("White Tea Extract")?.name).not.toBe("Triethanolamine");
  });

  it("does not match Rose Water to Aqua via the alias 'water'", () => {
    expect(findPersonalCareIngredient("Rose Water")).toBeUndefined();
  });

  it("does not match bare Alcohol to Alcohol Denat. or other alcohol ingredients", () => {
    expect(findPersonalCareIngredient("Alcohol")?.name).toBe("Alcohol");
    expect(findPersonalCareIngredient("Alcohol Denat.")?.name).toBe("Alcohol Denat.");
    expect(findPersonalCareIngredient("Benzyl Alcohol")?.name).toBe("Benzyl Alcohol");
  });

  it("normalizes hyphens and punctuation consistently on both sides", () => {
    expect(normalizeIngredientName("Coco-Glucoside")).toBe("coco glucoside");
    expect(findPersonalCareIngredient("coco glucoside")?.name).toBe("Coco-Glucoside");
    expect(findPersonalCareIngredient("Coco–Glucoside")?.name).toBe("Coco-Glucoside");
  });

  it("still matches exact names and verified aliases", () => {
    expect(findPersonalCareIngredient("Triethanolamine")?.name).toBe("Triethanolamine");
    expect(findPersonalCareIngredient("parfum")?.name).toBe("Fragrance");
    expect(findPersonalCareIngredient("SD Alcohol")?.name).toBe("Alcohol Denat.");
  });

  it("never matches an unknown name to any entry", () => {
    for (const name of ["Herbal Essence Blend", "Rosehip Oil", "Zzq fictional compound"]) {
      expect(findPersonalCareIngredient(name)).toBeUndefined();
    }
  });
});

describe("PubChem source relevance — verify before linking", () => {
  it("accepts a CID whose PubChem title matches the ingredient name", async () => {
    stubFetch(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ PropertyTable: { Properties: [{ CID: 702, Title: "Ethanol" }] } }),
          { status: 200 },
        ),
      ),
    );
    await expect(verifyPubChemCid(702, "Alcohol")).resolves.toBe(true);
    await expect(verifyPubChemCid(702, "Ethanol")).resolves.toBe(true);
  });

  it("rejects a CID whose compound is a different substance", async () => {
    stubFetch(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ PropertyTable: { Properties: [{ CID: 2231, Title: "Glucose" }] } }),
          { status: 200 },
        ),
      ),
    );
    await expect(verifyPubChemCid(2231, "Alcohol")).resolves.toBe(false);
  });

  it("returns false on HTTP error, bad payload, or network failure — never an unverifiable link", async () => {
    stubFetch(() => Promise.resolve(new Response("{}", { status: 404 })));
    await expect(verifyPubChemCid(702, "Alcohol")).resolves.toBe(false);

    stubFetch(() =>
      Promise.resolve(new Response(JSON.stringify({ PropertyTable: {} }), { status: 200 })),
    );
    await expect(verifyPubChemCid(702, "Alcohol")).resolves.toBe(false);

    stubFetch(() => Promise.reject(new Error("offline")));
    await expect(verifyPubChemCid(702, "Alcohol")).resolves.toBe(false);
  });

  it("resolveVerifiedPubChemCid returns null when the resolved compound does not match", async () => {
    const fetchMock = vi.fn();
    // Call 1: CID lookup succeeds. Call 2: title belongs to another compound.
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        new Response(JSON.stringify({ IdentifierList: { CID: [2231] } }), { status: 200 }),
      ),
    );
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ PropertyTable: { Properties: [{ CID: 2231, Title: "Glucose" }] } }),
          { status: 200 },
        ),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    await expect(resolveVerifiedPubChemCid("Alcohol")).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("resolveVerifiedPubChemCid returns the CID when lookup and verification both succeed", async () => {
    const fetchMock = vi.fn();
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        new Response(JSON.stringify({ IdentifierList: { CID: [702] } }), { status: 200 }),
      ),
    );
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ PropertyTable: { Properties: [{ CID: 702, Title: "Ethanol" }] } }),
          { status: 200 },
        ),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    await expect(resolveVerifiedPubChemCid("Alcohol")).resolves.toBe(702);
  });

  it("matched ingredients link only to their own compound page", async () => {
    stubFetch(() => Promise.reject(new Error("offline")));
    const linalool = await analyzePersonalCareIngredient("Linalool");
    expect(linalool.matched).toBe(true);
    expect(linalool.sources.map((s) => s.url)).toContain(pubchemCompoundUrl(6549));
    // No live lookup was attempted, so no unverified compound link can appear.
    expect(linalool.sources.every((s) => s.url.startsWith("https://"))).toBe(true);
  });
});

describe("generic Fragrance (parfum) vs declared allergens", () => {
  it("does not claim a generic Fragrance listing is a declared EU fragrance allergen", async () => {
    stubFetch(() => Promise.reject(new Error("offline")));
    const parfum = await analyzePersonalCareIngredient("Parfum");
    expect(parfum.matched).toBe(true);
    expect(parfum.name).toBe("Fragrance");
    const joined = parfum.potentialConcerns.join(" ");
    expect(joined).not.toMatch(/declared EU fragrance allergen/i);
    expect(joined).toMatch(/not disclose/i);
  });

  it("keeps the declared-allergen wording for named fragrance compounds", async () => {
    stubFetch(() => Promise.reject(new Error("offline")));
    const linalool = await analyzePersonalCareIngredient("Linalool");
    expect(linalool.matched).toBe(true);
    expect(linalool.potentialConcerns.join(" ")).toMatch(/declared EU fragrance allergen/i);
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
    stubFetch(() => Promise.reject(new Error("offline")));
    // "Aloe Vera" has no curated CID; a failed live lookup leaves a search link.
    const result = await analyzePersonalCareIngredient("Aloe Vera");
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
    expect(run.ingredients[0]!.matched).toBe(true);
    expect(run.ingredients[1]!.matched).toBe(false);
    expect(run.ingredients[2]!.matched).toBe(true);
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

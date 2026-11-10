import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createWorker } from "tesseract.js";
import { OcrError, recognizeIngredientLabel } from "@/lib/ocr";
import { analyzeScan } from "@/lib/analysis";
import { extractIngredientSection, parseIngredients, parseOcrIngredients } from "@/lib/scan-store";

vi.mock("tesseract.js", () => ({ createWorker: vi.fn() }));

const mockedCreateWorker = vi.mocked(createWorker);

function makeWorker(text: string, confidence = 86) {
  const worker = {
    recognize: vi.fn().mockResolvedValue({ data: { text, confidence, words: [] } }),
    terminate: vi.fn().mockResolvedValue(undefined),
  };
  mockedCreateWorker.mockResolvedValue(worker as never);
  return worker;
}

beforeEach(() => {
  vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 1200, height: 800, close: vi.fn() }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("local label OCR", () => {
  it("returns text and parsed ingredients for review, and terminates its worker", async () => {
    const worker = makeWorker("Ingredients: Aqua, Glycerin\nSodium Chloride", 92);
    const progress = vi.fn();
    const result = await recognizeIngredientLabel(new File(["image"], "label.png", { type: "image/png" }), progress);

    expect(result.text).toBe("Aqua, Glycerin Sodium Chloride");
    expect(result.ingredients).toEqual(["Aqua", "Glycerin", "Sodium Chloride"]);
    expect(result.confidence).toBe(92);
    expect(result.uncertainSegments).toEqual([]);
    expect(worker.recognize).toHaveBeenCalledWith(expect.any(File));
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it("rejects empty or non-image inputs before OCR", async () => {
    await expect(recognizeIngredientLabel(new File([], "empty.png", { type: "image/png" }))).rejects.toMatchObject({ kind: "invalid-image" });
    await expect(recognizeIngredientLabel(new File(["text"], "notes.txt", { type: "text/plain" }))).rejects.toMatchObject({ kind: "invalid-image" });
    expect(mockedCreateWorker).not.toHaveBeenCalled();
  });

  it("returns a manual-entry unreadable state when OCR finds no text", async () => {
    makeWorker("   \n ");
    await expect(recognizeIngredientLabel(new File(["image"], "blur.png", { type: "image/png" }))).rejects.toMatchObject({ kind: "unreadable" });
  });

  it("extracts only the ingredient section and stops at packaging headings", () => {
    const text = `Moisturizing balm\nINGREDIENTS: Microcrystalline Wax, Caprylic/Capric\nTriglyceride, Kokum Butter, Olive Oil (including Olea Europaea)\nDIRECTIONS: Apply as needed\nWarnings: For external use only\nBest before: 2027`;
    expect(extractIngredientSection(text)).toBe(
      "Microcrystalline Wax, Caprylic/Capric Triglyceride, Kokum Butter, Olive Oil (including Olea Europaea)",
    );
    expect(parseOcrIngredients(text)).toEqual([
      "Microcrystalline Wax",
      "Caprylic/Capric Triglyceride",
      "Kokum Butter",
      "Olive Oil (including Olea Europaea)",
    ]);
  });

  it("preserves grouped expressions, line-wrapped names, and uncertain spelling without autocorrection", () => {
    expect(parseOcrIngredients("INGREDIENTS: C12-15 Alkyl Benzoate\n(and) Hydrogenated Olive Oil (A, B), Sillicone Oyl"))
      .toEqual(["C12-15 Alkyl Benzoate (and) Hydrogenated Olive Oil (A, B)", "Sillicone Oyl"]);
  });

  it("reports low-confidence words from the ingredient section for user review", async () => {
    const worker = makeWorker("INGREDIENTS: Aqua, Glycerin\nDirections: apply daily");
    worker.recognize.mockResolvedValue({
      data: {
        text: "INGREDIENTS: Aqua, Glycerin\nDirections: apply daily",
        confidence: 80,
        words: [
          { text: "Aqua", confidence: 96 },
          { text: "Glycerin", confidence: 31 },
          { text: "Directions", confidence: 20 },
        ],
      },
    } as never);
    const result = await recognizeIngredientLabel(new File(["image"], "label.png", { type: "image/png" }));
    expect(result.uncertainSegments).toEqual(["Glycerin"]);
  });

  it("does not guess when OCR lacks an ingredients heading", async () => {
    makeWorker("Moisturizing balm. For external use only. Apply as needed.");
    await expect(recognizeIngredientLabel(new File(["image"], "label.png", { type: "image/png" })))
      .rejects.toMatchObject({ kind: "unreadable" });
  });

  it("reports unsupported browser image decoding without calling OCR", async () => {
    vi.stubGlobal("createImageBitmap", vi.fn().mockRejectedValue(new Error("unsupported")));
    const error = await recognizeIngredientLabel(new File(["image"], "photo.heic", { type: "image/heic" })).catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(OcrError);
    expect(error).toMatchObject({ kind: "unsupported-image" });
    expect(mockedCreateWorker).not.toHaveBeenCalled();
  });

  it("maps OCR failures to a recoverable manual-entry error and always terminates", async () => {
    const worker = {
      recognize: vi.fn().mockRejectedValue(new Error("worker failed")),
      terminate: vi.fn().mockResolvedValue(undefined),
    };
    mockedCreateWorker.mockResolvedValue(worker as never);
    await expect(recognizeIngredientLabel(new File(["image"], "label.png", { type: "image/png" }))).rejects.toMatchObject({ kind: "recognition-failed" });
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it("analyzes only the ingredient text approved after photo review", async () => {
    makeWorker("Ingredients: Water, Glycerin, Sodium Chloride");
    const extracted = await recognizeIngredientLabel(
      new File(["image"], "label.png", { type: "image/png" }),
    );

    // Simulate the editable review textarea: the user corrects the OCR text before continuing.
    const approvedIngredients = parseIngredients("Aqua, Glycerin");
    expect(extracted.ingredients).toEqual(["Water", "Glycerin", "Sodium Chloride"]);

    const result = await analyzeScan("personal-care", approvedIngredients, async () => null);
    expect(result.category).toBe("personal-care");
    expect(result.ingredients.map((ingredient) => ingredient.name)).toEqual(["Aqua", "Glycerin"]);
    expect(result.ingredients.every((ingredient) => ingredient.name !== "Sodium Chloride")).toBe(true);
  });
});
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createWorker } from "tesseract.js";
import { OcrError, recognizeIngredientLabel } from "@/lib/ocr";

vi.mock("tesseract.js", () => ({ createWorker: vi.fn() }));

const mockedCreateWorker = vi.mocked(createWorker);

function makeWorker(text: string, confidence = 86) {
  const worker = {
    recognize: vi.fn().mockResolvedValue({ data: { text, confidence } }),
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

    expect(result.text).toBe("Ingredients: Aqua, Glycerin\nSodium Chloride");
    expect(result.ingredients).toEqual(["Aqua", "Glycerin", "Sodium Chloride"]);
    expect(result.confidence).toBe(92);
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
});
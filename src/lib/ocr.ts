import { extractIngredientSection, parseOcrIngredients } from "@/lib/scan-store";

export type OcrFailureKind = "invalid-image" | "unsupported-image" | "unreadable" | "recognition-failed";

export class OcrError extends Error {
  constructor(
    readonly kind: OcrFailureKind,
    message: string,
  ) {
    super(message);
    this.name = "OcrError";
  }
}

export interface IngredientOcrResult {
  text: string;
  ingredients: string[];
  confidence: number;
  uncertainSegments: string[];
}

/** Read a browser-decodable image locally and return text for the user to review. */
export async function recognizeIngredientLabel(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<IngredientOcrResult> {
  if (!file || !file.type.startsWith("image/") || file.size === 0) {
    throw new OcrError("invalid-image", "Choose a valid, non-empty image file.");
  }

  if (typeof createImageBitmap !== "function") {
    throw new OcrError(
      "unsupported-image",
      "This browser cannot read the image format. Choose a JPEG or PNG, or enter the ingredients manually.",
    );
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
    if (bitmap.width < 1 || bitmap.height < 1) throw new Error("Empty image dimensions");
  } catch {
    throw new OcrError(
      "unsupported-image",
      "This image could not be opened in your browser. Choose a JPEG or PNG, or enter the ingredients manually.",
    );
  }
  bitmap.close();

  try {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("eng", 1, {
      logger: ({ progress }) => onProgress?.(Math.max(0, Math.min(1, progress))),
    });
    try {
      const { data } = await worker.recognize(file);
      const text = extractIngredientSection(data.text);
      if (text === null) {
        throw new OcrError(
          "unreadable",
          "No clear INGREDIENTS heading was found. Try a sharper photo or enter the ingredients manually.",
        );
      }
      const ingredients = parseOcrIngredients(text);
      if (ingredients.length === 0) {
        throw new OcrError(
          "unreadable",
          "No clear ingredient text was found. Try a sharper, well-lit photo or enter the ingredients manually.",
        );
      }
      const sectionWords = new Set(text.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []);
      const uncertainSegments = [...new Set(
        (data.words ?? [])
          .filter((word) => word.confidence < 55)
          .map((word) => word.text.trim())
          .filter((word) => word && (word.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).some((token) => sectionWords.has(token))),
      )];
      return { text, ingredients, confidence: data.confidence, uncertainSegments };
    } finally {
      await worker.terminate().catch(() => undefined);
    }
  } catch (error) {
    if (error instanceof OcrError) throw error;
    throw new OcrError(
      "recognition-failed",
      "The photo could not be read right now. Try again or enter the ingredients manually.",
    );
  }
}
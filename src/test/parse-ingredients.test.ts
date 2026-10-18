import { describe, expect, it } from "vitest";
import { parseIngredients } from "@/lib/scan-store";

describe("parseIngredients", () => {
  it("splits on commas, semicolons and newlines and strips the label prefix", () => {
    expect(parseIngredients("Ingredients: Water, Sugar; Salt\nCitric Acid.")).toEqual([
      "Water",
      "Sugar",
      "Salt",
      "Citric Acid",
    ]);
  });
  it("removes duplicates case-insensitively", () => {
    expect(parseIngredients("Water, water, WATER")).toEqual(["Water"]);
  });
});

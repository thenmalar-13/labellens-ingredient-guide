import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { parseIngredients } from "@/lib/scan-store";

export type ScanCategory = "food" | "personal-care";

export interface ScanSummary {
  id: string;
  category: ScanCategory;
  ingredients: string[];
  createdAt: string;
}

/** Load the signed-in user's saved scans, newest first. Ownership comes from the session, not the client. */
export const listScans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ScanSummary[]> => {
    const { data, error } = await context.supabase
      .from("scans")
      .select("id, category, ingredient_text, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error("Could not load your saved scans. Please try again.");
    return (data ?? []).map((row) => ({
      id: row.id,
      category: row.category === "personal-care" ? "personal-care" : "food",
      ingredients: parseIngredients(row.ingredient_text),
      createdAt: row.created_at,
    }));
  });

/**
 * Save the current scan for the signed-in user.
 * The user ID is taken from the authenticated session (context.userId) —
 * a client-supplied user ID is never trusted.
 */
export const createScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { category: ScanCategory; ingredients: string[] }) => {
    const category: ScanCategory = input?.category === "personal-care" ? "personal-care" : "food";
    const ingredients = (Array.isArray(input?.ingredients) ? input.ingredients : [])
      .map((s) => String(s).trim())
      .filter(Boolean)
      .slice(0, 200);
    if (ingredients.length === 0) throw new Error("Add at least one ingredient before saving.");
    if (ingredients.some((s) => s.length > 300)) throw new Error("An ingredient name is too long to save.");
    const ingredientText = ingredients.join(", ");
    if (ingredientText.length > 20000) throw new Error("This ingredient list is too long to save.");
    return { category, ingredientText };
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("scans").insert({
      user_id: context.userId,
      category: data.category,
      ingredient_text: data.ingredientText,
    });
    if (error) {
      console.error("[createScan] insert failed:", error.message);
      throw new Error("Could not save this scan. Nothing was changed — please try again.");
    }
    return { ok: true as const };
  });

/** Delete one of the signed-in user's scans. RLS also scopes this, and the delete only targets own rows. */
export const deleteScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => {
    const id = String(input?.id ?? "");
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new Error("Invalid scan id.");
    }
    return { id };
  })
  .handler(async ({ data, context }) => {
    const { count, error } = await context.supabase
      .from("scans")
      .delete({ count: "exact" })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) {
      console.error("[deleteScan] delete failed:", error.message);
      throw new Error("Could not delete this scan. Please try again.");
    }
    return { deleted: count ?? 0 };
  });

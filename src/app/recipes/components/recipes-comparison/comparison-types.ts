// src/app/recipes/components/recipes-comparison/comparison-types.ts
import type {
  RecipeDisplay,
  RecipeIngredientDisplay,
  RecipeVariant,
} from "@/types/shared-types";

/**
 * Unified type for items that can be compared
 * Extends existing types instead of duplicating
 */
export type ComparisonItem =
  | (RecipeDisplay & { itemType: "recipe" })
  | (RecipeVariant & {
      itemType: "variant";
      parentRecipe: RecipeDisplay;
      // Computed fields for variants
      costPerKg: number;
      taxedCostPerKg: number;
      totalWeight: number;
      // Add missing properties to align with RecipeDisplay
      ingredients: RecipeIngredientDisplay[];
      totalCost: number;
      taxedTotalCost: number;
      ingredientCount: number;
      variantCount: number;
      status: RecipeDisplay["status"];
      description?: string;
    });

/**
 * Metric definition for comparison table
 */
export interface ComparisonMetric {
  key: string;
  label: string;
  getValue: (item: ComparisonItem) => number | string;
  format: (value: number | string) => string;
  calculateDiff?: (
    current: number,
    baseline: number
  ) => {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  description?: string;
}

/**
 * Ingredient comparison data
 */
export interface ComparisonIngredient {
  materialId: string;
  materialName: string;
  values: Record<
    string,
    {
      quantity: number;
      unit: string;
      supplier: string;
      cost: number;
      present: boolean;
    }
  >;
}

/**
 * Summary statistics for comparison
 */
export interface ComparisonSummary {
  itemCount: number;
  costRange: { min: number; max: number; diff: number };
  weightRange: { min: number; max: number };
  commonIngredients: number;
  uniqueToItems: Record<string, number>;
  bestCost: { itemId: string; name: string; cost: number };
  worstCost: { itemId: string; name: string; cost: number };
}

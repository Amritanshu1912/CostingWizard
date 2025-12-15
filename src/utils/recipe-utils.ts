// src/utils/recipe-utils.ts
import type {
  ExperimentIngredient,
  RecipeVariantChange,
  SupplierMaterialForRecipe,
  VariantIngredientSnapshot,
} from "@/types/recipe-types";

/**
 * ================================================================================================
 * COST CALCULATION UTILITIES
 * ================================================================================================
 */

/**
 * Convert quantity to kilograms based on unit
 */
export function convertToKg(quantity: number, unit: string): number {
  switch (unit) {
    case "kg":
    case "L":
      return quantity;
    case "gm":
    case "g":
    case "ml":
      return quantity / 1000;
    default:
      return quantity / 1000;
  }
}

/**
 * Convert quantity to grams based on unit
 */
export function convertToGrams(quantity: number, unit: string): number {
  switch (unit) {
    case "kg":
    case "L":
      return quantity * 1000;
    case "gm":
    case "g":
    case "ml":
      return quantity;
    default:
      return quantity;
  }
}

/**
 * Get price for ingredient considering locked pricing
 */
export function getIngredientPrice(
  ingredient: {
    lockedPricing?: { unitPrice: number; tax: number };
  },
  supplierMaterial: { unitPrice: number; tax?: number }
): { unitPrice: number; tax: number } {
  return {
    unitPrice:
      ingredient.lockedPricing?.unitPrice ?? supplierMaterial.unitPrice,
    tax: ingredient.lockedPricing?.tax ?? supplierMaterial.tax ?? 0,
  };
}

/**
 * Calculate cost for a single ingredient
 */
export function calculateIngredientCost(
  ingredient: {
    quantity: number;
    unit: string;
    lockedPricing?: { unitPrice: number; tax: number };
  },
  supplierMaterial: { unitPrice: number; tax?: number }
): {
  cost: number;
  costWithTax: number;
  weightGrams: number;
} {
  const { unitPrice, tax } = getIngredientPrice(ingredient, supplierMaterial);
  const quantityInKg = convertToKg(ingredient.quantity, ingredient.unit);
  const weightGrams = convertToGrams(ingredient.quantity, ingredient.unit);

  const cost = unitPrice * quantityInKg;
  const costWithTax = cost * (1 + tax / 100);

  return { cost, costWithTax, weightGrams };
}

/**
 * Calculate total recipe costs from ingredients
 * Centralized calculation logic used across all hooks
 */
export function calculateRecipeTotals(
  ingredients: Array<{
    supplierMaterialId: string;
    quantity: number;
    unit: string;
    lockedPricing?: { unitPrice: number; tax: number };
  }>,
  supplierMaterialsMap: Map<string, { unitPrice: number; tax?: number }>
): {
  totalCost: number;
  totalCostWithTax: number;
  totalWeightGrams: number;
  costPerKg: number;
  taxedCostPerKg: number;
} {
  let totalCost = 0;
  let totalCostWithTax = 0;
  let totalWeightGrams = 0;

  ingredients.forEach((ing) => {
    const sm = supplierMaterialsMap.get(ing.supplierMaterialId);
    if (!sm) return;

    const { cost, costWithTax, weightGrams } = calculateIngredientCost(ing, sm);

    totalCost += cost;
    totalCostWithTax += costWithTax;
    totalWeightGrams += weightGrams;
  });

  const weightInKg = totalWeightGrams / 1000;
  const costPerKg = weightInKg > 0 ? totalCost / weightInKg : 0;
  const taxedCostPerKg = weightInKg > 0 ? totalCostWithTax / weightInKg : 0;

  return {
    totalCost,
    totalCostWithTax,
    totalWeightGrams,
    costPerKg,
    taxedCostPerKg,
  };
}

/**
 * Calculate recipe cost from ingredients (legacy function for backward compatibility)
 * @deprecated Use calculateRecipeTotals instead
 */
export function calculateRecipeCost(
  ingredients: Array<{
    supplierMaterialId: string;
    quantity: number;
    unit: string;
    lockedPricing?: { unitPrice: number; tax: number };
  }>,
  supplierMaterials: SupplierMaterialForRecipe[]
): {
  totalCost: number;
  totalCostWithTax: number;
  totalWeight: number;
  costPerKg: number;
} {
  const smMap = new Map(supplierMaterials.map((sm) => [sm.id, sm]));
  const result = calculateRecipeTotals(ingredients, smMap);

  return {
    totalCost: result.totalCost,
    totalCostWithTax: result.totalCostWithTax,
    totalWeight: result.totalWeightGrams,
    costPerKg: result.costPerKg,
  };
}

/**
 * ================================================================================================
 * VARIANCE CALCULATION UTILITIES
 * ================================================================================================
 */

/**
 * Calculate variance from target cost
 */
export function calculateVariance(
  actualCost: number,
  targetCost?: number
): {
  varianceFromTarget?: number;
  variancePercentage?: number;
  isAboveTarget: boolean;
} {
  if (!targetCost) {
    return { isAboveTarget: false };
  }

  const varianceFromTarget = actualCost - targetCost;
  const variancePercentage = (varianceFromTarget / targetCost) * 100;

  return {
    varianceFromTarget,
    variancePercentage,
    isAboveTarget: varianceFromTarget > 0,
  };
}

/**
 * ================================================================================================
 * DATA TRANSFORMATION UTILITIES
 * ================================================================================================
 */

/**
 * Create lookup maps for related data
 */
export function createLookupMaps<T extends { id: string }>(
  items: T[]
): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

/**
 * Group items by a key
 */
export function groupBy<T>(
  items: T[],
  keyFn: (item: T) => string
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  items.forEach((item) => {
    const key = keyFn(item);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  });

  return grouped;
}

/**
 * Group ingredients by recipe ID
 */
export function groupIngredientsByRecipe<T extends { recipeId: string }>(
  ingredients: T[]
): Map<string, T[]> {
  return groupBy(ingredients, (ing) => ing.recipeId);
}

/**
 * ================================================================================================
 * VARIANT UTILITIES
 * ================================================================================================
 */

/**
 * Create change records for variant audit trail
 */
export function createVariantChanges(
  experimentIngredients: ExperimentIngredient[],
  supplierMaterials: SupplierMaterialForRecipe[]
): RecipeVariantChange[] {
  const smMap = createLookupMaps(supplierMaterials);

  return experimentIngredients
    .filter((ing) => ing._changed)
    .flatMap((ing) => {
      const sm = smMap.get(ing.supplierMaterialId);
      const changeTypes = Array.from(ing._changeTypes || []);
      const changes: RecipeVariantChange[] = [];

      if (changeTypes.includes("quantity")) {
        changes.push({
          type: "quantity_change",
          ingredientName: sm?.materialName || "Unknown",
          oldValue: String(ing._originalQuantity),
          newValue: String(ing.quantity),
          changedAt: new Date(),
        });
      }

      if (changeTypes.includes("supplier")) {
        const oldSm = smMap.get(ing._originalSupplierId || "");
        changes.push({
          type: "supplier_change",
          ingredientName: sm?.materialName || "Unknown",
          oldValue: oldSm?.supplierName || "Unknown",
          newValue: sm?.supplierName || "Unknown",
          changedAt: new Date(),
        });
      }

      return changes;
    });
}

/**
 * Create ingredient snapshot for variant immutability
 */
export function createVariantSnapshot(
  experimentIngredients: ExperimentIngredient[]
): VariantIngredientSnapshot[] {
  return experimentIngredients.map((ing) => ({
    supplierMaterialId: ing.supplierMaterialId,
    quantity: ing.quantity,
    unit: ing.unit,
    lockedPricing: ing.lockedPricing,
    notes: undefined,
  }));
}

/**
 * ================================================================================================
 * VALIDATION UTILITIES
 * ================================================================================================
 */

/**
 * Validate recipe data before save
 */
export function validateRecipeData(recipeData: {
  name?: string;
  ingredients?: Array<{ supplierMaterialId: string; quantity: number }>;
  targetCostPerKg?: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!recipeData.name?.trim()) {
    errors.push("Recipe name is required");
  }

  if (!recipeData.ingredients || recipeData.ingredients.length === 0) {
    errors.push("At least one ingredient is required");
  }

  if (recipeData.ingredients) {
    const hasInvalidIngredients = recipeData.ingredients.some(
      (ing) => !ing.supplierMaterialId || ing.quantity <= 0
    );
    if (hasInvalidIngredients) {
      errors.push("All ingredients must have valid material and quantity > 0");
    }
  }

  if (
    recipeData.targetCostPerKg !== undefined &&
    recipeData.targetCostPerKg < 0
  ) {
    errors.push("Target cost cannot be negative");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * ================================================================================================
 * SUPPLIER ANALYSIS UTILITIES
 * ================================================================================================
 */

/**
 * Count unique suppliers from ingredients
 */
export function countUniqueSuppliers(
  ingredients: Array<{ supplierMaterialId: string }>,
  supplierMaterialsMap: Map<string, { supplierId: string }>
): number {
  const supplierIds = new Set<string>();

  ingredients.forEach((ing) => {
    const sm = supplierMaterialsMap.get(ing.supplierMaterialId);
    if (sm) {
      supplierIds.add(sm.supplierId);
    }
  });

  return supplierIds.size;
}

/**
 * Get list of supplier names from ingredients
 */
export function getSupplierNames(
  ingredients: Array<{ supplierMaterialId: string }>,
  supplierMaterialsMap: Map<string, { supplierId: string }>,
  suppliersMap: Map<string, { name: string }>
): string[] {
  const supplierIds = new Set<string>();
  const names: string[] = [];

  ingredients.forEach((ing) => {
    const sm = supplierMaterialsMap.get(ing.supplierMaterialId);
    if (sm && !supplierIds.has(sm.supplierId)) {
      supplierIds.add(sm.supplierId);
      const supplier = suppliersMap.get(sm.supplierId);
      if (supplier) {
        names.push(supplier.name);
      }
    }
  });

  return names;
}

/**
 * ================================================================================================
 * EXPORT UTILITIES OBJECT
 * ================================================================================================
 */

export const recipeUtils = {
  // Cost calculations
  convertToKg,
  convertToGrams,
  getIngredientPrice,
  calculateIngredientCost,
  calculateRecipeTotals,
  calculateRecipeCost,

  // Variance
  calculateVariance,

  // Data transformation
  createLookupMaps,
  groupBy,
  groupIngredientsByRecipe,

  // Variants
  createVariantChanges,
  createVariantSnapshot,

  // Validation
  validateRecipeData,

  // Supplier analysis
  countUniqueSuppliers,
  getSupplierNames,
};

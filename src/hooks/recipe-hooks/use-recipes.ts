// hooks/use-recipes.ts
import { db } from "@/lib/db";
import type {
  CapacityUnit,
  RecipeDisplay,
  RecipeIngredient,
  RecipeIngredientDisplay,
  RecipeVariant,
} from "@/types/shared-types";
import type { SupplierMaterialRow } from "@/types/material-types";

import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import {
  convertToBaseUnit,
  formatQuantity,
  normalizeToKg,
} from "../../utils/unit-conversion-utils";

/**
 * Fetches all recipe-related data once and creates lookup maps
 * This is the single source of truth for all recipe operations
 */
export function useRecipeData() {
  const data = useLiveQuery(async () => {
    const [
      recipes,
      recipeIngredients,
      variants,
      supplierMaterials,
      suppliers,
      materials,
      categories,
    ] = await Promise.all([
      db.recipes.toArray(),
      db.recipeIngredients.toArray(),
      db.recipeVariants.toArray(),
      db.supplierMaterials.toArray(),
      db.suppliers.toArray(),
      db.materials.toArray(),
      db.categories.toArray(),
    ]);

    // Create lookup maps for O(1) access
    const smMap = new Map(supplierMaterials.map((sm) => [sm.id, sm]));
    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
    const materialMap = new Map(materials.map((m) => [m.id, m]));
    const categoryMap = new Map(categories.map((c) => [c.name, c]));

    // Group ingredients by recipe
    const ingredientsByRecipe = new Map<string, RecipeIngredient[]>();
    recipeIngredients.forEach((ing) => {
      if (!ingredientsByRecipe.has(ing.recipeId)) {
        ingredientsByRecipe.set(ing.recipeId, []);
      }
      ingredientsByRecipe.get(ing.recipeId)!.push(ing);
    });

    // Count variants per recipe
    const variantCountMap = new Map<string, number>();
    variants.forEach((v) => {
      variantCountMap.set(
        v.originalRecipeId,
        (variantCountMap.get(v.originalRecipeId) || 0) + 1
      );
    });

    return {
      recipes,
      recipeIngredients,
      variants,
      supplierMaterials,
      suppliers,
      materials,
      categories,
      // Lookup maps
      smMap,
      supplierMap,
      materialMap,
      categoryMap,
      ingredientsByRecipe,
      variantCountMap,
    };
  }, []);

  return data;
}

// ============================================================================
// ENRICHED RECIPES HOOK
// ============================================================================

/**
 * Returns all recipes with calculated fields and enriched ingredients
 */
export function useEnrichedRecipes(): RecipeDisplay[] {
  const data = useRecipeData();

  const enrichedRecipes = useMemo(() => {
    if (!data) return [];

    const {
      recipes,
      smMap,
      supplierMap,
      materialMap,
      ingredientsByRecipe,
      variantCountMap,
    } = data;

    return recipes.map((recipe): RecipeDisplay => {
      const ingredients = ingredientsByRecipe.get(recipe.id) || [];

      // Enrich each ingredient
      const enrichedIngredients: RecipeIngredientDisplay[] = ingredients.map(
        (ing) => {
          const sm = smMap.get(ing.supplierMaterialId);
          const supplier = sm ? supplierMap.get(sm.supplierId) : null;
          const material = sm ? materialMap.get(sm.materialId) : null;

          // Calculate costs
          const quantityInKg = normalizeToKg(ing.quantity, ing.unit);
          const pricePerKg = ing.lockedPricing?.unitPrice || sm?.unitPrice || 0;
          const effectiveTax = ing.lockedPricing?.tax || sm?.tax || 0;
          const costForQuantity = pricePerKg * quantityInKg;
          const taxedPriceForQuantity =
            costForQuantity * (1 + effectiveTax / 100);

          const materialName = material?.name || "Unknown Material";
          const supplierName = supplier?.name || "Unknown Supplier";

          return {
            ...ing,
            displayQuantity: formatQuantity(ing.quantity, ing.unit),
            materialName,
            supplierName,
            displayName: `${materialName} (${supplierName})`,
            pricePerKg,
            costForQuantity,
            taxedPriceForQuantity,
            priceSharePercentage: 0, // Calculated after total
            isPriceLocked: !!ing.lockedPricing,
            priceChangedSinceLock: ing.lockedPricing
              ? sm
                ? sm.unitPrice !== ing.lockedPricing.unitPrice ||
                  sm.tax !== ing.lockedPricing.tax
                : false
              : false,
            priceDifference:
              ing.lockedPricing && sm
                ? sm.unitPrice - ing.lockedPricing.unitPrice
                : undefined,
            isAvailable: sm ? sm.availability === "in-stock" : false,
          };
        }
      );

      // Calculate totals
      const totalCost = enrichedIngredients.reduce(
        (sum, ing) => sum + ing.costForQuantity,
        0
      );
      const taxedTotalCost = enrichedIngredients.reduce(
        (sum, ing) => sum + ing.taxedPriceForQuantity,
        0
      );
      const totalWeight = enrichedIngredients.reduce((sum, ing) => {
        let quantityInGrams = convertToBaseUnit(
          ing.quantity,
          ing.unit
        ).quantity;
        return sum + quantityInGrams;
      }, 0);

      // Update percentages
      enrichedIngredients.forEach((ing) => {
        ing.priceSharePercentage =
          totalCost > 0 ? (ing.costForQuantity / totalCost) * 100 : 0;
      });

      // Calculate per kg costs
      const costPerKg =
        totalWeight > 0 ? totalCost / normalizeToKg(totalWeight, "gm") : 0;
      const taxedCostPerKg =
        totalWeight > 0 ? taxedTotalCost / normalizeToKg(totalWeight, "gm") : 0;

      // Calculate variance from target
      const varianceFromTarget = recipe.targetCostPerKg
        ? costPerKg - recipe.targetCostPerKg
        : undefined;
      const variancePercentage =
        varianceFromTarget && recipe.targetCostPerKg
          ? (varianceFromTarget / recipe.targetCostPerKg) * 100
          : undefined;

      return {
        ...recipe,
        ingredients: enrichedIngredients,
        ingredientCount: enrichedIngredients.length,
        variantCount: variantCountMap.get(recipe.id) || 0,
        totalWeight: totalWeight,
        totalCost,
        taxedTotalCost,
        costPerKg,
        taxedCostPerKg,
        varianceFromTarget,
        variancePercentage,
        isAboveTarget: varianceFromTarget ? varianceFromTarget > 0 : false,
      };
    });
  }, [data]);

  return enrichedRecipes;
}

// ============================================================================
// SINGLE RECIPE HOOK
// ============================================================================

/**
 * Get a single enriched recipe by ID
 */
export function useEnrichedRecipe(
  recipeId: string | null | undefined
): RecipeDisplay | null {
  const enrichedRecipes = useEnrichedRecipes();

  const recipe = useMemo(() => {
    if (!recipeId) return null;
    return enrichedRecipes.find((r) => r.id === recipeId) || null;
  }, [recipeId, enrichedRecipes]);

  return recipe;
}

// ============================================================================
// RECIPE INGREDIENTS HOOK
// ============================================================================

/**
 * Get enriched ingredients for a specific recipe
 */
export function useRecipeIngredients(
  recipeId: string | null | undefined
): RecipeIngredientDisplay[] {
  const recipe = useEnrichedRecipe(recipeId);

  return useMemo(() => {
    return recipe?.ingredients || [];
  }, [recipe]);
}

// ============================================================================
// RECIPE VARIANTS HOOK
// ============================================================================

/**
 * Get variants for a specific recipe with enriched cost data
 */
export function useRecipeVariants(
  recipeId: string | null | undefined
): (RecipeVariant & {
  costPerKg: number;
  costDifference: number;
  costDifferencePercentage: number;
})[] {
  const data = useRecipeData();
  const originalRecipe = useEnrichedRecipe(recipeId);

  const variants = useMemo(() => {
    if (!data || !recipeId || !originalRecipe) return [];

    const { ingredientsByRecipe, smMap } = data;

    return data.variants
      .filter((v) => v.originalRecipeId === recipeId)
      .map((variant) => {
        const variantIngredients = ingredientsByRecipe.get(variant.id) || [];

        const enrichedVariantIngredients = variantIngredients.map((ing) => {
          const sm = smMap.get(ing.supplierMaterialId);

          const quantityInKg = normalizeToKg(ing.quantity, ing.unit);
          const pricePerKg = ing.lockedPricing?.unitPrice || sm?.unitPrice || 0;
          const effectiveTax = ing.lockedPricing?.tax || sm?.tax || 0;
          const costForQuantity = pricePerKg * quantityInKg;
          const taxedPriceForQuantity =
            costForQuantity * (1 + effectiveTax / 100);

          return {
            ...ing,
            costForQuantity,
            taxedPriceForQuantity,
          };
        });

        const totalVariantCost = enrichedVariantIngredients.reduce(
          (sum, ing) => sum + ing.costForQuantity,
          0
        );

        const totalVariantWeight = enrichedVariantIngredients.reduce(
          (sum, ing) => sum + normalizeToKg(ing.quantity, ing.unit),
          0
        );

        const variantCostPerKg =
          totalVariantWeight > 0 ? totalVariantCost / totalVariantWeight : 0;

        const costDifference = variantCostPerKg - originalRecipe.costPerKg;
        const costDifferencePercentage =
          originalRecipe.costPerKg > 0
            ? (costDifference / originalRecipe.costPerKg) * 100
            : 0;

        return {
          ...variant,
          costPerKg: variantCostPerKg,
          costDifference,
          costDifferencePercentage,
        };
      });
  }, [data, recipeId, originalRecipe]);

  return variants;
}

/**
 * Get variant summary stats for a specific recipe
 */
export function useRecipeVariantSummary(recipeId: string | null | undefined) {
  const variants = useRecipeVariants(recipeId);

  const summary = useMemo(() => {
    if (!variants.length) return null;

    const activeVariants = variants.filter((v) => v.isActive).length;
    const costOptimizedVariants = variants.filter(
      (v) => v.optimizationGoal === "cost_reduction"
    ).length;

    return {
      totalVariants: variants.length,
      activeVariants,
      costOptimizedVariants,
      hasVariants: true,
    };
  }, [variants]);

  return summary;
}

// ============================================================================
// RECIPE STATS HOOK
// ============================================================================

export interface RecipeStats {
  totalRecipes: number;
  activeRecipes: number;
  avgCostPerKg: number;
  totalIngredients: number;
  totalVariants: number;
  targetAchievementRate: number;
}

/**
 * Calculate aggregate statistics across all recipes
 */
export function useRecipeStats(): RecipeStats {
  const enrichedRecipes = useEnrichedRecipes();
  const data = useRecipeData();

  const stats = useMemo(() => {
    const totalRecipes = enrichedRecipes.length;
    const activeRecipes = enrichedRecipes.filter(
      (r) => r.status === "active"
    ).length;

    const avgCostPerKg =
      totalRecipes > 0
        ? enrichedRecipes.reduce((sum, r) => sum + r.costPerKg, 0) /
          totalRecipes
        : 0;

    const totalIngredients = enrichedRecipes.reduce(
      (sum, r) => sum + r.ingredientCount,
      0
    );

    const totalVariants = data?.variants.length || 0;

    const recipesWithTarget = enrichedRecipes.filter(
      (r) => r.targetCostPerKg
    ).length;
    const recipesMetTarget = enrichedRecipes.filter(
      (r) => r.targetCostPerKg && !r.isAboveTarget
    ).length;
    const targetAchievementRate =
      recipesWithTarget > 0 ? (recipesMetTarget / recipesWithTarget) * 100 : 0;

    return {
      totalRecipes,
      activeRecipes,
      avgCostPerKg,
      totalIngredients,
      totalVariants,
      targetAchievementRate,
    };
  }, [enrichedRecipes, data]);

  return stats;
}

// ============================================================================
// RECIPE COMPARISON HOOK
// ============================================================================

/**
 * Compare two recipes side by side
 */
export function useRecipeComparison(recipeId1: string, recipeId2: string) {
  const recipe1 = useEnrichedRecipe(recipeId1);
  const recipe2 = useEnrichedRecipe(recipeId2);

  const comparison = useMemo(() => {
    if (!recipe1 || !recipe2) return null;

    const diff = Math.abs(recipe1.costPerKg - recipe2.costPerKg);
    const cheaper = recipe1.costPerKg < recipe2.costPerKg ? recipe1 : recipe2;
    const expensive =
      recipe1.costPerKg >= recipe2.costPerKg ? recipe1 : recipe2;
    const base = Math.max(recipe1.costPerKg, recipe2.costPerKg);

    return {
      recipe1,
      recipe2,
      difference: diff,
      differencePercentage: base > 0 ? (diff / base) * 100 : 0,
      cheaperRecipe: cheaper,
      expensiveRecipe: expensive,
    };
  }, [recipe1, recipe2]);

  return comparison;
}

// ============================================================================
// OPTIMIZATION SUGGESTIONS HOOK
// ============================================================================

interface OptimizationSuggestion {
  type: "supplier_switch" | "quantity_reduction";
  ingredientName: string;
  currentSupplier: string;
  suggestedSupplier?: string;
  currentPrice: number;
  suggestedPrice?: number;
  savings: number;
  savingsPercent: number;
  confidence: number;
}

/**
 * Find optimization opportunities for a recipe
 */
export function useRecipeOptimizations(
  recipeId: string | null | undefined
): OptimizationSuggestion[] {
  const recipe = useEnrichedRecipe(recipeId);
  const data = useRecipeData();

  const suggestions = useMemo(() => {
    if (!recipe || !data) return [];

    const suggestions: OptimizationSuggestion[] = [];
    const { smMap, supplierMap } = data;

    recipe.ingredients.forEach((ing) => {
      const currentSM = smMap.get(ing.supplierMaterialId);
      if (!currentSM) return;

      // Find alternative suppliers for same material
      const alternatives = Array.from(smMap.values()).filter(
        (sm) =>
          sm.materialId === currentSM.materialId &&
          sm.id !== currentSM.id &&
          sm.availability !== "out-of-stock" &&
          sm.unitPrice < currentSM.unitPrice
      );

      if (alternatives.length > 0) {
        const cheapest = alternatives.reduce((min, sm) =>
          sm.unitPrice < min.unitPrice ? sm : min
        );
        const cheapestSupplier = supplierMap.get(cheapest.supplierId);

        const savings = currentSM.unitPrice - cheapest.unitPrice;
        const savingsPercent = (savings / currentSM.unitPrice) * 100;

        suggestions.push({
          type: "supplier_switch",
          ingredientName: ing.materialName || "Unknown",
          currentSupplier: ing.supplierName || "Unknown",
          suggestedSupplier: cheapestSupplier?.name || "Unknown",
          currentPrice: currentSM.unitPrice,
          suggestedPrice: cheapest.unitPrice,
          savings,
          savingsPercent,
          confidence: 90,
        });
      }
    });

    return suggestions.sort((a, b) => b.savings - a.savings);
  }, [recipe, data]);

  return suggestions;
}

// ============================================================================
// CALCULATOR UTILITIES (Pure functions, no React dependencies)
// ============================================================================

/**
 * Pure calculation utilities that don't depend on React
 * All functions are synchronous except where DB access is explicitly needed
 */
export const recipeCalculator = {
  // Basic conversions

  /**
   * Calculate total weight from ingredients array
   * Used when saving to DB
   */
  calculateTotalWeight(
    ingredients: { quantity: number; unit: CapacityUnit }[]
  ): number {
    return ingredients.reduce((sum, ing) => {
      return sum + convertToBaseUnit(ing.quantity, ing.unit).quantity;
    }, 0);
  },

  /**
   * Calculate full recipe metrics from ingredients
   * This is used for real-time calculation in edit mode
   */
  calculateRecipeMetrics(
    ingredients: RecipeIngredientDisplay[],
    targetCostPerKg?: number
  ) {
    const totalWeight = this.calculateTotalWeight(
      ingredients.map((ing) => ({ quantity: ing.quantity, unit: ing.unit }))
    );
    const totalCost = ingredients.reduce(
      (sum, ing) => sum + ing.costForQuantity,
      0
    );
    const taxedTotalCost = ingredients.reduce(
      (sum, ing) => sum + ing.taxedPriceForQuantity,
      0
    );

    const costPerKg =
      totalWeight > 0 ? totalCost / normalizeToKg(totalWeight, "gm") : 0;
    const taxedCostPerKg =
      totalWeight > 0 ? taxedTotalCost / normalizeToKg(totalWeight, "gm") : 0;

    const varianceFromTarget = targetCostPerKg
      ? costPerKg - targetCostPerKg
      : undefined;
    const variancePercentage =
      varianceFromTarget && targetCostPerKg
        ? (varianceFromTarget / targetCostPerKg) * 100
        : undefined;

    return {
      totalWeight,
      totalCost,
      taxedTotalCost,
      costPerKg,
      taxedCostPerKg,
      varianceFromTarget,
      variancePercentage,
      isAboveTarget: varianceFromTarget ? varianceFromTarget > 0 : false,
    };
  },

  /**
   * Calculate recipe total from ingredients
   */
  calculateRecipeTotal(ingredients: RecipeIngredientDisplay[]) {
    const totalCost = ingredients.reduce(
      (sum, ing) => sum + ing.costForQuantity,
      0
    );
    const taxedTotalCost = ingredients.reduce(
      (sum, ing) => sum + ing.taxedPriceForQuantity,
      0
    );
    return { totalCost, taxedTotalCost };
  },

  /**
   * Validate recipe data before save
   */
  validateRecipe(recipe: {
    name?: string;
    ingredients?: any[];
    targetCostPerKg?: number;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!recipe.name?.trim()) {
      errors.push("Recipe name is required");
    }

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      errors.push("At least one ingredient is required");
    }

    if (recipe.ingredients) {
      const hasInvalidIngredients = recipe.ingredients.some(
        (ing) => !ing.supplierMaterialId || ing.quantity <= 0
      );
      if (hasInvalidIngredients) {
        errors.push(
          "All ingredients must have valid material and quantity > 0"
        );
      }
    }

    if (recipe.targetCostPerKg !== undefined && recipe.targetCostPerKg < 0) {
      errors.push("Target cost cannot be negative");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Calculate ingredient cost from params (async for DB access)
   * Only use when you need to fetch fresh supplier material data
   */
  async calculateIngredientCost(ing: RecipeIngredientDisplay) {
    const quantityInKg = normalizeToKg(ing.quantity, ing.unit);
    const cost = ing.pricePerKg * quantityInKg;
    const sm = await db.supplierMaterials.get(ing.supplierMaterialId);
    const tax = sm?.tax ?? 0;
    const costWithTax = cost * (1 + tax / 100);

    return { cost, costWithTax, quantityInKg };
  },
};

// ============================================================================
// MATERIALS WITH SUPPLIERS HOOK (for two-dropdown ingredient selection)
// ============================================================================

/**
 * Returns materials with their available suppliers for ingredient selection
 * Used in recipe editing to provide material-first, then supplier selection
 */
export function useMaterialsWithSuppliers() {
  const data = useRecipeData();

  const materialsWithSuppliers = useMemo(() => {
    if (!data) return [];

    const { materials, supplierMaterials, materialMap, supplierMap } = data;

    // Group supplier materials by material ID
    const suppliersByMaterial = new Map<string, SupplierMaterialRow[]>();

    supplierMaterials.forEach((sm) => {
      const material = materialMap.get(sm.materialId);
      const supplier = supplierMap.get(sm.supplierId);

      if (!material || !supplier) return; // Skip orphaned records

      const enrichedSM: SupplierMaterialRow = {
        ...sm,
        materialName: material.name,
        materialCategory: material.category,
        unit: sm.unit ?? "kg",
        priceWithTax: sm.unitPrice * (1 + (sm.tax ?? 0) / 100),
        categoryColor: "",
        supplierName: supplier.name,
        moq: sm.moq ?? 0,
        leadTime: sm.leadTime ?? 0,
        availability: sm.availability ?? "out-of-stock",
        supplierRating: supplier.rating,
      };

      if (!suppliersByMaterial.has(sm.materialId)) {
        suppliersByMaterial.set(sm.materialId, []);
      }
      suppliersByMaterial.get(sm.materialId)!.push(enrichedSM);
    });

    // Sort suppliers by price (cheapest first) for each material
    suppliersByMaterial.forEach((suppliers) => {
      suppliers.sort((a, b) => a.unitPrice - b.unitPrice);
    });

    // Return materials with their suppliers
    return materials.map((material) => ({
      ...material,
      suppliers: suppliersByMaterial.get(material.id) || [],
      supplierCount: suppliersByMaterial.get(material.id)?.length || 0,
    }));
  }, [data]);

  return materialsWithSuppliers;
}
const useRecipes = {
  useRecipeData,
  useEnrichedRecipes,
  useEnrichedRecipe,
  useRecipeIngredients,
  useRecipeVariants,
  useRecipeVariantSummary,
  useRecipeStats,
  useRecipeComparison,
  useRecipeOptimizations,
  useMaterialsWithSuppliers,
  recipeCalculator,
};

export default useRecipes;

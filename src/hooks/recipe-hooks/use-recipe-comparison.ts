// src/hooks/recipe-hooks/use-recipe-comparison.ts
import { db } from "@/lib/db";
import type {
  ComparisonIngredient,
  ComparisonItem,
  ComparisonSummary,
} from "@/types/recipe-types";
import { recipeUtils } from "@/utils/recipe-utils";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { useRecipeDetail, useRecipeList } from "./use-recipe-data";

/**
 * Get all items available for comparison (recipes + variants)
 */
export function useComparableItems(): ComparisonItem[] {
  const recipes = useRecipeList();

  const data = useLiveQuery(async () => {
    const [variants, supplierMaterials, recipeIngredients, suppliers] =
      await Promise.all([
        db.recipeVariants.toArray(),
        db.supplierMaterials.toArray(),
        db.recipeIngredients.toArray(),
        db.suppliers.toArray(),
      ]);

    const smMap = recipeUtils.createLookupMaps(supplierMaterials);
    const supplierMap = recipeUtils.createLookupMaps(suppliers);
    const ingredientsByRecipe =
      recipeUtils.groupIngredientsByRecipe(recipeIngredients);

    const items: ComparisonItem[] = [];

    // Process recipes
    recipes.forEach((recipe) => {
      const ingredients = ingredientsByRecipe.get(recipe.id) || [];

      // Use centralized supplier analysis
      const supplierAnalysis = recipeUtils.analyzeSupplierDistribution(
        ingredients,
        smMap,
        supplierMap
      );

      items.push({
        ...recipe,
        totalWeight: 0,
        totalCost: 0,
        taxedTotalCost: 0,
        instructions: undefined,
        notes: undefined,
        itemType: "recipe" as const,
        uniqueSuppliers: supplierAnalysis.uniqueCount,
        supplierNames: supplierAnalysis.supplierNames,
      });
    });

    // Process variants
    variants.forEach((variant) => {
      const parentRecipe = recipes.find(
        (r) => r.id === variant.originalRecipeId
      );
      if (!parentRecipe) return;

      const ingredients = variant.ingredientsSnapshot || [];

      // Calculate totals
      const totals = recipeUtils.calculateRecipeTotals(ingredients, smMap);

      // Analyze suppliers
      const supplierAnalysis = recipeUtils.analyzeSupplierDistribution(
        ingredients,
        smMap,
        supplierMap
      );

      // FIXED: Use correct cost difference calculation
      // Variant cost compared to parent recipe (parent is the base)
      const costComparison = recipeUtils.calculateCostDifference(
        totals.costPerKg,
        parentRecipe.costPerKg
      );

      items.push({
        ...variant,
        itemType: "variant" as const,
        parentRecipe: {
          ...parentRecipe,
          totalWeight: 0,
          totalCost: 0,
          taxedTotalCost: 0,
          instructions: undefined,
          notes: undefined,
        },
        totalWeight: totals.totalWeightGrams,
        totalCost: totals.totalCost,
        taxedTotalCost: totals.totalCostWithTax,
        costPerKg: totals.costPerKg,
        taxedCostPerKg: totals.taxedCostPerKg,
        costDifference: costComparison.difference,
        costDifferencePercentage: costComparison.percentage,
        ingredientCount: ingredients.length,
        uniqueSuppliers: supplierAnalysis.uniqueCount,
        supplierNames: supplierAnalysis.supplierNames,
      });
    });

    return items;
  }, [recipes]);

  return data || [];
}

/**
 * Fetch only selected items for comparison
 */
export function useComparisonData(selectedIds: string[]): ComparisonItem[] {
  const allItems = useComparableItems();

  return useMemo(() => {
    return selectedIds
      .map((id) => allItems.find((item) => item.id === id))
      .filter((item): item is ComparisonItem => item !== undefined);
  }, [allItems, selectedIds]);
}

/**
 * Generate comparison summary statistics
 */
export function useComparisonSummary(
  items: ComparisonItem[]
): ComparisonSummary | null {
  return useMemo(() => {
    if (items.length === 0) return null;

    const costs = items.map((item) => item.costPerKg);
    const weights = items.map((item) => item.totalWeight);

    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);

    const bestItem = items.find((item) => item.costPerKg === minCost)!;
    const worstItem = items.find((item) => item.costPerKg === maxCost)!;

    return {
      itemCount: items.length,
      costRange: {
        min: minCost,
        max: maxCost,
        diff: maxCost - minCost,
      },
      weightRange: {
        min: Math.min(...weights),
        max: Math.max(...weights),
      },
      commonIngredients: 0,
      uniqueToItems: {},
      bestCost: {
        itemId: bestItem.id,
        name: bestItem.name,
        cost: minCost,
      },
      worstCost: {
        itemId: worstItem.id,
        name: worstItem.name,
        cost: maxCost,
      },
    };
  }, [items]);
}

/**
 * Compare ingredients across selected recipes/variants
 */
export function useIngredientComparison(
  itemIds: string[]
): ComparisonIngredient[] {
  const data = useLiveQuery(async () => {
    if (itemIds.length === 0) return [];

    const [
      recipes,
      variants,
      allIngredients,
      supplierMaterials,
      materials,
      suppliers,
    ] = await Promise.all([
      db.recipes.bulkGet(itemIds),
      db.recipeVariants.bulkGet(itemIds),
      db.recipeIngredients.toArray(),
      db.supplierMaterials.toArray(),
      db.materials.toArray(),
      db.suppliers.toArray(),
    ]);

    const smMap = recipeUtils.createLookupMaps(supplierMaterials);
    const materialMap = recipeUtils.createLookupMaps(materials);
    const supplierMap = recipeUtils.createLookupMaps(suppliers);

    const comparisonMap = new Map<string, ComparisonIngredient>();

    // Helper to process ingredients (eliminates duplication)
    const processIngredients = (
      itemId: string,
      ingredients: Array<{
        supplierMaterialId: string;
        quantity: number;
        unit: string;
        lockedPricing?: {
          unitPrice: number;
          tax: number;
        };
      }>
    ) => {
      ingredients.forEach((ing) => {
        const sm = smMap.get(ing.supplierMaterialId);
        const material = sm ? materialMap.get(sm.materialId) : null;
        const supplier = sm ? supplierMap.get(sm.supplierId) : null;

        if (!material) return;

        if (!comparisonMap.has(material.id)) {
          comparisonMap.set(material.id, {
            materialId: material.id,
            materialName: material.name,
            values: {},
          });
        }

        const comparison = comparisonMap.get(material.id)!;

        // Calculate cost
        const costDetails = sm
          ? recipeUtils.enrichIngredientWithCost(ing, sm, 0)
          : { costForQuantity: 0 };

        comparison.values[itemId] = {
          quantity: ing.quantity,
          unit: ing.unit,
          supplier: supplier?.name || "Unknown",
          cost: costDetails.costForQuantity,
          present: true,
        };
      });
    };

    // Process recipes
    recipes.forEach((recipe) => {
      if (!recipe) return;
      const ingredients = allIngredients.filter(
        (ing) => ing.recipeId === recipe.id
      );
      processIngredients(
        recipe.id,
        ingredients.map((ing) => ({
          supplierMaterialId: ing.supplierMaterialId,
          quantity: ing.quantity,
          unit: ing.unit,
          lockedPricing: ing.lockedPricing,
        }))
      );
    });

    // Process variants
    variants.forEach((variant) => {
      if (!variant || !variant.ingredientsSnapshot) return;
      processIngredients(variant.id, variant.ingredientsSnapshot);
    });

    // Fill missing values
    comparisonMap.forEach((comparison) => {
      itemIds.forEach((id) => {
        if (!comparison.values[id]) {
          comparison.values[id] = {
            quantity: 0,
            unit: "-",
            supplier: "-",
            cost: 0,
            present: false,
          };
        }
      });
    });

    return Array.from(comparisonMap.values()).sort((a, b) =>
      a.materialName.localeCompare(b.materialName)
    );
  }, [itemIds]);

  return data || [];
}

/**
 * Compare two specific recipes side-by-side
 * FIXED: Uses correct absolute difference calculation
 */
export function useTwoRecipeComparison(recipeId1: string, recipeId2: string) {
  const recipe1 = useRecipeDetail(recipeId1);
  const recipe2 = useRecipeDetail(recipeId2);

  return useMemo(() => {
    if (!recipe1 || !recipe2) return null;

    // FIXED: Use absolute difference calculation (not relative to base)
    const comparison = recipeUtils.calculateAbsoluteDifference(
      recipe1.costPerKg,
      recipe2.costPerKg
    );

    const cheaper = recipe1.costPerKg < recipe2.costPerKg ? recipe1 : recipe2;
    const expensive =
      recipe1.costPerKg >= recipe2.costPerKg ? recipe1 : recipe2;

    return {
      recipe1,
      recipe2,
      difference: comparison.difference,
      differencePercentage: comparison.percentage,
      cheaperRecipe: cheaper,
      expensiveRecipe: expensive,
    };
  }, [recipe1, recipe2]);
}

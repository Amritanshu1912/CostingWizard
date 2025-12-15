// src/hooks/recipe-hooks/use-recipe-comparison.ts
import { db } from "@/lib/db";
import type {
  ComparisonIngredient,
  ComparisonItem,
  ComparisonSummary,
} from "@/types/recipe-types";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { useRecipeDetail, useRecipeList } from "./use-recipe-data";

/**
 * Get all items available for comparison (recipes + variants)
 * @returns Array of all comparable items
 */
export function useComparableItems(): ComparisonItem[] {
  const recipes = useRecipeList();

  const data = useLiveQuery(async () => {
    // Fetch all variants and supplier materials
    const [
      variants,
      supplierMaterials,
      recipeIngredients, // ← ADD
      suppliers, // ← ADD
    ] = await Promise.all([
      db.recipeVariants.toArray(),
      db.supplierMaterials.toArray(),
      db.recipeIngredients.toArray(), // ← ADD
      db.suppliers.toArray(), // ← ADD
    ]);

    const smMap = new Map(supplierMaterials.map((sm) => [sm.id, sm]));
    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    // Group ingredients by recipe
    const ingredientsByRecipe = new Map(); // ← ADD
    recipeIngredients.forEach((ing) => {
      if (!ingredientsByRecipe.has(ing.recipeId)) {
        ingredientsByRecipe.set(ing.recipeId, []);
      }
      ingredientsByRecipe.get(ing.recipeId).push(ing);
    });

    const items: ComparisonItem[] = [];

    // Add recipes as comparison items
    recipes.forEach((recipe) => {
      const ingredients = ingredientsByRecipe.get(recipe.id) || []; // ← ADD

      // Calculate unique suppliers  // ← ADD
      const supplierIds = new Set();
      const supplierNamesList: string[] = [];

      ingredients.forEach((ing: { supplierMaterialId: string }) => {
        const sm = smMap.get(ing.supplierMaterialId);
        if (sm && !supplierIds.has(sm.supplierId)) {
          supplierIds.add(sm.supplierId);
          const supplier = supplierMap.get(sm.supplierId);
          if (supplier) {
            supplierNamesList.push(supplier.name);
          }
        }
      });

      items.push({
        ...recipe,
        totalWeight: 0,
        totalCost: 0,
        taxedTotalCost: 0,
        instructions: undefined,
        notes: undefined,
        itemType: "recipe" as const,
        uniqueSuppliers: supplierIds.size, // ← ADD
        supplierNames: supplierNamesList, // ← ADD
      });
    });
    // Add variants as comparison items
    variants.forEach((variant) => {
      const parentRecipe = recipes.find(
        (r) => r.id === variant.originalRecipeId
      );
      if (!parentRecipe) return;

      const ingredients = variant.ingredientsSnapshot || [];

      // Calculate variant metrics
      let totalWeightGrams = 0;
      let totalCost = 0;
      let taxedTotalCost = 0;
      const supplierIds = new Set();
      const supplierNamesList: string[] = [];

      ingredients.forEach((ing) => {
        const sm = smMap.get(ing.supplierMaterialId);
        if (!sm) return;

        const multiplier =
          ing.unit === "kg" ? 1000 : ing.unit === "L" ? 1000 : 1;
        totalWeightGrams += ing.quantity * multiplier;

        if (!supplierIds.has(sm.supplierId)) {
          supplierIds.add(sm.supplierId);
          const supplier = supplierMap.get(sm.supplierId);
          if (supplier) {
            supplierNamesList.push(supplier.name);
          }
        }

        const pricePerKg = ing.lockedPricing?.unitPrice || sm.unitPrice;
        const tax = ing.lockedPricing?.tax || sm.tax || 0;

        const quantityInKg =
          ing.unit === "kg"
            ? ing.quantity
            : ing.unit === "L"
              ? ing.quantity
              : ing.quantity / 1000;

        const cost = pricePerKg * quantityInKg;
        totalCost += cost;
        taxedTotalCost += cost * (1 + tax / 100);
      });

      const weightInKg = totalWeightGrams / 1000;
      const costPerKg = weightInKg > 0 ? totalCost / weightInKg : 0;
      const taxedCostPerKg = weightInKg > 0 ? taxedTotalCost / weightInKg : 0;

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
        totalWeight: totalWeightGrams,
        totalCost,
        taxedTotalCost,
        costPerKg,
        taxedCostPerKg,
        costDifference: costPerKg - parentRecipe.costPerKg,
        costDifferencePercentage:
          parentRecipe.costPerKg > 0
            ? ((costPerKg - parentRecipe.costPerKg) / parentRecipe.costPerKg) *
              100
            : 0,
        ingredientCount: ingredients.length,
        uniqueSuppliers: supplierIds.size,
        supplierNames: supplierNamesList,
      });
    });

    return items;
  }, [recipes]);

  return data || [];
}

/**
 * Fetch only selected items for comparison
 * @param selectedIds - Array of recipe/variant IDs to compare
 * @returns Array of selected comparison items
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
 * @param items - Items to compare
 * @returns Summary with cost ranges, ingredient overlap, etc.
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

    // Ingredient analysis would require fetching ingredients
    // This is a simplified version
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
      commonIngredients: 0, // Would need ingredient data
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
 * @param itemIds - IDs of items to compare
 * @returns Ingredient comparison data
 */
export function useIngredientComparison(
  itemIds: string[]
): ComparisonIngredient[] {
  const data = useLiveQuery(async () => {
    if (itemIds.length === 0) return [];

    // Fetch ingredients and related data
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

    const smMap = new Map(supplierMaterials.map((sm) => [sm.id, sm]));
    const materialMap = new Map(materials.map((m) => [m.id, m]));
    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    const comparisonMap = new Map<string, ComparisonIngredient>();

    // Process recipes
    recipes.forEach((recipe) => {
      if (!recipe) return;

      const ingredients = allIngredients.filter(
        (ing) => ing.recipeId === recipe.id
      );

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
        const pricePerKg = ing.lockedPricing?.unitPrice || sm?.unitPrice || 0;
        const quantityInKg =
          ing.unit === "kg"
            ? ing.quantity
            : ing.unit === "L"
              ? ing.quantity
              : ing.quantity / 1000;

        comparison.values[recipe.id] = {
          quantity: ing.quantity,
          unit: ing.unit,
          supplier: supplier?.name || "Unknown",
          cost: pricePerKg * quantityInKg,
          present: true,
        };
      });
    });

    // Process variants
    variants.forEach((variant) => {
      if (!variant || !variant.ingredientsSnapshot) return;

      variant.ingredientsSnapshot.forEach((ing) => {
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
        const pricePerKg = ing.lockedPricing?.unitPrice || sm?.unitPrice || 0;
        const quantityInKg =
          ing.unit === "kg"
            ? ing.quantity
            : ing.unit === "L"
              ? ing.quantity
              : ing.quantity / 1000;

        comparison.values[variant.id] = {
          quantity: ing.quantity,
          unit: ing.unit,
          supplier: supplier?.name || "Unknown",
          cost: pricePerKg * quantityInKg,
          present: true,
        };
      });
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
 * @param recipeId1 - First recipe ID
 * @param recipeId2 - Second recipe ID
 * @returns Comparison object with both recipes and differences
 */
export function useTwoRecipeComparison(recipeId1: string, recipeId2: string) {
  const recipe1 = useRecipeDetail(recipeId1);
  const recipe2 = useRecipeDetail(recipeId2);

  return useMemo(() => {
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
}

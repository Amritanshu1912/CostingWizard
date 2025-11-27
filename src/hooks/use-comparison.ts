// hooks/use-comparison.ts
import {
  ComparisonIngredient,
  ComparisonItem,
  ComparisonSummary,
} from "@/app/recipes/components/recipes-comparison/comparison-types";
import type {
  Material,
  RecipeIngredient,
  RecipeIngredientDisplay,
  RecipeVariant,
  Supplier,
  SupplierMaterial,
  VariantIngredientSnapshot,
} from "@/lib/types";
import { useMemo } from "react";
import { useEnrichedRecipes, useRecipeData } from "./use-recipes";
import { formatQuantity, normalizeToKg } from "./use-unit-conversion";

/**
 * Resolves a variant's ingredients from a snapshot or ingredient IDs.
 * This function is critical for ensuring variants have their own ingredient data.
 */
const getVariantIngredients = (
  variant: RecipeVariant,
  smMap: Map<string, SupplierMaterial>,
  materialMap: Map<string, Material>,
  supplierMap: Map<string, Supplier>,
  allRecipeIngredients: RecipeIngredient[]
): RecipeIngredientDisplay[] => {
  let baseIngredients: (RecipeIngredient | VariantIngredientSnapshot)[] = [];
  let isSnapshot = false;

  if (variant.ingredientsSnapshot?.length) {
    baseIngredients = variant.ingredientsSnapshot;
    isSnapshot = true;
  } else if (variant.ingredientIds?.length) {
    baseIngredients = variant.ingredientIds
      .map((id) => allRecipeIngredients.find((ing) => ing.id === id))
      .filter((ing): ing is RecipeIngredient => !!ing);
  }

  if (!baseIngredients.length) {
    return [];
  }

  const ingredients = baseIngredients.map((ingOrSnap) => {
    const sm = smMap.get(ingOrSnap.supplierMaterialId);
    const material = materialMap.get(sm?.materialId || "");
    const supplier = supplierMap.get(sm?.supplierId || "");

    const materialName = material?.name || "Unknown Material";
    const supplierName = supplier?.name || "Unknown Supplier";

    const pricePerKg = ingOrSnap.lockedPricing?.unitPrice ?? sm?.unitPrice ?? 0;
    const tax = ingOrSnap.lockedPricing?.tax ?? sm?.tax ?? 0;
    const quantityInKg = normalizeToKg(ingOrSnap.quantity, ingOrSnap.unit);
    const costForQuantity = pricePerKg * quantityInKg;
    const taxedPriceForQuantity = costForQuantity * (1 + tax / 100);

    let ingredient: RecipeIngredient;
    if (isSnapshot) {
      const snap = ingOrSnap as VariantIngredientSnapshot;
      ingredient = {
        id: `${variant.id}-${snap.supplierMaterialId}`,
        recipeId: variant.originalRecipeId,
        supplierMaterialId: snap.supplierMaterialId,
        quantity: snap.quantity,
        unit: snap.unit,
        lockedPricing: snap.lockedPricing,
        createdAt: variant.createdAt,
      };
    } else {
      ingredient = ingOrSnap as RecipeIngredient;
    }

    return {
      ...ingredient,
      displayQuantity: formatQuantity(ingOrSnap.quantity, ingOrSnap.unit),
      materialName,
      supplierName,
      displayName: `${materialName} (${supplierName})`,
      pricePerKg,
      costForQuantity,
      taxedPriceForQuantity,
      priceSharePercentage: 0, // Calculated later
      isPriceLocked: !!ingOrSnap.lockedPricing,
      priceChangedSinceLock: ingOrSnap.lockedPricing
        ? sm
          ? sm.unitPrice !== ingOrSnap.lockedPricing.unitPrice ||
            (sm.tax ?? 0) !== ingOrSnap.lockedPricing.tax
          : false
        : false,
      priceDifference:
        ingOrSnap.lockedPricing && sm
          ? sm.unitPrice - ingOrSnap.lockedPricing.unitPrice
          : undefined,
      isAvailable: sm ? sm.availability === "in-stock" : false,
    };
  });

  const totalCost = ingredients.reduce(
    (sum, ing) => sum + ing.costForQuantity,
    0
  );

  ingredients.forEach((ing) => {
    ing.priceSharePercentage =
      totalCost > 0 ? (ing.costForQuantity / totalCost) * 100 : 0;
  });

  return ingredients;
};

/**
 * Get all items that can be compared (recipes + their variants)
 */
export function useComparableItems(): ComparisonItem[] {
  const recipes = useEnrichedRecipes();
  const data = useRecipeData();

  return useMemo(() => {
    if (!data) return [];

    const items: ComparisonItem[] = recipes.map((r) => ({
      ...r,
      itemType: "recipe" as const,
    }));

    // Add variants with computed cost metrics
    data.variants.forEach((variant) => {
      const parentRecipe = recipes.find(
        (r) => r.id === variant.originalRecipeId
      );
      if (!parentRecipe) return;

      const ingredients = getVariantIngredients(
        variant,
        data.smMap,
        data.materialMap,
        data.supplierMap,
        data.recipeIngredients
      );

      // Calculate variant totals
      const totalCost = ingredients.reduce(
        (sum, ing) => sum + (ing.costForQuantity || 0),
        0
      );
      const taxedTotalCost = ingredients.reduce(
        (sum, ing) => sum + (ing.taxedPriceForQuantity || 0),
        0
      );
      const totalWeight = ingredients.reduce(
        (sum, ing) => sum + normalizeToKg(ing.quantity, ing.unit) * 1000,
        0
      );

      const costPerKg = totalWeight > 0 ? totalCost / (totalWeight / 1000) : 0;
      const taxedCostPerKg =
        totalWeight > 0 ? taxedTotalCost / (totalWeight / 1000) : 0;

      items.push({
        ...variant,
        itemType: "variant" as const,
        parentRecipe,
        costPerKg,
        taxedCostPerKg,
        totalWeight,
        // Ensure variants have their own ingredients
        ingredients: ingredients,
        // Add other missing properties to satisfy ComparisonItem type
        totalCost,
        taxedTotalCost,
        ingredientCount: ingredients.length,
        // These may not be perfectly accurate without more context
        variantCount: 0,
        status: parentRecipe.status,
        description: variant.description || parentRecipe.description,
      });
    });

    return items;
  }, [recipes, data]);
}

/**
 * Get selected items for comparison
 */
export function useSelectedItems(selectedIds: string[]): ComparisonItem[] {
  const allItems = useComparableItems();

  return useMemo(() => {
    return selectedIds
      .map((id) => allItems.find((item) => item.id === id))
      .filter(
        (item): item is ComparisonItem => item !== null && item !== undefined
      );
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

    const costs = items.map((item) =>
      item.itemType === "recipe" ? item.costPerKg : item.costPerKg
    );

    const weights = items.map((item) =>
      item.itemType === "recipe" ? item.totalWeight : item.totalWeight
    );

    // Ingredient analysis
    const ingredientSets = items.map((item) => {
      return new Set(item.ingredients.map((ing) => ing.supplierMaterialId));
    });

    const allIngredients = new Set(
      ingredientSets.flatMap((set) => Array.from(set))
    );
    const commonIngredients = Array.from(allIngredients).filter((id) =>
      ingredientSets.every((set) => set.has(id))
    ).length;

    const uniqueToItems: Record<string, number> = {};
    items.forEach((item, idx) => {
      const unique = Array.from(ingredientSets[idx]).filter(
        (id) => !ingredientSets.some((set, i) => i !== idx && set.has(id))
      );
      uniqueToItems[item.id] = unique.length;
    });

    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    const bestItem = items.find(
      (item) =>
        (item.itemType === "recipe" ? item.costPerKg : item.costPerKg) ===
        minCost
    )!;
    const worstItem = items.find(
      (item) =>
        (item.itemType === "recipe" ? item.costPerKg : item.costPerKg) ===
        maxCost
    )!;

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
      commonIngredients,
      uniqueToItems,
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
 * Compare ingredients across selected items
 */
export function useIngredientComparison(
  items: ComparisonItem[]
): ComparisonIngredient[] {
  return useMemo(() => {
    if (items.length === 0) return [];

    const comparisonMap = new Map<string, ComparisonIngredient>();

    items.forEach((item) => {
      const ingredients = item.ingredients;

      ingredients.forEach((ing) => {
        const materialId = ing.supplierMaterialId;

        if (!comparisonMap.has(materialId)) {
          comparisonMap.set(materialId, {
            materialId,
            materialName: ing.materialName || "Unknown",
            values: {},
          });
        }

        const comparison = comparisonMap.get(materialId)!;
        comparison.values[item.id] = {
          quantity: ing.quantity,
          unit: ing.unit,
          supplier: ing.supplierName || "Unknown",
          cost: ing.costForQuantity || 0,
          present: true,
        };
      });
    });

    // Fill in missing values
    comparisonMap.forEach((comparison) => {
      items.forEach((item) => {
        if (!comparison.values[item.id]) {
          comparison.values[item.id] = {
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
  }, [items]);
}

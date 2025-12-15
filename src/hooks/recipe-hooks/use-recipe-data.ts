// src/hooks/recipe-hooks/use-recipe-data.ts
import { db } from "@/lib/db";
import type {
  RecipeDetail,
  RecipeIngredientDetail,
  RecipeListItem,
  RecipeStats,
  RecipeVariantWithMetrics,
  SupplierMaterialForRecipe,
} from "@/types/recipe-types";
import {
  calculateRecipeTotals,
  calculateVariance,
  convertToKg,
  createLookupMaps,
  groupIngredientsByRecipe,
} from "@/utils/recipe-utils";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";

/**
 * Fetches complete details for a single recipe
 * @param recipeId - Recipe ID to fetch (null returns null)
 * @returns Recipe with computed totals and metrics
 */
export function useRecipeDetail(
  recipeId: string | null | undefined
): RecipeDetail | null {
  const data = useLiveQuery(async () => {
    if (!recipeId) return null;

    // Fetch recipe and related data
    const [recipe, ingredients, variants, supplierMaterials] =
      await Promise.all([
        db.recipes.get(recipeId),
        db.recipeIngredients.where("recipeId").equals(recipeId).toArray(),
        db.recipeVariants.where("originalRecipeId").equals(recipeId).toArray(),
        db.supplierMaterials.toArray(),
      ]);

    if (!recipe) return null;

    // Use utility for cost calculation
    const smMap = createLookupMaps(supplierMaterials);
    const totals = calculateRecipeTotals(ingredients, smMap);
    const variance = calculateVariance(
      totals.costPerKg,
      recipe.targetCostPerKg
    );

    return {
      ...recipe,
      totalWeight: totals.totalWeightGrams,
      totalCost: totals.totalCost,
      taxedTotalCost: totals.totalCostWithTax,
      costPerKg: totals.costPerKg,
      taxedCostPerKg: totals.taxedCostPerKg,
      ...variance,
      ingredientCount: ingredients.length,
      variantCount: variants.length,
    };
  }, [recipeId]);

  return data || null;
}

/**
 * Fetches enriched ingredients for a specific recipe
 * @param recipeId - Recipe ID (null returns empty array)
 * @returns Array of enriched ingredient details
 */
export function useRecipeIngredients(
  recipeId: string | null | undefined
): RecipeIngredientDetail[] {
  const data = useLiveQuery(async () => {
    if (!recipeId) return [];

    // Fetch ingredients and related data
    const [ingredients, supplierMaterials, suppliers, materials, inventory] =
      await Promise.all([
        db.recipeIngredients.where("recipeId").equals(recipeId).toArray(),
        db.supplierMaterials.toArray(),
        db.suppliers.toArray(),
        db.materials.toArray(),
        db.inventoryItems
          .where("itemType")
          .equals("supplierMaterial")
          .toArray(),
      ]);

    const smMap = createLookupMaps(supplierMaterials);
    const supplierMap = createLookupMaps(suppliers);
    const materialMap = createLookupMaps(materials);
    // ✅ FIXED: Keep original inventory map logic (maps by itemId, not id)
    const inventoryMap = new Map(inventory.map((i) => [i.itemId, i]));

    // Calculate total cost for percentage - use utility
    const { totalCost } = calculateRecipeTotals(ingredients, smMap);

    return ingredients.map((ing) => {
      const sm = smMap.get(ing.supplierMaterialId);
      const supplier = sm ? supplierMap.get(sm.supplierId) : null;
      const material = sm ? materialMap.get(sm.materialId) : null;
      const inventoryItem = inventoryMap.get(ing.supplierMaterialId);

      const materialName = material?.name || "Unknown Material";
      const supplierName = supplier?.name || "Unknown Supplier";

      // EXACT ORIGINAL LOGIC for cost calculation
      const pricePerKg = ing.lockedPricing?.unitPrice || sm?.unitPrice || 0;
      const tax = ing.lockedPricing?.tax || sm?.tax || 0;
      const quantityInKg = convertToKg(ing.quantity, ing.unit);

      const costForQuantity = pricePerKg * quantityInKg;
      const taxedPriceForQuantity = costForQuantity * (1 + tax / 100);
      const priceSharePercentage =
        totalCost > 0 ? (costForQuantity / totalCost) * 100 : 0;

      // Price lock status - EXACT ORIGINAL LOGIC
      const isPriceLocked = !!ing.lockedPricing;
      const priceChangedSinceLock =
        ing.lockedPricing && sm
          ? sm.unitPrice !== ing.lockedPricing.unitPrice ||
            (sm.tax || 0) !== ing.lockedPricing.tax
          : false;
      const priceDifference =
        ing.lockedPricing && sm
          ? sm.unitPrice - ing.lockedPricing.unitPrice
          : undefined;

      return {
        id: ing.id,
        recipeId: ing.recipeId,
        supplierMaterialId: ing.supplierMaterialId,
        quantity: ing.quantity,
        unit: ing.unit,
        lockedPricing: ing.lockedPricing,
        materialName,
        supplierName,
        displayName: `${materialName} (${supplierName})`,
        pricePerKg,
        costForQuantity,
        taxedPriceForQuantity,
        priceSharePercentage,
        isPriceLocked,
        priceChangedSinceLock,
        priceDifference,
        currentStock: inventoryItem?.currentStock || 0,
        stockStatus: inventoryItem?.status || "unknown",
        createdAt: ing.createdAt,
        updatedAt: ing.updatedAt,
      };
    });
  }, [recipeId]);

  return data || [];
}

/**
 * Fetches variants for a recipe with computed cost metrics
 * @param recipeId - Recipe ID (null returns empty array)
 * @returns Array of variants with cost metrics
 */
export function useRecipeVariants(
  recipeId: string | null | undefined
): RecipeVariantWithMetrics[] {
  const originalRecipe = useRecipeDetail(recipeId);

  const data = useLiveQuery(async () => {
    if (!recipeId || !originalRecipe) return [];

    // Fetch variants and supplier materials
    const [variants, supplierMaterials] = await Promise.all([
      db.recipeVariants.where("originalRecipeId").equals(recipeId).toArray(),
      db.supplierMaterials.toArray(),
    ]);

    const smMap = createLookupMaps(supplierMaterials);

    // Enrich variants with cost metrics
    return variants.map((variant): RecipeVariantWithMetrics => {
      // Prefer snapshot over ingredient IDs
      const ingredients = variant.ingredientsSnapshot || [];

      // Use utility for cost calculation
      const totals = calculateRecipeTotals(ingredients, smMap);

      // Compare with original - EXACT ORIGINAL LOGIC
      const costDifference = totals.costPerKg - originalRecipe.costPerKg;
      const costDifferencePercentage =
        originalRecipe.costPerKg > 0
          ? (costDifference / originalRecipe.costPerKg) * 100
          : 0;

      return {
        ...variant,
        totalWeight: totals.totalWeightGrams,
        totalCost: totals.totalCost,
        taxedTotalCost: totals.totalCostWithTax,
        costPerKg: totals.costPerKg,
        taxedCostPerKg: totals.taxedCostPerKg,
        costDifference,
        costDifferencePercentage,
        ingredientCount: ingredients.length,
      };
    });
  }, [recipeId, originalRecipe]);

  return data || [];
}

/**
 * Fetches minimal recipe data for list views
 * @returns Array of recipes with computed costs and counts
 */
export function useRecipeList(): RecipeListItem[] {
  const data = useLiveQuery(async () => {
    // Fetch base data in parallel
    const [recipes, allIngredients, allVariants, supplierMaterials] =
      await Promise.all([
        db.recipes.toArray(),
        db.recipeIngredients.toArray(),
        db.recipeVariants.toArray(),
        db.supplierMaterials.toArray(),
      ]);

    const smMap = createLookupMaps(supplierMaterials);
    const ingredientsByRecipe = groupIngredientsByRecipe(allIngredients);

    // Count variants per recipe - EXACT ORIGINAL LOGIC
    const variantCountMap = new Map<string, number>();
    allVariants.forEach((v) => {
      variantCountMap.set(
        v.originalRecipeId,
        (variantCountMap.get(v.originalRecipeId) || 0) + 1
      );
    });

    // Transform recipes with minimal computed data
    return recipes.map((recipe): RecipeListItem => {
      const ingredients = ingredientsByRecipe.get(recipe.id) || [];

      // Use utility for cost calculation
      const totals = calculateRecipeTotals(ingredients, smMap);
      const variance = calculateVariance(
        totals.costPerKg,
        recipe.targetCostPerKg
      );

      return {
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        status: recipe.status,
        version: recipe.version || 1,
        costPerKg: totals.costPerKg,
        taxedCostPerKg: totals.taxedCostPerKg,
        targetCostPerKg: recipe.targetCostPerKg,
        ingredientCount: ingredients.length,
        variantCount: variantCountMap.get(recipe.id) || 0,
        ...variance,
        updatedAt: recipe.updatedAt || recipe.createdAt,
        createdAt: recipe.createdAt,
      };
    });
  }, []);

  return data || [];
}

/**
 * Calculate aggregate statistics across all recipes
 * @returns Summary statistics for recipes
 */
export function useRecipeStats(): RecipeStats {
  const recipes = useRecipeList();

  return useMemo(() => {
    const totalRecipes = recipes.length;

    if (totalRecipes === 0) {
      return {
        totalRecipes: 0,
        activeRecipes: 0,
        avgCostPerKg: 0,
        totalIngredients: 0,
        totalVariants: 0,
        targetAchievementRate: 0,
      };
    }

    // EXACT ORIGINAL LOGIC
    const activeRecipes = recipes.filter((r) => r.status === "active").length;
    const avgCostPerKg =
      recipes.reduce((sum, r) => sum + r.costPerKg, 0) / totalRecipes;
    const totalIngredients = recipes.reduce(
      (sum, r) => sum + r.ingredientCount,
      0
    );
    const totalVariants = recipes.reduce((sum, r) => sum + r.variantCount, 0);

    // Calculate target achievement
    const recipesWithTarget = recipes.filter((r) => r.targetCostPerKg).length;
    const recipesMetTarget = recipes.filter(
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
  }, [recipes]);
}

/**
 * Fetches supplier materials formatted for recipe operations
 * @returns Array of supplier materials with essential recipe data
 */
export function useSupplierMaterialsForRecipe(): SupplierMaterialForRecipe[] {
  const data = useLiveQuery(async () => {
    // Fetch only needed tables
    const [supplierMaterials, suppliers, materials, inventory] =
      await Promise.all([
        db.supplierMaterials.toArray(),
        db.suppliers.toArray(),
        db.materials.toArray(),
        db.inventoryItems
          .where("itemType")
          .equals("supplierMaterial")
          .toArray(),
      ]);

    const supplierMap = createLookupMaps(suppliers);
    const materialMap = createLookupMaps(materials);
    const inventoryMap = new Map(inventory.map((i) => [i.itemId, i]));

    // Transform to minimal recipe format
    return supplierMaterials.map((sm): SupplierMaterialForRecipe => {
      const supplier = supplierMap.get(sm.supplierId);
      const material = materialMap.get(sm.materialId);
      const inventoryItem = inventoryMap.get(sm.id);

      return {
        id: sm.id,
        materialId: sm.materialId,
        supplierId: sm.supplierId,
        materialName: material?.name || "Unknown Material",
        supplierName: supplier?.name || "Unknown Supplier",
        unitPrice: sm.unitPrice,
        tax: sm.tax,
        capacityUnit: sm.capacityUnit,
        moq: sm.moq,
        leadTime: sm.leadTime,
        stockStatus: inventoryItem?.status,
        currentStock: inventoryItem?.currentStock,
      };
    });
  }, []);

  return data || [];
}

/**
 * Get supplier materials grouped by material
 * @returns Map of materialId -> array of supplier options
 */
export function useSupplierMaterialsByMaterial(): Map<
  string,
  SupplierMaterialForRecipe[]
> {
  const allMaterials = useSupplierMaterialsForRecipe();

  return useMemo(() => {
    const grouped = new Map<string, SupplierMaterialForRecipe[]>();

    allMaterials.forEach((sm) => {
      if (!grouped.has(sm.materialId)) {
        grouped.set(sm.materialId, []);
      }
      grouped.get(sm.materialId)!.push(sm);
    });

    // Sort each group by price
    grouped.forEach((materials) => {
      materials.sort((a, b) => a.unitPrice - b.unitPrice);
    });

    return grouped;
  }, [allMaterials]);
}

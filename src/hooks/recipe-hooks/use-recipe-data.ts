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
import { recipeUtils } from "@/utils/recipe-utils";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";

/**
 * ================================================================================================
 * SHARED DATA FETCHING UTILITIES
 * PROFESSIONAL: Consolidate common data fetching patterns
 * ================================================================================================
 */

/**
 * Fetch and organize all recipe-related data
 * PROFESSIONAL: Single source for data fetching, used by multiple hooks
 */
async function fetchRecipeBaseData() {
  const [
    recipes,
    allIngredients,
    allVariants,
    supplierMaterials,
    suppliers,
    materials,
    inventory,
  ] = await Promise.all([
    db.recipes.toArray(),
    db.recipeIngredients.toArray(),
    db.recipeVariants.toArray(),
    db.supplierMaterials.toArray(),
    db.suppliers.toArray(),
    db.materials.toArray(),
    db.inventoryItems.where("itemType").equals("supplierMaterial").toArray(),
  ]);

  // Create lookup maps
  const smMap = recipeUtils.createLookupMaps(supplierMaterials);
  const supplierMap = recipeUtils.createLookupMaps(suppliers);
  const materialMap = recipeUtils.createLookupMaps(materials);
  const inventoryMap = new Map(inventory.map((i) => [i.itemId, i]));

  // Group data by recipe
  const ingredientsByRecipe =
    recipeUtils.groupIngredientsByRecipe(allIngredients);
  const variantCountMap = new Map<string, number>();
  allVariants.forEach((v) => {
    variantCountMap.set(
      v.originalRecipeId,
      (variantCountMap.get(v.originalRecipeId) || 0) + 1
    );
  });

  return {
    recipes,
    allIngredients,
    allVariants,
    smMap,
    supplierMap,
    materialMap,
    inventoryMap,
    ingredientsByRecipe,
    variantCountMap,
  };
}

/**
 * ================================================================================================
 * RECIPE DETAIL HOOKS
 * ================================================================================================
 */

/**
 * Fetches complete details for a single recipe
 * PROFESSIONAL: Uses centralized calculation utilities
 */
export function useRecipeDetail(
  recipeId: string | null | undefined
): RecipeDetail | null {
  const data = useLiveQuery(async () => {
    if (!recipeId) return null;

    const [recipe, ingredients, variants, supplierMaterials] =
      await Promise.all([
        db.recipes.get(recipeId),
        db.recipeIngredients.where("recipeId").equals(recipeId).toArray(),
        db.recipeVariants.where("originalRecipeId").equals(recipeId).toArray(),
        db.supplierMaterials.toArray(),
      ]);

    if (!recipe) return null;

    const smMap = recipeUtils.createLookupMaps(supplierMaterials);

    // Calculate totals using centralized utility
    const totals = recipeUtils.calculateRecipeTotals(ingredients, smMap);

    // Calculate variance using centralized utility
    const variance = recipeUtils.calculateVariance(
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
      varianceFromTarget: variance.varianceFromTarget,
      variancePercentage: variance.variancePercentage,
      isAboveTarget: variance.isAboveTarget,
      ingredientCount: ingredients.length,
      variantCount: variants.length,
    };
  }, [recipeId]);

  return data || null;
}

/**
 * Fetches enriched ingredients for a specific recipe
 * PROFESSIONAL: Uses enrichment utilities
 */
export function useRecipeIngredients(
  recipeId: string | null | undefined
): RecipeIngredientDetail[] {
  const data = useLiveQuery(async () => {
    if (!recipeId) return [];

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

    const smMap = recipeUtils.createLookupMaps(supplierMaterials);
    const supplierMap = recipeUtils.createLookupMaps(suppliers);
    const materialMap = recipeUtils.createLookupMaps(materials);
    const inventoryMap = new Map(inventory.map((i) => [i.itemId, i]));

    // Calculate total cost for share percentage
    const totals = recipeUtils.calculateRecipeTotals(ingredients, smMap);

    return ingredients.map((ing) => {
      const sm = smMap.get(ing.supplierMaterialId);
      const supplier = sm ? supplierMap.get(sm.supplierId) : null;
      const material = sm ? materialMap.get(sm.materialId) : null;
      const inventoryItem = inventoryMap.get(ing.supplierMaterialId);

      const materialName = material?.name || "Unknown Material";
      const supplierName = supplier?.name || "Unknown Supplier";

      // Use enrichment utility
      const costDetails = sm
        ? recipeUtils.enrichIngredientWithCost(ing, sm, totals.totalCost)
        : {
            pricePerKg: 0,
            tax: 0,
            quantityInKg: 0,
            costForQuantity: 0,
            taxedPriceForQuantity: 0,
            priceSharePercentage: 0,
          };

      // Use pricing check utility
      const pricingStatus = sm
        ? recipeUtils.checkPricingChanges(ing, sm)
        : {
            isPriceLocked: false,
            priceChangedSinceLock: false,
          };

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
        pricePerKg: costDetails.pricePerKg,
        tax: costDetails.tax,
        costForQuantity: costDetails.costForQuantity,
        taxedPriceForQuantity: costDetails.taxedPriceForQuantity,
        priceSharePercentage: costDetails.priceSharePercentage,
        isPriceLocked: pricingStatus.isPriceLocked,
        priceChangedSinceLock: pricingStatus.priceChangedSinceLock,
        priceDifference: pricingStatus.priceDifference,
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
 * ================================================================================================
 * RECIPE VARIANT HOOKS
 * ================================================================================================
 */

/**
 * Fetches variants for a recipe with computed cost metrics
 * PROFESSIONAL: Uses centralized cost calculation
 */
export function useRecipeVariants(
  recipeId: string | null | undefined
): RecipeVariantWithMetrics[] {
  const originalRecipe = useRecipeDetail(recipeId);

  const data = useLiveQuery(async () => {
    if (!recipeId || !originalRecipe) return [];

    const [variants, supplierMaterials] = await Promise.all([
      db.recipeVariants.where("originalRecipeId").equals(recipeId).toArray(),
      db.supplierMaterials.toArray(),
    ]);

    const smMap = recipeUtils.createLookupMaps(supplierMaterials);

    return variants.map((variant): RecipeVariantWithMetrics => {
      const ingredients = variant.ingredientsSnapshot || [];

      // Use centralized calculation
      const totals = recipeUtils.calculateRecipeTotals(ingredients, smMap);

      // Use centralized cost difference calculation
      const costComparison = recipeUtils.calculateCostDifference(
        totals.costPerKg,
        originalRecipe.costPerKg
      );

      return {
        ...variant,
        totalWeight: totals.totalWeightGrams,
        totalCost: totals.totalCost,
        taxedTotalCost: totals.totalCostWithTax,
        costPerKg: totals.costPerKg,
        taxedCostPerKg: totals.taxedCostPerKg,
        costDifference: costComparison.difference,
        costDifferencePercentage: costComparison.percentage,
        ingredientCount: ingredients.length,
      };
    });
  }, [recipeId, originalRecipe]);

  return data || [];
}

/**
 * ================================================================================================
 * RECIPE LIST HOOKS
 * ================================================================================================
 */

/**
 * Fetches minimal recipe data for list views
 * PROFESSIONAL: Optimized with shared data fetching
 */
export function useRecipeList(): RecipeListItem[] {
  const data = useLiveQuery(async () => {
    const { recipes, ingredientsByRecipe, variantCountMap, smMap } =
      await fetchRecipeBaseData();

    return recipes.map((recipe): RecipeListItem => {
      const ingredients = ingredientsByRecipe.get(recipe.id) || [];

      // Use centralized calculation
      const totals = recipeUtils.calculateRecipeTotals(ingredients, smMap);

      // Use centralized variance calculation
      const variance = recipeUtils.calculateVariance(
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
        varianceFromTarget: variance.varianceFromTarget,
        variancePercentage: variance.variancePercentage,
        isAboveTarget: variance.isAboveTarget,
        updatedAt: recipe.updatedAt || recipe.createdAt,
        createdAt: recipe.createdAt,
      };
    });
  }, []);

  return data || [];
}

/**
 * Calculate aggregate statistics across all recipes
 * PROFESSIONAL: Efficient memoized calculation
 */
export function useRecipeStats(): RecipeStats {
  const recipes = useRecipeList();

  const stats = useMemo(() => {
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

    const activeRecipes = recipes.filter((r) => r.status === "active").length;
    const avgCostPerKg =
      recipes.reduce((sum, r) => sum + r.costPerKg, 0) / totalRecipes;
    const totalIngredients = recipes.reduce(
      (sum, r) => sum + r.ingredientCount,
      0
    );
    const totalVariants = recipes.reduce((sum, r) => sum + r.variantCount, 0);

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

  return stats;
}

/**
 * ================================================================================================
 * SUPPLIER MATERIAL HOOKS
 * ================================================================================================
 */

/**
 * Fetches supplier materials formatted for recipe operations
 */
export function useSupplierMaterialsForRecipe(): SupplierMaterialForRecipe[] {
  const data = useLiveQuery(async () => {
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

    const supplierMap = recipeUtils.createLookupMaps(suppliers);
    const materialMap = recipeUtils.createLookupMaps(materials);
    const inventoryMap = new Map(inventory.map((i) => [i.itemId, i]));

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
 */
export function useSupplierMaterialsByMaterial(): Map<
  string,
  SupplierMaterialForRecipe[]
> {
  const allMaterials = useSupplierMaterialsForRecipe();

  return useMemo(() => {
    const grouped = recipeUtils.groupBy(allMaterials, (sm) => sm.materialId);

    // Sort each group by price
    grouped.forEach((materials) => {
      materials.sort((a, b) => a.unitPrice - b.unitPrice);
    });

    return grouped;
  }, [allMaterials]);
}

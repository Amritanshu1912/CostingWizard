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

    // Create supplier material lookup
    const smMap = new Map(supplierMaterials.map((sm) => [sm.id, sm]));

    // Calculate total weight (in grams)
    let totalWeightGrams = 0;
    ingredients.forEach((ing) => {
      const multiplier = ing.unit === "kg" ? 1000 : ing.unit === "L" ? 1000 : 1;
      totalWeightGrams += ing.quantity * multiplier;
    });

    // Calculate costs
    let totalCost = 0;
    let taxedTotalCost = 0;

    ingredients.forEach((ing) => {
      const sm = smMap.get(ing.supplierMaterialId);
      if (!sm) return;

      const pricePerKg = ing.lockedPricing?.unitPrice || sm.unitPrice;
      const tax = ing.lockedPricing?.tax || sm.tax || 0;

      const quantityInKg =
        ing.unit === "kg"
          ? ing.quantity
          : ing.unit === "L"
            ? ing.quantity
            : ing.quantity / 1000;

      const cost = pricePerKg * quantityInKg;
      const costWithTax = cost * (1 + tax / 100);

      totalCost += cost;
      taxedTotalCost += costWithTax;
    });

    // Calculate per kg costs
    const weightInKg = totalWeightGrams / 1000;
    const costPerKg = weightInKg > 0 ? totalCost / weightInKg : 0;
    const taxedCostPerKg = weightInKg > 0 ? taxedTotalCost / weightInKg : 0;

    // Calculate variance
    const varianceFromTarget = recipe.targetCostPerKg
      ? costPerKg - recipe.targetCostPerKg
      : undefined;
    const variancePercentage =
      varianceFromTarget && recipe.targetCostPerKg
        ? (varianceFromTarget / recipe.targetCostPerKg) * 100
        : undefined;

    return {
      ...recipe,
      totalWeight: totalWeightGrams,
      totalCost,
      taxedTotalCost,
      costPerKg,
      taxedCostPerKg,
      varianceFromTarget,
      variancePercentage,
      isAboveTarget: varianceFromTarget ? varianceFromTarget > 0 : false,
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

    // Create lookup maps
    const smMap = new Map(supplierMaterials.map((sm) => [sm.id, sm]));
    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
    const materialMap = new Map(materials.map((m) => [m.id, m]));
    const inventoryMap = new Map(inventory.map((i) => [i.itemId, i]));

    // Calculate total cost for percentage calculation
    let totalCost = 0;
    ingredients.forEach((ing) => {
      const sm = smMap.get(ing.supplierMaterialId);
      if (!sm) return;

      const pricePerKg = ing.lockedPricing?.unitPrice || sm.unitPrice;
      const quantityInKg =
        ing.unit === "kg"
          ? ing.quantity
          : ing.unit === "L"
            ? ing.quantity
            : ing.quantity / 1000;

      totalCost += pricePerKg * quantityInKg;
    });

    // Enrich ingredients
    const enriched: RecipeIngredientDetail[] = ingredients.map((ing) => {
      const sm = smMap.get(ing.supplierMaterialId);
      const supplier = sm ? supplierMap.get(sm.supplierId) : null;
      const material = sm ? materialMap.get(sm.materialId) : null;
      const inventoryItem = inventoryMap.get(ing.supplierMaterialId);

      const materialName = material?.name || "Unknown Material";
      const supplierName = supplier?.name || "Unknown Supplier";

      // Calculate costs
      const pricePerKg = ing.lockedPricing?.unitPrice || sm?.unitPrice || 0;
      const tax = ing.lockedPricing?.tax || sm?.tax || 0;

      const quantityInKg =
        ing.unit === "kg"
          ? ing.quantity
          : ing.unit === "L"
            ? ing.quantity
            : ing.quantity / 1000;

      const costForQuantity = pricePerKg * quantityInKg;
      const taxedPriceForQuantity = costForQuantity * (1 + tax / 100);
      const priceSharePercentage =
        totalCost > 0 ? (costForQuantity / totalCost) * 100 : 0;

      // Price lock status
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

    return enriched;
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

    const smMap = new Map(supplierMaterials.map((sm) => [sm.id, sm]));

    // Enrich variants with cost metrics
    return variants.map((variant): RecipeVariantWithMetrics => {
      // Prefer snapshot over ingredient IDs
      const ingredients = variant.ingredientsSnapshot || [];

      // Calculate variant totals
      let totalWeightGrams = 0;
      let totalCost = 0;
      let taxedTotalCost = 0;

      ingredients.forEach((ing) => {
        const sm = smMap.get(ing.supplierMaterialId);
        if (!sm) return;

        // Weight
        const multiplier =
          ing.unit === "kg" ? 1000 : ing.unit === "L" ? 1000 : 1;
        totalWeightGrams += ing.quantity * multiplier;

        // Cost
        const pricePerKg = ing.lockedPricing?.unitPrice || sm.unitPrice;
        const tax = ing.lockedPricing?.tax || sm.tax || 0;

        const quantityInKg =
          ing.unit === "kg"
            ? ing.quantity
            : ing.unit === "L"
              ? ing.quantity
              : ing.quantity / 1000;

        const cost = pricePerKg * quantityInKg;
        const costWithTax = cost * (1 + tax / 100);

        totalCost += cost;
        taxedTotalCost += costWithTax;
      });

      const weightInKg = totalWeightGrams / 1000;
      const costPerKg = weightInKg > 0 ? totalCost / weightInKg : 0;
      const taxedCostPerKg = weightInKg > 0 ? taxedTotalCost / weightInKg : 0;

      // Compare with original
      const costDifference = costPerKg - originalRecipe.costPerKg;
      const costDifferencePercentage =
        originalRecipe.costPerKg > 0
          ? (costDifference / originalRecipe.costPerKg) * 100
          : 0;

      return {
        ...variant,
        totalWeight: totalWeightGrams,
        totalCost,
        taxedTotalCost,
        costPerKg,
        taxedCostPerKg,
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

    // Create supplier material lookup map
    const smMap = new Map(supplierMaterials.map((sm) => [sm.id, sm]));

    // Group ingredients by recipe
    const ingredientsByRecipe = new Map<string, typeof allIngredients>();
    allIngredients.forEach((ing) => {
      if (!ingredientsByRecipe.has(ing.recipeId)) {
        ingredientsByRecipe.set(ing.recipeId, []);
      }
      ingredientsByRecipe.get(ing.recipeId)!.push(ing);
    });

    // Count variants per recipe
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

      // Calculate total weight (in grams)
      let totalWeightGrams = 0;
      ingredients.forEach((ing) => {
        // Convert to grams based on unit
        const multiplier =
          ing.unit === "kg" ? 1000 : ing.unit === "L" ? 1000 : 1;
        totalWeightGrams += ing.quantity * multiplier;
      });

      // Calculate costs
      let totalCost = 0;
      let taxedTotalCost = 0;

      ingredients.forEach((ing) => {
        const sm = smMap.get(ing.supplierMaterialId);
        if (!sm) return;

        // Get price (locked or current)
        const pricePerKg = ing.lockedPricing?.unitPrice || sm.unitPrice;
        const tax = ing.lockedPricing?.tax || sm.tax || 0;

        // Convert quantity to kg for cost calculation
        const quantityInKg =
          ing.unit === "kg"
            ? ing.quantity
            : ing.unit === "L"
              ? ing.quantity
              : ing.quantity / 1000;

        const cost = pricePerKg * quantityInKg;
        const costWithTax = cost * (1 + tax / 100);

        totalCost += cost;
        taxedTotalCost += costWithTax;
      });

      // Calculate per kg costs
      const weightInKg = totalWeightGrams / 1000;
      const costPerKg = weightInKg > 0 ? totalCost / weightInKg : 0;
      const taxedCostPerKg = weightInKg > 0 ? taxedTotalCost / weightInKg : 0;

      // Calculate variance from target
      const varianceFromTarget = recipe.targetCostPerKg
        ? costPerKg - recipe.targetCostPerKg
        : undefined;
      const variancePercentage =
        varianceFromTarget && recipe.targetCostPerKg
          ? (varianceFromTarget / recipe.targetCostPerKg) * 100
          : undefined;

      return {
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        status: recipe.status,
        version: recipe.version || 1,
        costPerKg,
        taxedCostPerKg,
        targetCostPerKg: recipe.targetCostPerKg,
        ingredientCount: ingredients.length,
        variantCount: variantCountMap.get(recipe.id) || 0,
        varianceFromTarget,
        variancePercentage,
        isAboveTarget: varianceFromTarget ? varianceFromTarget > 0 : false,
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

  return stats;
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

    // Create lookup maps
    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
    const materialMap = new Map(materials.map((m) => [m.id, m]));
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

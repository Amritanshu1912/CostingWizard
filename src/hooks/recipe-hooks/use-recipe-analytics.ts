// src/hooks/recipe-hooks/use-recipe-analytics.ts
import { db } from "@/lib/db";
import type {
  ExperimentIngredient,
  ExperimentMetrics,
  RecipeDetail,
  RecipeWithIngredients,
} from "@/types/recipe-types";
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useState } from "react";
import { useSupplierMaterialsForRecipe } from "./use-recipe-data";

/**
 * Hook for recipe experimentation in Recipe Lab
 *
 * Manages temporary state for ingredient modifications before saving as variant
 * Tracks changes, calculates real-time metrics, provides undo functionality
 *
 * @param recipe - Recipe to experiment with (RecipeDetail)
 * @returns Experiment state and handlers
 */
export function useRecipeExperiment(recipe: RecipeDetail | null) {
  const supplierMaterials = useSupplierMaterialsForRecipe();

  // Experiment state
  const [experimentIngredients, setExperimentIngredients] = useState<
    ExperimentIngredient[]
  >([]);
  const [expandedAlternatives, setExpandedAlternatives] = useState<Set<string>>(
    new Set()
  );
  const [targetCost, setTargetCost] = useState<number | undefined>();
  const [loadedVariantName, setLoadedVariantName] = useState<string | null>(
    null
  );

  /**
   * Initialize experiment with recipe ingredients
   * Called when recipe changes or when loading original recipe
   */
  const initializeExperiment = useCallback(
    (newRecipe: RecipeDetail, ingredients: any[]) => {
      setExperimentIngredients(
        ingredients.map((ing) => ({
          id: ing.id,
          recipeId: ing.recipeId,
          supplierMaterialId: ing.supplierMaterialId,
          quantity: ing.quantity,
          unit: ing.unit,
          lockedPricing: ing.lockedPricing,
          createdAt: ing.createdAt,
          updatedAt: ing.updatedAt,
          _originalQuantity: ing.quantity,
          _originalSupplierId: ing.supplierMaterialId,
          _changeTypes: new Set<"quantity" | "supplier">(),
        }))
      );
      setTargetCost(newRecipe.targetCostPerKg);
      setLoadedVariantName(null);
    },
    []
  );

  /**
   * Calculate real-time metrics comparing original vs modified
   */
  const calculateMetrics = useCallback((): ExperimentMetrics => {
    if (!recipe || experimentIngredients.length === 0) {
      return {
        originalCost: 0,
        modifiedCost: 0,
        originalWeight: 0,
        modifiedWeight: 0,
        originalTotalCost: 0,
        modifiedTotalCost: 0,
        originalTotalCostWithTax: 0,
        modifiedTotalCostWithTax: 0,
        originalCostPerKgWithTax: 0,
        modifiedCostPerKgWithTax: 0,
        savings: 0,
        savingsPercent: 0,
        changeCount: 0,
      };
    }

    // Calculate modified values
    let modifiedTotalCost = 0;
    let modifiedTotalCostWithTax = 0;
    let modifiedWeightGrams = 0;

    experimentIngredients.forEach((ing) => {
      const sm = supplierMaterials.find((s) => s.id === ing.supplierMaterialId);
      if (!sm) return;

      // Weight
      const multiplier = ing.unit === "kg" ? 1000 : ing.unit === "L" ? 1000 : 1;
      modifiedWeightGrams += ing.quantity * multiplier;

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

      modifiedTotalCost += cost;
      modifiedTotalCostWithTax += costWithTax;
    });

    const modifiedWeightKg = modifiedWeightGrams / 1000;
    const modifiedCostPerKg =
      modifiedWeightKg > 0 ? modifiedTotalCost / modifiedWeightKg : 0;
    const modifiedCostPerKgWithTax =
      modifiedWeightKg > 0 ? modifiedTotalCostWithTax / modifiedWeightKg : 0;

    // Original values from recipe
    const originalCostPerKg = recipe.costPerKg;
    const originalWeightGrams = recipe.totalWeight;
    const originalTotalCost = recipe.totalCost;
    const originalTotalCostWithTax = recipe.taxedTotalCost;
    const originalCostPerKgWithTax = recipe.taxedCostPerKg;

    // Calculate savings
    const savings = originalCostPerKg - modifiedCostPerKg;
    const savingsPercent =
      originalCostPerKg > 0 ? (savings / originalCostPerKg) * 100 : 0;

    // Target gap
    const targetGap = targetCost ? modifiedCostPerKg - targetCost : undefined;

    // Count changes
    const changedIngredients = experimentIngredients.filter(
      (ing) => ing._changed
    ).length;
    const deletedIngredients =
      (recipe.ingredientCount || 0) - experimentIngredients.length;
    const changeCount = changedIngredients + Math.abs(deletedIngredients);

    return {
      originalCost: originalCostPerKg,
      modifiedCost: modifiedCostPerKg,
      originalWeight: originalWeightGrams,
      modifiedWeight: modifiedWeightGrams,
      originalTotalCost,
      modifiedTotalCost,
      originalTotalCostWithTax,
      modifiedTotalCostWithTax,
      originalCostPerKgWithTax,
      modifiedCostPerKgWithTax,
      savings,
      savingsPercent,
      targetGap,
      changeCount,
    };
  }, [recipe, experimentIngredients, supplierMaterials, targetCost]);

  // Handlers
  const handleQuantityChange = useCallback(
    (index: number, newQuantity: number) => {
      setExperimentIngredients((prev) => {
        const updated = [...prev];
        const changeTypes = new Set(updated[index]._changeTypes || []);
        changeTypes.add("quantity");

        updated[index] = {
          ...updated[index],
          quantity: newQuantity,
          _changed: true,
          _changeTypes: changeTypes,
        };
        return updated;
      });
    },
    []
  );

  const handleSupplierChange = useCallback(
    (index: number, newSupplierId: string) => {
      const newSm = supplierMaterials.find((s) => s.id === newSupplierId);
      if (!newSm) return;

      setExperimentIngredients((prev) => {
        const updated = [...prev];
        const changeTypes = new Set(updated[index]._changeTypes || []);
        changeTypes.add("supplier");

        updated[index] = {
          ...updated[index],
          supplierMaterialId: newSupplierId,
          _changed: true,
          _changeTypes: changeTypes,
        };
        return updated;
      });
    },
    [supplierMaterials]
  );

  const handleTogglePriceLock = useCallback(
    (index: number) => {
      const ing = experimentIngredients[index];
      const sm = supplierMaterials.find((s) => s.id === ing.supplierMaterialId);
      if (!sm) return;

      setExperimentIngredients((prev) => {
        const updated = [...prev];
        if (updated[index].lockedPricing) {
          const { lockedPricing: _lockedPricing, ...rest } = updated[index];
          updated[index] = rest;
        } else {
          updated[index] = {
            ...updated[index],
            lockedPricing: {
              unitPrice: sm.unitPrice,
              tax: sm.tax,
              lockedAt: new Date(),
              reason: "cost_analysis",
            },
          };
        }
        return updated;
      });
    },
    [experimentIngredients, supplierMaterials]
  );

  const handleRemoveIngredient = useCallback((index: number) => {
    setExperimentIngredients((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleResetIngredient = useCallback((index: number) => {
    setExperimentIngredients((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        quantity: updated[index]._originalQuantity || updated[index].quantity,
        supplierMaterialId:
          updated[index]._originalSupplierId ||
          updated[index].supplierMaterialId,
        _changed: false,
        _changeTypes: new Set(),
      };
      return updated;
    });
  }, []);

  const handleResetAll = useCallback(() => {
    setExperimentIngredients((prev) =>
      prev.map((ing) => ({
        ...ing,
        quantity: ing._originalQuantity || ing.quantity,
        supplierMaterialId: ing._originalSupplierId || ing.supplierMaterialId,
        _changed: false,
        _changeTypes: new Set(),
      }))
    );
  }, []);

  const getAlternatives = useCallback(
    (ing: ExperimentIngredient) => {
      const currentSm = supplierMaterials.find(
        (s) => s.id === ing.supplierMaterialId
      );
      if (!currentSm) return [];

      return supplierMaterials.filter(
        (sm) => sm.materialId === currentSm.materialId && sm.id !== currentSm.id
      );
    },
    [supplierMaterials]
  );

  const toggleAlternatives = useCallback((ingredientId: string) => {
    setExpandedAlternatives((prev) => {
      const next = new Set(prev);
      if (next.has(ingredientId)) {
        next.delete(ingredientId);
      } else {
        next.add(ingredientId);
      }
      return next;
    });
  }, []);

  const loadVariant = useCallback((variant: any, ingredients: any[]) => {
    const variantIngredients: ExperimentIngredient[] = ingredients.map(
      (ing) => ({
        id: ing.id,
        recipeId: ing.recipeId,
        supplierMaterialId: ing.supplierMaterialId,
        quantity: ing.quantity,
        unit: ing.unit,
        lockedPricing: ing.lockedPricing,
        createdAt: ing.createdAt,
        updatedAt: ing.updatedAt,
        _originalQuantity: ing.quantity,
        _originalSupplierId: ing.supplierMaterialId,
        _changeTypes: new Set<"quantity" | "supplier">(),
      })
    );

    setExperimentIngredients(variantIngredients);
    setLoadedVariantName(variant.name || null);
  }, []);

  return {
    experimentIngredients,
    metrics: calculateMetrics(),
    expandedAlternatives,
    targetCost,
    loadedVariantName,
    setTargetCost,
    initializeExperiment,
    getAlternatives,
    handleQuantityChange,
    handleSupplierChange,
    handleTogglePriceLock,
    handleRemoveIngredient,
    handleResetIngredient,
    handleResetAll,
    toggleAlternatives,
    loadVariant,
  };
}

/**
 * Fetches recipe data optimized for analytics
 *
 * Used in: Recipe Analytics dashboard
 *
 * Returns recipes with ingredient details for:
 * - Cost distribution charts
 * - Weight distribution charts
 * - Ingredient usage analysis
 *
 * @returns Array of recipes with ingredient details
 */
export function useRecipesForAnalytics(): RecipeWithIngredients[] {
  const data = useLiveQuery(async () => {
    // Fetch all needed data in parallel
    const [recipes, allIngredients, supplierMaterials, suppliers, materials] =
      await Promise.all([
        db.recipes.toArray(),
        db.recipeIngredients.toArray(),
        db.supplierMaterials.toArray(),
        db.suppliers.toArray(),
        db.materials.toArray(),
      ]);

    // Create lookup maps
    const smMap = new Map(supplierMaterials.map((sm) => [sm.id, sm]));
    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));
    const materialMap = new Map(materials.map((m) => [m.id, m]));

    // Group ingredients by recipe
    const ingredientsByRecipe = new Map<string, typeof allIngredients>();
    allIngredients.forEach((ing) => {
      if (!ingredientsByRecipe.has(ing.recipeId)) {
        ingredientsByRecipe.set(ing.recipeId, []);
      }
      ingredientsByRecipe.get(ing.recipeId)!.push(ing);
    });

    // Transform to analytics format
    return recipes.map((recipe): RecipeWithIngredients => {
      const recipeIngredients = ingredientsByRecipe.get(recipe.id) || [];

      // Calculate recipe cost
      let totalWeightGrams = 0;
      let totalCost = 0;

      const enrichedIngredients = recipeIngredients.map((ing) => {
        const sm = smMap.get(ing.supplierMaterialId);
        const supplier = sm ? supplierMap.get(sm.supplierId) : null;
        const material = sm ? materialMap.get(sm.materialId) : null;

        // Weight
        const multiplier =
          ing.unit === "kg" ? 1000 : ing.unit === "L" ? 1000 : 1;
        totalWeightGrams += ing.quantity * multiplier;

        // Cost
        const pricePerKg = ing.lockedPricing?.unitPrice || sm?.unitPrice || 0;
        const quantityInKg =
          ing.unit === "kg"
            ? ing.quantity
            : ing.unit === "L"
              ? ing.quantity
              : ing.quantity / 1000;
        const cost = pricePerKg * quantityInKg;
        totalCost += cost;

        return {
          materialName: material?.name || "Unknown",
          supplierName: supplier?.name || "Unknown",
          displayName: `${material?.name || "Unknown"} (${supplier?.name || "Unknown"})`,
          quantity: ing.quantity,
          unit: ing.unit,
          costForQuantity: cost,
        };
      });

      const weightInKg = totalWeightGrams / 1000;
      const costPerKg = weightInKg > 0 ? totalCost / weightInKg : 0;

      return {
        id: recipe.id,
        name: recipe.name,
        costPerKg,
        targetCostPerKg: recipe.targetCostPerKg,
        ingredients: enrichedIngredients,
      };
    });
  }, []);

  return data || [];
}

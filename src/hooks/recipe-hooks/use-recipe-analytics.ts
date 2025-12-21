// src/hooks/recipe-hooks/use-recipe-analytics.ts
import { db } from "@/lib/db";
import type {
  ExperimentIngredient,
  ExperimentMetrics,
  RecipeDetail,
  RecipeWithIngredients,
} from "@/types/recipe-types";
import { recipeUtils } from "@/utils/recipe-utils";
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useState } from "react";
import { useSupplierMaterialsForRecipe } from "./use-recipe-data";

/**
 * Hook for recipe experimentation in Recipe Lab
 * PROFESSIONAL: Simplified with centralized calculation utilities
 */
export function useRecipeExperiment(recipe: RecipeDetail | null) {
  const supplierMaterials = useSupplierMaterialsForRecipe();

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
   * PROFESSIONAL: Uses centralized calculation utilities
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

    // Calculate modified values using centralized utility
    const smMap = recipeUtils.createLookupMaps(supplierMaterials);
    const modifiedTotals = recipeUtils.calculateRecipeTotals(
      experimentIngredients,
      smMap
    );

    // Calculate savings using centralized utility
    const savingsData = recipeUtils.calculateSavings(
      recipe.costPerKg,
      modifiedTotals.costPerKg
    );

    // Target gap
    const targetGap = targetCost
      ? modifiedTotals.costPerKg - targetCost
      : undefined;

    // Count changes
    const changedIngredients = experimentIngredients.filter(
      (ing) => ing._changed
    ).length;
    const deletedIngredients =
      (recipe.ingredientCount || 0) - experimentIngredients.length;
    const changeCount = changedIngredients + Math.abs(deletedIngredients);

    return {
      originalCost: recipe.costPerKg,
      modifiedCost: modifiedTotals.costPerKg,
      originalWeight: recipe.totalWeight,
      modifiedWeight: modifiedTotals.totalWeightGrams,
      originalTotalCost: recipe.totalCost,
      modifiedTotalCost: modifiedTotals.totalCost,
      originalTotalCostWithTax: recipe.taxedTotalCost,
      modifiedTotalCostWithTax: modifiedTotals.totalCostWithTax,
      originalCostPerKgWithTax: recipe.taxedCostPerKg,
      modifiedCostPerKgWithTax: modifiedTotals.taxedCostPerKg,
      savings: savingsData.savings,
      savingsPercent: savingsData.savingsPercent,
      targetGap,
      changeCount,
    };
  }, [recipe, experimentIngredients, supplierMaterials, targetCost]);

  // Ingredient modification handlers
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
      (ing, index) => ({
        // Handle backward compatibility for variants created before BaseEntity extension
        id: ing.id || `${variant.id}-ing-${index}`,
        recipeId: variant.originalRecipeId, // Use variant's original recipe ID
        supplierMaterialId: ing.supplierMaterialId,
        quantity: ing.quantity,
        unit: ing.unit,
        lockedPricing: ing.lockedPricing,
        // Fallback for legacy variants
        createdAt: ing.createdAt || new Date().toISOString(),
        updatedAt: ing.updatedAt || new Date().toISOString(),
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
 * PROFESSIONAL: Uses centralized calculation and grouping
 */
export function useRecipesForAnalytics(): RecipeWithIngredients[] {
  const data = useLiveQuery(async () => {
    const [recipes, allIngredients, supplierMaterials, suppliers, materials] =
      await Promise.all([
        db.recipes.toArray(),
        db.recipeIngredients.toArray(),
        db.supplierMaterials.toArray(),
        db.suppliers.toArray(),
        db.materials.toArray(),
      ]);

    // Create lookup maps using utility
    const smMap = recipeUtils.createLookupMaps(supplierMaterials);
    const supplierMap = recipeUtils.createLookupMaps(suppliers);
    const materialMap = recipeUtils.createLookupMaps(materials);

    // Group ingredients using utility
    const ingredientsByRecipe =
      recipeUtils.groupIngredientsByRecipe(allIngredients);

    return recipes.map((recipe): RecipeWithIngredients => {
      const recipeIngredients = ingredientsByRecipe.get(recipe.id) || [];

      // Calculate totals using centralized utility
      const totals = recipeUtils.calculateRecipeTotals(
        recipeIngredients,
        smMap
      );

      const enrichedIngredients = recipeIngredients.map((ing) => {
        const sm = smMap.get(ing.supplierMaterialId);
        const supplier = sm ? supplierMap.get(sm.supplierId) : null;
        const material = sm ? materialMap.get(sm.materialId) : null;

        // Use enrichment utility
        const costDetails = sm
          ? recipeUtils.enrichIngredientWithCost(ing, sm, totals.totalCost)
          : { costForQuantity: 0 };

        return {
          materialName: material?.name || "Unknown",
          supplierName: supplier?.name || "Unknown",
          displayName: `${material?.name || "Unknown"} (${supplier?.name || "Unknown"})`,
          quantity: ing.quantity,
          unit: ing.unit,
          costForQuantity: costDetails.costForQuantity,
        };
      });

      return {
        id: recipe.id,
        name: recipe.name,
        costPerKg: totals.costPerKg,
        targetCostPerKg: recipe.targetCostPerKg,
        ingredients: enrichedIngredients,
      };
    });
  }, []);

  return data || [];
}

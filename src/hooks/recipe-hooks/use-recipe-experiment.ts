// hooks/use-recipe-experiment.ts
import { db } from "@/lib/db";
import type { RecipeDisplay, RecipeIngredient } from "@/types/shared-types";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSupplierMaterialRows } from "@/hooks/material-hooks/use-materials-queries";

import {
  convertToBaseUnit,
  normalizeToKg,
} from "../../utils/unit-conversion-utils";

export interface ExperimentIngredient extends RecipeIngredient {
  _changed?: boolean;
  _changeTypes?: Set<"quantity" | "supplier">; // Track multiple changes
  _originalQuantity?: number;
  _originalSupplierId?: string;
}

export interface ExperimentMetrics {
  originalCost: number;
  modifiedCost: number;
  originalWeight: number;
  modifiedWeight: number;
  originalTotalCost: number;
  modifiedTotalCost: number;
  originalTotalCostWithTax: number;
  modifiedTotalCostWithTax: number;
  originalCostPerKgWithTax: number;
  modifiedCostPerKgWithTax: number;
  savings: number;
  savingsPercent: number;
  targetGap?: number;
  changeCount: number;
}

export function useRecipeExperiment(recipe: RecipeDisplay | null) {
  const supplierMaterials = useSupplierMaterialRows();

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

  const initializeExperiment = useCallback((newRecipe: RecipeDisplay) => {
    setExperimentIngredients(
      newRecipe.ingredients.map((ing) => ({
        // Only include RecipeIngredient properties
        id: ing.id,
        recipeId: ing.recipeId,
        supplierMaterialId: ing.supplierMaterialId,
        quantity: ing.quantity,
        unit: ing.unit,
        lockedPricing: ing.lockedPricing,
        createdAt: ing.createdAt,
        updatedAt: ing.updatedAt,
        // Experiment tracking fields
        _originalQuantity: ing.quantity,
        _originalSupplierId: ing.supplierMaterialId,
        _changeTypes: new Set<"quantity" | "supplier">(),
      }))
    );
    setTargetCost(newRecipe.targetCostPerKg);
    setLoadedVariantName(null);
  }, []);

  // Calculate comprehensive metrics
  const metrics = useMemo((): ExperimentMetrics => {
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
    let modifiedWeight = 0;

    experimentIngredients.forEach((ing) => {
      const sm = supplierMaterials.find((s) => s.id === ing.supplierMaterialId);
      if (!sm) return;

      const quantityInKg = normalizeToKg(ing.quantity, ing.unit);
      const pricePerKg = ing.lockedPricing?.unitPrice || sm.unitPrice;
      const tax = ing.lockedPricing?.tax || sm.tax || 0;
      const cost = pricePerKg * quantityInKg;
      const costWithTax = cost * (1 + tax / 100);

      modifiedTotalCost += cost;
      modifiedTotalCostWithTax += costWithTax;
      modifiedWeight += convertToBaseUnit(ing.quantity, ing.unit).quantity;
    });

    const modifiedCostPerKg =
      modifiedWeight > 0
        ? modifiedTotalCost / normalizeToKg(modifiedWeight, "gm")
        : 0;

    const modifiedCostPerKgWithTax =
      modifiedWeight > 0
        ? modifiedTotalCostWithTax / normalizeToKg(modifiedWeight, "gm")
        : 0;

    // Original values
    const originalCostPerKg = recipe.costPerKg;
    const originalWeight = experimentIngredients.reduce((sum, ing) => {
      return sum + convertToBaseUnit(ing.quantity, ing.unit).quantity;
    }, 0);
    const originalTotalCost = recipe.totalCost;
    const originalTotalCostWithTax = recipe.taxedTotalCost;
    const originalCostPerKgWithTax = recipe.taxedCostPerKg;

    // Calculate savings
    const savings = originalCostPerKg - modifiedCostPerKg;
    const savingsPercent =
      originalCostPerKg > 0 ? (savings / originalCostPerKg) * 100 : 0;

    // Target gap
    const targetGap = targetCost ? modifiedCostPerKg - targetCost : undefined;

    // Count changes - include both modified ingredients and deletions
    const deletedCount =
      recipe.ingredients.length - experimentIngredients.length;
    const modifiedCount = experimentIngredients.filter(
      (ing) => ing._changed
    ).length;
    const changeCount = deletedCount + modifiedCount;

    return {
      originalCost: originalCostPerKg,
      modifiedCost: modifiedCostPerKg,
      originalWeight,
      modifiedWeight,
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

  // Get alternatives for an ingredient
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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { lockedPricing, ...rest } = updated[index];
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
    setExperimentIngredients((prev) => {
      // Keep track of deleted ingredients by filtering them out
      const filtered = prev.filter((_, i) => i !== index);
      // The existence of fewer ingredients than original will be counted as changes
      return filtered;
    });
    toast.success("Ingredient removed");
  }, []);

  const handleResetIngredient = useCallback(
    (index: number) => {
      if (!recipe) return;

      const originalIng = recipe.ingredients[index];
      if (!originalIng) return;

      setExperimentIngredients((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...originalIng,
          _originalQuantity: originalIng.quantity,
          _originalSupplierId: originalIng.supplierMaterialId,
          _changed: false,
          _changeTypes: new Set(),
        };
        return updated;
      });

      toast.success("Ingredient reset");
    },
    [recipe]
  );

  const handleResetAll = useCallback(() => {
    if (recipe) {
      // Instead of mapping over current ingredients (which might have some removed),
      // start fresh from recipe.ingredients to also restore deleted ones
      const resetIngredients = recipe.ingredients.map((ing) => ({
        ...ing,
        _originalQuantity: ing.quantity,
        _originalSupplierId: ing.supplierMaterialId,
        _changed: false,
        _changeTypes: new Set<"quantity" | "supplier">(),
      }));
      setExperimentIngredients(resetIngredients);
      toast.success("Reset all changes");
    }
  }, [recipe]);

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

  // Load a variant into the experiment.
  const loadVariant = useCallback(
    async (variant: any) => {
      if (!recipe || !variant) return;

      try {
        const variantIngredientsRaw = await db.recipeIngredients
          .where("recipeId")
          .equals(variant.id)
          .toArray();

        if (variantIngredientsRaw.length === 0) {
          toast.error(`No ingredients found for variant: ${variant.name}`);
          return;
        }

        const variantIngredients: ExperimentIngredient[] =
          variantIngredientsRaw.map((ing: RecipeIngredient) => ({
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
          }));

        setExperimentIngredients(variantIngredients);
        setLoadedVariantName(variant.name || null);
        toast.success(`Loaded variant: ${variant.name || "Variant"}`);
      } catch (error) {
        console.error("Failed to load variant ingredients:", error);
        toast.error(`Failed to load ingredients for variant: ${variant.name}`);
      }
    },
    [recipe]
  );

  return {
    experimentIngredients,
    metrics,
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

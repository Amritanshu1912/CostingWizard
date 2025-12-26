// src/hooks/products/use-product-options.ts

import { db } from "@/lib/db";
import type {
  PackagingOption,
  LabelOption,
  RecipeOption,
} from "@/types/product-types";
import type { RecipeVariant } from "@/types/recipe-types";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";

// ============================================================================
// DROPDOWN OPTIONS HOOKS
// These hooks provide minimal data needed for form dropdowns
// ============================================================================

/**
 * Hook: Get packaging options for dropdowns
 * Returns minimal data: id, displayName, unitPrice, capacity
 *
 * @returns Array of packaging options for selection
 *
 * @example
 * const packagingOptions = usePackagingOptions();
 * <Select>
 *   {packagingOptions.map(p => (
 *     <SelectItem value={p.id}>{p.displayName}</SelectItem>
 *   ))}
 * </Select>
 */
export function usePackagingOptions(): PackagingOption[] {
  const supplierPackagingsQuery = useLiveQuery(
    () => db.supplierPackaging.toArray(),
    []
  );
  const packagingsQuery = useLiveQuery(() => db.packaging.toArray(), []);
  const suppliersQuery = useLiveQuery(() => db.suppliers.toArray(), []);

  const supplierPackagings = useMemo(
    () => supplierPackagingsQuery || [],
    [supplierPackagingsQuery]
  );
  const packagings = useMemo(() => packagingsQuery || [], [packagingsQuery]);
  const suppliers = useMemo(() => suppliersQuery || [], [suppliersQuery]);

  return useMemo(() => {
    // Build lookup maps
    const packagingMap = new Map(packagings.map((p) => [p.id, p]));
    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    // Create options with display names
    return supplierPackagings.map((sp) => {
      const packaging = packagingMap.get(sp.packagingId);
      const supplier = supplierMap.get(sp.supplierId);

      return {
        id: sp.id,
        displayName: `${packaging?.name} - ${packaging?.capacity}${packaging?.capacityUnit} (${supplier?.name})`,
        unitPrice: sp.unitPrice,
        capacity: packaging?.capacity || 0,
        capacityUnit: packaging?.capacityUnit || "ml",
      } as PackagingOption;
    });
  }, [supplierPackagings, packagings, suppliers]);
}

/**
 * Hook: Get label options for dropdowns
 * Returns minimal data: id, displayName, unitPrice
 *
 * @returns Array of label options for selection
 *
 * @example
 * const labelOptions = useLabelOptions();
 * <Select>
 *   {labelOptions.map(l => (
 *     <SelectItem value={l.id}>{l.displayName}</SelectItem>
 *   ))}
 * </Select>
 */
export function useLabelOptions(): LabelOption[] {
  const supplierLabelsQuery = useLiveQuery(
    () => db.supplierLabels.toArray(),
    []
  );
  const labelsQuery = useLiveQuery(() => db.labels.toArray(), []);
  const suppliersQuery = useLiveQuery(() => db.suppliers.toArray(), []);

  const supplierLabels = useMemo(
    () => supplierLabelsQuery || [],
    [supplierLabelsQuery]
  );
  const labels = useMemo(() => labelsQuery || [], [labelsQuery]);
  const suppliers = useMemo(() => suppliersQuery || [], [suppliersQuery]);

  return useMemo(() => {
    // Build lookup maps
    const labelMap = new Map(labels.map((l) => [l.id, l]));
    const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

    // Create options with display names
    return supplierLabels.map((sl) => {
      const label = sl.labelId ? labelMap.get(sl.labelId) : null;
      const supplier = supplierMap.get(sl.supplierId);

      return {
        id: sl.id,
        displayName: `${label?.name || "Custom Label"} (${supplier?.name})`,
        unitPrice: sl.unitPrice,
      } as LabelOption;
    });
  }, [supplierLabels, labels, suppliers]);
}

/**
 * Hook: Get recipe options for dropdowns
 * Returns minimal data: id, name, costPerKg
 *
 * @returns Array of recipe options for selection
 *
 * @example
 * const recipeOptions = useRecipeOptions();
 * <Select>
 *   {recipeOptions.map(r => (
 *     <SelectItem value={r.id}>{r.name}</SelectItem>
 *   ))}
 * </Select>
 */
export function useRecipeOptions(): RecipeOption[] {
  const recipesQuery = useLiveQuery(() => db.recipes.toArray(), []);
  const recipeIngredientsQuery = useLiveQuery(
    () => db.recipeIngredients.toArray(),
    []
  );
  const supplierMaterialsQuery = useLiveQuery(
    () => db.supplierMaterials.toArray(),
    []
  );

  const recipes = useMemo(() => recipesQuery || [], [recipesQuery]);
  const recipeIngredients = useMemo(
    () => recipeIngredientsQuery || [],
    [recipeIngredientsQuery]
  );
  const supplierMaterials = useMemo(
    () => supplierMaterialsQuery || [],
    [supplierMaterialsQuery]
  );

  return useMemo(() => {
    // Build supplier material map
    const supplierMaterialMap = new Map(
      supplierMaterials.map((sm) => [sm.id, sm])
    );

    // Calculate cost per kg for each recipe
    return recipes.map((recipe) => {
      const ingredients = recipeIngredients.filter(
        (i) => i.recipeId === recipe.id
      );

      let totalCost = 0;
      let totalWeight = 0;

      ingredients.forEach((ingredient) => {
        const supplierMaterial = supplierMaterialMap.get(
          ingredient.supplierMaterialId
        );
        if (supplierMaterial) {
          const pricePerKg =
            ingredient.lockedPricing?.unitPrice ||
            supplierMaterial.unitPrice ||
            0;

          // Simple conversion - normalize to kg
          const quantityKg =
            ingredient.unit === "kg"
              ? ingredient.quantity
              : ingredient.quantity / 1000;

          totalCost += pricePerKg * quantityKg;
          totalWeight += quantityKg;
        }
      });

      const costPerKg = totalWeight > 0 ? totalCost / totalWeight : 0;

      return {
        id: recipe.id,
        name: recipe.name,
        costPerKg,
        isVariant: false,
      } as RecipeOption;
    });
  }, [recipes, recipeIngredients, supplierMaterials]);
}

/**
 * Hook: Get recipe variant options for a specific recipe
 * Returns minimal data: id, name, costPerKg, isVariant flag
 *
 * @param recipeId - The parent recipe ID to fetch variants for
 * @returns Array of recipe variant options
 *
 * @example
 * const variants = useRecipeVariantOptions("recipe-1");
 * <Select>
 *   {variants.map(v => (
 *     <SelectItem value={v.id}>{v.name}</SelectItem>
 *   ))}
 * </Select>
 */
export function useRecipeVariantOptions(
  recipeId: string | null
): RecipeOption[] {
  const variantsQuery = useLiveQuery(async (): Promise<RecipeVariant[]> => {
    if (!recipeId) return [];
    return db.recipeVariants
      .where("originalRecipeId")
      .equals(recipeId)
      .toArray();
  }, [recipeId]);

  const variants = useMemo(() => variantsQuery || [], [variantsQuery]);

  // For variants, we need to calculate cost from snapshot
  return useMemo(() => {
    if (!variants || variants.length === 0) return [];

    // TODO: Calculate cost per kg from variant snapshot
    // For now, return basic info
    return variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      costPerKg: 0, // Would need to calculate from snapshot
      isVariant: true,
    }));
  }, [variants]);
}

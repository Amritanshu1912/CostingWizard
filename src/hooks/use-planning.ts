import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { normalizeToKg } from "./use-recipes";
import type {
  ProductionBatch,
  BatchProductItem,
  CapacityUnit,
  RecipeIngredient,
} from "@/lib/types";

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Interface for material requirements across production batches
 */
export interface MaterialRequirement {
  materialId: string;
  materialName: string;
  totalRequired: number;
  totalAvailable: number;
  totalShortage: number;
  unit: CapacityUnit;
  batches: string[];
}

/**
 * Interface for material cost breakdown item
 */
export interface MaterialCostBreakdownItem {
  materialId: string;
  materialName: string;
  totalCost: number;
  totalCostWithTax: number;
  percentage: number;
  batches: string[];
}

/**
 * Hook that returns all production batches with enriched data
 * Uses Dexie's reactive queries for real-time updates
 */
export function useProductionBatches(): ProductionBatch[] {
  const batchesData = useLiveQuery(() => db.productionBatches.toArray(), []);
  return batchesData || [];
}

/**
 * Hook that returns active production batches (not cancelled)
 */
export function useActiveProductionBatches(): ProductionBatch[] {
  const batches = useProductionBatches();
  return useMemo(
    () => batches.filter((b) => b.status !== "cancelled"),
    [batches]
  );
}

/**
 * Hook that returns a single production batch by ID
 */
export function useProductionBatch(
  batchId: string | null | undefined
): ProductionBatch | null {
  const batches = useProductionBatches();
  return useMemo(() => {
    if (!batchId) return null;
    return batches.find((b) => b.id === batchId) || null;
  }, [batchId, batches]);
}

/**
 * Hook that computes material requirements across all batches
 * Returns aggregated material needs by calculating from recipe ingredients
 */
export function useMaterialRequirements(): Record<string, MaterialRequirement> {
  const data = useLiveQuery(async () => {
    const [
      batches,
      products,
      productVariants,
      recipes,
      recipeIngredients,
      supplierMaterials,
      materials,
    ] = await Promise.all([
      db.productionBatches.toArray(),
      db.products.toArray(),
      db.productVariants.toArray(),
      db.recipes.toArray(),
      db.recipeIngredients.toArray(),
      db.supplierMaterials.toArray(),
      db.materials.toArray(),
    ]);

    // Create lookup maps
    const productMap = new Map(products.map((p) => [p.id, p]));
    const variantMap = new Map(productVariants.map((v) => [v.id, v]));
    const recipeMap = new Map(recipes.map((r) => [r.id, r]));
    const ingredientMap = new Map<string, RecipeIngredient[]>();
    recipeIngredients.forEach((ing) => {
      if (!ingredientMap.has(ing.recipeId)) {
        ingredientMap.set(ing.recipeId, []);
      }
      ingredientMap.get(ing.recipeId)!.push(ing);
    });
    const smMap = new Map(supplierMaterials.map((sm) => [sm.id, sm]));
    const materialMap = new Map(materials.map((m) => [m.id, m]));

    return {
      batches,
      productMap,
      variantMap,
      recipeMap,
      ingredientMap,
      smMap,
      materialMap,
    };
  }, []);

  return useMemo(() => {
    if (!data) return {};

    const {
      batches,
      productMap,
      variantMap,
      recipeMap,
      ingredientMap,
      smMap,
      materialMap,
    } = data;
    const requirements: Record<string, MaterialRequirement> = {};

    batches.forEach((batch) => {
      batch.items.forEach((item) => {
        const product = productMap.get(item.productId);
        if (!product) return;

        const recipe = recipeMap.get(product.recipeId);
        if (!recipe) return;

        const ingredients = ingredientMap.get(recipe.id) || [];

        item.variants.forEach((batchVariant) => {
          const variant = variantMap.get(batchVariant.variantId);
          if (!variant) return;

          // Calculate units to produce
          const fillInKg = normalizeToKg(
            batchVariant.fillQuantity,
            batchVariant.fillUnit
          );
          const unitsToProduce = Math.ceil(
            fillInKg / normalizeToKg(variant.fillQuantity, variant.fillUnit)
          );

          ingredients.forEach((ing) => {
            const sm = smMap.get(ing.supplierMaterialId);
            if (!sm) return;

            const material = materialMap.get(sm.materialId);
            if (!material) return;

            const quantityNeeded = ing.quantity * unitsToProduce;
            const quantityInKg = normalizeToKg(quantityNeeded, ing.unit);

            const key = sm.materialId;
            if (!requirements[key]) {
              requirements[key] = {
                materialId: sm.materialId,
                materialName: material.name,
                totalRequired: 0,
                totalAvailable: 0, // No inventory system yet
                totalShortage: 0,
                unit: sm.unit,
                batches: [],
              };
            }

            requirements[key].totalRequired += quantityInKg;
            if (!requirements[key].batches.includes(batch.id)) {
              requirements[key].batches.push(batch.id);
            }
          });
        });
      });
    });

    // Calculate shortages
    Object.values(requirements).forEach((req) => {
      req.totalShortage = Math.max(0, req.totalRequired - req.totalAvailable);
    });

    return requirements;
  }, [data]);
}

/**
 * Hook that computes production planning statistics
 */
export function usePlanningStats() {
  const batches = useProductionBatches();

  return useMemo(() => {
    const totalBatches = batches.length;
    const activeBatches = batches.filter(
      (b) => b.status === "in-progress" || b.status === "scheduled"
    ).length;
    const completedBatches = batches.filter(
      (b) => b.status === "completed"
    ).length;
    const draftBatches = batches.filter((b) => b.status === "draft").length;

    const totalCost = batches.reduce((sum, b) => sum + b.totalCost, 0);
    const totalRevenue = batches.reduce((sum, b) => sum + b.totalRevenue, 0);
    const totalProfit = batches.reduce((sum, b) => sum + b.totalProfit, 0);

    const avgProfitMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalBatches,
      activeBatches,
      completedBatches,
      draftBatches,
      totalCost,
      totalRevenue,
      totalProfit,
      avgProfitMargin,
    };
  }, [batches]);
}

/**
 * Hook that returns batches filtered by status
 */
export function useBatchesByStatus(
  status: ProductionBatch["status"]
): ProductionBatch[] {
  const batches = useProductionBatches();
  return useMemo(
    () => batches.filter((b) => b.status === status),
    [batches, status]
  );
}

/**
 * Hook that returns batches within a date range
 */
export function useBatchesInDateRange(
  startDate: string,
  endDate: string
): ProductionBatch[] {
  const batches = useProductionBatches();
  return useMemo(() => {
    return batches.filter((batch) => {
      return batch.startDate >= startDate && batch.endDate <= endDate;
    });
  }, [batches, startDate, endDate]);
}

/**
 * Hook that computes critical material shortages across all batches
 */
export function useCriticalShortages(): {
  materialId: string;
  materialName: string;
  totalShortage: number;
  unit: string;
  affectedBatches: number;
}[] {
  const requirements = useMaterialRequirements();

  return useMemo(() => {
    return Object.values(requirements)
      .filter((req) => req.totalShortage > 0)
      .map((req) => ({
        materialId: req.materialId,
        materialName: req.materialName,
        totalShortage: req.totalShortage,
        unit: req.unit,
        affectedBatches: req.batches.length,
      }))
      .sort((a, b) => b.totalShortage - a.totalShortage);
  }, [requirements]);
}

/**
 * Hook that returns production batches with search functionality
 */
export function useFilteredBatches(searchTerm: string): ProductionBatch[] {
  const batches = useProductionBatches();

  return useMemo(() => {
    if (!searchTerm.trim()) return batches;

    const term = searchTerm.toLowerCase();
    return batches.filter(
      (batch) =>
        batch.batchName.toLowerCase().includes(term) ||
        batch.description?.toLowerCase().includes(term)
    );
  }, [batches, searchTerm]);
}

/**
 * Returns material cost breakdown for chart visualization
 * Shows top materials by cost across all production batches
 */
export function useMaterialCostBreakdown(): MaterialCostBreakdownItem[] {
  const batches = useProductionBatches();
  const requirements = useMaterialRequirements();

  return useMemo(() => {
    const breakdown: MaterialCostBreakdownItem[] = [];
    let totalCost = 0;

    // Calculate costs for each material requirement
    Object.values(requirements).forEach(async (req) => {
      // Get supplier materials for this material to calculate average cost
      const supplierMaterials = await db.supplierMaterials
        .where("materialId")
        .equals(req.materialId)
        .toArray();

      if (supplierMaterials.length === 0) return;

      // Use the cheapest available supplier for cost calculation
      const cheapestSupplier = supplierMaterials
        .filter((sm) => sm.availability === "in-stock")
        .sort((a, b) => a.unitPrice - b.unitPrice)[0];

      if (!cheapestSupplier) return;

      const costForRequired = req.totalRequired * cheapestSupplier.unitPrice;
      const taxAmount = costForRequired * (cheapestSupplier.tax / 100);
      const totalCostWithTax = costForRequired + taxAmount;

      breakdown.push({
        materialId: req.materialId,
        materialName: req.materialName,
        totalCost: costForRequired,
        totalCostWithTax,
        percentage: 0, // Will be calculated after total
        batches: req.batches,
      });

      totalCost += totalCostWithTax;
    });

    // Calculate percentages
    breakdown.forEach((item) => {
      item.percentage =
        totalCost > 0 ? (item.totalCostWithTax / totalCost) * 100 : 0;
    });

    // Sort by cost descending and return top items
    return breakdown
      .sort((a, b) => b.totalCostWithTax - a.totalCostWithTax)
      .slice(0, 10); // Top 10 materials by cost
  }, [batches, requirements]);
}

/**
 * Calculate total material cost across all batches.
 * Note: Simplified implementation - full version would calculate from recipes
 */
export function useCalculateTotalMaterialCost(
  batches: ProductionBatch[]
): number {
  // Placeholder implementation
  // Full implementation would sum costs from recipe ingredients
  // scaled by production quantities
  return 0;
}

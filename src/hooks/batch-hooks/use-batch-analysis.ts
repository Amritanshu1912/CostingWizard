// src/hooks/batch-hooks/use-batch-analysis.ts
import { useLiveQuery } from "dexie-react-hooks";
import type {
  BatchCostAnalysis,
  VariantCostAnalysis,
} from "@/types/batch-types";
import type {
  BatchRequirementsAnalysis,
  BatchRequirementsOverview,
  BatchRequirementsByCategory,
} from "@/types/batch-types";
import { useBatchFoundation } from "./use-batch-data";
import { calculateVariantCost } from "@/utils/batch-calculation-utils";
import {
  calculateVariantMaterialRequirements,
  calculateVariantPackagingRequirements,
  calculateVariantLabelRequirements,
  aggregateRequirements,
  groupRequirementsBySupplier,
  groupRequirementsByProduct,
  findItemsWithoutInventory,
} from "@/utils/batch-requirements-utils";

/**
 * Calculates complete cost analysis for a batch
 * Uses foundation hook to avoid redundant queries and calculations
 *
 * @param batchId - ID of the batch to analyze
 * @returns BatchCostAnalysis or null if batch not found
 */
export function useBatchCostAnalysis(
  batchId: string | null
): BatchCostAnalysis | null {
  const foundation = useBatchFoundation(batchId);

  return (
    useLiveQuery(async (): Promise<BatchCostAnalysis | null> => {
      if (!foundation) return null;

      // Accumulators
      let totalUnits = 0;
      let totalCost = 0;
      let totalRevenue = 0;
      let materialsCost = 0;
      let packagingCost = 0;
      let labelsCost = 0;

      const variantCosts: VariantCostAnalysis[] = [];

      // Process each variant (already filtered for units > 0)
      for (const pv of foundation.variants) {
        // Calculate costs using utility
        const costs = await calculateVariantCost(
          pv.variant,
          pv.units,
          pv.fillInKg
        );

        // Accumulate totals
        totalUnits += pv.units;
        totalCost += costs.totalCost;
        totalRevenue += costs.totalRevenue;
        materialsCost += costs.materialsCost;
        packagingCost += costs.packagingCost;
        labelsCost += costs.labelsCost;

        // Add variant cost analysis
        variantCosts.push({
          variantId: pv.variantId,
          variantName: pv.variantName,
          productName: pv.productName,
          fillQuantity: pv.variant.fillQuantity,
          fillUnit: pv.variant.fillUnit,
          units: pv.units,
          costPerUnit: costs.costPerUnit,
          revenuePerUnit: costs.revenuePerUnit,
          totalCost: costs.totalCost,
          totalRevenue: costs.totalRevenue,
          profit: costs.profit,
          margin: costs.margin,
        });
      }

      // Calculate final metrics
      const totalProfit = totalRevenue - totalCost;
      const profitMargin =
        totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

      return {
        batchId: foundation.batch.id,
        totalUnits,
        totalCost,
        totalRevenue,
        totalProfit,
        profitMargin,
        materialsCost,
        packagingCost,
        labelsCost,
        materialsPercentage:
          totalCost > 0 ? (materialsCost / totalCost) * 100 : 0,
        packagingPercentage:
          totalCost > 0 ? (packagingCost / totalCost) * 100 : 0,
        labelsPercentage: totalCost > 0 ? (labelsCost / totalCost) * 100 : 0,
        variantCosts,
      };
    }, [foundation]) || null
  );
}

/**
 * Calculates complete requirements analysis for a batch
 * Uses foundation hook to avoid redundant queries and calculations
 *
 * @param batchId - ID of the batch to analyze
 * @returns BatchRequirementsAnalysis or null if batch not found
 */
export function useBatchRequirements(
  batchId: string | null
): BatchRequirementsAnalysis | null {
  const foundation = useBatchFoundation(batchId);

  return (
    useLiveQuery(async (): Promise<BatchRequirementsAnalysis | null> => {
      if (!foundation) return null;

      // Arrays to collect all requirements with product/variant context
      const allMaterials = [];
      const allPackaging = [];
      const allLabels = [];

      // Process each variant (already filtered, metrics calculated)
      for (const pv of foundation.variants) {
        // Calculate material requirements
        if (pv.recipeId) {
          const materials = await calculateVariantMaterialRequirements({
            productId: pv.productId,
            productName: pv.productName,
            variantId: pv.variantId,
            variantName: pv.variantName,
            fillQtyInKg: pv.fillInKg,
            recipeId: pv.recipeId,
          });
          allMaterials.push(...materials);
        }

        // Calculate packaging requirements
        const packaging = await calculateVariantPackagingRequirements({
          productId: pv.productId,
          productName: pv.productName,
          variantId: pv.variantId,
          variantName: pv.variantName,
          units: pv.units,
          packagingSelectionId: pv.variant.packagingSelectionId,
        });
        allPackaging.push(...packaging);

        // Calculate label requirements
        const labels = await calculateVariantLabelRequirements({
          productId: pv.productId,
          productName: pv.productName,
          variantId: pv.variantId,
          variantName: pv.variantName,
          units: pv.units,
          frontLabelId: pv.variant.frontLabelSelectionId,
          backLabelId: pv.variant.backLabelSelectionId,
        });
        allLabels.push(...labels);
      }

      // Aggregate requirements by item + supplier
      const materials = aggregateRequirements(allMaterials);
      const packaging = aggregateRequirements(allPackaging);
      const labels = aggregateRequirements(allLabels);

      // Calculate totals
      const totalMaterialCost = materials.reduce(
        (sum, m) => sum + m.totalCost,
        0
      );
      const totalPackagingCost = packaging.reduce(
        (sum, p) => sum + p.totalCost,
        0
      );
      const totalLabelCost = labels.reduce((sum, l) => sum + l.totalCost, 0);
      const totalCost = totalMaterialCost + totalPackagingCost + totalLabelCost;

      // Group by supplier
      const bySupplier = groupRequirementsBySupplier(
        materials,
        packaging,
        labels
      );

      // Group by product
      const byProduct = groupRequirementsByProduct(
        allMaterials,
        allPackaging,
        allLabels
      );

      // Find critical shortages
      const criticalShortages = [...materials, ...packaging, ...labels].filter(
        (item) => item.shortage > 0
      );

      // Find items without inventory tracking
      const itemsWithoutInventory = findItemsWithoutInventory(
        materials,
        packaging,
        labels
      );

      // Build overview
      const overview: BatchRequirementsOverview = {
        batchId: foundation.batch.id,
        totalItems: materials.length + packaging.length + labels.length,
        totalCost,
        supplierCount: bySupplier.length,
        shortageCount: criticalShortages.length,
        materialCount: materials.length,
        packagingCount: packaging.length,
        labelCount: labels.length,
        materialCost: totalMaterialCost,
        packagingCost: totalPackagingCost,
        labelCost: totalLabelCost,
      };

      // Build category breakdown
      const byCategory: BatchRequirementsByCategory = {
        materials,
        packaging,
        labels,
        totalMaterialCost,
        totalPackagingCost,
        totalLabelCost,
      };

      return {
        batchId: foundation.batch.id,
        overview,
        byCategory,
        bySupplier,
        byProduct,
        criticalShortages,
        itemsWithoutInventory,
      };
    }, [foundation]) || null
  );
}

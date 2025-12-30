// hooks/use-batches.ts
import { db } from "@/lib/db";
import type {
  BatchCostAnalysis,
  BatchWithDetails,
  BatchRequirementsAnalysis,
  BatchProductItem,
  BatchVariantItem,
} from "@/types/batch-types";
import type { ProductVariant } from "@/types/product-types";
import { useLiveQuery } from "dexie-react-hooks";

import {
  calculateUnits,
  convertToDisplayUnit,
  normalizeToKg,
} from "@/utils/unit-conversion-utils";

import { getRecipeCostPerKg } from "@/hooks/product-hooks/use-product-costs";
import {
  aggregateRequirements,
  calculateCostWithTax,
  calculateVariantLabelRequirements,
  calculateVariantMaterialRequirements,
  calculateVariantPackagingRequirements,
  findItemsWithoutInventory,
  groupByProduct,
  groupBySupplier,
  type LabelRequirement,
  type MaterialRequirement,
  type PackagingRequirement,
} from "./use-batch-calculations";

// ============================================================================
// BASIC BATCH LIST
// ============================================================================

/**
 * Hook for basic batch list (lightweight)
 */
export function useProductionBatches() {
  return useLiveQuery(() => db.productionBatches.toArray(), []) || [];
}

// ============================================================================
// BATCH DETAILS WITH PRODUCTS
// ============================================================================

/**
 * Hook for batch details with products and variants
 */
export function useBatchDetails(batchId: string | null) {
  return useLiveQuery(async (): Promise<BatchWithDetails | null> => {
    if (!batchId) return null;

    const batch = await db.productionBatches.get(batchId);
    if (!batch) return null;

    const products = await Promise.all(
      batch.items.map(async (item: BatchProductItem) => {
        const product = await db.products.get(item.productId);
        if (!product) return null;

        const variants = await Promise.all(
          item.variants.map(async (variantItem: BatchVariantItem) => {
            const variant = await db.productVariants.get(variantItem.variantId);
            if (!variant) return null;

            // Calculate units
            const units = calculateUnits(
              variant.fillQuantity,
              variant.fillUnit,
              variantItem.totalFillQuantity,
              variantItem.fillUnit
            );

            // Convert for display
            const displayQty = convertToDisplayUnit(
              variantItem.totalFillQuantity,
              "kg"
            );

            return {
              variantId: variantItem.variantId,
              variantName: variant.name,
              productName: product.name,
              fillQuantity: variant.fillQuantity,
              fillUnit: variant.fillUnit,
              totalFillQuantity: variantItem.totalFillQuantity,
              units,
              displayQuantity: `${displayQty.quantity} ${displayQty.unit}`,
            };
          })
        );

        return {
          productId: item.productId,
          productName: product.name,
          variants: variants.filter(
            (v): v is NonNullable<typeof v> => v !== null
          ),
        };
      })
    );

    return {
      ...batch,
      products: products.filter(
        (p: any): p is NonNullable<typeof p> => p !== null
      ),
    };
  }, [batchId]);
}

// ============================================================================
// COST ANALYSIS
// ============================================================================

/**
 * Calculate cost analysis for a single variant
 */
async function calculateVariantCostAnalysis(variant: ProductVariant) {
  // Get recipe cost per kg
  const recipeCost = await getRecipeCostPerKg(variant.productId);

  // Get packaging details
  const packaging = await db.supplierPackaging.get(
    variant.packagingSelectionId
  );

  // Get label details
  const frontLabel = variant.frontLabelSelectionId
    ? await db.supplierLabels.get(variant.frontLabelSelectionId)
    : null;

  const backLabel = variant.backLabelSelectionId
    ? await db.supplierLabels.get(variant.backLabelSelectionId)
    : null;

  // Convert fill quantity to kg
  const fillInKg = normalizeToKg(variant.fillQuantity, variant.fillUnit);

  // Calculate recipe costs
  const recipeCostForFill = recipeCost.costPerKg * fillInKg;
  const recipeTaxForFill = recipeCost.taxPerKg * fillInKg;
  const recipeTotalForFill = recipeCostForFill + recipeTaxForFill;

  // Calculate packaging costs
  const packagingUnitPrice = packaging?.unitPrice || 0;
  const packagingTax = packaging?.tax || 0;
  const packagingTotal = calculateCostWithTax(
    1,
    packagingUnitPrice,
    packagingTax
  );

  // Calculate label costs
  const frontLabelTotal = frontLabel
    ? calculateCostWithTax(1, frontLabel.unitPrice, frontLabel.tax || 0)
    : 0;

  const backLabelTotal = backLabel
    ? calculateCostWithTax(1, backLabel.unitPrice, backLabel.tax || 0)
    : 0;

  const totalLabelsCost = frontLabelTotal + backLabelTotal;
  const totalCostWithTax =
    recipeTotalForFill + packagingTotal + totalLabelsCost;

  return { totalCostWithTax };
}

/**
 * Hook for cost analysis
 */
export function useBatchCostAnalysis(batchId: string | null) {
  return useLiveQuery(async (): Promise<BatchCostAnalysis | null> => {
    if (!batchId) return null;

    const batch = await db.productionBatches.get(batchId);
    if (!batch) return null;

    let totalUnits = 0;
    let totalCost = 0;
    let totalRevenue = 0;
    const variantCosts = [];

    let materialsCost = 0;
    let packagingCost = 0;
    let labelsCost = 0;

    for (const item of batch.items) {
      const product = await db.products.get(item.productId);

      for (const variantItem of item.variants) {
        const variant = await db.productVariants.get(variantItem.variantId);
        if (!variant) continue;

        // Get cost analysis for this variant
        const costAnalysis = await calculateVariantCostAnalysis(variant);

        // Calculate units
        const units = calculateUnits(
          variant.fillQuantity,
          variant.fillUnit,
          variantItem.totalFillQuantity,
          variantItem.fillUnit
        );

        if (units === 0) continue;

        const variantCost = costAnalysis.totalCostWithTax * units;
        const variantRevenue = variant.sellingPricePerUnit * units;

        // Calculate component costs for this variant
        const recipeCost = await getRecipeCostPerKg(variant.productId);
        const fillInKg = normalizeToKg(variant.fillQuantity, variant.fillUnit);
        const recipeTotalForFill =
          (recipeCost.costPerKg + recipeCost.taxPerKg) * fillInKg;
        materialsCost += recipeTotalForFill * units;

        const packaging = await db.supplierPackaging.get(
          variant.packagingSelectionId
        );
        if (packaging) {
          const pkgCost = calculateCostWithTax(
            1,
            packaging.unitPrice,
            packaging.tax || 0
          );
          packagingCost += pkgCost * units;
        }

        const frontLabel = variant.frontLabelSelectionId
          ? await db.supplierLabels.get(variant.frontLabelSelectionId)
          : null;
        const backLabel = variant.backLabelSelectionId
          ? await db.supplierLabels.get(variant.backLabelSelectionId)
          : null;

        if (frontLabel) {
          labelsCost +=
            calculateCostWithTax(1, frontLabel.unitPrice, frontLabel.tax || 0) *
            units;
        }
        if (backLabel) {
          labelsCost +=
            calculateCostWithTax(1, backLabel.unitPrice, backLabel.tax || 0) *
            units;
        }

        variantCosts.push({
          variantId: variant.id,
          variantName: variant.name,
          productName: product?.name || "Unknown",
          fillQuantity: variant.fillQuantity,
          fillUnit: variant.fillUnit,
          units,
          totalCost: variantCost,
          totalRevenue: variantRevenue,
          profit: variantRevenue - variantCost,
          margin:
            variantRevenue > 0
              ? ((variantRevenue - variantCost) / variantRevenue) * 100
              : 0,
          costPerUnit: variantCost / units,
          revenuePerUnit: variantRevenue / units,
        });

        totalUnits += units;
        totalCost += variantCost;
        totalRevenue += variantRevenue;
      }
    }

    const totalProfit = totalRevenue - totalCost;
    const profitMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      batchId: batch.id,
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
  }, [batchId]);
}

// ============================================================================
// REQUIREMENTS ANALYSIS
// ============================================================================

/**
 * Hook for requirements analysis with inventory integration
 */
export function useBatchRequirements(batchId: string | null) {
  return useLiveQuery(async (): Promise<BatchRequirementsAnalysis | null> => {
    if (!batchId) return null;

    const batch = await db.productionBatches.get(batchId);
    if (!batch) return null;

    // Arrays to collect all requirements (with product/variant context)
    const allMaterials: MaterialRequirement[] = [];
    const allPackaging: PackagingRequirement[] = [];
    const allLabels: LabelRequirement[] = [];

    // Process each product and variant
    for (const item of batch.items) {
      const product = await db.products.get(item.productId);
      if (!product) continue;

      // Resolve recipe ID
      const recipeId = product.isRecipeVariant
        ? (await db.recipeVariants.get(product.recipeId))?.originalRecipeId
        : product.recipeId;

      for (const variantItem of item.variants) {
        const variant = await db.productVariants.get(variantItem.variantId);
        if (!variant) continue;

        const units = calculateUnits(
          variant.fillQuantity,
          variant.fillUnit,
          variantItem.totalFillQuantity,
          variantItem.fillUnit
        );

        if (units === 0) continue;

        const fillQtyInKg = normalizeToKg(
          variantItem.totalFillQuantity,
          variantItem.fillUnit
        );

        // Calculate materials
        if (recipeId) {
          const materials = await calculateVariantMaterialRequirements(
            product.id,
            product.name,
            variant.id,
            variant.name,
            fillQtyInKg,
            recipeId
          );
          allMaterials.push(...materials);
        }

        // Calculate packaging
        const packaging = await calculateVariantPackagingRequirements(
          product.id,
          product.name,
          variant.id,
          variant.name,
          units,
          variant.packagingSelectionId
        );
        allPackaging.push(...packaging);

        // Calculate labels
        const labels = await calculateVariantLabelRequirements(
          product.id,
          product.name,
          variant.id,
          variant.name,
          units,
          variant.frontLabelSelectionId,
          variant.backLabelSelectionId
        );
        allLabels.push(...labels);
      }
    }

    // Aggregate by composite key (item + supplier)
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
    const bySupplier = groupBySupplier(materials, packaging, labels);

    // Group by product (for product-wise view)
    const byProduct = groupByProduct(allMaterials, allPackaging, allLabels);

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

    // Create overview object
    const overview = {
      batchId: batch.id,
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

    // Create byCategory object
    const byCategory = {
      materials,
      packaging,
      labels,
      totalMaterialCost,
      totalPackagingCost,
      totalLabelCost,
    };

    return {
      batchId: batch.id,
      overview,
      byCategory,
      bySupplier,
      byProduct,
      criticalShortages:
        criticalShortages.length > 0 ? criticalShortages : undefined,
      itemsWithoutInventory:
        itemsWithoutInventory.length > 0 ? itemsWithoutInventory : undefined,
    };
  }, [batchId]);
}

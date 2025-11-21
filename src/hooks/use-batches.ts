import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import {
  getProductVariantsWithDetails,
  calculateVariantCostAnalysis,
} from "./use-products";
import type {
  ProductionBatch,
  BatchRequirementsAnalysis,
  BatchCostAnalysis,
  RequirementItem,
  SupplierRequirement,
  BatchWithDetails,
} from "@/lib/types";

/**
 * Get all production batches
 */
export function useProductionBatches() {
  return useLiveQuery(() => db.productionBatches.toArray(), []) || [];
}

/**
 * Get a single batch with enriched data
 */
export async function getBatchWithDetails(
  batchId: string
): Promise<BatchWithDetails | null> {
  const batch = await db.productionBatches.get(batchId);
  if (!batch) return null;

  const enrichedProducts = await Promise.all(
    batch.items.map(async (item) => {
      const product = await db.products.get(item.productId);

      const enrichedVariants = await Promise.all(
        item.variants.map(async (variantItem) => {
          const variant = await db.productVariants.get(variantItem.variantId);

          // Calculate units: fillQuantity / variant.fillQuantity
          const units = variant
            ? variantItem.fillQuantity / variant.fillQuantity
            : 0;

          return {
            variantId: variantItem.variantId,
            variantName: variant?.name || "Unknown",
            fillQuantity: variantItem.fillQuantity,
            fillUnit: variantItem.fillUnit,
            units: Math.round(units),
          };
        })
      );

      return {
        productId: item.productId,
        productName: product?.name || "Unknown",
        variants: enrichedVariants,
      };
    })
  );

  return {
    ...batch,
    products: enrichedProducts,
  };
}

/**
 * Calculate requirements for a batch
 */
export async function calculateBatchRequirements(
  batch: ProductionBatch
): Promise<BatchRequirementsAnalysis> {
  const materialsMap = new Map<string, RequirementItem>();
  const packagingMap = new Map<string, RequirementItem>();
  const labelsMap = new Map<string, RequirementItem>();

  // Process each product's variants
  for (const item of batch.items) {
    for (const variantItem of item.variants) {
      const variant = await db.productVariants.get(variantItem.variantId);
      if (!variant) continue;

      // Calculate units to produce
      const units = Math.round(variantItem.fillQuantity / variant.fillQuantity);
      const fillQtyInKg = convertToKg(
        variantItem.fillQuantity,
        variantItem.fillUnit
      );

      // Get recipe ingredients (materials)
      const product = await db.products.get(variant.productId);
      if (!product) continue;

      const recipeId = product.isRecipeVariant
        ? (await db.recipeVariants.get(product.recipeId))?.originalRecipeId
        : product.recipeId;

      if (recipeId) {
        const ingredients = await db.recipeIngredients
          .where("recipeId")
          .equals(recipeId)
          .toArray();

        for (const ing of ingredients) {
          const sm = await db.supplierMaterials.get(ing.supplierMaterialId);
          if (!sm) continue;

          const material = await db.materials.get(sm.materialId);
          const supplier = await db.suppliers.get(sm.supplierId);

          // Calculate required quantity
          const ingQtyInKg = convertToKg(ing.quantity, ing.unit);
          const requiredQty = ingQtyInKg * fillQtyInKg;

          const key = sm.id;
          if (materialsMap.has(key)) {
            materialsMap.get(key)!.required += requiredQty;
          } else {
            materialsMap.set(key, {
              itemType: "material",
              itemId: sm.id,
              itemName: material?.name || "Unknown",
              supplierId: sm.supplierId,
              supplierName: supplier?.name || "Unknown",
              required: requiredQty,
              available: 0, // TODO: Get from inventory
              shortage: requiredQty,
              unit: sm.unit,
              unitPrice: sm.unitPrice,
              tax: sm.tax,
              totalCost: requiredQty * sm.unitPrice * (1 + sm.tax / 100),
            });
          }
        }
      }

      // Get packaging
      const packaging = await db.supplierPackaging.get(
        variant.packagingSelectionId
      );
      if (packaging) {
        const packagingDef = await db.packaging.get(packaging.packagingId);
        const supplier = await db.suppliers.get(packaging.supplierId);

        const key = packaging.id;
        if (packagingMap.has(key)) {
          packagingMap.get(key)!.required += units;
        } else {
          packagingMap.set(key, {
            itemType: "packaging",
            itemId: packaging.id,
            itemName: packagingDef?.name || "Unknown",
            supplierId: packaging.supplierId,
            supplierName: supplier?.name || "Unknown",
            required: units,
            available: 0,
            shortage: units,
            unit: "pcs",
            unitPrice: packaging.unitPrice,
            tax: packaging.tax || 0,
            totalCost:
              units * packaging.unitPrice * (1 + (packaging.tax || 0) / 100),
          });
        }
      }

      // Get labels
      if (variant.frontLabelSelectionId) {
        const label = await db.supplierLabels.get(
          variant.frontLabelSelectionId
        );
        if (label) {
          const labelDef = label.labelId
            ? await db.labels.get(label.labelId)
            : null;
          const supplier = await db.suppliers.get(label.supplierId);

          const key = label.id;
          if (labelsMap.has(key)) {
            labelsMap.get(key)!.required += units;
          } else {
            labelsMap.set(key, {
              itemType: "label",
              itemId: label.id,
              itemName: labelDef?.name || "Front Label",
              supplierId: label.supplierId,
              supplierName: supplier?.name || "Unknown",
              required: units,
              available: 0,
              shortage: units,
              unit: label.unit,
              unitPrice: label.unitPrice,
              tax: label.tax || 0,
              totalCost: units * label.unitPrice * (1 + (label.tax || 0) / 100),
            });
          }
        }
      }

      if (variant.backLabelSelectionId) {
        const label = await db.supplierLabels.get(variant.backLabelSelectionId);
        if (label) {
          const labelDef = label.labelId
            ? await db.labels.get(label.labelId)
            : null;
          const supplier = await db.suppliers.get(label.supplierId);

          const key = label.id;
          if (labelsMap.has(key)) {
            labelsMap.get(key)!.required += units;
          } else {
            labelsMap.set(key, {
              itemType: "label",
              itemId: label.id,
              itemName: labelDef?.name || "Back Label",
              supplierId: label.supplierId,
              supplierName: supplier?.name || "Unknown",
              required: units,
              available: 0,
              shortage: units,
              unit: label.unit,
              unitPrice: label.unitPrice,
              tax: label.tax || 0,
              totalCost: units * label.unitPrice * (1 + (label.tax || 0) / 100),
            });
          }
        }
      }
    }
  }

  // Convert maps to arrays
  const materials = Array.from(materialsMap.values());
  const packaging = Array.from(packagingMap.values());
  const labels = Array.from(labelsMap.values());

  // Calculate totals
  const totalMaterialCost = materials.reduce((sum, m) => sum + m.totalCost, 0);
  const totalPackagingCost = packaging.reduce((sum, p) => sum + p.totalCost, 0);
  const totalLabelCost = labels.reduce((sum, l) => sum + l.totalCost, 0);

  // Group by supplier
  const supplierMap = new Map<string, SupplierRequirement>();

  [...materials, ...packaging, ...labels].forEach((item) => {
    if (!supplierMap.has(item.supplierId)) {
      supplierMap.set(item.supplierId, {
        supplierId: item.supplierId,
        supplierName: item.supplierName,
        materials: [],
        packaging: [],
        labels: [],
        totalCost: 0,
      });
    }

    const supplier = supplierMap.get(item.supplierId)!;
    if (item.itemType === "material") supplier.materials.push(item);
    if (item.itemType === "packaging") supplier.packaging.push(item);
    if (item.itemType === "label") supplier.labels.push(item);
    supplier.totalCost += item.totalCost;
  });

  return {
    batchId: batch.id,
    materials,
    packaging,
    labels,
    totalMaterialCost,
    totalPackagingCost,
    totalLabelCost,
    totalCost: totalMaterialCost + totalPackagingCost + totalLabelCost,
    totalItemsToOrder: materials.length + packaging.length + labels.length,
    totalProcurementCost:
      totalMaterialCost + totalPackagingCost + totalLabelCost,
    criticalShortages: [...materials, ...packaging, ...labels].filter(
      (item) => item.shortage > 0
    ),
    bySupplier: Array.from(supplierMap.values()),
  };
}

/**
 * Calculate cost analysis for a batch
 */
export async function calculateBatchCostAnalysis(
  batch: ProductionBatch
): Promise<BatchCostAnalysis> {
  const variantCosts = [];

  for (const item of batch.items) {
    const product = await db.products.get(item.productId);

    for (const variantItem of item.variants) {
      const variant = await db.productVariants.get(variantItem.variantId);
      if (!variant) continue;

      const units = Math.round(variantItem.fillQuantity / variant.fillQuantity);

      // Get cost analysis for this variant
      const costAnalysis = await calculateVariantCostAnalysis(variant);

      variantCosts.push({
        variantId: variant.id,
        variantName: variant.name,
        productName: product?.name || "Unknown",
        fillQuantity: variantItem.fillQuantity,
        fillUnit: variantItem.fillUnit,
        units,
        costPerUnit: costAnalysis.totalCostWithTax,
        revenuePerUnit: variant.sellingPricePerUnit,
        totalCost: costAnalysis.totalCostWithTax * units,
        totalRevenue: variant.sellingPricePerUnit * units,
        profit:
          (variant.sellingPricePerUnit - costAnalysis.totalCostWithTax) * units,
        margin:
          ((variant.sellingPricePerUnit - costAnalysis.totalCostWithTax) /
            variant.sellingPricePerUnit) *
          100,
      });
    }
  }

  const totalCost = variantCosts.reduce((sum, v) => sum + v.totalCost, 0);
  const totalRevenue = variantCosts.reduce((sum, v) => sum + v.totalRevenue, 0);
  const totalProfit = totalRevenue - totalCost;

  // Calculate break-even units (total cost / average profit per unit)
  const totalUnits = variantCosts.reduce((sum, v) => sum + v.units, 0);
  const averageProfitPerUnit = totalUnits > 0 ? totalProfit / totalUnits : 0;
  const breakEvenUnits =
    averageProfitPerUnit > 0 ? Math.ceil(totalCost / averageProfitPerUnit) : 0;

  // Calculate cost breakdown (would need requirements analysis)
  const requirements = await calculateBatchRequirements(batch);

  return {
    batchId: batch.id,
    variantCosts,
    materialsCost: requirements.totalMaterialCost,
    packagingCost: requirements.totalPackagingCost,
    labelsCost: requirements.totalLabelCost,
    materialsPercentage: (requirements.totalMaterialCost / totalCost) * 100,
    packagingPercentage: (requirements.totalPackagingCost / totalCost) * 100,
    labelsPercentage: (requirements.totalLabelCost / totalCost) * 100,
    totalCost,
    totalRevenue,
    totalProfit,
    overallMargin: (totalProfit / totalRevenue) * 100,
    breakEvenUnits,
  };
}

/**
 * Helper: Convert to kg
 */
function convertToKg(quantity: number, unit: string): number {
  switch (unit) {
    case "kg":
      return quantity;
    case "gm":
      return quantity / 1000;
    case "L":
      return quantity; // Assume 1L ≈ 1kg
    case "ml":
      return quantity / 1000;
    default:
      return quantity;
  }
}

/**
 * Hook to get batch statistics
 */
export function useBatchStats() {
  const batches = useProductionBatches();

  return useMemo(() => {
    const totalBatches = batches.length;
    const activeBatches = batches.filter(
      (b) => b.status === "in-progress" || b.status === "scheduled"
    ).length;
    const completedBatches = batches.filter(
      (b) => b.status === "completed"
    ).length;

    const totalRevenue = batches.reduce((sum, b) => sum + b.totalRevenue, 0);
    const totalProfit = batches.reduce((sum, b) => sum + b.totalProfit, 0);
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalBatches,
      activeBatches,
      completedBatches,
      totalRevenue,
      totalProfit,
      avgMargin,
    };
  }, [batches]);
}

/**
 * Hook to filter batches
 */
export function useFilteredBatches(searchTerm: string) {
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

// src/hooks/use-batches.ts
import { db } from "@/lib/db";
import type {
  BatchCostAnalysis,
  BatchRequirementsAnalysis,
  BatchWithDetails,
  ProductionBatch,
  ProductVariant,
  RequirementItem,
  SupplierRequirement,
} from "@/lib/types";
import { useLiveQuery } from "dexie-react-hooks";
import { getRecipeCostPerKg } from "../../../hooks/use-products";
import {
  calculateUnits,
  convertToDisplayUnit,
  normalizeToKg,
} from "../../../hooks/use-unit-conversion";

// Hook for basic batch list
export function useProductionBatches() {
  return useLiveQuery(() => db.productionBatches.toArray(), []) || [];
}

// Hook for batch details with products and variants
export function useBatchDetails(batchId: string | null) {
  return useLiveQuery(async (): Promise<BatchWithDetails | null> => {
    if (!batchId) return null;

    const batch = await db.productionBatches.get(batchId);
    if (!batch) return null;

    const products = await Promise.all(
      batch.items.map(async (item) => {
        const product = await db.products.get(item.productId);
        if (!product) return null;

        const variants = await Promise.all(
          item.variants.map(async (variantItem) => {
            const variant = await db.productVariants.get(variantItem.variantId);
            if (!variant) return null;

            // Calculate units: batch quantity (L/kg) vs variant capacity (mL/g)
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
      products: products.filter((p): p is NonNullable<typeof p> => p !== null),
    };
  }, [batchId]);
}

// Hook for cost analysis
export function useBatchCostAnalysis(batchId: string | null) {
  return useLiveQuery(async (): Promise<BatchCostAnalysis | null> => {
    if (!batchId) return null;

    const batch = await db.productionBatches.get(batchId);
    if (!batch) return null;

    let totalUnits = 0;
    let totalCost = 0;
    let totalRevenue = 0;
    const variantCosts = [];

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

        variantCosts.push({
          variantId: variant.id,
          variantName: variant.name,
          productName: product?.name || "Unknown",
          units,
          totalCost: variantCost,
          totalRevenue: variantRevenue,
          profit: variantRevenue - variantCost,
          margin:
            variantRevenue > 0
              ? ((variantRevenue - variantCost) / variantRevenue) * 100
              : 0,
        });

        totalUnits += units;
        totalCost += variantCost;
        totalRevenue += variantRevenue;
      }
    }

    const totalProfit = totalRevenue - totalCost;
    const profitMargin =
      totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Get cost breakdown from requirements
    const requirements = await calculateBatchRequirements(batch);

    return {
      batchId: batch.id,
      totalUnits,
      totalCost,
      totalRevenue,
      totalProfit,
      profitMargin,
      materialsCost: requirements.totalMaterialCost,
      packagingCost: requirements.totalPackagingCost,
      labelsCost: requirements.totalLabelCost,
      materialsPercentage:
        totalCost > 0 ? (requirements.totalMaterialCost / totalCost) * 100 : 0,
      packagingPercentage:
        totalCost > 0 ? (requirements.totalPackagingCost / totalCost) * 100 : 0,
      labelsPercentage:
        totalCost > 0 ? (requirements.totalLabelCost / totalCost) * 100 : 0,
      variantCosts,
    };
  }, [batchId]);
}

// Hook for requirements analysis
export function useBatchRequirements(batchId: string | null) {
  return useLiveQuery(async (): Promise<BatchRequirementsAnalysis | null> => {
    if (!batchId) return null;

    const batch = await db.productionBatches.get(batchId);
    if (!batch) return null;

    return await calculateBatchRequirements(batch);
  }, [batchId]);
}

// Helper function to calculate variant cost (you might have this elsewhere)
async function calculateVariantCostAnalysis(variant: ProductVariant) {
  // Your existing variant cost calculation logic
  // This should return { totalCostWithTax: number }

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
  const packagingTaxAmount = (packagingUnitPrice * packagingTax) / 100;
  const packagingTotal = packagingUnitPrice + packagingTaxAmount;

  // Calculate label costs
  const frontLabelUnitPrice = frontLabel?.unitPrice || 0;
  const frontLabelTax = frontLabel?.tax || 0;
  const frontLabelTaxAmount = (frontLabelUnitPrice * frontLabelTax) / 100;
  const frontLabelTotal = frontLabelUnitPrice + frontLabelTaxAmount;

  const backLabelUnitPrice = backLabel?.unitPrice || 0;
  const backLabelTax = backLabel?.tax || 0;
  const backLabelTaxAmount = (backLabelUnitPrice * backLabelTax) / 100;
  const backLabelTotal = backLabelUnitPrice + backLabelTaxAmount;

  const totalLabelsCost = frontLabelTotal + backLabelTotal;

  const totalCostWithTax =
    recipeTotalForFill + packagingTotal + totalLabelsCost;

  return { totalCostWithTax }; // placeholder
}

/**
 * Calculate requirements for a batch
 */
export async function calculateBatchRequirements(
  batch: ProductionBatch
): Promise<BatchRequirementsAnalysis> {
  console.log("🔵 START calculateBatchRequirements for batch:", batch.id);

  const materialsMap = new Map<string, RequirementItem>();
  const packagingMap = new Map<string, RequirementItem>();
  const labelsMap = new Map<string, RequirementItem>();

  console.log(
    "📦 Initialized empty maps: materialsMap, packagingMap, labelsMap"
  );

  for (const item of batch.items) {
    console.log("➡️ Processing batch item:", item);

    for (const variantItem of item.variants) {
      console.log("  ➡️ Processing variantItem:", variantItem);

      const variant = await db.productVariants.get(variantItem.variantId);
      console.log("  🔍 Loaded variant:", variant);

      if (!variant) {
        console.log("  ⛔ Variant not found, skipping…");
        continue;
      }

      const units = calculateUnits(
        variant.fillQuantity,
        variant.fillUnit,
        variantItem.totalFillQuantity,
        variantItem.fillUnit
      );
      console.log("  📐 Calculated units:", units);

      const fillQtyInKg = normalizeToKg(
        variantItem.totalFillQuantity,
        variantItem.fillUnit
      );
      console.log("  ⚖️ fillQtyInKg:", fillQtyInKg);

      const product = await db.products.get(variant.productId);
      console.log("  📦 Loaded product:", product);

      if (!product) {
        console.log("  ⛔ Product not found, skipping…");
        continue;
      }

      const recipeId = product.isRecipeVariant
        ? (await db.recipeVariants.get(product.recipeId))?.originalRecipeId
        : product.recipeId;

      console.log("  🧪 recipeId resolved to:", recipeId);

      if (recipeId) {
        const ingredients = await db.recipeIngredients
          .where("recipeId")
          .equals(recipeId)
          .toArray();
        console.log("  🧂 Loaded recipe ingredients:", ingredients);

        for (const ing of ingredients) {
          console.log("    ➡️ Processing ingredient:", ing);

          const sm = await db.supplierMaterials.get(ing.supplierMaterialId);
          console.log("    🔍 Loaded supplierMaterial:", sm);

          if (!sm) {
            console.log(
              "    ⛔ SupplierMaterial not found, skipping ingredient"
            );
            continue;
          }

          const material = await db.materials.get(sm.materialId);
          const supplier = await db.suppliers.get(sm.supplierId);

          const materialInventoryItem = await db.inventoryItems.get(sm.id);
          const availableMaterialStock = materialInventoryItem?.currentStock;
          console.log(
            "    📦 materialInventoryItem:",
            materialInventoryItem,
            "availableMaterialStock:",
            availableMaterialStock
          );

          const ingQtyInKg = normalizeToKg(ing.quantity, ing.unit);
          const requiredQty = ingQtyInKg * fillQtyInKg;

          console.log(
            "    ⚖️ Normalized ingredient qty:",
            ingQtyInKg,
            "requiredQty:",
            requiredQty
          );

          const key = `sm-${sm.id}-${sm.supplierId}`;

          if (materialsMap.has(key)) {
            console.log("    ♻️ Updating existing material entry:", key);
            materialsMap.get(key)!.required += requiredQty;

            // console.log("  ♻️ Updating existing material item:", key);
            // const existing = materialsMap.get(key)!;
            // existing.required += units;
            // existing.totalCost +=
            //   units * sm.unitPrice * (1 + (sm.tax || 0) / 100);
          } else {
            console.log("    ➕ Adding new material entry:", key);
            materialsMap.set(key, {
              itemType: "material",
              itemId: sm.id,
              itemName: material?.name || "Unknown",
              supplierId: sm.supplierId,
              supplierName: supplier?.name || "Unknown",
              required: requiredQty,
              available: availableMaterialStock ?? 0,
              shortage: requiredQty - (availableMaterialStock ?? 0),
              unit: sm.unit,
              unitPrice: sm.unitPrice,
              tax: sm.tax,
              totalCost: requiredQty * sm.unitPrice * (1 + sm.tax / 100),
            });
          }
        }
      }

      // PACKAGING
      console.log(
        "  📦 variant id ",
        variant.id,
        "variant name",
        variant.name,
        "variant.packagingSelectionId:",
        variant.packagingSelectionId
      );
      const packaging = await db.supplierPackaging.get(
        variant.packagingSelectionId
      );
      console.log("  📦 Loaded packaging:", packaging);

      if (packaging && units > 0) {
        const packagingDef = await db.packaging.get(packaging.packagingId);
        const supplier = await db.suppliers.get(packaging.supplierId);
        const packagingInventoryItem = await db.inventoryItems.get(
          packaging.id
        );
        const availableStock = packagingInventoryItem?.currentStock;

        console.log("  📦 Packaging detail:", {
          packagingDef,
          supplier,
          availableStock,
        });

        const key = `packaging-${packaging.id}-${packaging.supplierId}`;
        if (packagingMap.has(key)) {
          console.log("  ♻️ Updating existing packaging item:", key);
          const existing = packagingMap.get(key)!;
          existing.required += units;
          existing.totalCost +=
            units * packaging.unitPrice * (1 + (packaging.tax || 0) / 100);
        } else {
          console.log("  ➕ Adding new packaging item:", key);
          packagingMap.set(key, {
            itemType: "packaging",
            itemId: packaging.id,
            itemName: packagingDef?.name || "Unknown",
            supplierId: packaging.supplierId,
            supplierName: supplier?.name || "Unknown",
            required: units,
            available: availableStock ?? 0,
            shortage: units - (availableStock ?? 0),
            unit: "pcs",
            unitPrice: packaging.unitPrice,
            tax: packaging.tax || 0,
            totalCost:
              units * packaging.unitPrice * (1 + (packaging.tax || 0) / 100),
          });
        }
      }

      // FRONT LABEL
      if (variant.frontLabelSelectionId && units > 0) {
        console.log(
          "  🏷️ Front label selected:",
          variant.frontLabelSelectionId
        );

        const label = await db.supplierLabels.get(
          variant.frontLabelSelectionId
        );
        console.log("  🏷️ Loaded front label object:", label);

        if (label) {
          const labelDef = label.labelId
            ? await db.labels.get(label.labelId)
            : null;
          const supplier = await db.suppliers.get(label.supplierId);
          const labelInventoryItem = await db.inventoryItems.get(label.id);
          const availableStock = labelInventoryItem?.currentStock;

          console.log("  🏷️ Front label details:", {
            labelDef,
            supplier,
            availableStock,
          });

          const key = `label-${label.id}-${label.supplierId}`;
          if (labelsMap.has(key)) {
            console.log("  ♻️ Updating existing label item:", key);
            const existing = labelsMap.get(key)!;
            existing.required += units;
            existing.totalCost +=
              units * label.unitPrice * (1 + (label.tax || 0) / 100);
          } else {
            console.log("  ➕ Adding front label:", key);
            labelsMap.set(key, {
              itemType: "label",
              itemId: label.id,
              itemName: labelDef?.name || "Front Label",
              supplierId: label.supplierId,
              supplierName: supplier?.name || "Unknown",
              required: units,
              available: availableStock ?? 0,
              shortage: units - (availableStock ?? 0),
              unit: label.unit,
              unitPrice: label.unitPrice,
              tax: label.tax || 0,
              totalCost: units * label.unitPrice * (1 + (label.tax || 0) / 100),
            });
          }
        }
      }

      // BACK LABEL
      if (variant.backLabelSelectionId && units > 0) {
        console.log("  🏷️ Back label selected:", variant.backLabelSelectionId);

        const label = await db.supplierLabels.get(variant.backLabelSelectionId);
        console.log("  🏷️ Loaded back label object:", label);

        if (label) {
          const labelDef = label.labelId
            ? await db.labels.get(label.labelId)
            : null;
          const supplier = await db.suppliers.get(label.supplierId);
          const labelInventoryItem = await db.inventoryItems.get(label.id);
          const availableStock = labelInventoryItem?.currentStock;

          console.log("  🏷️ Back label details:", {
            labelDef,
            supplier,
            availableStock,
          });

          const key = `label-${label.id}-${label.supplierId}`;
          if (labelsMap.has(key)) {
            console.log("  ♻️ Updating existing label item:", key);
            const existing = labelsMap.get(key)!;
            existing.required += units;
            existing.totalCost +=
              units * label.unitPrice * (1 + (label.tax || 0) / 100);
          } else {
            console.log("  ➕ Adding back label:", key);
            labelsMap.set(key, {
              itemType: "label",
              itemId: label.id,
              itemName: labelDef?.name || "Back Label",
              supplierId: label.supplierId,
              supplierName: supplier?.name || "Unknown",
              required: units,
              available: availableStock ?? 0,
              shortage: units - (availableStock ?? 0),
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

  console.log("📤 Maps ready. Converting to arrays…");

  const materials = Array.from(materialsMap.values());
  const packaging = Array.from(packagingMap.values());
  const labels = Array.from(labelsMap.values());

  console.log("📦 MATERIALS:", materials);
  console.log("📦 PACKAGING:", packaging);
  console.log("📦 LABELS:", labels);

  const totalMaterialCost = materials.reduce((sum, m) => sum + m.totalCost, 0);
  const totalPackagingCost = packaging.reduce((sum, p) => sum + p.totalCost, 0);
  const totalLabelCost = labels.reduce((sum, l) => sum + l.totalCost, 0);

  console.log("💰 COST TOTALS:", {
    totalMaterialCost,
    totalPackagingCost,
    totalLabelCost,
  });

  const supplierMap = new Map<string, SupplierRequirement>();

  console.log("👥 Grouping items by supplier…");
  [...materials, ...packaging, ...labels].forEach((item) => {
    console.log("  ➡️ Processing supplier entry:", item);

    if (!supplierMap.has(item.supplierId)) {
      console.log("  ➕ Creating new supplier bucket:", item.supplierId);
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

    console.log("  🧮 Updated supplier:", supplier);
  });

  const result = {
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

  console.log("🏁 FINAL RESULT:", result);

  return result;
}

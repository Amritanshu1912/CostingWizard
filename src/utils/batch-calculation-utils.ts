// src/utils/batch-calculation-utils.ts
import { db } from "@/lib/db";
import type { CapacityUnit } from "@/types/shared-types";
import type { PricingInfo } from "@/types/batch-types";

import type { ProductVariant } from "@/types/product-types";
import type { SupplierMaterial } from "@/types/material-types";
import type { RecipeIngredient } from "@/types/recipe-types";
import {
  normalizeToKg,
  calculateUnits,
  convertToDisplayUnit,
} from "@/utils/unit-conversion-utils";
import { getRecipeCostPerKg } from "@/hooks/product-hooks/use-product-costs";

/**
 * Batch variant metrics result
 */
interface BatchVariantMetrics {
  fillInKg: number;
  units: number;
  displayQuantity: string;
}

/**
 * Calculates all metrics for a batch variant
 * Centralizes unit conversion and calculation logic
 *
 * @param variantFillQty - Individual variant capacity
 * @param variantFillUnit - Variant unit
 * @param batchFillQty - Total batch quantity
 * @param batchFillUnit - Batch unit
 * @returns Calculated metrics
 */
export function calculateBatchVariantMetrics(
  variantFillQty: number,
  variantFillUnit: CapacityUnit,
  batchFillQty: number,
  batchFillUnit: CapacityUnit
): BatchVariantMetrics {
  // Convert batch quantity to kg for calculations
  const fillInKg = normalizeToKg(batchFillQty, batchFillUnit);

  // Calculate number of units
  const units = calculateUnits(
    variantFillQty,
    variantFillUnit,
    batchFillQty,
    batchFillUnit
  );

  // Format for display
  const display = convertToDisplayUnit(batchFillQty, batchFillUnit);
  const displayQuantity = `${display.quantity.toFixed(2)} ${display.unit}`;

  return { fillInKg, units, displayQuantity };
}

/**
 * Variant cost result
 */
interface VariantCostResult {
  totalCost: number;
  totalRevenue: number;
  profit: number;
  margin: number;
  costPerUnit: number;
  revenuePerUnit: number;
  materialsCost: number;
  packagingCost: number;
  labelsCost: number;
}

/**
 * Calculates complete cost breakdown for a variant
 *
 * @param variant - Product variant
 * @param units - Number of units to produce
 * @param fillInKg - Fill quantity in kg
 * @returns Cost breakdown
 */
export async function calculateVariantCost(
  variant: ProductVariant,
  units: number,
  fillInKg: number
): Promise<VariantCostResult> {
  // Get recipe cost per kg
  const recipeCost = await getRecipeCostPerKg(variant.productId);
  const recipeTotalPerUnit =
    (recipeCost.costPerKg + recipeCost.taxPerKg) * fillInKg;
  const materialsCost = recipeTotalPerUnit * units;

  // Get packaging cost
  const packaging = await db.supplierPackaging.get(
    variant.packagingSelectionId
  );
  const packagingCostPerUnit = packaging
    ? calculateCostWithTax(1, packaging.unitPrice, packaging.tax || 0)
    : 0;
  const packagingCost = packagingCostPerUnit * units;

  // Get label costs
  const frontLabel = variant.frontLabelSelectionId
    ? await db.supplierLabels.get(variant.frontLabelSelectionId)
    : null;
  const backLabel = variant.backLabelSelectionId
    ? await db.supplierLabels.get(variant.backLabelSelectionId)
    : null;

  const frontLabelCost = frontLabel
    ? calculateCostWithTax(1, frontLabel.unitPrice, frontLabel.tax || 0)
    : 0;
  const backLabelCost = backLabel
    ? calculateCostWithTax(1, backLabel.unitPrice, backLabel.tax || 0)
    : 0;
  const labelsCost = (frontLabelCost + backLabelCost) * units;

  // Calculate totals
  const totalCost = materialsCost + packagingCost + labelsCost;
  const totalRevenue = variant.sellingPricePerUnit * units;
  const profit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  return {
    totalCost,
    totalRevenue,
    profit,
    margin,
    costPerUnit: totalCost / units,
    revenuePerUnit: totalRevenue / units,
    materialsCost,
    packagingCost,
    labelsCost,
  };
}

/**
 * Resolves pricing for a recipe ingredient
 * Uses locked pricing if available, otherwise current supplier pricing
 *
 * @param ingredient - Recipe ingredient
 * @param supplierMaterial - Supplier material
 * @returns Resolved pricing info
 */
export function resolveIngredientPrice(
  ingredient: RecipeIngredient,
  supplierMaterial: SupplierMaterial
): PricingInfo {
  if (ingredient.lockedPricing) {
    return {
      unitPrice: ingredient.lockedPricing.unitPrice,
      tax: ingredient.lockedPricing.tax,
      isLocked: true,
    };
  }

  return {
    unitPrice: supplierMaterial.unitPrice,
    tax: supplierMaterial.tax,
    isLocked: false,
  };
}

/**
 * Calculates total cost including tax
 *
 * @param quantity - Quantity to calculate for
 * @param unitPrice - Price per unit
 * @param taxPercent - Tax percentage
 * @returns Total cost with tax
 */
export function calculateCostWithTax(
  quantity: number,
  unitPrice: number,
  taxPercent: number
): number {
  return quantity * unitPrice * (1 + taxPercent / 100);
}

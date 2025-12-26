// src/hooks/products/use-product-costs.ts

import { db } from "@/lib/db";
import type {
  ProductVariant,
  ProductVariantCostAnalysis,
} from "@/types/product-types";
import { calculateMargin, generateCostBreakdown } from "@/utils/product-utils";
import { normalizeToKg } from "@/utils/unit-conversion-utils";

// ============================================================================
// COST CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate comprehensive cost analysis for a product variant
 * Fetches all necessary data and computes costs, margins, breakdowns
 *
 * @param variant - The product variant to analyze
 * @returns Complete cost analysis with all metrics
 *
 * @example
 * const analysis = await calculateVariantCostAnalysis(variant);
 * console.log(analysis.grossProfitMargin); // 35.5
 */
export async function calculateVariantCostAnalysis(
  variant: ProductVariant
): Promise<ProductVariantCostAnalysis> {
  // Step 1: Get recipe cost per kg
  const recipeCost = await getRecipeCostPerKg(variant.productId);

  // Step 2: Get packaging details
  const packaging = await db.supplierPackaging.get(
    variant.packagingSelectionId
  );

  // Step 3: Get label details
  const frontLabel = variant.frontLabelSelectionId
    ? await db.supplierLabels.get(variant.frontLabelSelectionId)
    : null;

  const backLabel = variant.backLabelSelectionId
    ? await db.supplierLabels.get(variant.backLabelSelectionId)
    : null;

  // Step 4: Convert fill quantity to kg for calculations
  const fillInKg = normalizeToKg(variant.fillQuantity, variant.fillUnit);

  // Step 5: Calculate recipe costs
  const recipeCostForFill = recipeCost.costPerKg * fillInKg;
  const recipeTaxForFill = recipeCost.taxPerKg * fillInKg;
  const recipeTotalForFill = recipeCostForFill + recipeTaxForFill;

  // Step 6: Calculate packaging costs
  const packagingUnitPrice = packaging?.unitPrice || 0;
  const packagingTax = packaging?.tax || 0;
  const packagingTaxAmount = packagingUnitPrice * (packagingTax / 100);

  const packagingTotal = packagingUnitPrice + packagingTaxAmount;

  // Step 7: Calculate front label costs
  const frontLabelUnitPrice = frontLabel?.unitPrice || 0;
  const frontLabelTax = frontLabel?.tax || 0;
  const frontLabelTaxAmount = frontLabelUnitPrice * (frontLabelTax / 100);

  const frontLabelTotal = frontLabelUnitPrice + frontLabelTaxAmount;

  // Step 8: Calculate back label costs
  const backLabelUnitPrice = backLabel?.unitPrice || 0;
  const backLabelTax = backLabel?.tax || 0;
  const backLabelTaxAmount = backLabelUnitPrice * (backLabelTax / 100);

  const backLabelTotal = backLabelUnitPrice + backLabelTaxAmount;

  const totalLabelsCost = frontLabelTotal + backLabelTotal;

  // Step 9: Calculate totals
  const totalCostWithoutTax =
    recipeCostForFill +
    packagingUnitPrice +
    frontLabelUnitPrice +
    backLabelUnitPrice;
  const totalTaxAmount =
    recipeTaxForFill +
    packagingTaxAmount +
    frontLabelTaxAmount +
    backLabelTaxAmount;
  const totalCostWithTax = totalCostWithoutTax + totalTaxAmount;

  // Step 10: Per-kg calculations
  const costPerKgWithoutTax = totalCostWithoutTax / fillInKg;
  const costPerKgWithTax = totalCostWithTax / fillInKg;

  // Step 11: Profitability metrics
  const grossProfit = variant.sellingPricePerUnit - totalCostWithTax;
  const grossProfitMargin = calculateMargin(
    variant.sellingPricePerUnit,
    totalCostWithTax
  );

  // Step 12: Cost breakdown for visualization
  const costBreakdown = generateCostBreakdown(
    recipeTotalForFill,
    packagingTotal,
    frontLabelTotal,
    backLabelTotal,
    totalCostWithTax
  );

  // Step 13: Generate warnings
  const warnings = (() => {
    const result: string[] = [];

    if (!packaging) {
      result.push("Packaging not found - cost analysis may be incomplete");
    }

    if (
      variant.minimumProfitMargin !== undefined &&
      grossProfitMargin < variant.minimumProfitMargin
    ) {
      result.push(
        `Margin below minimum threshold (${variant.minimumProfitMargin}%)`
      );
    }

    if (grossProfitMargin < 0) {
      result.push("Selling price is below cost - you will lose money!");
    }

    return result;
  })();

  // Step 14: Return complete analysis
  return {
    variantId: variant.id,
    variantName: variant.name,
    sku: variant.sku,
    fillQuantity: variant.fillQuantity,
    fillUnit: variant.fillUnit,
    fillQuantityInKg: fillInKg,
    recipeCostPerKg: recipeCost.costPerKg,
    recipeTaxPerKg: recipeCost.taxPerKg,
    recipeCostForFill,
    recipeTaxForFill,
    recipeTotalForFill,
    packagingUnitPrice,
    packagingTax,
    packagingTaxAmount,
    packagingTotal,
    frontLabelUnitPrice,
    frontLabelTax,
    frontLabelTaxAmount,
    frontLabelTotal,
    backLabelUnitPrice,
    backLabelTax,
    backLabelTaxAmount,
    backLabelTotal,
    totalLabelsCost,
    totalCostWithoutTax,
    totalTaxAmount,
    totalCostWithTax,
    costPerKgWithoutTax,
    costPerKgWithTax,
    sellingPricePerUnit: variant.sellingPricePerUnit,
    grossProfit,
    grossProfitMargin,
    targetProfitMargin: variant.targetProfitMargin,
    marginVsTarget: variant.targetProfitMargin
      ? grossProfitMargin - variant.targetProfitMargin
      : undefined,
    meetsMinimumMargin: variant.minimumProfitMargin
      ? grossProfitMargin >= variant.minimumProfitMargin
      : true,
    costBreakdown,
    priceChangedSinceSnapshot: false,
    warnings,
    hasAvailabilityIssues: warnings.some((w) => w.includes("out of stock")),
  };
}

/**
 * Helper: Calculate recipe cost per kg for a product
 * Aggregates ingredient costs and normalizes to per-kg basis
 *
 * @param productId - The product ID to calculate recipe cost for
 * @returns Object with costPerKg and taxPerKg
 *
 * @example
 * const cost = await getRecipeCostPerKg("product-1");
 * console.log(cost.costPerKg); // 45.50
 */
export async function getRecipeCostPerKg(
  productId: string
): Promise<{ costPerKg: number; taxPerKg: number }> {
  // Step 1: Get the product to find its recipe
  const product = await db.products.get(productId);
  if (!product) {
    console.warn(`Product ${productId} not found`);
    return { costPerKg: 0, taxPerKg: 0 };
  }

  // Step 2: Handle recipe variants - resolve to original recipe ID
  let recipeId: string | undefined;

  if (product.isRecipeVariant) {
    const recipeVariant = await db.recipeVariants.get(product.recipeId);
    recipeId = recipeVariant?.originalRecipeId;
  } else {
    recipeId = product.recipeId;
  }

  if (!recipeId) {
    console.warn(`Could not resolve recipe ID for product ${productId}`);
    return { costPerKg: 0, taxPerKg: 0 };
  }

  // Step 3: Get all ingredients for the recipe
  const ingredients = await db.recipeIngredients
    .where("recipeId")
    .equals(recipeId)
    .toArray();

  if (ingredients.length === 0) {
    console.warn(`No ingredients found for recipe ${recipeId}`);
    return { costPerKg: 0, taxPerKg: 0 };
  }

  // Step 4: Calculate total cost and weight
  let totalCost = 0;
  let totalTaxedCost = 0;
  let totalWeightKg = 0;

  for (const ingredient of ingredients) {
    // Get supplier material pricing
    const supplierMaterial = await db.supplierMaterials.get(
      ingredient.supplierMaterialId
    );
    if (!supplierMaterial) {
      console.warn(
        `Supplier material ${ingredient.supplierMaterialId} not found`
      );
      continue;
    }

    // Use locked pricing if available, otherwise current pricing
    const pricePerKg =
      ingredient.lockedPricing?.unitPrice || supplierMaterial.unitPrice || 0;
    const effectiveTax =
      ingredient.lockedPricing?.tax || supplierMaterial.tax || 0;

    // Convert ingredient quantity to kg
    const quantityKg = normalizeToKg(ingredient.quantity, ingredient.unit);

    // Calculate costs for this ingredient
    const costForQuantity = pricePerKg * quantityKg;
    const taxAmount = costForQuantity * (effectiveTax / 100);

    // Accumulate totals
    totalCost += costForQuantity;
    totalTaxedCost += costForQuantity + taxAmount;
    totalWeightKg += quantityKg;
  }

  // Step 5: Calculate per-kg costs
  if (totalWeightKg === 0) {
    console.warn(`Total weight is zero for recipe ${recipeId}`);
    return { costPerKg: 0, taxPerKg: 0 };
  }

  return {
    costPerKg: totalCost / totalWeightKg,
    taxPerKg: (totalTaxedCost - totalCost) / totalWeightKg,
  };
}

/**
 * Calculate real-time margin based on selling price and cost
 * Used for live feedback in forms
 *
 * @param sellingPrice - The selling price per unit
 * @param totalCost - The total cost per unit
 * @returns The calculated margin percentage
 *
 * @example
 * const margin = calculateLiveMargin(100, 70); // Returns 30
 */
export function calculateLiveMargin(
  sellingPrice: number,
  totalCost: number
): number {
  return calculateMargin(sellingPrice, totalCost);
}

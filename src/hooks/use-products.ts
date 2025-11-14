// ============================================================================
// FILE: lib/db/product-operations.ts
// Database operations for products and variants
// ============================================================================

import { db } from "@/lib/db";
import { normalizeToKg } from "./use-recipes";
import type {
  Product,
  ProductVariant,
  ProductVariantWithDetails,
  ProductVariantCostAnalysis,
  CapacityUnit,
} from "@/lib/types";

/**
 * Get all products with variant counts
 */
export async function getProductsWithCounts() {
  const products = await db.products.toArray();

  const productsWithCounts = await Promise.all(
    products.map(async (product) => {
      const variants = await db.productVariants
        .where("productId")
        .equals(product.id)
        .toArray();

      return {
        ...product,
        variantCount: variants.length,
        activeVariantCount: variants.filter((v) => v.isActive).length,
      };
    })
  );

  return productsWithCounts;
}

/**
 * Get product variants with joined details
 */
export async function getProductVariantsWithDetails(
  productId: string
): Promise<ProductVariantWithDetails[]> {
  const variants = await db.productVariants
    .where("productId")
    .equals(productId)
    .toArray();

  const product = await db.products.get(productId);
  if (!product) return [];

  const recipe = await db.recipes.get(product.recipeId);

  const variantsWithDetails = await Promise.all(
    variants.map(async (variant) => {
      const packaging = await db.supplierPackaging.get(
        variant.packagingSelectionId
      );
      const packagingDetails = packaging
        ? await db.packaging.get(packaging.packagingId)
        : null;

      const frontLabel = variant.frontLabelSelectionId
        ? await db.supplierLabels.get(variant.frontLabelSelectionId)
        : null;
      const frontLabelDetails = frontLabel
        ? await db.labels.get(frontLabel.labelId!)
        : null;

      const backLabel = variant.backLabelSelectionId
        ? await db.supplierLabels.get(variant.backLabelSelectionId)
        : null;
      const backLabelDetails = backLabel
        ? await db.labels.get(backLabel.labelId!)
        : null;

      return {
        ...variant,
        product,
        productName: product.name,
        productCategory: product.category,
        recipe,
        recipeName: recipe?.name || "Unknown Recipe",
        packagingName: packagingDetails?.name || "Unknown Packaging",
        packagingCapacity: packagingDetails?.capacity || 0,
        packagingUnit: packagingDetails?.unit || "ml",
        frontLabelName: frontLabelDetails?.name,
        backLabelName: backLabelDetails?.name,
        displayName: `${product.name} - ${variant.name}`,
        displaySku: variant.sku,
      } as ProductVariantWithDetails;
    })
  );

  return variantsWithDetails;
}

/**
 * Calculate cost analysis for a variant
 */
export async function calculateVariantCostAnalysis(
  variant: ProductVariant
): Promise<ProductVariantCostAnalysis> {
  // Get recipe cost
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

  console.log("calculateVariantCostAnalysis DEBUG:", {
    recipeCost,
    fillInKg,
    recipeCostForFill,
    recipeTaxForFill,
    recipeTotalForFill,
  });

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

  // Calculate totals
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

  // Per-kg calculations
  const costPerKgWithoutTax = totalCostWithoutTax / fillInKg;
  const costPerKgWithTax = totalCostWithTax / fillInKg;

  // Profitability
  const grossProfit = variant.sellingPricePerUnit - totalCostWithTax;
  const grossProfitMargin = (grossProfit / variant.sellingPricePerUnit) * 100;

  // Cost breakdown
  const costBreakdown: {
    component: "recipe" | "packaging" | "front_label" | "back_label";
    name: string;
    cost: number;
    percentage: number;
  }[] = [
    {
      component: "recipe" as const,
      name: "Recipe/Formula",
      cost: recipeTotalForFill,
      percentage: (recipeTotalForFill / totalCostWithTax) * 100,
    },
    {
      component: "packaging" as const,
      name: "Packaging",
      cost: packagingTotal,
      percentage: (packagingTotal / totalCostWithTax) * 100,
    },
  ];

  if (frontLabelTotal > 0) {
    costBreakdown.push({
      component: "front_label" as const,
      name: "Front Label",
      cost: frontLabelTotal,
      percentage: (frontLabelTotal / totalCostWithTax) * 100,
    });
  }

  if (backLabelTotal > 0) {
    costBreakdown.push({
      component: "back_label" as const,
      name: "Back Label",
      cost: backLabelTotal,
      percentage: (backLabelTotal / totalCostWithTax) * 100,
    });
  }

  // Warnings
  const warnings: string[] = [];
  if (!packaging) {
    warnings.push("Packaging not found - cost analysis may be incomplete");
  }
  if (
    variant.minimumProfitMargin &&
    grossProfitMargin < variant.minimumProfitMargin
  ) {
    warnings.push(
      `Margin below minimum threshold (${variant.minimumProfitMargin}%)`
    );
  }
  if (packaging?.availability === "out-of-stock") {
    warnings.push("Packaging is out of stock");
  }
  if (frontLabel?.availability === "out-of-stock") {
    warnings.push("Front label is out of stock");
  }

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
 * Helper: Get recipe cost per kg
 */
async function getRecipeCostPerKg(productId: string) {
  console.log("getRecipeCostPerKg START:", { productId });

  // Get the product to find its recipe
  const product = await db.products.get(productId);
  if (!product) {
    throw new Error("Product not found");
  }
  console.log("getRecipeCostPerKg PRODUCT:", { product });

  // Get the recipe
  const recipe = await db.recipes.get(product.recipeId);
  if (!recipe) {
    throw new Error("Recipe not found");
  }
  console.log("getRecipeCostPerKg RECIPE:", { recipe });

  // Get recipe ingredients
  const ingredients = await db.recipeIngredients
    .where("recipeId")
    .equals(recipe.id)
    .toArray();
  console.log("getRecipeCostPerKg INGREDIENTS:", { ingredients });

  if (ingredients.length === 0) {
    console.log("getRecipeCostPerKg NO INGREDIENTS");
    return {
      costPerKg: 0,
      taxPerKg: 0,
    };
  }

  // Calculate total cost and weight
  let totalCost = 0;
  let totalTaxedCost = 0;
  let totalWeightKg = 0;

  console.log("getRecipeCostPerKg LOOP START");
  for (const ingredient of ingredients) {
    console.log("getRecipeCostPerKg INGREDIENT:", { ingredient });

    // Get supplier material for pricing
    const supplierMaterial = await db.supplierMaterials.get(
      ingredient.supplierMaterialId
    );
    console.log("getRecipeCostPerKg SUPPLIER MATERIAL:", { supplierMaterial });
    if (!supplierMaterial) {
      console.log("getRecipeCostPerKg SKIP: no supplier material");
      continue;
    }

    // Convert ingredient quantity to kg
    const quantityKg = normalizeToKg(ingredient.quantity, ingredient.unit);
    console.log("getRecipeCostPerKg QUANTITY KG:", {
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      quantityKg,
    });

    // Calculate costs
    const pricePerKg =
      ingredient.lockedPricing?.unitPrice || supplierMaterial?.unitPrice || 0;
    const effectiveTax =
      ingredient.lockedPricing?.tax || supplierMaterial?.tax || 0;

    const costForQuantity = pricePerKg * quantityKg;
    const taxAmount = costForQuantity * (effectiveTax / 100);
    const costWithTax = costForQuantity + taxAmount;

    console.log("getRecipeCostPerKg COSTS:", {
      pricePerKg: pricePerKg,
      effectiveTax: effectiveTax,
      costForQuantity,
      taxAmount,
      costWithTax,
    });

    totalCost += costForQuantity;
    totalTaxedCost += costWithTax;
    totalWeightKg += quantityKg;

    console.log("getRecipeCostPerKg TOTALS SO FAR:", {
      totalCost,
      totalTaxedCost,
      totalWeightKg,
    });
  }
  console.log("getRecipeCostPerKg LOOP END:", {
    totalCost,
    totalTaxedCost,
    totalWeightKg,
  });

  if (totalWeightKg === 0) {
    console.log("getRecipeCostPerKg ZERO WEIGHT");
    return {
      costPerKg: 0,
      taxPerKg: 0,
    };
  }

  // Calculate per kg costs
  const costPerKg = totalCost / totalWeightKg;
  const taxPerKg = (totalTaxedCost - totalCost) / totalWeightKg;

  console.log("getRecipeCostPerKg FINAL:", {
    totalCost,
    totalTaxedCost,
    totalWeightKg,
    costPerKg,
    taxPerKg,
  });

  return {
    costPerKg,
    taxPerKg,
  };
}

/**
 * Helper: Convert any unit to kg
 */
function convertToKg(quantity: number, unit: CapacityUnit): number {
  switch (unit) {
    case "kg":
      return quantity;
    case "gm":
      return quantity / 1000;
    case "L":
      return quantity; // Assuming 1L ≈ 1kg for cleaning products
    case "ml":
      return quantity / 1000;
    case "pcs":
      return quantity; // Not applicable but handle gracefully
    default:
      return quantity;
  }
}

// hooks/use-products.ts
import { db } from "@/lib/db";
import type {
  Product,
  ProductVariant,
  ProductVariantCostAnalysis,
  ProductVariantWithDetails,
} from "@/lib/types";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { normalizeToKg } from "./use-unit-conversion";

// ============================================================================
// DATA FETCHING HOOKS
// ============================================================================

/**
 * Hook: Get all products from database
 */
export function useProducts() {
  return useLiveQuery(() => db.products.toArray(), []) || [];
}

/**
 * Hook: Get all product variants
 */
export function useAllProductVariants() {
  return useLiveQuery(() => db.productVariants.toArray(), []) || [];
}

/**
 * Hook: Get variants for a specific product
 */
export function useProductVariants(productId: string | null) {
  const result = useLiveQuery(
    () =>
      productId
        ? db.productVariants.where("productId").equals(productId).toArray()
        : Promise.resolve([] as ProductVariant[]),
    [productId]
  );
  return result || [];
}

/**
 * Hook: Get all supplier packaging options
 */
export function useSupplierPackaging() {
  return useLiveQuery(() => db.supplierPackaging.toArray(), []) || [];
}

/**
 * Hook: Get all supplier labels
 */
export function useSupplierLabels() {
  return useLiveQuery(() => db.supplierLabels.toArray(), []) || [];
}

/**
 * Get packaging details with supplier info (async function, not a hook)
 */
export async function getPackagingDetails() {
  const supplierPackagings = await db.supplierPackaging.toArray();

  return Promise.all(
    supplierPackagings.map(async (sp) => {
      const packaging = await db.packaging.get(sp.packagingId);
      const supplier = await db.suppliers.get(sp.supplierId);
      return {
        ...sp,
        packaging,
        supplier,
        displayName: `${packaging?.name} - ${packaging?.capacity}${packaging?.unit} (${supplier?.name})`,
      };
    })
  );
}

/**
 * Get label details with supplier info (async function, not a hook)
 */
export async function getLabelDetails() {
  const supplierLabels = await db.supplierLabels.toArray();

  return Promise.all(
    supplierLabels.map(async (sl) => {
      const label = sl.labelId ? await db.labels.get(sl.labelId) : null;
      const supplier = await db.suppliers.get(sl.supplierId);
      return {
        ...sl,
        label,
        supplier,
        displayName: `${label?.name || "Custom Label"} (${supplier?.name})`,
      };
    })
  );
}

/**
 * Hook: Get variant count map for products
 */
export function useVariantCountMap() {
  const allVariants = useAllProductVariants();

  return useMemo(() => {
    const map = new Map<string, number>();
    allVariants.forEach((variant) => {
      map.set(variant.productId, (map.get(variant.productId) || 0) + 1);
    });
    return map;
  }, [allVariants]);
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Get product variants with all joined details
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
      const frontLabelDetails = frontLabel?.labelId
        ? await db.labels.get(frontLabel.labelId)
        : null;

      const backLabel = variant.backLabelSelectionId
        ? await db.supplierLabels.get(variant.backLabelSelectionId)
        : null;
      const backLabelDetails = backLabel?.labelId
        ? await db.labels.get(backLabel.labelId)
        : null;

      return {
        ...variant,
        product,
        productName: product.name,
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
 * Create a new product
 */
export async function createProduct(
  productData: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<Product> {
  const newProduct: Product = {
    id: crypto.randomUUID(),
    ...productData,
    createdAt: new Date().toISOString(),
  };

  await db.products.add(newProduct);
  return newProduct;
}

/**
 * Update an existing product
 */
export async function updateProduct(
  productId: string,
  productData: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<void> {
  await db.products.update(productId, productData);
}

/**
 * Delete a product and all its variants
 */
export async function deleteProduct(productId: string): Promise<void> {
  await db.productVariants.where("productId").equals(productId).delete();
  await db.products.delete(productId);
}

/**
 * Create or update a product variant
 */
export async function saveProductVariant(
  variant: ProductVariant
): Promise<void> {
  await db.productVariants.put(variant);
}

/**
 * Delete a product variant
 */
export async function deleteProductVariant(variantId: string): Promise<void> {
  await db.productVariants.delete(variantId);
}

// ============================================================================
// COST CALCULATIONS
// ============================================================================

/**
 * Calculate comprehensive cost analysis for a variant
 */
export async function calculateVariantCostAnalysis(
  variant: ProductVariant
): Promise<ProductVariantCostAnalysis> {
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

  // Profitability metrics
  const grossProfit = variant.sellingPricePerUnit - totalCostWithTax;
  const grossProfitMargin = (grossProfit / variant.sellingPricePerUnit) * 100;

  // Cost breakdown for visualization
  const costBreakdown = [
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
    frontLabelTotal > 0 && {
      component: "front_label" as const,
      name: "Front Label",
      cost: frontLabelTotal,
      percentage: (frontLabelTotal / totalCostWithTax) * 100,
    },
    backLabelTotal > 0 && {
      component: "back_label" as const,
      name: "Back Label",
      cost: backLabelTotal,
      percentage: (backLabelTotal / totalCostWithTax) * 100,
    },
  ].filter(Boolean) as Array<{
    component: "recipe" | "packaging" | "front_label" | "back_label";
    name: string;
    cost: number;
    percentage: number;
  }>;

  // Generate warnings
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
 * Helper: Calculate recipe cost per kg
 */
export async function getRecipeCostPerKg(productId: string) {
  const product = await db.products.get(productId);
  if (!product) throw new Error("Product not found");

  // Handle recipe variants
  const recipeId = product.isRecipeVariant
    ? (await db.recipeVariants.get(product.recipeId))?.originalRecipeId
    : product.recipeId;

  if (!recipeId) {
    // This can happen if the recipe variant is deleted or data is inconsistent
    console.warn(
      `Could not resolve a valid recipe ID for product ${productId}.`
    );
    return { costPerKg: 0, taxPerKg: 0 };
  }

  const ingredients = await db.recipeIngredients
    .where("recipeId")
    .equals(recipeId)
    .toArray();

  if (ingredients.length === 0) {
    return { costPerKg: 0, taxPerKg: 0 };
  }

  let totalCost = 0;
  let totalTaxedCost = 0;
  let totalWeightKg = 0;

  for (const ingredient of ingredients) {
    const supplierMaterial = await db.supplierMaterials.get(
      ingredient.supplierMaterialId
    );
    if (!supplierMaterial) continue;

    const quantityKg = normalizeToKg(ingredient.quantity, ingredient.unit);
    const pricePerKg =
      ingredient.lockedPricing?.unitPrice || supplierMaterial.unitPrice || 0;
    const effectiveTax =
      ingredient.lockedPricing?.tax || supplierMaterial.tax || 0;

    const costForQuantity = pricePerKg * quantityKg;
    const taxAmount = costForQuantity * (effectiveTax / 100);

    totalCost += costForQuantity;
    totalTaxedCost += costForQuantity + taxAmount;
    totalWeightKg += quantityKg;
  }

  if (totalWeightKg === 0) {
    return { costPerKg: 0, taxPerKg: 0 };
  }

  return {
    costPerKg: totalCost / totalWeightKg,
    taxPerKg: (totalTaxedCost - totalCost) / totalWeightKg,
  };
}

/**
 * Helper: Generate unique SKU
 */
export function generateSKU(): string {
  const timestamp = Date.now().toString().slice(-6);
  return `VAR-${timestamp}`;
}

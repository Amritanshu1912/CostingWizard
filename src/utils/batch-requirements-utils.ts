// src/utils/batch-requirements-utils.ts
import { db } from "@/lib/db";
import type {
  InventoryAvailability,
  LabelRequirement,
  MaterialRequirement,
  PackagingRequirement,
  ProductRequirements,
  RequirementItem,
  SupplierRequirement,
} from "@/types/batch-types";
import type { ItemWithoutInventory } from "@/types/shared-types";
import {
  calculateCostWithTax,
  resolveIngredientPrice,
} from "@/utils/batch-calculation-utils";
import { normalizeToKg } from "@/utils/unit-conversion-utils";

// ============================================================================
// INVENTORY CHECKS
// ============================================================================

/**
 * Checks inventory availability for an item
 *
 * @param itemId - Item ID from supplier table
 * @param itemType - Type of item
 * @param requiredQty - Required quantity
 * @returns Inventory availability info
 */
export async function checkInventoryAvailability(
  itemId: string,
  itemType: string,
  requiredQty: number
): Promise<InventoryAvailability> {
  const inventoryItem = await db.inventoryItems
    .where("[itemId+itemType]")
    .equals([itemId, itemType])
    .first();

  if (!inventoryItem) {
    return {
      itemId,
      available: 0,
      shortage: requiredQty,
      hasInventoryTracking: false,
    };
  }

  const available = inventoryItem.currentStock;
  const shortage = Math.max(0, requiredQty - available);

  return {
    itemId,
    available,
    shortage,
    hasInventoryTracking: true,
  };
}

// ============================================================================
// MATERIAL REQUIREMENTS
// ============================================================================

interface MaterialRequirementParams {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  fillQtyInKg: number;
  recipeId: string;
}

/**
 * Calculates material requirements for a variant
 * Scales recipe ingredients based on batch quantity
 *
 * @param params - Material requirement parameters
 * @returns Array of material requirements
 */
export async function calculateVariantMaterialRequirements(
  params: MaterialRequirementParams
): Promise<MaterialRequirement[]> {
  const {
    productId,
    productName,
    variantId,
    variantName,
    fillQtyInKg,
    recipeId,
  } = params;
  const materials: MaterialRequirement[] = [];

  // Get all recipe ingredients
  const ingredients = await db.recipeIngredients
    .where("recipeId")
    .equals(recipeId)
    .toArray();

  // Calculate total recipe weight
  let totalRecipeWeightInKg = 0;
  const ingredientData = [];

  for (const ingredient of ingredients) {
    const supplierMaterial = await db.supplierMaterials.get(
      ingredient.supplierMaterialId
    );
    if (!supplierMaterial) continue;

    const ingredientQtyInKg = normalizeToKg(
      ingredient.quantity,
      ingredient.unit
    );
    totalRecipeWeightInKg += ingredientQtyInKg;

    ingredientData.push({
      ingredient,
      supplierMaterial,
      ingredientQtyInKg,
    });
  }

  // Calculate scale factor
  const scaleFactor = fillQtyInKg / totalRecipeWeightInKg;

  // Calculate requirements for each ingredient
  for (const data of ingredientData) {
    const { ingredient, supplierMaterial, ingredientQtyInKg } = data;

    const material = await db.materials.get(supplierMaterial.materialId);
    const supplier = await db.suppliers.get(supplierMaterial.supplierId);

    // Resolve pricing (locked or current)
    const pricing = resolveIngredientPrice(ingredient, supplierMaterial);

    // Scale quantity
    const requiredQty = ingredientQtyInKg * scaleFactor;

    // Check inventory
    const inventory = await checkInventoryAvailability(
      supplierMaterial.id,
      "supplierMaterial",
      requiredQty
    );

    // Calculate cost
    const totalCost = calculateCostWithTax(
      requiredQty,
      pricing.unitPrice,
      pricing.tax
    );

    materials.push({
      itemType: "material",
      itemId: supplierMaterial.id,
      itemName: material?.name || "Unknown Material",
      supplierId: supplierMaterial.supplierId,
      supplierName: supplier?.name || "Unknown Supplier",
      required: requiredQty,
      available: inventory.available,
      shortage: inventory.shortage,
      unit: supplierMaterial.capacityUnit,
      unitPrice: pricing.unitPrice,
      tax: pricing.tax,
      totalCost,
      isLocked: pricing.isLocked,
      productId,
      productName,
      variantId,
      variantName,
    });
  }

  return materials;
}

// ============================================================================
// PACKAGING REQUIREMENTS
// ============================================================================

interface PackagingRequirementParams {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  units: number;
  packagingSelectionId: string;
}

/**
 * Calculates packaging requirements for a variant
 *
 * @param params - Packaging requirement parameters
 * @returns Array of packaging requirements
 */
export async function calculateVariantPackagingRequirements(
  params: PackagingRequirementParams
): Promise<PackagingRequirement[]> {
  const {
    productId,
    productName,
    variantId,
    variantName,
    units,
    packagingSelectionId,
  } = params;

  if (!packagingSelectionId || units === 0) return [];

  const packaging = await db.supplierPackaging.get(packagingSelectionId);
  if (!packaging) return [];

  const packagingDef = await db.packaging.get(packaging.packagingId);
  const supplier = await db.suppliers.get(packaging.supplierId);

  // Check inventory
  const inventory = await checkInventoryAvailability(
    packaging.id,
    "supplierPackaging",
    units
  );

  // Calculate cost
  const totalCost = calculateCostWithTax(
    units,
    packaging.unitPrice,
    packaging.tax || 0
  );

  return [
    {
      itemType: "packaging",
      itemId: packaging.id,
      itemName: packagingDef?.name || "Unknown Packaging",
      supplierId: packaging.supplierId,
      supplierName: supplier?.name || "Unknown Supplier",
      required: units,
      available: inventory.available,
      shortage: inventory.shortage,
      unit: "pcs",
      unitPrice: packaging.unitPrice,
      tax: packaging.tax || 0,
      totalCost,
      productId,
      productName,
      variantId,
      variantName,
    },
  ];
}

// ============================================================================
// LABEL REQUIREMENTS
// ============================================================================

interface LabelRequirementParams {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  units: number;
  frontLabelId?: string;
  backLabelId?: string;
}
/**

Calculates label requirements for a variant

@param params - Label requirement parameters
@returns Array of label requirements
*/
export async function calculateVariantLabelRequirements(
  params: LabelRequirementParams
): Promise<LabelRequirement[]> {
  const {
    productId,
    productName,
    variantId,
    variantName,
    units,
    frontLabelId,
    backLabelId,
  } = params;
  const labels: LabelRequirement[] = [];

  if (units === 0) return labels;
  // Front label
  if (frontLabelId) {
    const label = await db.supplierLabels.get(frontLabelId);
    if (label) {
      const labelDef = label.labelId
        ? await db.labels.get(label.labelId)
        : null;
      const supplier = await db.suppliers.get(label.supplierId);
      const inventory = await checkInventoryAvailability(
        label.id,
        "supplierLabel",
        units
      );
      const totalCost = calculateCostWithTax(
        units,
        label.unitPrice,
        label.tax || 0
      );
      labels.push({
        itemType: "label",
        itemId: label.id,
        itemName: labelDef?.name || "Front Label",
        supplierId: label.supplierId,
        supplierName: supplier?.name || "Unknown Supplier",
        required: units,
        available: inventory.available,
        shortage: inventory.shortage,
        unit: label.unit,
        unitPrice: label.unitPrice,
        tax: label.tax || 0,
        totalCost,
        productId,
        productName,
        variantId,
        variantName,
        labelType: "front",
      });
    }
  }
  // Back label
  if (backLabelId) {
    const label = await db.supplierLabels.get(backLabelId);
    if (label) {
      const labelDef = label.labelId
        ? await db.labels.get(label.labelId)
        : null;
      const supplier = await db.suppliers.get(label.supplierId);
      const inventory = await checkInventoryAvailability(
        label.id,
        "supplierLabel",
        units
      );
      const totalCost = calculateCostWithTax(
        units,
        label.unitPrice,
        label.tax || 0
      );
      labels.push({
        itemType: "label",
        itemId: label.id,
        itemName: labelDef?.name || "Back Label",
        supplierId: label.supplierId,
        supplierName: supplier?.name || "Unknown Supplier",
        required: units,
        available: inventory.available,
        shortage: inventory.shortage,
        unit: label.unit,
        unitPrice: label.unitPrice,
        tax: label.tax || 0,
        totalCost,
        productId,
        productName,
        variantId,
        variantName,
        labelType: "back",
      });
    }
  }
  return labels;
}
// ============================================================================
// AGGREGATION FUNCTIONS
// ============================================================================
/**

Aggregates requirements by composite key (item + supplier)
Combines duplicate items from different variants

@param requirements - Array of requirements
@returns Aggregated requirements
*/
export function aggregateRequirements<T extends RequirementItem>(
  requirements: T[]
): T[] {
  const map = new Map<string, T>();

  for (const req of requirements) {
    const key = `${req.itemType}-${req.itemId}-${req.supplierId}`;
    if (map.has(key)) {
      const existing = map.get(key)!;
      existing.required += req.required;
      existing.shortage = Math.max(0, existing.required - existing.available);
      existing.totalCost += req.totalCost;
    } else {
      map.set(key, { ...req });
    }
  }
  return Array.from(map.values());
}

/**

Groups requirements by supplier

@param materials - Material requirements
@param packaging - Packaging requirements
@param labels - Label requirements
@returns Array of supplier requirements
*/
export function groupRequirementsBySupplier(
  materials: RequirementItem[],
  packaging: RequirementItem[],
  labels: RequirementItem[]
): SupplierRequirement[] {
  const supplierMap = new Map<string, SupplierRequirement>();

  const allItems = [...materials, ...packaging, ...labels];
  for (const item of allItems) {
    if (!supplierMap.has(item.supplierId)) {
      supplierMap.set(item.supplierId, {
        supplierId: item.supplierId,
        supplierName: item.supplierName,
        materials: [],
        packaging: [],
        labels: [],
        totalCost: 0,
        itemCount: 0,
        shortageCount: 0,
      });
    }
    const supplier = supplierMap.get(item.supplierId)!;

    if (item.itemType === "material") supplier.materials.push(item);
    if (item.itemType === "packaging") supplier.packaging.push(item);
    if (item.itemType === "label") supplier.labels.push(item);

    supplier.totalCost += item.totalCost;
    supplier.itemCount++;
    if (item.shortage > 0) supplier.shortageCount++;
  }
  return Array.from(supplierMap.values());
}
/**

Groups requirements by product
Maintains variant-level detail and creates product-level aggregates

@param materials - Material requirements with context
@param packaging - Packaging requirements with context
@param labels - Label requirements with context
@returns Array of product requirements
*/
export function groupRequirementsByProduct(
  materials: MaterialRequirement[],
  packaging: PackagingRequirement[],
  labels: LabelRequirement[]
): ProductRequirements[] {
  const productMap = new Map<string, ProductRequirements>();

  // Process all requirements
  const allRequirements = [
    ...materials.map((m) => ({ ...m, type: "material" as const })),
    ...packaging.map((p) => ({ ...p, type: "packaging" as const })),
    ...labels.map((l) => ({ ...l, type: "label" as const })),
  ];
  for (const req of allRequirements) {
    // Initialize product if needed
    if (!productMap.has(req.productId)) {
      productMap.set(req.productId, {
        productId: req.productId,
        productName: req.productName,
        variants: [],
        totalMaterials: [],
        totalPackaging: [],
        totalLabels: [],
        totalCost: 0,
      });
    }
    const product = productMap.get(req.productId)!;

    // Find or create variant
    let variant = product.variants.find((v) => v.variantId === req.variantId);
    if (!variant) {
      variant = {
        variantId: req.variantId,
        variantName: req.variantName,
        materials: [],
        packaging: [],
        labels: [],
        totalCost: 0,
      };
      product.variants.push(variant);
    }

    // Add to variant
    if (req.type === "material") {
      variant.materials.push(req);
    } else if (req.type === "packaging") {
      variant.packaging.push(req);
    } else if (req.type === "label") {
      variant.labels.push(req);
    }
    variant.totalCost += req.totalCost;

    // Add to product totals
    if (req.type === "material") {
      product.totalMaterials.push(req);
    } else if (req.type === "packaging") {
      product.totalPackaging.push(req);
    } else if (req.type === "label") {
      product.totalLabels.push(req);
    }
    product.totalCost += req.totalCost;
  }
  // Aggregate product-level totals
  for (const product of productMap.values()) {
    product.totalMaterials = aggregateRequirements(product.totalMaterials);
    product.totalPackaging = aggregateRequirements(product.totalPackaging);
    product.totalLabels = aggregateRequirements(product.totalLabels);
  }
  return Array.from(productMap.values());
}
/**

Finds items without inventory tracking

@param materials - Material requirements
@param packaging - Packaging requirements
@param labels - Label requirements
@returns Array of items without inventory
*/
export function findItemsWithoutInventory(
  materials: RequirementItem[],
  packaging: RequirementItem[],
  labels: RequirementItem[]
): ItemWithoutInventory[] {
  const itemsWithoutTracking: ItemWithoutInventory[] = [];

  const checkItem = (item: RequirementItem) => {
    // If shortage equals required, it means no inventory tracking
    if (item.shortage === item.required && item.available === 0) {
      itemsWithoutTracking.push({
        itemType: item.itemType,
        itemId: item.itemId,
        itemName: item.itemName,
        supplierName: item.supplierName,
      });
    }
  };
  materials.forEach(checkItem);
  packaging.forEach(checkItem);
  labels.forEach(checkItem);
  return itemsWithoutTracking;
}

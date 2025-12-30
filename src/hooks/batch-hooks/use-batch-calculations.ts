// hooks/use-batch-calculations.ts
import { db } from "@/lib/db";
import type { InventoryItem } from "@/types/inventory-types";
import type { SupplierMaterial } from "@/types/material-types";
import type { RecipeIngredient } from "@/types/recipe-types";
import type { RequirementItem, SupplierRequirement } from "@/types/batch-types";
import type { ItemWithoutInventory } from "@/types/shared-types";
import { normalizeToKg } from "@/utils/unit-conversion-utils";

// ============================================================================
// PRICE RESOLUTION
// ============================================================================

/**
 * Resolves the price to use for a recipe ingredient
 * Priority: lockedPricing → current SupplierMaterial price
 */
export function resolveIngredientPrice(
  ingredient: RecipeIngredient,
  supplierMaterial: SupplierMaterial
): { unitPrice: number; tax: number; isLocked: boolean } {
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
 * Calculate total cost with tax
 */
export function calculateCostWithTax(
  quantity: number,
  unitPrice: number,
  taxPercent: number
): number {
  return quantity * unitPrice * (1 + taxPercent / 100);
}

// ============================================================================
// INVENTORY CHECKS
// ============================================================================

/**
 * Get inventory item and calculate availability
 */
export async function checkInventoryAvailability(
  itemId: string,
  itemType: string,
  requiredQty: number
): Promise<{
  inventoryItem: InventoryItem | null;
  available: number;
  shortage: number;
  hasInventoryTracking: boolean;
}> {
  const inventoryItem = await db.inventoryItems
    .where("[itemId+itemType]")
    .equals([itemId, itemType])
    .first();

  if (!inventoryItem) {
    return {
      inventoryItem: null,
      available: 0,
      shortage: requiredQty,
      hasInventoryTracking: false,
    };
  }

  const available = inventoryItem.currentStock;
  const shortage = Math.max(0, requiredQty - available);
  return {
    inventoryItem,
    available,
    shortage,
    hasInventoryTracking: true,
  };
}

// ============================================================================
// MATERIAL REQUIREMENTS CALCULATION
// ============================================================================

export interface MaterialRequirement extends RequirementItem {
  isLocked: boolean;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
}

/**
 * Calculate material requirements for a single variant
 */
export async function calculateVariantMaterialRequirements(
  productId: string,
  productName: string,
  variantId: string,
  variantName: string,
  fillQtyInKg: number,
  recipeId: string
): Promise<MaterialRequirement[]> {
  const materials: MaterialRequirement[] = [];

  // Get recipe ingredients
  const ingredients = await db.recipeIngredients
    .where("recipeId")
    .equals(recipeId)
    .toArray();

  // IMPORTANT: Calculate total recipe weight first
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

  console.log(`📊 Recipe total weight: ${totalRecipeWeightInKg} kg`);
  console.log(`🎯 Target fill qty: ${fillQtyInKg} kg`);

  // Calculate scaling factor
  const scaleFactor = fillQtyInKg / totalRecipeWeightInKg;
  console.log(`⚖️ Scale factor: ${scaleFactor.toFixed(4)}`);

  // Now calculate requirements for each ingredient
  for (const data of ingredientData) {
    const { ingredient, supplierMaterial, ingredientQtyInKg } = data;

    const material = await db.materials.get(supplierMaterial.materialId);
    const supplier = await db.suppliers.get(supplierMaterial.supplierId);

    // Resolve pricing (locked or current)
    const pricing = resolveIngredientPrice(ingredient, supplierMaterial);

    // Calculate quantity needed using scale factor
    const requiredQty = ingredientQtyInKg * scaleFactor;

    console.log(
      `  ${material?.name}: ${ingredientQtyInKg} kg × ${scaleFactor.toFixed(2)} = ${requiredQty.toFixed(2)} kg`
    );

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
// PACKAGING REQUIREMENTS CALCULATION
// ============================================================================

export interface PackagingRequirement extends RequirementItem {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
}

/**
 * Calculate packaging requirements for a single variant
 */
export async function calculateVariantPackagingRequirements(
  productId: string,
  productName: string,
  variantId: string,
  variantName: string,
  units: number,
  packagingSelectionId: string
): Promise<PackagingRequirement[]> {
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
// LABEL REQUIREMENTS CALCULATION
// ============================================================================

export interface LabelRequirement extends RequirementItem {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  labelType: "front" | "back";
}

/**
 * Calculate label requirements for a single variant
 */
export async function calculateVariantLabelRequirements(
  productId: string,
  productName: string,
  variantId: string,
  variantName: string,
  units: number,
  frontLabelId?: string,
  backLabelId?: string
): Promise<LabelRequirement[]> {
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
 * Aggregate requirements by composite key (item + supplier)
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
 * Group requirements by supplier
 */
export function groupBySupplier(
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
 * Group requirements by product (for product-wise view)
 */
export interface ProductRequirements {
  productId: string;
  productName: string;
  variants: VariantRequirements[];
  totalMaterials: RequirementItem[];
  totalPackaging: RequirementItem[];
  totalLabels: RequirementItem[];
  totalCost: number;
}

export interface VariantRequirements {
  variantId: string;
  variantName: string;
  materials: RequirementItem[];
  packaging: RequirementItem[];
  labels: RequirementItem[];
  totalCost: number;
}

export function groupByProduct(
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

    // Add to product totals (will aggregate later)
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

// ============================================================================
// ITEMS WITHOUT INVENTORY TRACKING
// ============================================================================

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

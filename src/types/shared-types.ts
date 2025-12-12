// src/types/shared-types.ts
import { ItemWithoutInventory } from "./inventory-types";
import { SupplierLabelTableRow } from "./label-types";
import { SupplierPackagingTableRow } from "./packaging-types";

// ============================================================================
// BASE TYPES
// ============================================================================

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BulkDiscount {
  quantity: number;
  discount: number; // percentage
}

export type CapacityUnit = "kg" | "L" | "ml" | "gm" | "pcs";

// ============================================================================
// RECIPES
// ============================================================================

export interface LockedPricing {
  unitPrice: number; // locked supplier unit price
  tax: number; // Locked tax percentage
  lockedAt: Date;
  reason?: "cost_analysis" | "quote" | "production_batch" | "other";
  notes?: string;
}
// A single ingredient in a recipe formulation.

export interface RecipeIngredient extends BaseEntity {
  recipeId: string;
  supplierMaterialId: string;
  quantity: number;
  unit: CapacityUnit;
  lockedPricing?: LockedPricing;
}

// Recipe/Formulation - The formula for making a product substance

export interface Recipe extends BaseEntity {
  name: string;
  description?: string;
  targetCostPerKg?: number;
  status: "draft" | "testing" | "active" | "archived" | "discontinued";
  version?: number;
  instructions?: string;
  notes?: string;
}

export type OptimizationGoalType =
  | "cost_reduction"
  | "supplier_diversification"
  | "custom";

export interface RecipeVariant extends BaseEntity {
  originalRecipeId: string;
  name: string;
  description?: string;

  // Core formulation
  ingredientIds: string[];
  // Optional full snapshot of variant ingredients to avoid referencing mutable
  // recipe ingredient records. This allows historic variants to stay immutable
  // even if the base recipe changes.
  ingredientsSnapshot?: VariantIngredientSnapshot[];

  // Business context
  optimizationGoal?:
    | "cost_reduction"
    | "quality_improvement"
    | "supplier_diversification"
    | "other";
  isActive: boolean;

  // Audit trail
  changes?: RecipeVariantChange[];
  notes?: string;
}

export interface RecipeVariantChange {
  type:
    | "quantity_change"
    | "supplier_change"
    | "ingredient_added"
    | "ingredient_removed";
  ingredientName?: string;
  oldValue?: string | number;
  newValue?: string | number;
  reason?: string;
  changedAt: Date; // Add timestamp for better audit
}

// --- Snapshot for variant (optional) ---
// If you need the variant to be a full snapshot of formulation at that moment,
// use this structure instead of referencing ingredientIds. This avoids future edits
// to base ingredients from changing historic variants.
export interface VariantIngredientSnapshot {
  supplierMaterialId: string;
  quantity: number;
  unit: CapacityUnit;
  lockedPricing?: LockedPricing;
  notes?: string;
}

// Computed values for a recipe ingredient (NOT stored in DB)
// These are calculated at runtime from SupplierMaterial data

export interface RecipeIngredientDisplay extends RecipeIngredient {
  displayQuantity: string;

  // Material & supplier friendly fields (populated via join)
  materialName?: string;
  supplierName?: string;
  displayName: string; // human-friendly: "Sodium Chloride (Supplier X)"

  pricePerKg: number;
  costForQuantity: number;
  taxedPriceForQuantity: number;

  priceSharePercentage: number; // share of recipe cost
  isPriceLocked: boolean;
  priceChangedSinceLock: boolean;
  priceDifference?: number; // positive if current price > locked price
  isAvailable: boolean;
}

// For UI display - computed from Recipe + RecipeIngredientDisplay[]
export interface RecipeDisplay extends Recipe {
  ingredients: RecipeIngredientDisplay[];
  ingredientCount: number;
  variantCount: number;

  totalWeight: number;
  totalCost: number;
  taxedTotalCost: number;
  costPerKg: number;
  taxedCostPerKg: number;

  varianceFromTarget?: number;
  variancePercentage?: number;
  isAboveTarget?: boolean;
}

// ============================================================================
// PRODUCT SYSTEM (Final SKU)
// ============================================================================

// Product - The master product definition/family
export interface Product extends BaseEntity {
  name: string; // e.g., "Harpic Toilet Cleaner"
  description?: string;

  // Recipe reference - can be original recipe OR a variant
  recipeId: string; // This is EITHER a Recipe.id OR RecipeVariant.id
  isRecipeVariant: boolean; // true if recipeId points to RecipeVariant

  // Product metadata
  status: "draft" | "active" | "discontinued";
  barcode?: string;
  imageUrl?: string;
  tags?: string[];
  shelfLife?: number; // Days

  notes?: string;
}

/**
 * ProductVariant - Size/packaging variations of a product
 * Each variant represents a different SKU (e.g., "Harpic 1kg", "Harpic 500gm")
 * STORED IN INDEXEDDB
 */
export interface ProductVariant extends BaseEntity {
  productId: string; // References Product.id

  // Variant identity
  name: string; // e.g., "1kg Bottle", "500gm Pouch"
  sku: string; // Unique SKU for this variant

  // Size specification
  fillQuantity: number; // e.g., 1000 for 1kg
  fillUnit: CapacityUnit; // e.g., "gm"

  // Packaging & Labels (references to supplier selections)
  packagingSelectionId: string; // References SupplierPackaging.id
  frontLabelSelectionId?: string; // References SupplierLabel.id
  backLabelSelectionId?: string; // References SupplierLabel.id

  // Quantities needed for this variant
  labelsPerUnit: number; // Usually 1 front + 1 back = 2

  // Pricing (what you sell at)
  sellingPricePerUnit: number;
  targetProfitMargin?: number; // Desired margin %
  minimumProfitMargin?: number; // Don't sell below this

  // Distribution
  distributionChannels?: string[]; // ["retail", "wholesale", "online"]
  unitsPerCase?: number; // For bulk sales
  sellingPricePerCase?: number;

  // Status
  isActive: boolean;

  notes?: string;
}

// ============================================================================
// PRODUCT COMPUTED TYPES (Calculated on-the-fly, NOT stored)
// ============================================================================

/**
 * ProductVariantWithDetails - Product variant with joined data
 * Computed by joining with Product, Recipe, Packaging, Labels
 */
export interface ProductVariantWithDetails extends ProductVariant {
  // Joined product info
  product?: Product;
  productName: string;
  productCategory?: string;

  // Joined recipe info
  recipe?: Recipe;
  recipeName: string;
  recipeVariant?: RecipeVariant;

  // Joined packaging info
  packaging?: SupplierPackagingTableRow;
  packagingName: string;
  packagingCapacity: number;
  packagingUnit: CapacityUnit;

  // Joined label info
  frontLabel?: SupplierLabelTableRow;
  frontLabelName?: string;
  backLabel?: SupplierLabelTableRow;
  backLabelName?: string;

  // Display helpers
  displayName: string; // "Harpic 1kg Bottle"
  displaySku: string;
}

/**
 * ProductVariantCostAnalysis - Complete cost breakdown
 * Computed from current prices of recipe, packaging, labels
 */
export interface ProductVariantCostAnalysis {
  variantId: string;
  variantName: string;
  sku: string;

  // Fill specifications
  fillQuantity: number;
  fillUnit: CapacityUnit;
  fillQuantityInKg: number; // Normalized to kg for calculations

  // Recipe costs (from RecipeCostAnalysis)
  recipeCostPerKg: number;
  recipeTaxPerKg: number;
  recipeCostForFill: number; // recipeCostPerKg * fillQuantityInKg
  recipeTaxForFill: number;
  recipeTotalForFill: number; // with tax

  // Packaging costs
  packagingUnitPrice: number;
  packagingTax: number;
  packagingTaxAmount: number;
  packagingTotal: number; // with tax

  // Label costs
  frontLabelUnitPrice: number;
  frontLabelTax: number;
  frontLabelTaxAmount: number;
  frontLabelTotal: number; // with tax

  backLabelUnitPrice?: number;
  backLabelTax?: number;
  backLabelTaxAmount?: number;
  backLabelTotal?: number; // with tax

  totalLabelsCost: number; // Sum of all labels with tax

  // Total costs
  totalCostWithoutTax: number;
  totalTaxAmount: number;
  totalCostWithTax: number;

  // Per-kg calculations
  costPerKgWithoutTax: number; // totalCostWithoutTax / fillQuantityInKg
  costPerKgWithTax: number; // totalCostWithTax / fillQuantityInKg

  // Profitability
  sellingPricePerUnit: number;
  grossProfit: number; // sellingPrice - totalCostWithTax
  grossProfitMargin: number; // (grossProfit / sellingPrice) * 100

  // Target comparison
  targetProfitMargin?: number;
  marginVsTarget?: number; // Actual margin - target margin
  meetsMinimumMargin: boolean;

  // Cost breakdown by component (for charts/tables)
  costBreakdown: {
    component: "recipe" | "packaging" | "front_label" | "back_label";
    name: string;
    cost: number; // with tax
    percentage: number; // of total cost
  }[];

  // Price comparison with snapshot (if locked)
  priceChangedSinceSnapshot: boolean;
  costDifferenceFromSnapshot?: number; // Current cost - snapshot cost
  costDifferencePercentage?: number;

  // Warnings/Alerts
  warnings: string[];
  hasAvailabilityIssues: boolean;
}

/**
 * ProductFamilyAnalysis - Analysis across all variants of a product
 * Useful for comparing different sizes
 */
export interface ProductFamilyAnalysis {
  productId: string;
  productName: string;

  variants: ProductVariantCostAnalysis[];
  variantCount: number;
  activeVariantCount: number;

  // Aggregate metrics
  averageMargin: number;
  bestMarginVariant?: {
    variantId: string;
    variantName: string;
    margin: number;
  };
  worstMarginVariant?: {
    variantId: string;
    variantName: string;
    margin: number;
  };

  // Size comparison
  mostEconomicalSize?: {
    variantId: string;
    variantName: string;
    costPerKg: number;
  };

  // Revenue potential (if you track sales data later)
  totalPotentialRevenue?: number;
}

/**
 * Component cost summary for a product variant
 * Used in UI tables/cards
 */
export interface ComponentCostSummary {
  componentType: "recipe" | "packaging" | "label";
  itemName: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  tax: number;
  totalCost: number;
  totalCostWithTax: number;
}

/**
 * Quick variant comparison view
 * For showing multiple variants side-by-side
 */
export interface VariantComparison {
  variantId: string;
  sku: string;
  size: string; // e.g., "1kg", "500gm"
  sellingPrice: number;
  cost: number;
  margin: number;
  costPerKg: number;
  isActive: boolean;
}

// ============================================================================
// PRODUCTION BATCHES
// ============================================================================

// REPLACE ProductionBatch and related types with:

export interface ProductionBatch extends BaseEntity {
  batchName: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: "draft" | "scheduled" | "in-progress" | "completed" | "cancelled";
  items: BatchProductItem[];
}

export interface BatchProductItem {
  productId: string;
  variants: BatchVariantItem[];
}

export interface BatchVariantItem {
  variantId: string;
  totalFillQuantity: number; // How much kg/L to produce
  fillUnit: CapacityUnit; // Always in L or kg
}

export interface BatchVariantDetails {
  variantId: string;
  variantName: string;
  productName: string;
  fillQuantity: number; // Variant's capacity
  fillUnit: CapacityUnit; // Variant's unit (mL, g, etc.)
  totalFillQuantity: number; // Batch quantity in L/kg
  units: number; // Calculated
  displayQuantity: string; // Formatted for UI
}

export interface BatchProductDetails {
  productId: string;
  productName: string;
  variants: BatchVariantDetails[];
}

/**
 * BatchWithDetails - Batch with all joined data
 */
export interface BatchWithDetails extends ProductionBatch {
  products: BatchProductDetails[];
}

// Minimal cost analysis interface
export interface BatchCostAnalysis {
  batchId: string;
  totalUnits: number;
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;

  // Cost breakdown by type
  materialsCost: number;
  packagingCost: number;
  labelsCost: number;

  // Percentages
  materialsPercentage: number;
  packagingPercentage: number;
  labelsPercentage: number;

  // Remove heavy arrays unless specifically needed
  variantCosts?: VariantCost[]; // Make optional
}

export interface VariantCost {
  variantId: string;
  variantName: string;
  productName: string;
  fillQuantity: number; // NEW
  fillUnit: string; // NEW
  units: number;
  totalCost: number;
  totalRevenue: number;
  profit: number;
  margin: number;
  costPerUnit: number; // NEW
  revenuePerUnit: number; // NEW
}

// Computed analysis (NOT stored)
export interface BatchRequirementsAnalysis {
  batchId: string;

  // Aggregated requirements
  materials: RequirementItem[];
  packaging: RequirementItem[];
  labels: RequirementItem[];

  // Totals
  totalMaterialCost: number;
  totalPackagingCost: number;
  totalLabelCost: number;
  totalCost: number;

  // Procurement summary
  totalItemsToOrder: number;
  totalProcurementCost: number;
  criticalShortages: RequirementItem[]; // Items with shortage > 0

  // Grouped by supplier
  bySupplier: SupplierRequirement[];
  byProduct: ProductRequirements[];
  itemsWithoutInventory: ItemWithoutInventory[];
}

export interface RequirementItem {
  itemType: "material" | "packaging" | "label";
  itemId: string; // SupplierMaterial.id, SupplierPackaging.id, etc.
  itemName: string;
  supplierId: string;
  supplierName: string;

  required: number;
  available: number; // From inventory (0 for now)
  shortage: number; // required - available
  unit: string;

  unitPrice: number;
  tax: number;
  totalCost: number; // (required * unitPrice) * (1 + tax/100)
}
export interface EnhancedRequirementItem extends RequirementItem {
  isLocked?: boolean; // For materials with locked pricing
  hasInventoryTracking?: boolean;
}
export interface SupplierRequirement {
  supplierId: string;
  supplierName: string;
  materials: RequirementItem[];
  packaging: RequirementItem[];
  labels: RequirementItem[];
  totalCost: number;
}
/**
 * Product-wise requirements grouping
 */
export interface ProductRequirements {
  productId: string;
  productName: string;
  variants: VariantRequirements[];
  // Aggregated totals for the product
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
// ============================================================================
// PROCUREMENT & ORDERS
// ============================================================================

export interface PurchaseOrderItem {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  costPerKg: number;
  totalCost: number;
}

export interface PurchaseOrder extends BaseEntity {
  id: string;
  orderId: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalCost: number;
  status:
    | "draft"
    | "submitted"
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled";
  dateCreated: string;
  deliveryDate: string;
}

// ============================================================================
// TRANSPORTATION COSTS
// ============================================================================

export interface TransportationCost extends BaseEntity {
  supplierId: string;
  region: string; // e.g., "Mumbai", "Delhi", "International"
  costPerKg: number;
  minOrderValue?: number;
  maxWeight?: number;
  leadTime: number; // additional days
  notes?: string;
}

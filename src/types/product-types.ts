// src/types/product-types.ts

import { BaseEntity } from "./shared-types";
import { CapacityUnit } from "./packaging-types";
import { RecipeVariant } from "./recipe-types";

/**
 * Product entity - The master product definition/family
 * Stored in: db.products
 */
export interface Product extends BaseEntity {
  name: string; // e.g., "Harpic Toilet Cleaner"
  description?: string;

  // Recipe reference - can be original recipe OR a variant
  recipeId: string; // Recipe.id OR RecipeVariant.id
  isRecipeVariant: boolean;
  // Product metadata
  status: "draft" | "active" | "discontinued";
  barcode?: string;
  imageUrl?: string;
  tags?: string[];
  shelfLife?: number; // Days

  notes?: string;
}

/**
 * ProductVariant entity - Size/packaging variations of a product
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
// VIEW MODELS - For displaying data in components (with joins)
// ============================================================================

/**
 * Minimal product data for list views
 */
export interface ProductListItem extends BaseEntity {
  name: string;
  description?: string;
  status: Product["status"];

  // Display data
  recipeName: string;
  variantCount: number;

  // Quick metrics (optional - for future enhancement)
  bestMargin?: number;
  worstMargin?: number;
}

/**
 * Product with enriched data for detail views
 */
export interface ProductDetail extends Product {
  // Joined recipe info
  recipeName: string;
  recipeVariant?: RecipeVariant;

  // Counts
  variantCount: number;
}

/**
 * Variant with essential joined data for list/card display
 */
export interface ProductVariantDetail extends ProductVariant {
  // Joined recipe info (for display only)
  recipeName: string;

  // Joined packaging info (essential fields only)
  packagingName: string;
  packagingCapacity: number;
  packagingUnit: CapacityUnit;

  // Joined label info (optional)
  frontLabelName?: string;
  backLabelName?: string;
}

// ============================================================================
// COST ANALYSIS TYPES - Computation results (not stored in DB)
// ============================================================================

/**
 * Computed on-demand from current prices of recipe, packaging, labels
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

// ============================================================================
// FORM MODELS - For create/update operations
// ============================================================================

/**
 * Form data for creating/updating products
 */
export interface ProductFormData {
  name: string;
  description?: string;
  status: Product["status"];
  recipeId: string;
  isRecipeVariant: boolean;
  barcode?: string;
  imageUrl?: string;
  tags?: string[];
  shelfLife?: number;
  notes?: string;
}

/**
 * Form data for creating/updating product variants
 */
export interface VariantFormData {
  productId: string;
  name: string;
  sku: string;
  fillQuantity: number;
  fillUnit: CapacityUnit;
  packagingSelectionId: string;
  frontLabelSelectionId?: string;
  backLabelSelectionId?: string;
  labelsPerUnit: number;
  sellingPricePerUnit: number;
  targetProfitMargin?: number;
  minimumProfitMargin?: number;
  distributionChannels?: string[];
  unitsPerCase?: number;
  sellingPricePerCase?: number;
  isActive: boolean;
  notes?: string;
}

/**
 * Form validation errors
 */
export interface ProductFormErrors {
  name?: string;
  recipeId?: string;
  sellingPricePerUnit?: string;
  packagingSelectionId?: string;
  sku?: string;
}

// ============================================================================
// HELPER TYPES - For specific use cases
// ============================================================================

/**
 * Packaging option for dropdowns
 * Minimal data needed for selection UI
 */
export interface PackagingOption {
  id: string;
  displayName: string;
  unitPrice: number;
  capacity: number;
  capacityUnit: CapacityUnit;
}

/**
 * Label option for dropdowns
 * Minimal data needed for selection UI
 */
export interface LabelOption {
  id: string;
  displayName: string;
  unitPrice: number;
}

/**
 * Recipe option for dropdowns
 * Minimal data needed for selection UI
 */
export interface RecipeOption {
  id: string;
  name: string;
  costPerKg: number;
  isVariant?: boolean;
}

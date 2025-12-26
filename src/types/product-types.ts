// ============================================================================
// PRODUCT SYSTEM (Final SKU)
// =========================================================================+++

import { SupplierLabelTableRow } from "./label-types";
import { CapacityUnit, SupplierPackagingTableRow } from "./packaging-types";
import { Recipe, RecipeVariant } from "./recipe-types";
import { BaseEntity } from "./shared-types";

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

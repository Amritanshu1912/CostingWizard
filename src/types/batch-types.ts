import { BaseEntity, CapacityUnit, ItemWithoutInventory } from "./shared-types";

export type BatchStatus =
  | "draft"
  | "scheduled"
  | "in-progress"
  | "completed"
  | "cancelled";

/**
 * Production batch - core database schema
 * Stores only what's necessary, all metrics calculated on-demand
 */
export interface ProductionBatch extends BaseEntity {
  batchName: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: BatchStatus;
  items: BatchProductItem[];
}

/**
 * Product item within a batch
 * Links to a product and specifies which variants to produce
 */
export interface BatchProductItem {
  productId: string;
  variants: BatchVariantItem[];
}

/**
 * Variant item within a batch
 * Specifies how much to produce (always in kg or L for consistency)
 */
export interface BatchVariantItem {
  variantId: string;
  totalFillQuantity: number; // How much kg/L to produce
  fillUnit: CapacityUnit; // Always "kg" or "L"
}

// ============================================================================
// VIEW-SPECIFIC TYPES (Computed - for UI consumption)
// ============================================================================

/**
 * Batch with basic product/variant details for list views
 * Lightweight - only names and counts
 */
export interface BatchListItem extends ProductionBatch {
  productCount: number;
  variantCount: number;
  totalUnits?: number; // Optional - only if needed
}

/**
 * Single variant with calculated metrics for detail views
 */
export interface BatchVariantDetails {
  variantId: string;
  variantName: string;
  productId: string;
  productName: string;
  fillQuantity: number; // Variant's individual capacity (e.g., 500ml)
  fillUnit: CapacityUnit;
  totalFillQuantity: number; // Batch total (e.g., 50L)
  units: number; // Calculated: how many bottles/units
  displayQuantity: string; // Formatted: "50 L" or "50000 ml"
}

/**
 * Product grouping with all its variants for detail views
 */
export interface BatchProductDetails {
  productId: string;
  productName: string;
  variants: BatchVariantDetails[];
}

/**
 * Complete batch details with all joined data
 * Used in detail panel main view
 */
export interface BatchWithDetails extends ProductionBatch {
  products: BatchProductDetails[];
}

// ============================================================================
// COST ANALYSIS TYPES (Financial calculations)
// ============================================================================

/**
 * Summary-level cost analysis for overview cards
 * Minimal fields for quick display
 */
export interface BatchCostSummary {
  batchId: string;
  totalUnits: number;
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number; // Percentage
}

/**
 * Cost breakdown by category
 * Used for pie charts and category analysis
 */
export interface BatchCostBreakdown {
  materialsCost: number;
  packagingCost: number;
  labelsCost: number;
  materialsPercentage: number;
  packagingPercentage: number;
  labelsPercentage: number;
}

/**
 * Per-variant cost analysis
 * Used for variant comparison charts and tables
 */
export interface VariantCostAnalysis {
  variantId: string;
  variantName: string;
  productName: string;
  fillQuantity: number;
  fillUnit: CapacityUnit;
  units: number;
  costPerUnit: number;
  revenuePerUnit: number;
  totalCost: number;
  totalRevenue: number;
  profit: number;
  margin: number; // Percentage
}

/**
 * Complete cost analysis with all details
 * Only fetched when analytics tab is active
 */
export interface BatchCostAnalysis
  extends BatchCostSummary,
    BatchCostBreakdown {
  variantCosts: VariantCostAnalysis[];
}

// ============================================================================
// REQUIREMENTS TYPES (Procurement planning)
// ============================================================================

/**
 * Base requirement for any item (material/packaging/label)
 * Core fields needed for procurement
 */
export interface RequirementItem {
  itemType: RequirementItemType;
  itemId: string; // ID from supplier table
  itemName: string;
  supplierId: string;
  supplierName: string;
  required: number;
  available: number; // From inventory
  shortage: number; // required - available
  unit: string;
  unitPrice: number;
  tax: number; // Percentage
  totalCost: number; // (required * unitPrice) * (1 + tax/100)
}

export type RequirementItemType = "material" | "packaging" | "label";

/**
 * Enhanced requirement with additional context
 * Used when showing detailed item information
 */
export interface RequirementItemDetailed extends RequirementItem {
  isLocked?: boolean; // For materials with locked pricing from recipe
  hasInventoryTracking?: boolean;
  productId?: string; // Context: which product needs this
  variantId?: string; // Context: which variant needs this
}

/**
 * Minimal overview data for requirement summary cards
 * Optimized for quick dashboard display
 */
export interface BatchRequirementsOverview {
  batchId: string;
  totalItems: number;
  totalCost: number;
  supplierCount: number;
  shortageCount: number;
  // Category counts
  materialCount: number;
  packagingCount: number;
  labelCount: number;
  // Category costs
  materialCost: number;
  packagingCost: number;
  labelCost: number;
}

/**
 * Requirements grouped by category
 * Used for tabbed category view
 */
export interface BatchRequirementsByCategory {
  materials: RequirementItem[];
  packaging: RequirementItem[];
  labels: RequirementItem[];
  totalMaterialCost: number;
  totalPackagingCost: number;
  totalLabelCost: number;
}

/**
 * Requirements grouped by supplier
 * Used for supplier-wise procurement planning
 */
export interface SupplierRequirement {
  supplierId: string;
  supplierName: string;
  materials: RequirementItem[];
  packaging: RequirementItem[];
  labels: RequirementItem[];
  totalCost: number;
  itemCount: number; // Total items from this supplier
  shortageCount: number; // Items with shortages
}

/**
 * Requirements grouped by product and variant
 * Used for product-wise detailed view
 */
export interface ProductRequirements {
  productId: string;
  productName: string;
  variants: VariantRequirements[];
  // Aggregated totals across all variants
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

/**
 * Complete requirements analysis
 * Only fetch components that are actually needed
 */
export interface BatchRequirementsAnalysis {
  batchId: string;
  overview: BatchRequirementsOverview;
  byCategory?: BatchRequirementsByCategory; // Lazy load when category tab opened
  bySupplier?: SupplierRequirement[]; // Lazy load when supplier section opened
  byProduct?: ProductRequirements[]; // Lazy load when product view opened
  criticalShortages?: RequirementItem[]; // Only when shortages exist
  itemsWithoutInventory?: ItemWithoutInventory[]; // Only when items not tracked
}

// ============================================================================
// INTERMEDIATE CALCULATION TYPES (Internal use in hooks)
// ============================================================================

/**
 * Material requirement with product/variant context
 * Internal type for calculation aggregation
 */
export interface MaterialRequirement extends RequirementItem {
  isLocked: boolean;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
}

/**
 * Packaging requirement with product/variant context
 * Internal type for calculation aggregation
 */
export interface PackagingRequirement extends RequirementItem {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
}

/**
 * Label requirement with product/variant context and label type
 * Internal type for calculation aggregation
 */
export interface LabelRequirement extends RequirementItem {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  labelType: "front" | "back";
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Pricing information with optional locked pricing
 */
export interface PricingInfo {
  unitPrice: number;
  tax: number;
  isLocked: boolean;
}

/**
 * Inventory availability check result
 */
export interface InventoryAvailability {
  itemId: string;
  available: number;
  shortage: number;
  hasInventoryTracking: boolean;
}

// ============================================================================
// HELPER TYPE GUARDS
// ============================================================================

export function isRequirementItemDetailed(
  item: RequirementItem | RequirementItemDetailed
): item is RequirementItemDetailed {
  return "isLocked" in item || "productId" in item;
}

export function hasShortage(item: RequirementItem): boolean {
  return item.shortage > 0;
}

export function hasInventoryTracking(item: RequirementItem): boolean {
  return item.available > 0 || item.shortage < item.required;
}

import type { BaseEntity, BulkDiscount } from "./shared-types";

/** Packaging type classifications */
export type PackagingType =
  | "bottle"
  | "jar"
  | "can"
  | "box"
  | "pouch"
  | "other";

/** Build material classifications */
export type BuildMaterial =
  | "PET"
  | "HDPE"
  | "Glass"
  | "Plastic"
  | "Paper"
  | "Other";

/** Capacity unit classifications */
export type CapacityUnit = "kg" | "L" | "ml" | "gm" | "pcs";

/** Packaging table entity */
export interface Packaging extends BaseEntity {
  name: string;
  type: PackagingType;
  capacity: number;
  capacityUnit: CapacityUnit;
  buildMaterial: BuildMaterial;
  notes?: string;
}

/** SupplierPackaging table entity */
export interface SupplierPackaging extends BaseEntity {
  supplierId: string;
  packagingId: string;
  bulkPrice: number; // The actual quoted price
  quantityForBulkPrice: number;
  unitPrice: number;
  capacityUnit: CapacityUnit;
  tax: number;
  moq: number;
  bulkDiscounts?: BulkDiscount[];
  leadTime: number;
  transportationCost?: number;
  notes?: string;
}

// ============================================================================
// VIEW MODELS - For displaying data in components (with joins)
// ============================================================================

/**
 * Packaging with basic supplier info for lists/dropdowns
 * Used in: packaging-list-drawer (table), dropdowns
 */
export interface PackagingWithSupplierCount {
  id: string;
  name: string;
  type: PackagingType;
  capacity: number;
  capacityUnit: CapacityUnit;
  buildMaterial: BuildMaterial;
  supplierCount: number;
  suppliers: Array<{
    id: string;
    name: string;
    rating: number;
  }>;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Supplier packaging with all joined data for main table
 * Used in: packaging-supplier-table (main packaging table)
 */
export interface SupplierPackagingTableRow {
  // IDs for actions
  id: string;
  packagingId: string;
  supplierId: string;

  // Packaging info
  packagingName: string;
  packagingType: PackagingType;
  capacity: number;
  capacityUnit: CapacityUnit;
  buildMaterial: BuildMaterial;

  // Supplier info
  supplierName: string;
  supplierRating: number;

  // Pricing
  bulkPrice: number;
  quantityForBulkPrice: number;
  unitPrice: number;
  tax: number;
  priceWithTax: number;

  // Terms
  moq: number;
  leadTime: number;
  currentStock: number;
  stockStatus: string;
  transportationCost?: number;

  // Meta
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Supplier packaging with inventory for price comparison
 * Used in: packaging-price-comparison (comparison cards)
 */
export interface SupplierPackagingForComparison {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierRating: number;
  unitPrice: number;
  priceWithTax: number;
  bulkPrice: number;
  capacityUnit: CapacityUnit;
  moq: number;
  leadTime: number;
  currentStock: number;
  stockStatus: string;
  packagingName: string;
  packagingType: PackagingType;
  buildMaterial: BuildMaterial;
}

/**
 * Packaging grouped with supplier alternatives for comparison
 * Used in: packaging-price-comparison (grouped by packaging)
 */
export interface PackagingPriceComparison {
  packagingId: string;
  packagingName: string;
  packagingType: PackagingType;
  buildMaterial: BuildMaterial;
  alternatives: SupplierPackagingForComparison[];
  cheapest: SupplierPackagingForComparison;
  mostExpensive: SupplierPackagingForComparison;
  savings: number;
  savingsPercentage: number;
  averagePrice: number;
}

/**
 * Minimal mapping of packaging to suppliers for analytics
 * Used in: packaging-analytics (supplier diversity calculations)
 */
export interface PackagingSupplierMapping {
  packagingName: string;
  supplierId: string;
  supplierName: string;
}

/**
 * Aggregated analytics data
 * Used in: packaging-analytics (dashboard)
 */
export interface PackagingAnalytics {
  totalPackaging: number;
  avgPrice: number;
  avgTax: number;
  highestPrice: number;
  stockAlerts: number;
  typeDistribution: Array<{
    type: PackagingType;
    count: number;
    percentage: number;
    avgPrice: number;
  }>;
  materialDistribution: Array<{
    material: BuildMaterial;
    count: number;
    percentage: number;
    avgPrice: number;
  }>;
  priceRanges: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

// ============================================================================
// FORM MODELS - For create/update operations
// ============================================================================

/**
 * Form data for creating/updating packaging
 * Used in: packaging-list-drawer (inline edit)
 */
export interface PackagingFormData {
  name: string;
  type: PackagingType;
  capacity: number;
  capacityUnit: CapacityUnit;
  buildMaterial: BuildMaterial;
}

/**
 * Form data for creating/updating supplier packaging
 * Used in: packaging-supplier-dialog (add/edit dialog)
 */
export interface SupplierPackagingFormData {
  supplierId: string;
  packagingId?: string; // undefined = create new packaging
  packagingName: string;
  packagingType: PackagingType;
  capacity: number;
  capacityUnit: CapacityUnit;
  buildMaterial: BuildMaterial;
  bulkPrice: number;
  quantityForBulkPrice: number;
  unitPrice: number;
  tax: number;
  moq: number;
  leadTime: number;
  transportationCost?: number;
  bulkDiscounts?: BulkDiscount[];
  notes?: string;
}

/**
 * Form validation errors
 */
export interface PackagingFormErrors {
  name?: string;
  type?: string;
  capacity?: string;
  capacityUnit?: string;
  buildMaterial?: string;
  supplierId?: string;
  packagingName?: string;
  packagingType?: string;
  bulkPrice?: string;
  quantityForBulkPrice?: string;
  unitPrice?: string;
  tax?: string;
  moq?: string;
  leadTime?: string;
}

// ============================================================================
// FILTER MODELS
// ============================================================================

export interface PackagingFilters {
  searchTerm?: string;
  type?: PackagingType;
  buildMaterial?: BuildMaterial;
  supplierId?: string;
  priceRange?: { min?: number; max?: number };
}

// ============================================================================
// INTERNAL HOOK DATA - Not exported, used only within hooks
// ============================================================================

/**
 * Base data structure for core data hook
 * Internal use only - components should not import this
 */
export interface PackagingBaseData {
  packagings: Packaging[];
  supplierPackagings: SupplierPackaging[];
  packagingMap: Map<string, Packaging>;
  supplierPackagingMap: Map<string, SupplierPackaging>;
  supplierPackagingsByPackaging: Map<string, SupplierPackaging[]>;
  supplierPackagingsBySupplier: Map<string, SupplierPackaging[]>;
  packagingsByType: Map<string, Packaging[]>;
  packagingsByMaterial: Map<string, Packaging[]>;
}

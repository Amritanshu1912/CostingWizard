// src/types/material-types.ts
import type { BaseEntity, BulkDiscount, CapacityUnit } from "./shared-types";

/** Category table entity */
export interface Category extends BaseEntity {
  name: string;
  description?: string;
  color: string;
}

/** Material table entity */
export interface Material extends BaseEntity {
  name: string;
  category: string; // References Category.name
  notes?: string;
}

/** SupplierMaterial table entity */
export interface SupplierMaterial extends BaseEntity {
  supplierId: string;
  materialId: string;
  unit: CapacityUnit;
  unitPrice: number;
  tax: number;
  moq: number;
  bulkPrice?: number;
  quantityForBulkPrice?: number;
  bulkDiscounts?: BulkDiscount[];
  leadTime: number;
  transportationCost?: number;
  notes?: string;
}

// ============================================================================
// VIEW MODELS - For displaying data in components (with joins)
// ============================================================================

/**
 * Material with basic category info and supplier details for lists/dropdowns
 * Used in: materials-list-drawer (table), dropdowns
 */
export interface MaterialWithSupplierCount {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
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
 * Supplier material with all joined data for main table
 * Used in: materials-supplier-table (main materials table)
 */
export interface SupplierMaterialTableRow {
  // IDs for actions
  id: string;
  materialId: string;
  supplierId: string;

  // Material info
  materialName: string;
  materialCategory: string;
  categoryColor: string;

  // Supplier info
  supplierName: string;
  supplierRating: number;

  // Pricing
  unitPrice: number;
  priceWithTax: number;
  bulkPrice?: number;
  quantityForBulkPrice?: number;
  tax: number;
  unit: CapacityUnit;

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
 * Supplier material with inventory for price comparison
 * Used in: materials-price-comparison (comparison cards)
 */
export interface SupplierMaterialForComparison {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierRating: number;
  unitPrice: number;
  priceWithTax: number;
  unit: CapacityUnit;
  moq: number;
  leadTime: number;
  currentStock: number;
}

/**
 * Material grouped with supplier alternatives for comparison
 * Used in: materials-price-comparison (grouped by material)
 */
export interface MaterialPriceComparison {
  materialId: string;
  materialName: string;
  materialCategory: string;
  categoryColor: string;
  alternatives: SupplierMaterialForComparison[];
  cheapest: SupplierMaterialForComparison;
  mostExpensive: SupplierMaterialForComparison;
  savings: number;
  savingsPercentage: number;
  averagePrice: number;
}

/**
 * Minimal mapping of materials to suppliers for analytics
 * Used in: materials-analytics (supplier diversity calculations)
 */
export interface MaterialSupplierMapping {
  materialName: string;
  supplierId: string;
}

/**
 * Aggregated analytics data
 * Used in: materials-analytics (dashboard)
 */
export interface MaterialsAnalytics {
  totalMaterials: number;
  avgPrice: number;
  avgTax: number;
  highestPrice: number;
  stockAlerts: number;
  categoryDistribution: Array<{
    category: string;
    categoryColor: string;
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
 * Form data for creating/updating materials
 * Used in: materials-list-drawer (inline edit)
 */
export interface MaterialFormData {
  name: string;
  category: string;
  notes?: string;
}

/**
 * Form data for creating/updating supplier materials
 * Used in: materials-supplier-dialog (add/edit dialog)
 */
export interface SupplierMaterialFormData {
  supplierId: string;
  materialId?: string; // undefined = create new material
  materialName: string;
  materialCategory: string;
  bulkPrice: number;
  quantityForBulkPrice: number;
  unit: CapacityUnit;
  tax: number;
  moq: number;
  leadTime: number;
  transportationCost?: number;
  bulkDiscounts?: BulkDiscount[];
  notes?: string;
}

/**
 * Form data for creating/updating categories
 * Used in: materials-category-manager (category dialog)
 */
export interface CategoryFormData {
  name: string;
  description?: string;
}

/**
 * Form validation errors
 */
export interface MaterialFormErrors {
  name?: string;
  category?: string;
  supplierId?: string;
  materialName?: string;
  materialCategory?: string;
  bulkPrice?: string;
  quantityForBulkPrice?: string;
  unit?: string;
  tax?: string;
  moq?: string;
  leadTime?: string;
}

// ============================================================================
// FILTER MODELS
// ============================================================================

export interface MaterialFilters {
  searchTerm?: string;
  category?: string;
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
export interface MaterialsBaseData {
  materials: Material[];
  supplierMaterials: SupplierMaterial[];
  categories: Category[];
  materialMap: Map<string, Material>;
  supplierMaterialMap: Map<string, SupplierMaterial>;
  categoryMap: Map<string, Category>;
  supplierMaterialsByMaterial: Map<string, SupplierMaterial[]>;
  supplierMaterialsBySupplier: Map<string, SupplierMaterial[]>;
  materialsByCategory: Map<string, Material[]>;
}

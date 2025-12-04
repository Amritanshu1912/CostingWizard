import type { BaseEntity, BulkDiscount } from "./shared-types";

export type LabelType = "sticker" | "label" | "tag" | "other";
export type PrintingType = "bw" | "color" | "foil" | "embossed";
export type LabelMaterialType = "paper" | "vinyl" | "plastic" | "other";
export type ShapeType = "rectangular" | "custom";

/** Label table entity */
export interface Label extends BaseEntity {
  name: string;
  type: LabelType;
  printingType: PrintingType;
  material: LabelMaterialType;
  shape: ShapeType;
  size?: string; // e.g., "50x30mm"
  notes?: string;
}

/** SupplierLabel table entity */
export interface SupplierLabel extends BaseEntity {
  supplierId: string;
  labelId?: string;
  unit: "pieces" | "sheets" | string;
  unitPrice: number;
  bulkPrice?: number;
  quantityForBulkPrice?: number;
  moq?: number;
  tax: number;
  bulkDiscounts?: BulkDiscount[];
  leadTime: number;
  transportationCost?: number;
  notes?: string;
}

// ============================================================================
// VIEW MODELS - For displaying data in components (with joins)
// ============================================================================

/**
 * Label with basic supplier info for lists/dropdowns
 * Used in: labels-list-drawer (table), dropdowns
 */
export interface LabelWithSupplierCount {
  id: string;
  name: string;
  type: LabelType;
  printingType: PrintingType;
  material: LabelMaterialType;
  shape: ShapeType;
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
 * Supplier label with all joined data for main table
 * Used in: labels-table (main labels table)
 */
export interface SupplierLabelTableRow {
  // IDs for actions
  id: string;
  labelId: string;
  supplierId: string;

  // Label info
  labelName: string;
  labelType: LabelType;
  printingType: PrintingType;
  material: LabelMaterialType;
  shape: ShapeType;

  // Supplier info
  supplierName: string;
  supplierRating: number;

  // Pricing
  unitPrice: number;
  priceWithTax: number;
  bulkPrice?: number;
  quantityForBulkPrice?: number;
  tax: number;
  unit: string;

  // Terms
  moq: number;
  leadTime: number;
  currentStock: number;
  stockStatus: string;
  transportationCost?: number;

  // Meta
  size?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Supplier label with inventory for price comparison
 * Used in: labels-price-comparison (comparison cards)
 */
export interface SupplierLabelForComparison {
  id: string;
  supplierId: string;
  supplierName: string;
  supplierRating: number;
  unitPrice: number;
  priceWithTax: number;
  unit: string;
  moq: number;
  leadTime: number;
  currentStock: number;
}

/**
 * Label grouped with supplier alternatives for comparison
 * Used in: labels-price-comparison (grouped by label)
 */
export interface LabelPriceComparison {
  labelId: string;
  labelName: string;
  labelType: LabelType;
  printingType: PrintingType;
  alternatives: SupplierLabelForComparison[];
  cheapest: SupplierLabelForComparison;
  mostExpensive: SupplierLabelForComparison;
  savings: number;
  savingsPercentage: number;
  averagePrice: number;
}

/**
 * Label with full supplier details
 * Used in: labels-drawer (management interface)
 */
export interface LabelWithSuppliers {
  id: string;
  name: string;
  type: LabelType;
  printingType: PrintingType;
  material: LabelMaterialType;
  shape: ShapeType;
  size?: string;
  notes?: string;
  supplierCount: number;
  suppliers: Array<{
    id: string;
    name: string;
    rating: number;
    isActive: boolean;
  }>;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Minimal mapping of labels to suppliers for analytics
 * Used in: labels-analytics (supplier diversity calculations)
 */
export interface LabelSupplierMapping {
  labelName: string;
  supplierId: string;
}

/**
 * Aggregated analytics data
 * Used in: labels-analytics (dashboard)
 */
export interface LabelsAnalytics {
  totalLabels: number;
  avgPrice: number;
  avgTax: number;
  highestPrice: number;
  stockAlerts: number;
  typeDistribution: Array<{
    type: LabelType;
    count: number;
    percentage: number;
    avgPrice: number;
  }>;
  printingTypeDistribution: Array<{
    printingType: PrintingType;
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
 * Form data for creating/updating labels
 * Used in: labels-drawer (inline edit)
 */
export interface LabelFormData {
  name: string;
  type: LabelType;
  printingType: PrintingType;
  material: LabelMaterialType;
  shape: ShapeType;
  size?: string;
  notes?: string;
}

/**
 * Form data for creating/updating supplier labels
 * Used in: supplier-labels-dialog (add/edit dialog)
 */
export interface SupplierLabelFormData {
  supplierId: string;
  labelId?: string; // undefined = create new label
  labelName: string;
  labelType: LabelType;
  printingType: PrintingType;
  material: LabelMaterialType;
  shape: ShapeType;
  size?: string;
  bulkPrice: number;
  quantityForBulkPrice: number;
  unit: string;
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
export interface LabelFormErrors {
  name?: string;
  type?: string;
  printingType?: string;
  material?: string;
  shape?: string;
  supplierId?: string;
  labelName?: string;
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

export interface LabelFilters {
  searchTerm?: string;
  type?: LabelType;
  printingType?: PrintingType;
  material?: LabelMaterialType;
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
export interface LabelsBaseData {
  labels: Label[];
  supplierLabels: SupplierLabel[];
  labelMap: Map<string, Label>;
  supplierLabelMap: Map<string, SupplierLabel>;
  supplierLabelsByLabel: Map<string, SupplierLabel[]>;
  supplierLabelsBySupplier: Map<string, SupplierLabel[]>;
  labelsByType: Map<string, Label[]>;
}

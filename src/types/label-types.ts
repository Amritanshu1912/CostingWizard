export type LabelType = "sticker" | "label" | "tag" | "other";
export type PrintingType = "bw" | "color" | "foil" | "embossed";
export type LabelMaterialType = "paper" | "vinyl" | "plastic" | "other";
export type ShapeType = "rectangular" | "custom";

// ============================================================================
// CORE DATABASE INTERFACES
// ============================================================================

export interface Label extends BaseEntity {
  name: string;
  type: LabelType;
  printingType: PrintingType;
  material: LabelMaterialType;
  shape: ShapeType;
  size?: string; // e.g., "50x30mm"
  labelFor?: string; // product name
  notes?: string;
}

export interface SupplierLabel extends BaseEntity {
  supplierId: string;
  labelId?: string;

  unit: "pieces" | "sheets" | string;
  unitPrice: number;
  bulkPrice?: number; // The actual quoted price
  quantityForBulkPrice?: number;
  moq?: number;
  tax: number; // TODO: Make required after migration
  bulkDiscounts?: BulkDiscount[];
  leadTime: number;
  transportationCost?: number;
  notes?: string;
}

// ============================================================================
// SHARED BASE INTERFACES
// ============================================================================

// Base for all label-related UI models
interface BaseLabelInfo {
  id: string;
  name: string;
  type: LabelType;
  printingType: PrintingType;
  material: LabelMaterialType;
  shape: ShapeType;
}

// Base for supplier label UI models
interface BaseSupplierLabelInfo {
  id: string;
  labelName: string;
  labelType: LabelType;
  printingType: PrintingType;
  material: LabelMaterialType;
  shape: ShapeType;
  supplierName: string;
  supplierRating: number;
  unitPrice: number;
  priceWithTax: number;
  unit: string;
}

// ============================================================================
// UI MODELS
// ============================================================================

export interface LabelListItem extends BaseLabelInfo {
  supplierCount: number;
  updatedAt?: string;
}

export interface LabelDetails
  extends BaseLabelInfo,
    Pick<BaseEntity, "createdAt" | "updatedAt"> {
  size?: string;
  labelFor?: string;
  notes?: string;
  suppliers: Array<{
    id: string;
    name: string;
    rating: number;
  }>;
  totalStock: number;
  stockStatus: "in-stock" | "low-stock" | "out-of-stock";
}

export interface LabelWithSuppliers
  extends BaseLabelInfo,
    Pick<BaseEntity, "createdAt" | "updatedAt"> {
  size?: string;
  labelFor?: string;
  notes?: string;
  supplierCount: number;
  suppliers: Array<{
    id: string;
    name: string;
    rating: number;
    isActive: boolean;
  }>;
}

export interface SupplierLabelRow
  extends BaseSupplierLabelInfo,
    Pick<BaseEntity, "createdAt" | "updatedAt"> {
  labelId: string;
  supplierId: string;
  size?: string;
  labelFor?: string;
  bulkPrice?: number;
  quantityForBulkPrice?: number;
  tax: number;
  moq: number;
  leadTime: number;
  transportationCost?: number;
  notes?: string;
  currentStock: number;
  stockStatus: "in-stock" | "low-stock" | "out-of-stock";
}

export interface SupplierLabelCard extends BaseSupplierLabelInfo {
  size?: string;
  labelFor?: string;
  isBestPrice?: boolean;
  savings?: number;
  currentStock: number;
  stockStatus: "in-stock" | "low-stock" | "out-of-stock";
}

export interface SupplierLabelAnalytics
  extends Omit<BaseSupplierLabelInfo, "leadTime"> {
  currentStock: number;
  stockValue: number;
  stockStatus: "in-stock" | "low-stock" | "out-of-stock" | "overstock";
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface LabelFormData extends Omit<Label, keyof BaseEntity> {}

export interface SupplierLabelFormData {
  supplierId: string;
  labelId?: string;
  labelName: string;
  labelType: LabelType;
  printingType: PrintingType;
  material: LabelMaterialType;
  shape: ShapeType;
  size?: string;
  labelFor?: string;
  bulkPrice: number;
  quantityForBulkPrice: number;
  unit: string;
  tax: number;
  moq: number;
  leadTime: number;
  transportationCost?: number;
  bulkDiscounts?: BulkDiscount[];
  currentStock: number;
  stockStatus: "in-stock" | "low-stock" | "out-of-stock";
  notes?: string;
}

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
// FILTER/ANALYTICS TYPES
// ============================================================================

export interface LabelFilters {
  searchTerm?: string;
  type?: LabelType;
  printingType?: PrintingType;
  material?: LabelMaterialType;
  supplierId?: string;
  priceRange?: { min?: number; max?: number };
  stockStatus?: "in-stock" | "low-stock" | "out-of-stock";
}

export interface LabelsAnalytics {
  totalLabels: number;
  avgPrice: number;
  avgTax: number;
  highestPrice: number;
  stockAlerts: number;
  costEfficiency: number;
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
  stockStatusDistribution: Array<{
    status: "in-stock" | "low-stock" | "out-of-stock";
    count: number;
    percentage: number;
  }>;
}

export interface LabelPriceComparison {
  labelId: string;
  labelName: string;
  labelType: LabelType;
  printingType: PrintingType;
  alternatives: SupplierLabelCard[];
  cheapest: SupplierLabelCard;
  mostExpensive: SupplierLabelCard;
  savings: number;
  savingsPercentage: number;
  averagePrice: number;
}

export interface SupplierLabelPerformance {
  supplierId: string;
  supplierName: string;
  supplierRating: number;
  labelCount: number;
  avgPrice: number;
  avgLeadTime: number;
  inStockCount: number;
  limitedCount: number;
  outOfStockCount: number;
  availabilityScore: number;
}

// ============================================================================
// IMPORTS (from shared-types)
// ============================================================================

import type { BaseEntity, BulkDiscount } from "./shared-types";

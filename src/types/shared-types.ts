// src/types/shared-types.ts
import { ItemWithoutInventory } from "./inventory-types";

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

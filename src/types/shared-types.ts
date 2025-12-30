// src/types/shared-types.ts
import { RequirementItemType } from "./batch-types";

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

/**
 * Item without inventory tracking
 * Used for warning alerts
 */
export interface ItemWithoutInventory {
  itemType: RequirementItemType;
  itemId: string;
  itemName: string;
  supplierName: string;
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

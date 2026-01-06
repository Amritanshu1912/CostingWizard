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

// src/types/inventory-types.ts
import { BaseEntity } from "./shared-types";

// ============================================================================
// CORE ENTITIES
// ============================================================================

/**
 * Core inventory item entity stored in the database
 */
export interface InventoryItem extends BaseEntity {
  itemType: "supplierMaterial" | "supplierPackaging" | "supplierLabel";
  itemId: string; // References SupplierMaterial.id, SupplierPackaging.id, or SupplierLabel.id
  itemName: string;
  currentStock: number;
  unit: string;
  minStockLevel: number;
  maxStockLevel?: number;
  status: "in-stock" | "low-stock" | "out-of-stock" | "overstock";
  notes?: string;
}

/**
 * Inventory transaction record for audit trail
 */
export interface InventoryTransaction extends BaseEntity {
  inventoryItemId: string;
  type: "in" | "out" | "adjustment";
  quantity: number; // Positive for in, negative for out
  unit: string;
  reason: string; // "Purchase Order", "Production Batch", "Manual Adjustment"
  reference?: string; // Batch ID, PO ID, etc.
  stockBefore: number;
  stockAfter: number;
  notes?: string;
}

/**
 * Alert generated for inventory issues
 */
export interface InventoryAlert extends BaseEntity {
  inventoryItemId: string;
  alertType: "low-stock" | "out-of-stock" | "overstock" | "expiring-soon";
  severity: "info" | "warning" | "critical";
  message: string;
  isRead: number; // 0 or 1 (boolean as number for Dexie)
  isResolved: number; // 0 or 1
}

// ============================================================================
// ENRICHED TYPES (with computed/joined data)
// ============================================================================

/**
 * Full inventory item with all related details and computed values.
 * Used across most components - only adds 7 fields to base InventoryItem.
 * Suitable for lists, details, bulk operations.
 */
export interface InventoryItemWithDetails extends InventoryItem {
  supplierName: string;
  supplierId: string;
  unitPrice: number;
  tax: number;
  stockValue: number; // currentStock × unitPrice × (1 + tax/100)
  stockPercentage: number; // currentStock / minStockLevel × 100
  isTracked: boolean; // Whether this item exists in inventoryItems table
}

// ============================================================================
// AGGREGATE TYPES
// ============================================================================

/**
 * Aggregate statistics for inventory overview
 */
export interface InventoryStats {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  overstockCount: number;
  totalStockValue: number;
  byType: {
    materials: { count: number; value: number };
    packaging: { count: number; value: number };
    labels: { count: number; value: number };
  };
  bySupplier: SupplierStockSummary[];
  criticalAlerts: number;
  warningAlerts: number;
}

/**
 * Stock summary grouped by supplier
 */
export interface SupplierStockSummary {
  supplierId: string;
  supplierName: string;
  itemCount: number;
  totalValue: number;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Filter state for inventory lists
 */
export interface InventoryFilters {
  searchQuery: string;
  itemTypes: Set<InventoryItem["itemType"]>;
  statuses: Set<InventoryItem["status"]>;
}

// ============================================================================
// INTERNAL HELPER TYPES (for hooks only)
// ============================================================================

/**
 * Reference data bundle for item enrichment (internal use in hooks)
 */
export interface ReferenceDataBundle {
  supplierMaterials: any[];
  supplierPackaging: any[];
  supplierLabels: any[];
  materials: any[];
  packaging: any[];
  labels: any[];
  suppliers: any[];
}

// ============================================================================
// UTILITY
// ============================================================================

/**
 * Convert boolean to number for Dexie storage
 */
export const boolToNum = (val: boolean): number => (val ? 1 : 0);

/**
 * Convert number to boolean from Dexie storage
 */
export const numToBool = (val: number): boolean => val === 1;

// src/hooks/inventory/use-inventory-data.ts
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useMemo, useState } from "react";
import type {
  InventoryItem,
  InventoryItemWithDetails,
  ReferenceDataBundle,
} from "@/types/inventory-types";
import {
  useAllSupplierMaterials,
  useAllSupplierPackaging,
  useAllSupplierLabels,
  useAllMaterials,
  useAllPackaging,
  useAllLabels,
  useAllSuppliers,
} from "@/hooks/use-database-data";

// ============================================================================
// BASE DATA HOOKS - Direct database queries
// ============================================================================

/**
 * Get single inventory item by ID
 * @param id - Item ID
 * @returns Inventory item or undefined
 */
export function useInventoryItem(id: string | undefined) {
  return useLiveQuery(() => {
    if (!id) return undefined;
    return db.inventoryItems.get(id);
  }, [id]);
}

/**
 * Get inventory transactions, optionally filtered by item
 * @param itemId - Optional item ID to filter by
 * @returns Array of transactions sorted by date (newest first)
 */
export function useInventoryTransactions(itemId?: string) {
  return useLiveQuery(() => {
    if (itemId) {
      return db.inventoryTransactions
        .where("inventoryItemId")
        .equals(itemId)
        .reverse()
        .sortBy("createdAt");
    }
    return db.inventoryTransactions.orderBy("createdAt").reverse().toArray();
  }, [itemId]);
}

/**
 * Hook for managing inventory list filters
 * Provides search, type filter, and status filter with apply logic
 * @returns Filter state and control functions
 */
export function useInventoryFilters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<Set<InventoryItem["itemType"]>>(
    new Set(["supplierMaterial", "supplierPackaging", "supplierLabel"])
  );
  const [filterStatus, setFilterStatus] = useState<
    Set<InventoryItem["status"]>
  >(new Set());

  /**
   * Toggle item type filter
   * @param type - Item type to toggle
   */
  const toggleTypeFilter = useCallback((type: InventoryItem["itemType"]) => {
    setFilterType((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  }, []);

  /**
   * Toggle status filter
   * @param status - Status to toggle
   */
  const toggleStatusFilter = useCallback((status: InventoryItem["status"]) => {
    setFilterStatus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  }, []);

  /**
   * Reset all filters to defaults
   */
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setFilterType(
      new Set(["supplierMaterial", "supplierPackaging", "supplierLabel"])
    );
    setFilterStatus(new Set());
  }, []);

  /**
   * Apply filters to item array
   * @param items - Array of items to filter
   * @returns Filtered array
   */
  const filterItems = useCallback(
    (items: InventoryItemWithDetails[]) => {
      return items.filter((item) => {
        // Search filter
        const matchesSearch =
          searchQuery === "" ||
          item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

        // Type filter
        const matchesType =
          filterType.size === 0 || filterType.has(item.itemType);

        // Status filter
        const matchesStatus =
          filterStatus.size === 0 || filterStatus.has(item.status);

        return matchesSearch && matchesType && matchesStatus;
      });
    },
    [searchQuery, filterType, filterStatus]
  );

  return {
    searchQuery,
    setSearchQuery,
    filterType,
    filterStatus,
    toggleTypeFilter,
    toggleStatusFilter,
    resetFilters,
    filterItems,
  };
}

// ============================================================================
// REFERENCE DATA HOOKS - Supplier/Material/Packaging/Label data
// ============================================================================

/**
 * Get all reference data in a single bundle (optimized for enrichment)
 * Only recomputes when any reference table changes
 * @returns Bundle of all reference data or undefined while loading
 */
export function useReferenceData(): ReferenceDataBundle | undefined {
  const suppliers = useAllSuppliers();
  const materials = useAllMaterials();
  const supplierMaterials = useAllSupplierMaterials();
  const packaging = useAllPackaging();
  const supplierPackaging = useAllSupplierPackaging();
  const labels = useAllLabels();
  const supplierLabels = useAllSupplierLabels();

  return useMemo(() => {
    // Only return bundle when all data is loaded
    if (
      !supplierMaterials ||
      !supplierPackaging ||
      !supplierLabels ||
      !materials ||
      !packaging ||
      !labels ||
      !suppliers
    ) {
      return undefined;
    }

    return {
      supplierMaterials,
      supplierPackaging,
      supplierLabels,
      materials,
      packaging,
      labels,
      suppliers,
    };
  }, [
    supplierMaterials,
    supplierPackaging,
    supplierLabels,
    materials,
    packaging,
    labels,
    suppliers,
  ]);
}

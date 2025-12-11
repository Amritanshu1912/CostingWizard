// src/hooks/inventory/use-inventory-computed.ts
import { format } from "date-fns";
import { useMemo } from "react";
import type {
  InventoryItemWithDetails,
  InventoryStats,
  InventoryTransaction,
} from "@/types/inventory-types";
import { createUntrackedItem } from "@/utils/inventory-utils";
import {
  useAllInventoryAlerts,
  useAllInventoryItems,
} from "@/hooks/use-database-data";
import {
  useInventoryTransactions,
  useReferenceData,
} from "./use-inventory-data";

/**
 * Get all inventory items enriched with supplier details and computed values
 * This is the primary hook for displaying inventory data
 * @returns Array of enriched items or undefined while loading
 */
export function useAllInventoryItemsWithDetails():
  | InventoryItemWithDetails[]
  | undefined {
  const items = useAllInventoryItems();
  const refData = useReferenceData();

  return useMemo(() => {
    if (!items || !refData) return undefined;

    const {
      supplierMaterials,
      supplierPackaging,
      supplierLabels,
      materials,
      packaging,
      labels,
      suppliers,
    } = refData;

    return items.map((item) => {
      let itemName = "Unknown";
      let supplierName = "Unknown";
      let supplierId = "";
      let unitPrice = 0;
      let tax = 0;
      let unit = "kg";

      if (item.itemType === "supplierMaterial") {
        const sm = supplierMaterials.find((s: any) => s.id === item.itemId);
        if (sm) {
          const material = materials.find((m: any) => m.id === sm.materialId);
          const supplier = suppliers.find((s: any) => s.id === sm.supplierId);

          itemName = material?.name || "Unknown Material";
          supplierName = supplier?.name || "Unknown Supplier";
          supplierId = sm.supplierId;
          unitPrice = sm.unitPrice;
          tax = sm.tax || 0;
          unit = sm.capacityUnit || "kg";
        }
      } else if (item.itemType === "supplierPackaging") {
        const sp = supplierPackaging.find((s: any) => s.id === item.itemId);
        if (sp) {
          const pkg = packaging.find((p: any) => p.id === sp.packagingId);
          const supplier = suppliers.find((s: any) => s.id === sp.supplierId);

          itemName = pkg?.name || "Unknown Packaging";
          supplierName = supplier?.name || "Unknown Supplier";
          supplierId = sp.supplierId;
          unitPrice = sp.unitPrice;
          tax = sp.tax || 0;
          unit = "pcs";
        }
      } else if (item.itemType === "supplierLabel") {
        const sl = supplierLabels.find((s: any) => s.id === item.itemId);
        if (sl) {
          const label = labels.find((l: any) => l.id === sl.labelId);
          const supplier = suppliers.find((s: any) => s.id === sl.supplierId);

          itemName = label?.name || "Unknown Label";
          supplierName = supplier?.name || "Unknown Supplier";
          supplierId = sl.supplierId;
          unitPrice = sl.unitPrice;
          tax = sl.tax || 0;
          unit = sl.unit || "pcs";
        }
      }

      const stockValue = item.currentStock * unitPrice * (1 + tax / 100);

      const stockPercentage =
        item.minStockLevel === 0
          ? 0
          : (item.currentStock / item.minStockLevel) * 100;

      return {
        ...item,
        itemName,
        supplierName,
        supplierId,
        unitPrice,
        tax,
        unit,
        stockValue,
        stockPercentage,
        isTracked: true,
      };
    });
  }, [items, refData]);
}

/**
 * Get all items (tracked + untracked) with inventory status
 * Combines existing inventory items with supplier items not yet tracked
 * Used in bulk operations and stock list to show all available items
 * @returns Array of all items with status or undefined while loading
 */
export function useAllItemsWithInventoryStatus():
  | InventoryItemWithDetails[]
  | undefined {
  const trackedItems = useAllInventoryItemsWithDetails();
  const refData = useReferenceData();

  return useMemo(() => {
    if (!trackedItems || !refData) return undefined;

    const {
      supplierMaterials,
      supplierPackaging,
      supplierLabels,
      materials,
      packaging,
      labels,
      suppliers,
    } = refData;

    const combinedItems: InventoryItemWithDetails[] = [];

    // Process Materials
    supplierMaterials.forEach((sm: any) => {
      const existingInventory = trackedItems.find(
        (inv) => inv.itemType === "supplierMaterial" && inv.itemId === sm.id
      );

      if (existingInventory) {
        combinedItems.push(existingInventory);
      } else {
        const material = materials.find((m: any) => m.id === sm.materialId);
        const supplier = suppliers.find((s: any) => s.id === sm.supplierId);
        combinedItems.push(
          createUntrackedItem(
            `sm-${sm.id}`,
            "supplierMaterial",
            sm.id,
            material?.name || "Unknown",
            supplier?.name || "Unknown",
            sm.supplierId,
            sm.capacityUnit,
            sm.unitPrice,
            sm.tax || 0
          )
        );
      }
    });

    // Process Packaging
    supplierPackaging.forEach((sp: any) => {
      const existingInventory = trackedItems.find(
        (inv) => inv.itemType === "supplierPackaging" && inv.itemId === sp.id
      );

      if (existingInventory) {
        combinedItems.push(existingInventory);
      } else {
        const pkg = packaging.find((p: any) => p.id === sp.packagingId);
        const supplier = suppliers.find((s: any) => s.id === sp.supplierId);
        combinedItems.push(
          createUntrackedItem(
            `sp-${sp.id}`,
            "supplierPackaging",
            sp.id,
            pkg?.name || "Unknown",
            supplier?.name || "Unknown",
            sp.supplierId,
            "pcs",
            sp.unitPrice,
            sp.tax || 0
          )
        );
      }
    });

    // Process Labels
    supplierLabels.forEach((sl: any) => {
      const existingInventory = trackedItems.find(
        (inv) => inv.itemType === "supplierLabel" && inv.itemId === sl.id
      );

      if (existingInventory) {
        combinedItems.push(existingInventory);
      } else {
        const label = labels.find((l: any) => l.id === sl.labelId);
        const supplier = suppliers.find((s: any) => s.id === sl.supplierId);
        combinedItems.push(
          createUntrackedItem(
            `sl-${sl.id}`,
            "supplierLabel",
            sl.id,
            label?.name || "Unknown",
            supplier?.name || "Unknown",
            sl.supplierId,
            sl.unit || "pcs",
            sl.unitPrice,
            sl.tax || 0
          )
        );
      }
    });

    return combinedItems;
  }, [trackedItems, refData]);
}

// ============================================================================
// AGGREGATE HOOKS - Statistics and summaries
// ============================================================================

/**
 * Get comprehensive inventory statistics
 * Used for dashboard overview and analytics
 * @returns Statistics object or undefined while loading
 */
export function useInventoryStats(): InventoryStats | undefined {
  const itemsWithDetails = useAllInventoryItemsWithDetails();
  const alerts = useAllInventoryAlerts();

  return useMemo(() => {
    if (!itemsWithDetails || !alerts) return undefined;

    const totalItems = itemsWithDetails.length;
    const lowStockCount = itemsWithDetails.filter(
      (i) => i.status === "low-stock"
    ).length;
    const outOfStockCount = itemsWithDetails.filter(
      (i) => i.status === "out-of-stock"
    ).length;
    const overstockCount = itemsWithDetails.filter(
      (i) => i.status === "overstock"
    ).length;
    const totalStockValue = itemsWithDetails.reduce(
      (sum, item) => sum + item.stockValue,
      0
    );

    // Calculate by type using reduce for better performance
    const typeStats = itemsWithDetails.reduce(
      (acc, item) => {
        const typeKey =
          item.itemType === "supplierMaterial"
            ? "materials"
            : item.itemType === "supplierPackaging"
              ? "packaging"
              : "labels";

        acc[typeKey].count++;
        acc[typeKey].value += item.stockValue;
        return acc;
      },
      {
        materials: { count: 0, value: 0 },
        packaging: { count: 0, value: 0 },
        labels: { count: 0, value: 0 },
      }
    );

    // Calculate by supplier using reduce
    const bySupplier = itemsWithDetails.reduce(
      (acc, item) => {
        const existing = acc.find((s) => s.supplierId === item.supplierId);
        if (existing) {
          existing.itemCount++;
          existing.totalValue += item.stockValue;
        } else {
          acc.push({
            supplierId: item.supplierId,
            supplierName: item.supplierName,
            itemCount: 1,
            totalValue: item.stockValue,
          });
        }
        return acc;
      },
      [] as {
        supplierId: string;
        supplierName: string;
        itemCount: number;
        totalValue: number;
      }[]
    );

    const criticalAlerts = alerts.filter(
      (a) => a.severity === "critical"
    ).length;
    const warningAlerts = alerts.filter((a) => a.severity === "warning").length;

    return {
      totalItems,
      lowStockCount,
      outOfStockCount,
      overstockCount,
      totalStockValue,
      byType: typeStats,
      bySupplier,
      criticalAlerts,
      warningAlerts,
    };
  }, [itemsWithDetails, alerts]);
}

/**
 * Get transactions grouped by date
 * @param itemId - Optional item ID to filter transactions
 * @returns Array of [date, transactions[]] tuples sorted by date (newest first)
 */
export function useGroupedTransactions(
  itemId?: string
): [string, InventoryTransaction[]][] | undefined {
  const transactions = useInventoryTransactions(itemId);

  return useMemo(() => {
    if (!transactions) return undefined;

    const groups: Record<string, InventoryTransaction[]> = {};

    transactions.forEach((txn) => {
      const date = format(new Date(txn.createdAt), "yyyy-MM-dd");
      if (!groups[date]) groups[date] = [];
      groups[date].push(txn);
    });

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [transactions]);
}

// ============================================================================
// FILTERED HOOKS - Convenience hooks for common filters
// ============================================================================

/**
 * Get inventory grouped by supplier
 * @returns Array of supplier groups with items or undefined while loading
 */
export function useInventoryBySupplier() {
  const itemsWithDetails = useAllInventoryItemsWithDetails();
  return useMemo(() => {
    if (!itemsWithDetails) return undefined;

    const bySupplier = itemsWithDetails.reduce(
      (acc, item) => {
        if (!acc[item.supplierId]) {
          acc[item.supplierId] = {
            supplierId: item.supplierId,
            supplierName: item.supplierName,
            items: [],
            totalValue: 0,
          };
        }
        acc[item.supplierId].items.push(item);
        acc[item.supplierId].totalValue += item.stockValue;
        return acc;
      },
      {} as Record<
        string,
        {
          supplierId: string;
          supplierName: string;
          items: InventoryItemWithDetails[];
          totalValue: number;
        }
      >
    );

    return Object.values(bySupplier);
  }, [itemsWithDetails]);
}

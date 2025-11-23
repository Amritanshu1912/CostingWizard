// src/hooks/use-inventory.ts
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type {
  InventoryItem,
  InventoryTransaction,
  InventoryAlert,
  InventoryItemWithDetails,
  InventoryStats,
} from "@/lib/types";
import { useMemo, useState, useCallback } from "react";
import { format } from "date-fns";
import { createOrUpdateAlertForItemById } from "@/lib/alerts";

// ============================================================================
// BASE DATA HOOKS - Optimized with proper dependencies
// ============================================================================

export function useInventoryItems() {
  return useLiveQuery(() => db.inventoryItems.toArray());
}

export function useInventoryItem(id: string | undefined) {
  return useLiveQuery(() => {
    if (!id) return undefined;
    return db.inventoryItems.get(id);
  }, [id]);
}

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

export function useInventoryAlerts() {
  return useLiveQuery(() =>
    db.inventoryAlerts.where("isResolved").equals(0).toArray()
  );
}

// ============================================================================
// REFERENCE DATA HOOKS - Single queries, properly cached
// ============================================================================

export function useSupplierMaterials() {
  return useLiveQuery(() => db.supplierMaterials.toArray());
}

export function useSupplierPackaging() {
  return useLiveQuery(() => db.supplierPackaging.toArray());
}

export function useSupplierLabels() {
  return useLiveQuery(() => db.supplierLabels.toArray());
}

export function useMaterials() {
  return useLiveQuery(() => db.materials.toArray());
}

export function usePackaging() {
  return useLiveQuery(() => db.packaging.toArray());
}

export function useLabels() {
  return useLiveQuery(() => db.labels.toArray());
}

export function useSuppliers() {
  return useLiveQuery(() => db.suppliers.toArray());
}

// Combined reference data hook for efficiency
export function useReferenceData() {
  const supplierMaterials = useSupplierMaterials();
  const supplierPackaging = useSupplierPackaging();
  const supplierLabels = useSupplierLabels();
  const materials = useMaterials();
  const packaging = usePackaging();
  const labels = useLabels();
  const suppliers = useSuppliers();

  return useMemo(() => {
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

// ============================================================================
// ENRICHED DATA HOOKS - Optimized with better memoization
// ============================================================================

export function useInventoryItemsWithDetails():
  | InventoryItemWithDetails[]
  | undefined {
  const items = useInventoryItems();
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

      if (item.itemType === "supplierMaterial") {
        const sm = supplierMaterials.find((s) => s.id === item.itemId);
        if (sm) {
          const material = materials.find((m) => m.id === sm.materialId);
          const supplier = suppliers.find((s) => s.id === sm.supplierId);
          itemName = material?.name || "Unknown Material";
          supplierName = supplier?.name || "Unknown Supplier";
          supplierId = sm.supplierId;
          unitPrice = sm.unitPrice;
          tax = sm.tax || 0;
        }
      } else if (item.itemType === "supplierPackaging") {
        const sp = supplierPackaging.find((s) => s.id === item.itemId);
        if (sp) {
          const pkg = packaging.find((p) => p.id === sp.packagingId);
          const supplier = suppliers.find((s) => s.id === sp.supplierId);
          itemName = pkg?.name || "Unknown Packaging";
          supplierName = supplier?.name || "Unknown Supplier";
          supplierId = sp.supplierId;
          unitPrice = sp.unitPrice;
          tax = sp.tax || 0;
        }
      } else if (item.itemType === "supplierLabel") {
        const sl = supplierLabels.find((s) => s.id === item.itemId);
        if (sl) {
          const label = labels.find((l) => l.id === sl.labelId);
          const supplier = suppliers.find((s) => s.id === sl.supplierId);
          itemName = label?.name || "Unknown Label";
          supplierName = supplier?.name || "Unknown Supplier";
          supplierId = sl.supplierId;
          unitPrice = sl.unitPrice;
          tax = sl.tax || 0;
        }
      }

      const stockValue = item.currentStock * unitPrice * (1 + tax / 100);
      const stockPercentage =
        item.minStockLevel > 0
          ? (item.currentStock / item.minStockLevel) * 100
          : 0;

      return {
        ...item,
        itemName,
        supplierName,
        supplierId,
        unitPrice,
        tax,
        stockValue,
        stockPercentage,
      };
    });
  }, [items, refData]);
}

// ============================================================================
// NEW: ALL ITEMS WITH INVENTORY STATUS (moved from stock-list)
// ============================================================================

export function useAllItemsWithInventoryStatus() {
  const items = useInventoryItemsWithDetails();
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

    const combinedItems: InventoryItemWithDetails[] = [];

    // Helper function to create untracked item
    const createUntrackedItem = (
      id: string,
      itemType: InventoryItem["itemType"],
      itemId: string,
      itemName: string,
      supplierName: string,
      supplierId: string,
      unit: string,
      unitPrice: number,
      tax: number
    ): InventoryItemWithDetails => ({
      id: `untracked-${id}`,
      itemType,
      itemId,
      itemName,
      supplierName,
      supplierId,
      currentStock: 0,
      unit,
      minStockLevel: 0,
      status: "out-of-stock",
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      unitPrice,
      tax,
      stockValue: 0,
      stockPercentage: 0,
    });

    // Process Materials
    supplierMaterials.forEach((sm) => {
      const existingInventory = items.find(
        (inv) => inv.itemType === "supplierMaterial" && inv.itemId === sm.id
      );

      if (existingInventory) {
        combinedItems.push(existingInventory);
      } else {
        const material = materials.find((m) => m.id === sm.materialId);
        const supplier = suppliers.find((s) => s.id === sm.supplierId);
        combinedItems.push(
          createUntrackedItem(
            `sm-${sm.id}`,
            "supplierMaterial",
            sm.id,
            material?.name || "Unknown",
            supplier?.name || "Unknown",
            sm.supplierId,
            sm.unit,
            sm.unitPrice,
            sm.tax || 0
          )
        );
      }
    });

    // Process Packaging
    supplierPackaging.forEach((sp) => {
      const existingInventory = items.find(
        (inv) => inv.itemType === "supplierPackaging" && inv.itemId === sp.id
      );

      if (existingInventory) {
        combinedItems.push(existingInventory);
      } else {
        const pkg = packaging.find((p) => p.id === sp.packagingId);
        const supplier = suppliers.find((s) => s.id === sp.supplierId);
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
    supplierLabels.forEach((sl) => {
      const existingInventory = items.find(
        (inv) => inv.itemType === "supplierLabel" && inv.itemId === sl.id
      );

      if (existingInventory) {
        combinedItems.push(existingInventory);
      } else {
        const label = labels.find((l) => l.id === sl.labelId);
        const supplier = suppliers.find((s) => s.id === sl.supplierId);
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
  }, [items, refData]);
}

// ============================================================================
// FILTERED HOOKS - Optimized
// ============================================================================

export function useLowStockItems() {
  const items = useInventoryItems();
  return useMemo(() => {
    if (!items) return undefined;
    return items.filter((item) => item.status === "low-stock");
  }, [items]);
}

export function useOutOfStockItems() {
  const items = useInventoryItems();
  return useMemo(() => {
    if (!items) return undefined;
    return items.filter((item) => item.status === "out-of-stock");
  }, [items]);
}

export function useInventoryBySupplier() {
  const itemsWithDetails = useInventoryItemsWithDetails();
  return useMemo(() => {
    if (!itemsWithDetails) return undefined;

    const bySupplier = itemsWithDetails.reduce((acc, item) => {
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
    }, {} as Record<string, { supplierId: string; supplierName: string; items: InventoryItemWithDetails[]; totalValue: number }>);

    return Object.values(bySupplier);
  }, [itemsWithDetails]);
}

// ============================================================================
// STATS HOOK - Optimized calculations
// ============================================================================

export function useInventoryStats(): InventoryStats | undefined {
  const itemsWithDetails = useInventoryItemsWithDetails();
  const alerts = useInventoryAlerts();

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
    const bySupplier = itemsWithDetails.reduce((acc, item) => {
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
    }, [] as { supplierId: string; supplierName: string; itemCount: number; totalValue: number }[]);

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

// ============================================================================
// NEW: GROUPED TRANSACTIONS HOOK
// ============================================================================

export function useGroupedTransactions(itemId?: string) {
  const transactions = useInventoryTransactions(itemId);

  return useMemo(() => {
    if (!transactions) return undefined;

    const groups: Record<string, typeof transactions> = {};

    transactions.forEach((txn) => {
      const date = format(new Date(txn.createdAt), "yyyy-MM-dd");
      if (!groups[date]) groups[date] = [];
      groups[date].push(txn);
    });

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [transactions]);
}

// ============================================================================
// NEW: INVENTORY FILTERS HOOK (state management)
// ============================================================================

export function useInventoryFilters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<Set<string>>(
    new Set(["supplierMaterial", "supplierPackaging", "supplierLabel"])
  );
  const [filterStatus, setFilterStatus] = useState<Set<string>>(new Set());

  const toggleTypeFilter = useCallback((type: string) => {
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

  const toggleStatusFilter = useCallback((status: string) => {
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

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setFilterType(
      new Set(["supplierMaterial", "supplierPackaging", "supplierLabel"])
    );
    setFilterStatus(new Set());
  }, []);

  const filterItems = useCallback(
    (items: InventoryItemWithDetails[]) => {
      return items.filter((item) => {
        const matchesSearch =
          item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType =
          filterType.size === 0 || filterType.has(item.itemType);
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
// ACTION HOOKS - Optimized with better error handling
// ============================================================================

export function useAdjustStock() {
  return useCallback(
    async (
      itemId: string,
      quantity: number,
      reason: string,
      reference?: string,
      notes?: string
    ) => {
      const item = await db.inventoryItems.get(itemId);
      if (!item) throw new Error("Inventory item not found");

      const stockBefore = item.currentStock;
      const stockAfter = stockBefore + quantity;

      // Update stock
      await db.inventoryItems.update(itemId, {
        currentStock: stockAfter,
        lastUpdated: new Date().toISOString(),
        status: calculateStatus(
          stockAfter,
          item.minStockLevel,
          item.maxStockLevel
        ),
      });

      // Create transaction
      await db.inventoryTransactions.add({
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        inventoryItemId: itemId,
        type: quantity > 0 ? "in" : "out",
        quantity: Math.abs(quantity),
        reason,
        reference,
        unit: item.unit,
        stockBefore,
        stockAfter,
        notes,
        createdAt: new Date().toISOString(),
      });

      // Check for alerts (centralized implementation)
      await createOrUpdateAlertForItemById(db, itemId);
    },
    []
  );
}

export function useCreateInventoryItem() {
  return useCallback(
    async (
      itemType: "supplierMaterial" | "supplierPackaging" | "supplierLabel",
      itemId: string,
      initialStock: number = 0,
      minStockLevel: number = 100,
      maxStockLevel?: number,
      unit: string = "kg"
    ) => {
      const id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();

      const item: InventoryItem = {
        id,
        itemType,
        itemId,
        itemName: "",
        currentStock: initialStock,
        unit,
        minStockLevel,
        maxStockLevel,
        lastUpdated: now,
        status: calculateStatus(initialStock, minStockLevel, maxStockLevel),
        createdAt: now,
      };

      await db.inventoryItems.add(item);

      // Create initial transaction if stock > 0
      if (initialStock > 0) {
        await db.inventoryTransactions.add({
          id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          inventoryItemId: id,
          type: "in",
          quantity: initialStock,
          reason: "Initial Stock",
          unit: unit,
          stockBefore: 0,
          stockAfter: initialStock,
          createdAt: now,
        });
      }

      return id;
    },
    []
  );
}

export function useResolveAlert() {
  return useCallback(async (alertId: string) => {
    await db.inventoryAlerts.update(alertId, {
      isResolved: 1, // Changed from true to 1
      updatedAt: new Date().toISOString(),
    });
  }, []);
}

export function useMarkAlertAsRead() {
  return useCallback(async (alertId: string) => {
    await db.inventoryAlerts.update(alertId, {
      isRead: 1, // Changed from true to 1
      updatedAt: new Date().toISOString(),
    });
  }, []);
}

// ============================================================================
// HELPER FUNCTIONS - Pure, optimized
// ============================================================================

function calculateStatus(
  currentStock: number,
  minStockLevel: number,
  maxStockLevel?: number
): "in-stock" | "low-stock" | "out-of-stock" | "overstock" {
  if (currentStock === 0) return "out-of-stock";
  if (currentStock < minStockLevel) return "low-stock";
  if (maxStockLevel && currentStock > maxStockLevel) return "overstock";
  return "in-stock";
}

// Use centralized alert creation from src/lib/alerts.ts (no local implementation)

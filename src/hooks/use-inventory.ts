// src/hooks/use-inventory.ts
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type {
  InventoryItem,
  InventoryTransaction,
  InventoryAlert,
  InventoryItemWithDetails,
  InventoryStats,
  SupplierMaterial,
  SupplierPackaging,
  SupplierLabel,
  Supplier,
  Material,
  Packaging,
  Label,
} from "@/lib/types";
import { useMemo } from "react";

// ============================================================================
// CORE HOOKS
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
// ENRICHED DATA HOOKS
// ============================================================================

export function useInventoryItemsWithDetails():
  | InventoryItemWithDetails[]
  | undefined {
  const items = useInventoryItems();
  const supplierMaterials = useLiveQuery(() => db.supplierMaterials.toArray());
  const supplierPackaging = useLiveQuery(() => db.supplierPackaging.toArray());
  const supplierLabels = useLiveQuery(() => db.supplierLabels.toArray());
  const materials = useLiveQuery(() => db.materials.toArray());
  const packaging = useLiveQuery(() => db.packaging.toArray());
  const labels = useLiveQuery(() => db.labels.toArray());
  const suppliers = useLiveQuery(() => db.suppliers.toArray());

  return useMemo(() => {
    if (
      !items ||
      !supplierMaterials ||
      !supplierPackaging ||
      !supplierLabels ||
      !materials ||
      !packaging ||
      !labels ||
      !suppliers
    )
      return undefined;

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
  }, [
    items,
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
// FILTERED HOOKS
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
// STATS HOOK
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

    const byType = {
      materials: {
        count: itemsWithDetails.filter((i) => i.itemType === "supplierMaterial")
          .length,
        value: itemsWithDetails
          .filter((i) => i.itemType === "supplierMaterial")
          .reduce((sum, item) => sum + item.stockValue, 0),
      },
      packaging: {
        count: itemsWithDetails.filter(
          (i) => i.itemType === "supplierPackaging"
        ).length,
        value: itemsWithDetails
          .filter((i) => i.itemType === "supplierPackaging")
          .reduce((sum, item) => sum + item.stockValue, 0),
      },
      labels: {
        count: itemsWithDetails.filter((i) => i.itemType === "supplierLabel")
          .length,
        value: itemsWithDetails
          .filter((i) => i.itemType === "supplierLabel")
          .reduce((sum, item) => sum + item.stockValue, 0),
      },
    };

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
      byType,
      bySupplier,
      criticalAlerts,
      warningAlerts,
    };
  }, [itemsWithDetails, alerts]);
}

// ============================================================================
// ACTION HOOKS
// ============================================================================

export function useAdjustStock() {
  return async (
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
      stockBefore,
      stockAfter,
      notes,
      createdAt: new Date().toISOString(),
    });

    // Check for alerts
    await checkAndCreateAlerts(itemId);
  };
}

export function useCreateInventoryItem() {
  return async (
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
      itemName: "", // Will be populated by UI
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
        stockBefore: 0,
        stockAfter: initialStock,
        createdAt: now,
      });
    }

    return id;
  };
}

export function useResolveAlert() {
  return async (alertId: string) => {
    await db.inventoryAlerts.update(alertId, {
      isResolved: true,
      updatedAt: new Date().toISOString(),
    });
  };
}

export function useMarkAlertAsRead() {
  return async (alertId: string) => {
    await db.inventoryAlerts.update(alertId, {
      isRead: true,
      updatedAt: new Date().toISOString(),
    });
  };
}

// ============================================================================
// HELPER FUNCTIONS
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

async function checkAndCreateAlerts(itemId: string) {
  const item = await db.inventoryItems.get(itemId);
  if (!item) return;

  // Remove existing unresolved alerts for this item
  const existingAlerts = await db.inventoryAlerts
    .where("inventoryItemId")
    .equals(itemId)
    .and((alert) => !alert.isResolved)
    .toArray();

  await Promise.all(
    existingAlerts.map((alert) =>
      db.inventoryAlerts.update(alert.id, { isResolved: true })
    )
  );

  // Create new alert based on status
  if (item.status === "out-of-stock") {
    await db.inventoryAlerts.add({
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      inventoryItemId: itemId,
      alertType: "out-of-stock",
      severity: "critical",
      message: `${item.itemName} is out of stock`,
      isRead: false,
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  } else if (item.status === "low-stock") {
    await db.inventoryAlerts.add({
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      inventoryItemId: itemId,
      alertType: "low-stock",
      severity: "warning",
      message: `${item.itemName} is running low (${item.currentStock} ${item.unit})`,
      isRead: false,
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  } else if (item.status === "overstock") {
    await db.inventoryAlerts.add({
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      inventoryItemId: itemId,
      alertType: "overstock",
      severity: "info",
      message: `${item.itemName} is overstocked (${item.currentStock} ${item.unit})`,
      isRead: false,
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }
}

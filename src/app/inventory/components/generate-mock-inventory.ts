// src/lib/generate-mock-inventory.ts
import { db } from "@/lib/db";
import type {
  InventoryItem,
  InventoryTransaction,
  InventoryAlert,
} from "@/lib/types";

export async function generateMockInventory() {
  console.log("Generating mock inventory data...");

  // Fetch existing supplier items
  const supplierMaterials = await db.supplierMaterials.toArray();
  const supplierPackaging = await db.supplierPackaging.toArray();
  const supplierLabels = await db.supplierLabels.toArray();

  const inventoryItems: InventoryItem[] = [];
  const transactions: InventoryTransaction[] = [];
  const alerts: InventoryAlert[] = [];

  const now = new Date().toISOString();

  // Helper to calculate status
  const calculateStatus = (
    current: number,
    min: number,
    max?: number
  ): "in-stock" | "low-stock" | "out-of-stock" | "overstock" => {
    if (current === 0) return "out-of-stock";
    if (current < min) return "low-stock";
    if (max && current > max) return "overstock";
    return "in-stock";
  };

  // Generate for Materials (take first 10)
  supplierMaterials.slice(0, 10).forEach((sm, index) => {
    const currentStock =
      index % 4 === 0 ? 0 : index % 3 === 0 ? 30 : 150 + index * 10;
    const minStockLevel = 100;
    const maxStockLevel = 500;
    const status = calculateStatus(currentStock, minStockLevel, maxStockLevel);

    const itemId = `inv_material_${sm.id}_${Date.now()}`;

    inventoryItems.push({
      id: itemId,
      itemType: "supplierMaterial",
      itemId: sm.id,
      itemName: "", // Will be populated by hooks
      currentStock,
      unit: sm.unit,
      minStockLevel,
      maxStockLevel,
      lastUpdated: now,
      status,
      createdAt: now,
    });

    // Create initial transaction if stock > 0
    if (currentStock > 0) {
      transactions.push({
        id: `txn_initial_${itemId}`,
        inventoryItemId: itemId,
        type: "in",
        quantity: currentStock,
        reason: "Initial Stock",
        stockBefore: 0,
        stockAfter: currentStock,
        createdAt: now,
      });
    }

    // Create alerts for low/out of stock
    if (status === "out-of-stock") {
      alerts.push({
        id: `alert_${itemId}_out`,
        inventoryItemId: itemId,
        alertType: "out-of-stock",
        severity: "critical",
        message: `Material is out of stock`,
        isRead: false,
        isResolved: false,
        createdAt: now,
      });
    } else if (status === "low-stock") {
      alerts.push({
        id: `alert_${itemId}_low`,
        inventoryItemId: itemId,
        alertType: "low-stock",
        severity: "warning",
        message: `Material is running low (${currentStock} ${sm.unit})`,
        isRead: false,
        isResolved: false,
        createdAt: now,
      });
    }
  });

  // Generate for Packaging (take first 8)
  supplierPackaging.slice(0, 8).forEach((sp, index) => {
    const currentStock =
      index % 5 === 0 ? 0 : index % 4 === 0 ? 80 : 250 + index * 20;
    const minStockLevel = 200;
    const maxStockLevel = 1000;
    const status = calculateStatus(currentStock, minStockLevel, maxStockLevel);

    const itemId = `inv_packaging_${sp.id}_${Date.now()}`;

    inventoryItems.push({
      id: itemId,
      itemType: "supplierPackaging",
      itemId: sp.id,
      itemName: "",
      currentStock,
      unit: "pcs",
      minStockLevel,
      maxStockLevel,
      lastUpdated: now,
      status,
      createdAt: now,
    });

    if (currentStock > 0) {
      transactions.push({
        id: `txn_initial_${itemId}`,
        inventoryItemId: itemId,
        type: "in",
        quantity: currentStock,
        reason: "Initial Stock",
        stockBefore: 0,
        stockAfter: currentStock,
        createdAt: now,
      });
    }

    if (status === "out-of-stock") {
      alerts.push({
        id: `alert_${itemId}_out`,
        inventoryItemId: itemId,
        alertType: "out-of-stock",
        severity: "critical",
        message: `Packaging is out of stock`,
        isRead: false,
        isResolved: false,
        createdAt: now,
      });
    } else if (status === "low-stock") {
      alerts.push({
        id: `alert_${itemId}_low`,
        inventoryItemId: itemId,
        alertType: "low-stock",
        severity: "warning",
        message: `Packaging is running low (${currentStock} pcs)`,
        isRead: false,
        isResolved: false,
        createdAt: now,
      });
    }
  });

  // Generate for Labels (take first 6)
  supplierLabels.slice(0, 6).forEach((sl, index) => {
    const currentStock =
      index % 3 === 0 ? 0 : index % 2 === 0 ? 150 : 400 + index * 30;
    const minStockLevel = 300;
    const maxStockLevel = 1500;
    const status = calculateStatus(currentStock, minStockLevel, maxStockLevel);

    const itemId = `inv_label_${sl.id}_${Date.now()}`;

    inventoryItems.push({
      id: itemId,
      itemType: "supplierLabel",
      itemId: sl.id,
      itemName: "",
      currentStock,
      unit: sl.unit || "pcs",
      minStockLevel,
      maxStockLevel,
      lastUpdated: now,
      status,
      createdAt: now,
    });

    if (currentStock > 0) {
      transactions.push({
        id: `txn_initial_${itemId}`,
        inventoryItemId: itemId,
        type: "in",
        quantity: currentStock,
        reason: "Initial Stock",
        stockBefore: 0,
        stockAfter: currentStock,
        createdAt: now,
      });
    }

    if (status === "out-of-stock") {
      alerts.push({
        id: `alert_${itemId}_out`,
        inventoryItemId: itemId,
        alertType: "out-of-stock",
        severity: "critical",
        message: `Labels are out of stock`,
        isRead: false,
        isResolved: false,
        createdAt: now,
      });
    } else if (status === "low-stock") {
      alerts.push({
        id: `alert_${itemId}_low`,
        inventoryItemId: itemId,
        alertType: "low-stock",
        severity: "warning",
        message: `Labels are running low (${currentStock} ${sl.unit || "pcs"})`,
        isRead: false,
        isResolved: false,
        createdAt: now,
      });
    }
  });

  // Bulk insert
  await db.inventoryItems.bulkAdd(inventoryItems);
  await db.inventoryTransactions.bulkAdd(transactions);
  await db.inventoryAlerts.bulkAdd(alerts);

  console.log(`Generated ${inventoryItems.length} inventory items`);
  console.log(`Generated ${transactions.length} transactions`);
  console.log(`Generated ${alerts.length} alerts`);

  return {
    items: inventoryItems.length,
    transactions: transactions.length,
    alerts: alerts.length,
  };
}

// Function to clear all inventory data
export async function clearInventoryData() {
  await db.inventoryItems.clear();
  await db.inventoryTransactions.clear();
  await db.inventoryAlerts.clear();
  console.log("Inventory data cleared");
}

// You can call this from your data management page or browser console:
// import { generateMockInventory } from "@/lib/generate-mock-inventory";
// generateMockInventory();

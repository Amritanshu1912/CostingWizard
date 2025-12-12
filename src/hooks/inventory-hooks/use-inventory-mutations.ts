// src/hooks/inventory/use-inventory-mutations.ts
import { db } from "@/lib/db";
import type { InventoryItem } from "@/types/inventory-types";
import { createOrUpdateAlertForItemById } from "@/utils/inventory-alerts";
import { calculateStatus, generateId } from "@/utils/inventory-utils";
import { useCallback } from "react";

// ============================================================================
// STOCK ADJUSTMENT HOOKS
// ============================================================================

/**
 * Hook for adjusting inventory stock levels
 * Creates transaction record and updates alerts
 * @returns Async function to adjust stock
 */
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
        updatedAt: new Date().toISOString(),
        status: calculateStatus(
          stockAfter,
          item.minStockLevel,
          item.maxStockLevel
        ),
      });

      // Create transaction
      await db.inventoryTransactions.add({
        id: generateId("txn"),
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

      // Check and update alerts
      await createOrUpdateAlertForItemById(db, itemId);
    },
    []
  );
}

// ============================================================================
// INVENTORY ITEM CRUD HOOKS
// ============================================================================

/**
 * Hook for creating new inventory item
 * Adds item to inventory with initial stock and creates transaction
 * @returns Async function to create inventory item
 */
export function useCreateInventoryItem() {
  return useCallback(
    async (
      itemType: InventoryItem["itemType"],
      itemId: string,
      initialStock: number = 0,
      minStockLevel: number = 100,
      maxStockLevel?: number,
      unit: string = "kg"
    ) => {
      const id = generateId("inv");
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
        status: calculateStatus(initialStock, minStockLevel, maxStockLevel),
        createdAt: now,
        updatedAt: now,
      };

      await db.inventoryItems.add(item);

      // Create initial transaction if stock > 0
      if (initialStock > 0) {
        await db.inventoryTransactions.add({
          id: generateId("txn"),
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

      // Generate alerts if needed
      await createOrUpdateAlertForItemById(db, id);

      return id;
    },
    []
  );
}

/**
 * Hook for updating inventory item details (not stock level)
 * Use useAdjustStock for stock changes
 * @returns Async function to update item details
 */
export function useUpdateInventoryItem() {
  return useCallback(
    async (
      itemId: string,
      updates: Partial<
        Pick<InventoryItem, "minStockLevel" | "maxStockLevel" | "notes">
      >
    ) => {
      await db.inventoryItems.update(itemId, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });

      // Recalculate status if thresholds changed
      if (
        updates.minStockLevel !== undefined ||
        updates.maxStockLevel !== undefined
      ) {
        const item = await db.inventoryItems.get(itemId);
        if (item) {
          const newStatus = calculateStatus(
            item.currentStock,
            updates.minStockLevel ?? item.minStockLevel,
            updates.maxStockLevel ?? item.maxStockLevel
          );
          await db.inventoryItems.update(itemId, { status: newStatus });
          await createOrUpdateAlertForItemById(db, itemId);
        }
      }
    },
    []
  );
}

// ============================================================================
// ALERT MANAGEMENT HOOKS
// ============================================================================

/**
 * Hook for resolving an alert
 * @returns Async function to resolve alert
 */
export function useResolveAlert() {
  return useCallback(async (alertId: string) => {
    await db.inventoryAlerts.update(alertId, {
      isResolved: 1,
      updatedAt: new Date().toISOString(),
    });
  }, []);
}

/**
 * Hook for marking alert as read
 * @returns Async function to mark alert as read
 */
export function useMarkAlertAsRead() {
  return useCallback(async (alertId: string) => {
    await db.inventoryAlerts.update(alertId, {
      isRead: 1,
      updatedAt: new Date().toISOString(),
    });
  }, []);
}

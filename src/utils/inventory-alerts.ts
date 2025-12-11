// src/lib/alerts.ts
import type {
  InventoryItem,
  InventoryAlert,
  InventoryItemWithDetails,
} from "../types/inventory-types";
import { generateId, createUntrackedItem } from "../utils/inventory-utils";

// Utility module to centralize alert creation logic.
// All functions accept a `db` instance so we avoid circular imports with `db.ts`.

export async function createOrUpdateAlertForItemById(db: any, itemId: string) {
  const item: InventoryItem | undefined = await db.inventoryItems.get(itemId);
  if (!item) return;
  return await createOrUpdateAlertForItem(db, item as any);
}

export async function createOrUpdateAlertForItem(
  db: any,
  item: Partial<InventoryItemWithDetails> | Partial<InventoryItem>
) {
  if (!item || !item.id) return;

  // Resolve existing unresolved alerts for this inventory item
  const existingAlerts: InventoryAlert[] = await db.inventoryAlerts
    .where("inventoryItemId")
    .equals(item.id)
    .and((a: any) => a.isResolved === 0)
    .toArray();

  await Promise.all(
    existingAlerts.map((a) =>
      db.inventoryAlerts.update(a.id, { isResolved: 1 })
    )
  );

  // Only create alerts for relevant statuses
  const status = (item as any).status;
  const now = new Date().toISOString();

  if (status === "out-of-stock") {
    const payload = {
      id: generateId("alert"),
      inventoryItemId: item.id,
      alertType: "out-of-stock",
      severity: "critical",
      message: `${(item as any).itemName || item.id} is out of stock`,
      isRead: 0,
      isResolved: 0,
      createdAt: now,
    };
    await db.inventoryAlerts.add(payload);
  } else if (status === "low-stock") {
    const payload = {
      id: generateId("alert"),
      inventoryItemId: item.id,
      alertType: "low-stock",
      severity: "warning",
      message: `${(item as any).itemName || item.id} is running low (${
        (item as any).currentStock ?? 0
      } ${(item as any).unit || ""})`,
      isRead: 0,
      isResolved: 0,
      createdAt: now,
    };
    await db.inventoryAlerts.add(payload);
  } else if (status === "overstock") {
    const payload = {
      id: generateId("alert"),
      inventoryItemId: item.id,
      alertType: "overstock",
      severity: "info",
      message: `${(item as any).itemName || item.id} is overstocked (${
        (item as any).currentStock ?? 0
      } ${(item as any).unit || ""})`,
      isRead: 0,
      isResolved: 0,
      createdAt: now,
    };
    await db.inventoryAlerts.add(payload);
  }
}

// Sweep all inventory-relevant sources and generate alerts for items that are
// low/out/overstocked. This mirrors the logic in `useAllItemsWithInventoryStatus`
// but runs at the DB/service layer so alerts exist independently of UI mounting.
export async function sweepAndGenerateAlerts(db: any) {
  // Fetch reference tables
  const [
    supplierMaterials,
    supplierPackaging,
    supplierLabels,
    inventoryItems,
    materials,
    packaging,
    labels,
    suppliers,
  ] = await Promise.all([
    db.supplierMaterials.toArray(),
    db.supplierPackaging.toArray(),
    db.supplierLabels.toArray(),
    db.inventoryItems.toArray(),
    db.materials.toArray(),
    db.packaging.toArray(),
    db.labels.toArray(),
    db.suppliers.toArray(),
  ]);

  const combinedItems: Partial<InventoryItemWithDetails>[] = [];

  // Materials
  supplierMaterials.forEach((sm: any) => {
    const tracked = inventoryItems.find(
      (inv: any) => inv.itemType === "supplierMaterial" && inv.itemId === sm.id
    );
    if (tracked) combinedItems.push(tracked);
    else {
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
          sm.unit,
          sm.unitPrice,
          sm.tax || 0
        )
      );
    }
  });

  // Packaging
  supplierPackaging.forEach((sp: any) => {
    const tracked = inventoryItems.find(
      (inv: any) => inv.itemType === "supplierPackaging" && inv.itemId === sp.id
    );
    if (tracked) combinedItems.push(tracked);
    else {
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

  // Labels
  supplierLabels.forEach((sl: any) => {
    const tracked = inventoryItems.find(
      (inv: any) => inv.itemType === "supplierLabel" && inv.itemId === sl.id
    );
    if (tracked) combinedItems.push(tracked);
    else {
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

  // Now generate alerts for relevant statuses
  for (const item of combinedItems) {
    if (!item || !item.id) continue;
    if (
      ["out-of-stock", "low-stock", "overstock"].includes(item.status as string)
    ) {
      // Avoid creating duplicate unresolved alerts
      const existing = await db.inventoryAlerts
        .where("inventoryItemId")
        .equals(item.id)
        .and((a: any) => a.isResolved === 0)
        .first();

      if (!existing) {
        await createOrUpdateAlertForItem(db, item);
      }
    }
  }
}

const alertsModule = {
  createOrUpdateAlertForItemById,
  createOrUpdateAlertForItem,
  sweepAndGenerateAlerts,
};

export default alertsModule;

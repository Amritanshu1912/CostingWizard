import { CostingWizardDB } from "./db";
import { InventoryItem } from "../types/shared-types";

/**
 * Auto-generate inventory items for supplier materials/packaging/labels
 * that don't have inventory tracking yet (with currentStock = 0)
 */
export async function autoGenerateMissingInventoryItems(db: CostingWizardDB) {
  console.log("🔍 Checking for missing inventory items...");

  const existingInventory = await db.inventoryItems.toArray();
  const existingKeys = new Set(
    existingInventory.map((inv) => `${inv.itemType}-${inv.itemId}`)
  );

  const itemsToAdd: InventoryItem[] = [];

  // Check all supplier materials
  const supplierMaterials = await db.supplierMaterials.toArray();
  for (const sm of supplierMaterials) {
    const key = `supplierMaterial-${sm.id}`;
    if (!existingKeys.has(key)) {
      const material = await db.materials.get(sm.materialId);
      itemsToAdd.push({
        id: crypto.randomUUID(),
        itemType: "supplierMaterial",
        itemId: sm.id,
        itemName: material?.name || "Unknown Material",
        currentStock: 0,
        unit: sm.capacityUnit,
        minStockLevel: 50, // Default minimum
        maxStockLevel: 500, // Default maximum
        lastUpdated: new Date().toISOString(),
        status: "out-of-stock",
        notes: "Auto-generated inventory tracking",
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Check all supplier packaging
  const supplierPackaging = await db.supplierPackaging.toArray();
  for (const sp of supplierPackaging) {
    const key = `supplierPackaging-${sp.id}`;
    if (!existingKeys.has(key)) {
      const packaging = await db.packaging.get(sp.packagingId);
      itemsToAdd.push({
        id: crypto.randomUUID(),
        itemType: "supplierPackaging",
        itemId: sp.id,
        itemName: packaging?.name || "Unknown Packaging",
        currentStock: 0,
        unit: "pcs",
        minStockLevel: 100,
        maxStockLevel: 1000,
        lastUpdated: new Date().toISOString(),
        status: "out-of-stock",
        notes: "Auto-generated inventory tracking",
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Check all supplier labels
  const supplierLabels = await db.supplierLabels.toArray();
  for (const sl of supplierLabels) {
    const key = `supplierLabel-${sl.id}`;
    if (!existingKeys.has(key)) {
      const label = sl.labelId ? await db.labels.get(sl.labelId) : null;
      itemsToAdd.push({
        id: crypto.randomUUID(),
        itemType: "supplierLabel",
        itemId: sl.id,
        itemName: label?.name || "Unknown Label",
        currentStock: 0,
        unit: sl.unit || "pieces",
        minStockLevel: 100,
        maxStockLevel: 1000,
        lastUpdated: new Date().toISOString(),
        status: "out-of-stock",
        notes: "Auto-generated inventory tracking",
        createdAt: new Date().toISOString(),
      });
    }
  }

  if (itemsToAdd.length > 0) {
    console.log(`➕ Adding ${itemsToAdd.length} missing inventory items`);
    await db.inventoryItems.bulkAdd(itemsToAdd);
    console.log("✅ Auto-generation complete");
  } else {
    console.log("✅ All supplier items already have inventory tracking");
  }
}

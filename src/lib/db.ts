import Dexie, { Table } from "dexie";
import type {
  Supplier,
  Category,
  Material,
  SupplierMaterial,
  Packaging,
  SupplierPackaging,
  Label,
  SupplierLabel,
  RecipeIngredient,
  Recipe,
  RecipeVariant,
  Product,
  ProductVariant,
  ProductionBatch,
  PurchaseOrder,
  InventoryItem,
  InventoryTransaction,
  InventoryAlert,
  TransportationCost,
} from "./types";
import { CATEGORIES, PURCHASE_ORDERS } from "./constants";
import { SUPPLIERS } from "@/app/suppliers/components/suppliers-constants";
import {
  MATERIALS,
  SUPPLIER_MATERIALS,
} from "../app/materials/components/materials-constants";
import {
  PACKAGING,
  SUPPLIER_PACKAGING,
} from "../app/packaging/components/packaging-constants";
import {
  LABELS,
  SUPPLIER_LABELS,
} from "../app/labels/components/labels-constants";
import {
  RECIPES,
  RECIPE_INGREDIENTS,
  RECIPE_VARIANTS,
} from "../app/recipes/components/recipes-constants";
import {
  PRODUCT_VARIANTS,
  PRODUCTS,
} from "@/app/compose-products/components/products-constants";
import { PRODUCTION_BATCHES } from "@/app/batches/components/planning-constants";
import { MOCK_INVENTORY_ITEMS } from "@/app/inventory/components/inventory-constants";

export class CostingWizardDB extends Dexie {
  categories!: Table<Category>;
  materials!: Table<Material>;
  suppliers!: Table<Supplier>;
  supplierMaterials!: Table<SupplierMaterial>;
  packaging!: Table<Packaging>;
  supplierPackaging!: Table<SupplierPackaging>;
  labels!: Table<Label>;
  supplierLabels!: Table<SupplierLabel>;
  recipes!: Table<Recipe>; // NEW: Recipe table
  recipeVariants!: Table<RecipeVariant>;
  recipeIngredients!: Table<RecipeIngredient>;

  products!: Table<Product>;
  productVariants!: Table<ProductVariant>;

  productionBatches!: Table<ProductionBatch>;
  purchaseOrders!: Table<PurchaseOrder>;

  inventoryItems!: Table<InventoryItem>;
  inventoryTransactions!: Table<InventoryTransaction>;
  inventoryAlerts!: Table<InventoryAlert>;
  transportationCosts!: Table<TransportationCost>;

  constructor() {
    super("CostingWizardDB");

    this.version(1).stores({
      categories: "id, name",
      materials: "id, name, category",
      suppliers: "id, name, isActive",
      supplierMaterials: "id, supplierId, materialId, availability",
      packaging: "id, name, type, supplierId, availability",
      supplierPackaging:
        "id, supplierId, packagingId, packagingName, availability",
      labels: "id, name, type, supplierId, availability",
      supplierLabels: "id, supplierId, labelId, labelName, availability",
      recipes: "id, name, status, createdAt", // NEW
      recipeVariants:
        "id, originalRecipeId, name, isActive, &ingredientsSnapshot",
      recipeIngredients: "id, recipeId, supplierMaterialId",
      products: "id, name, recipeId, category, status",
      productVariants: "id, productId, sku, packagingSelectionId, isActive",
      productionBatches: "id, batchName, status, startDate, endDate",
      purchaseOrders: "id, orderId, supplierId, status, dateCreated",
      inventoryItems: "id, itemType, itemId, status, currentStock, lastUpdated",
      inventoryTransactions: "id, inventoryItemId, type, createdAt, reference",
      inventoryAlerts:
        "id, inventoryItemId, alertType, severity, isRead, isResolved",
      transportationCosts: "id, supplierId, region",
    });

    // Migration: Populate initial data if tables are empty
    this.on("ready", async () => {
      const db = this;

      // Check if data exists
      const hasCategories = (await db.categories.count()) > 0;
      if (!hasCategories) {
        await db.categories.bulkAdd(CATEGORIES);
      }

      const hasMaterials = (await db.materials.count()) > 0;
      if (!hasMaterials) {
        await db.materials.bulkAdd(MATERIALS);
      }

      const hasSuppliers = (await db.suppliers.count()) > 0;
      if (!hasSuppliers) {
        await db.suppliers.bulkAdd(SUPPLIERS);
      }

      const hasSupplierMaterials = (await db.supplierMaterials.count()) > 0;
      if (!hasSupplierMaterials) {
        await db.supplierMaterials.bulkAdd(SUPPLIER_MATERIALS);
      }

      const hasRecipes = (await db.recipes.count()) > 0;
      if (!hasRecipes) {
        await db.recipes.bulkAdd(RECIPES);
      }

      const hasRecipeIngredients = (await db.recipeIngredients.count()) > 0;
      if (!hasRecipeIngredients) {
        await db.recipeIngredients.bulkAdd(RECIPE_INGREDIENTS);
      }

      const hasRecipeVariants = (await db.recipeVariants.count()) > 0;
      if (!hasRecipeVariants) {
        await db.recipeVariants.bulkAdd(RECIPE_VARIANTS);
      }
      const hasProducts = (await db.products.count()) > 0;
      if (!hasProducts) {
        await db.products.bulkAdd(PRODUCTS);
      }
      const hasProductVariants = (await db.productVariants.count()) > 0;
      if (!hasProductVariants) {
        await db.productVariants.bulkAdd(PRODUCT_VARIANTS);
      }
      const hasProductionBatches = (await db.productionBatches.count()) > 0;
      if (!hasProductionBatches) {
        await db.productionBatches.bulkAdd(
          PRODUCTION_BATCHES.map((batch) => ({
            ...batch,
            packagingSelections: [],
            labelSelections: [],
            inventoryChecked: false,
            procurementRequired: { materials: [], packaging: [], labels: [] },
          }))
        );
      }

      const hasPurchaseOrders = (await db.purchaseOrders.count()) > 0;
      if (!hasPurchaseOrders) {
        await db.purchaseOrders.bulkAdd(PURCHASE_ORDERS);
      }

      const hasPackaging = (await db.packaging.count()) > 0;
      if (!hasPackaging) {
        await db.packaging.bulkAdd(PACKAGING);
      }

      const hasSupplierPackaging = (await db.supplierPackaging.count()) > 0;
      if (!hasSupplierPackaging) {
        await db.supplierPackaging.bulkAdd(SUPPLIER_PACKAGING);
      }

      const hasLabels = (await db.labels.count()) > 0;
      if (!hasLabels) {
        await db.labels.bulkAdd(LABELS);
      }

      const hasSupplierLabels = (await db.supplierLabels.count()) > 0;
      if (!hasSupplierLabels) {
        await db.supplierLabels.bulkAdd(SUPPLIER_LABELS);
      }

      // Seed inventory items
      const hasInventoryItems = (await db.inventoryItems.count()) > 0;
      if (!hasInventoryItems) {
        const inventoryItemsWithIds = MOCK_INVENTORY_ITEMS.map(
          (item, index) => ({
            ...item,
            id: (index + 1).toString(),
            createdAt: new Date().toISOString(),
          })
        );
        await db.inventoryItems.bulkAdd(inventoryItemsWithIds);
      }

      // Seed inventory transactions
      const hasInventoryTransactions =
        (await db.inventoryTransactions.count()) > 0;
      if (!hasInventoryTransactions) {
        const transactions = [];
        const now = new Date();

        // Create transactions for each inventory item
        for (let i = 0; i < MOCK_INVENTORY_ITEMS.length; i++) {
          const itemId = (i + 1).toString();
          const item = MOCK_INVENTORY_ITEMS[i];

          // Initial stock transaction
          transactions.push({
            id: `${itemId}-initial`,
            inventoryItemId: itemId,
            type: "in" as const,
            quantity: item.currentStock,
            reason: "Initial Stock",
            reference: "setup",
            referenceType: "manual_adjustment" as const,
            stockBefore: 0,
            stockAfter: item.currentStock,
            createdAt: new Date(
              now.getTime() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(), // 7 days ago
            performedBy: "System",
          });

          // Add some recent transactions for variety
          if (item.currentStock > item.minStockLevel) {
            transactions.push({
              id: `${itemId}-recent-in`,
              inventoryItemId: itemId,
              type: "in" as const,
              quantity: Math.floor(item.minStockLevel * 0.5),
              reason: "Purchase Order Delivery",
              reference: "PO-001",
              referenceType: "purchase_order" as const,
              stockBefore:
                item.currentStock - Math.floor(item.minStockLevel * 0.5),
              stockAfter: item.currentStock,
              createdAt: new Date(
                now.getTime() - 2 * 24 * 60 * 60 * 1000
              ).toISOString(), // 2 days ago
              performedBy: "Warehouse Manager",
            });
          }

          if (item.status === "low-stock" || item.status === "out-of-stock") {
            transactions.push({
              id: `${itemId}-usage`,
              inventoryItemId: itemId,
              type: "out" as const,
              quantity: Math.floor(item.minStockLevel * 0.3),
              reason: "Production Batch",
              reference: "BATCH-001",
              referenceType: "production_batch" as const,
              stockBefore:
                item.currentStock + Math.floor(item.minStockLevel * 0.3),
              stockAfter: item.currentStock,
              createdAt: new Date(
                now.getTime() - 1 * 24 * 60 * 60 * 1000
              ).toISOString(), // 1 day ago
              performedBy: "Production Line",
            });
          }
        }

        await db.inventoryTransactions.bulkAdd(transactions);
      }

      // Seed inventory alerts
      const hasInventoryAlerts = (await db.inventoryAlerts.count()) > 0;
      if (!hasInventoryAlerts) {
        const alerts = [];
        const now = new Date();

        for (let i = 0; i < MOCK_INVENTORY_ITEMS.length; i++) {
          const itemId = (i + 1).toString();
          const item = MOCK_INVENTORY_ITEMS[i];

          if (item.status === "low-stock") {
            alerts.push({
              id: `${itemId}-low-stock`,
              inventoryItemId: itemId,
              alertType: "low-stock" as const,
              severity: "warning" as const,
              message: `${item.itemName} stock is below minimum level (${item.currentStock} ${item.unit} remaining)`,
              isRead: false,
              isResolved: false,
              createdAt: new Date(
                now.getTime() - 1 * 24 * 60 * 60 * 1000
              ).toISOString(),
            });
          } else if (item.status === "out-of-stock") {
            alerts.push({
              id: `${itemId}-out-of-stock`,
              inventoryItemId: itemId,
              alertType: "out-of-stock" as const,
              severity: "critical" as const,
              message: `${item.itemName} is completely out of stock`,
              isRead: false,
              isResolved: false,
              createdAt: new Date(
                now.getTime() - 1 * 24 * 60 * 60 * 1000
              ).toISOString(),
            });
          } else if (item.status === "overstock") {
            alerts.push({
              id: `${itemId}-overstock`,
              inventoryItemId: itemId,
              alertType: "overstock" as const,
              severity: "info" as const,
              message: `${item.itemName} has excess stock (${item.currentStock} ${item.unit})`,
              isRead: false,
              isResolved: false,
              createdAt: new Date(
                now.getTime() - 3 * 24 * 60 * 60 * 1000
              ).toISOString(),
            });
          }
        }

        if (alerts.length > 0) {
          await db.inventoryAlerts.bulkAdd(alerts);
        }
      }
    });
  }
}

export const db = new CostingWizardDB();

// Utility functions for data operations
export const dbUtils = {
  async getAll<T>(table: Table<T>): Promise<T[]> {
    return await table.toArray();
  },

  async add<T>(table: Table<T>, item: T): Promise<string> {
    const id = Date.now().toString();
    await table.add({ ...item, id, createdAt: new Date().toISOString() });
    return id;
  },

  async update<T extends { id: string }>(
    table: Table<T>,
    item: T
  ): Promise<void> {
    await table.put({ ...item, updatedAt: new Date().toISOString() });
  },

  async delete(table: Table<any>, id: string): Promise<void> {
    await table.delete(id);
  },

  async bulkAdd<T>(table: Table<T>, items: T[]): Promise<void> {
    await table.bulkAdd(items);
  },

  async bulkUpdate<T extends { id: string }>(
    table: Table<T>,
    items: T[]
  ): Promise<void> {
    await table.bulkPut(
      items.map((item) => ({ ...item, updatedAt: new Date().toISOString() }))
    );
  },
};

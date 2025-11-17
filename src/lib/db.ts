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
  ProductionPlan,
  PurchaseOrder,
  InventoryItem,
  InventoryTransaction,
  TransportationCost,
  ProductionPlanExtended,
} from "./types";
import {
  CATEGORIES,
  SUPPLIERS,
  PRODUCTION_PLANS,
  PURCHASE_ORDERS,
} from "./constants";
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

  productionPlans!: Table<ProductionPlanExtended>;
  purchaseOrders!: Table<PurchaseOrder>;

  inventoryItems!: Table<InventoryItem>;
  inventoryTransactions!: Table<InventoryTransaction>;
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
      productionPlans: "id, planName, status, startDate, endDate",
      purchaseOrders: "id, orderId, supplierId, status, dateCreated",
      inventoryItems: "id, itemType, itemId, itemName, status",
      inventoryTransactions: "id, inventoryItemId, type, reference",
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
      const hasProductionPlans = (await db.productionPlans.count()) > 0;
      if (!hasProductionPlans) {
        await db.productionPlans.bulkAdd(
          PRODUCTION_PLANS.map((plan) => ({
            ...plan,
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

      // Migrate from localStorage if exists
      if (typeof window !== "undefined") {
        const localSuppliers = localStorage.getItem("suppliers");
        if (localSuppliers && !hasSuppliers) {
          try {
            const suppliers = JSON.parse(localSuppliers);
            await db.suppliers.bulkAdd(suppliers);
          } catch (e) {
            console.error("Error migrating suppliers from localStorage:", e);
          }
        }

        const localSupplierMaterials =
          localStorage.getItem("supplier-materials");
        if (localSupplierMaterials && !hasSupplierMaterials) {
          try {
            const supplierMaterials = JSON.parse(localSupplierMaterials);
            await db.supplierMaterials.bulkAdd(supplierMaterials);
          } catch (e) {
            console.error(
              "Error migrating supplierMaterials from localStorage:",
              e
            );
          }
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

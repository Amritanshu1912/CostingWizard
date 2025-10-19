import Dexie, { Table } from 'dexie';
import type {
    Category,
    Material,
    Supplier,
    SupplierMaterial,
    Product,
    ProductionPlan,
    PurchaseOrder,
    Packaging,
    SupplierPackaging,
    Label,
    SupplierLabel,
    InventoryItem,
    InventoryTransaction,
    TransportationCost,
    RecipeVariant,
    ProductionPlanExtended,
} from './types';
import {
    CATEGORIES,
    SUPPLIERS,
    PRODUCTION_PLANS,
    PURCHASE_ORDERS,
} from './constants';
import {
    MATERIALS,
    SUPPLIER_MATERIALS,
} from '../app/materials/components/materials-config';
import {
    PACKAGING,
    SUPPLIER_PACKAGING,
} from '../app/packaging/components/packaging-constants';
import {
    LABELS,
    SUPPLIER_LABELS,
} from '../app/labels/components/labels-constants';
import { RECIPES } from '../app/recipes/components/recipes-constants';

export class CostingWizardDB extends Dexie {
    categories!: Table<Category>;
    materials!: Table<Material>;
    suppliers!: Table<Supplier>;
    supplierMaterials!: Table<SupplierMaterial>;
    products!: Table<Product>;
    productionPlans!: Table<ProductionPlanExtended>;
    purchaseOrders!: Table<PurchaseOrder>;
    packaging!: Table<Packaging>;
    supplierPackaging!: Table<SupplierPackaging>;
    labels!: Table<Label>;
    supplierLabels!: Table<SupplierLabel>;
    inventoryItems!: Table<InventoryItem>;
    inventoryTransactions!: Table<InventoryTransaction>;
    transportationCosts!: Table<TransportationCost>;
    recipeVariants!: Table<RecipeVariant>;

    constructor() {
        super('CostingWizardDB');

        this.version(1).stores({
            categories: 'id, name',
            materials: 'id, name, category',
            suppliers: 'id, name, isActive',
            supplierMaterials: 'id, supplierId, materialId, availability',
            packaging: 'id, name, type, supplierId, availability',
            supplierPackaging: 'id, supplierId, packagingId, packagingName, availability',
            labels: 'id, name, type, supplierId, availability',
            supplierLabels: 'id, supplierId, labelId, labelName, availability',
            products: 'id, name, status',
            productionPlans: 'id, planName, status, startDate, endDate',
            purchaseOrders: 'id, orderId, supplierId, status, dateCreated',
            inventoryItems: 'id, itemType, itemId, itemName, status',
            inventoryTransactions: 'id, inventoryItemId, type, reference',
            transportationCosts: 'id, supplierId, region',
            recipeVariants: 'id, originalRecipeId, name, isActive',
        });

        // Migration: Populate initial data if tables are empty
        this.on('ready', async () => {
            const db = this;

            // Check if data exists
            const hasCategories = await db.categories.count() > 0;
            if (!hasCategories) {
                await db.categories.bulkAdd(CATEGORIES);
            }

            const hasMaterials = await db.materials.count() > 0;
            if (!hasMaterials) {
                await db.materials.bulkAdd(MATERIALS);
            }

            const hasSuppliers = await db.suppliers.count() > 0;
            if (!hasSuppliers) {
                await db.suppliers.bulkAdd(SUPPLIERS);
            }

            const hasSupplierMaterials = await db.supplierMaterials.count() > 0;
            if (!hasSupplierMaterials) {
                await db.supplierMaterials.bulkAdd(SUPPLIER_MATERIALS);
            }

            const hasRecipes = await db.recipeVariants.count() > 0;
            if (!hasRecipes) {
                const recipeVariants = RECIPES.map(recipe => ({
                    ...recipe,
                    originalRecipeId: recipe.id,
                    costDifference: 0,
                    costDifferencePercentage: 0,
                    isActive: true,
                }));
                await db.recipeVariants.bulkAdd(recipeVariants);
            }

            const hasProductionPlans = await db.productionPlans.count() > 0;
            if (!hasProductionPlans) {
                await db.productionPlans.bulkAdd(PRODUCTION_PLANS.map(plan => ({
                    ...plan,
                    packagingSelections: [],
                    labelSelections: [],
                    inventoryChecked: false,
                    procurementRequired: { materials: [], packaging: [], labels: [] }
                })));
            }

            const hasPurchaseOrders = await db.purchaseOrders.count() > 0;
            if (!hasPurchaseOrders) {
                await db.purchaseOrders.bulkAdd(PURCHASE_ORDERS);
            }

            const hasPackaging = await db.packaging.count() > 0;
            if (!hasPackaging) {
                await db.packaging.bulkAdd(PACKAGING);
            }

            const hasSupplierPackaging = await db.supplierPackaging.count() > 0;
            if (!hasSupplierPackaging) {
                await db.supplierPackaging.bulkAdd(SUPPLIER_PACKAGING);
            }

            const hasLabels = await db.labels.count() > 0;
            if (!hasLabels) {
                await db.labels.bulkAdd(LABELS);
            }

            const hasSupplierLabels = await db.supplierLabels.count() > 0;
            if (!hasSupplierLabels) {
                await db.supplierLabels.bulkAdd(SUPPLIER_LABELS);
            }

            // Migrate from localStorage if exists
            if (typeof window !== 'undefined') {
                const localSuppliers = localStorage.getItem('suppliers');
                if (localSuppliers && !hasSuppliers) {
                    try {
                        const suppliers = JSON.parse(localSuppliers);
                        await db.suppliers.bulkAdd(suppliers);
                    } catch (e) {
                        console.error('Error migrating suppliers from localStorage:', e);
                    }
                }

                const localSupplierMaterials = localStorage.getItem('supplier-materials');
                if (localSupplierMaterials && !hasSupplierMaterials) {
                    try {
                        const supplierMaterials = JSON.parse(localSupplierMaterials);
                        await db.supplierMaterials.bulkAdd(supplierMaterials);
                    } catch (e) {
                        console.error('Error migrating supplierMaterials from localStorage:', e);
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

    async update<T extends { id: string }>(table: Table<T>, item: T): Promise<void> {
        await table.put({ ...item, updatedAt: new Date().toISOString() });
    },

    async delete(table: Table<any>, id: string): Promise<void> {
        await table.delete(id);
    },

    async bulkAdd<T>(table: Table<T>, items: T[]): Promise<void> {
        await table.bulkAdd(items);
    },

    async bulkUpdate<T extends { id: string }>(table: Table<T>, items: T[]): Promise<void> {
        await table.bulkPut(items.map(item => ({ ...item, updatedAt: new Date().toISOString() })));
    },
};

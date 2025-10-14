// ============================================================================
// BASE TYPES
// ============================================================================

export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt?: string;
}

export interface BulkDiscount {
    quantity: number;
    discount: number; // percentage
}

// ============================================================================
// CATEGORIES
// ============================================================================

export interface Category extends BaseEntity {
    name: string;
    description?: string;
    color?: string;
}

export interface CategoryManagerProps {
    categories: Category[];
    addCategory: (category: Omit<Category, 'id'>) => void;
    updateCategory: (category: Category) => void;
    deleteCategory: (id: string) => void;
}

// ============================================================================
// SUPPLIERS
// ============================================================================

export interface Supplier extends BaseEntity {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address?: string;
    rating: number;
    isActive: boolean;
    paymentTerms: string;
    leadTime: number; // in days
    notes?: string;
    performance?: {
        onTimeDelivery: number;
        qualityScore: number;
        priceCompetitiveness: number;
    };
}

// ============================================================================
// MATERIALS
// ============================================================================

export interface Material extends BaseEntity {
    name: string;
    category: string;
    notes?: string;
}

export interface SupplierMaterial extends BaseEntity {
    supplierId: string;
    materialId: string;

    unit: "kg" | "g" | "l" | "ml" | "pcs" | string;
    unitPrice: number;
    tax: number;
    moq?: number;

    bulkPrice?: number;      // The actual quoted price
    quantityForBulkPrice?: number;

    bulkDiscounts?: BulkDiscount[];
    leadTime?: number;
    availability?: "in-stock" | "limited" | "out-of-stock";
    transportationCost?: number;
    notes?: string;
}
// Helper type for enriched supplier material
export interface SupplierMaterialWithDetails extends SupplierMaterial {
    material?: Material;
    supplier?: Supplier;
    displayName: string;
    displayCategory: string;
    displayUnit: string;
    priceWithTax: number;
}

// Helper type for material with supplier count
export interface MaterialWithSuppliers extends Material {
    supplierCount: number;
    suppliersList: Supplier[];
}


// ============================================================================
// PACKAGING
// ============================================================================

export type PackagingType = "bottle" | "jar" | "can" | "box" | "pouch" | "other";
export type CapacityUnit = "kg" | "L" | "ml" | "gm";
export type BuildMaterial = "PET" | "HDPE" | "Glass" | "Plastic" | "Paper" | "Other";


export interface Packaging extends BaseEntity {
    name: string;
    type: PackagingType;
    capacity: number;
    unit: CapacityUnit;
    buildMaterial?: BuildMaterial;
    notes?: string;
}

export interface SupplierPackaging extends BaseEntity {
    supplierId: string;
    packagingId: string;
    unitPrice: number;
    tax?: number;
    moq?: number;
    bulkPrice?: number;      // The actual quoted price
    quantityForBulkPrice?: number;
    bulkDiscounts?: BulkDiscount[];
    leadTime?: number;
    availability?: "in-stock" | "limited" | "out-of-stock";
    transportationCost?: number;
    notes?: string;
}
export interface PackagingWithSuppliers extends Packaging {
    supplierCount: number;
    suppliersList: Supplier[];
}


// ============================================================================
// LABELS
// ============================================================================

export interface Label extends BaseEntity {
    name: string;
    type: "sticker" | "label" | "tag";
    printingType: "bw" | "color" | "foil" | "embossed";
    material: "paper" | "vinyl" | "plastic" | "other";
    shape: "rectangular" | "custom";
    size?: string; // e.g., "50x30mm"
    labelFor?: string; //product name
    notes?: string;
}

export interface SupplierLabel extends BaseEntity {
    supplierId: string;
    labelId?: string;

    unit: "pieces" | "sheets" | string;
    unitPrice: number;
    bulkPrice?: number;      // The actual quoted price
    quantityForBulkPrice?: number;
    moq: number;
    bulkDiscounts?: BulkDiscount[];
    leadTime: number;
    availability: "in-stock" | "limited" | "out-of-stock";
    transportationCost?: number;
    notes?: string;
}

export interface LabelsWithSuppliers extends Label {
    supplierCount: number;
    suppliersList: Supplier[];
}


// ============================================================================
// PRODUCTS & Recipes
// ============================================================================

export interface ProductIngredient {
    id: string; // New: Unique ID for the ingredient instance
    materialId: string;
    materialName: string;
    quantity: number;
    unit: string; // New: e.g., "kg", "g", "L", "mL"
    costPerKg: number;
    totalCost: number;
    percentage?: number;
}

export interface Product extends BaseEntity {
    name: string;
    description?: string;
    ingredients: ProductIngredient[];
    totalCostPerKg: number;
    sellingPricePerKg?: number;
    profitMargin?: number;
    batchSizeKg?: number;
    status: "draft" | "active" | "discontinued";
}

// ============================================================================
// PROCUREMENT & ORDERS
// ============================================================================

export interface PurchaseOrderItem {
    id: string;
    materialId: string;
    materialName: string;
    quantity: number;
    unit: string;
    costPerKg: number;
    totalCost: number;
}

export interface PurchaseOrder extends BaseEntity {
    id: string;
    orderId: string;
    supplierId: string;
    supplierName: string;
    items: PurchaseOrderItem[];
    totalCost: number;
    status: "draft" | "submitted" | "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    dateCreated: string;
    deliveryDate: string;
}

// ============================================================================
// PRODUCTION PLANNING
// ============================================================================

export interface MaterialRequirement {
    materialId: string;
    materialName: string;
    requiredQty: number;
    availableQty: number;
    shortage: number;
    costPerKg: number;
    totalCost: number;
}

export interface ProductionItem {
    productId: string;
    productName: string;
    quantityKg: number;
    costPerKg: number;
    totalCost: number;
    materialsRequired: MaterialRequirement[];
}

export interface ProductionPlan extends BaseEntity {
    planName: string;
    description?: string;
    startDate: string;
    endDate: string;
    products: ProductionItem[];
    totalCost: number;
    totalRevenue: number;
    totalProfit: number;
    status: "draft" | "scheduled" | "in-progress" | "completed" | "cancelled";
    progress: number; // 0-100
}

// ============================================================================
// INVENTORY
// ============================================================================

export interface InventoryItem extends BaseEntity {
    itemType: "material" | "packaging" | "label";
    itemId: string; // references Material.id, Packaging.id, or Label.id
    itemName: string;
    currentStock: number;
    unit: string;
    minStockLevel: number;
    maxStockLevel?: number;
    location?: string;
    lastUpdated: string;
    status: "in-stock" | "low-stock" | "out-of-stock" | "overstock";
    notes?: string;
}

export interface InventoryTransaction extends BaseEntity {
    inventoryItemId: string;
    type: "in" | "out" | "adjustment";
    quantity: number;
    reason: string;
    reference?: string; // e.g., order ID, production plan ID
    performedBy?: string;
    notes?: string;
}

// ============================================================================
// TRANSPORTATION COSTS
// ============================================================================

export interface TransportationCost extends BaseEntity {
    supplierId: string;
    region: string; // e.g., "Mumbai", "Delhi", "International"
    costPerKg: number;
    minOrderValue?: number;
    maxWeight?: number;
    leadTime: number; // additional days
    notes?: string;
}

// ============================================================================
// RECIPE TWEAKER
// ============================================================================

export interface RecipeVariant extends BaseEntity {
    originalRecipeId: string;
    name: string;
    description?: string;
    ingredients: ProductIngredient[];
    totalCostPerKg: number;
    sellingPricePerKg?: number;
    profitMargin?: number;
    notes?: string;
    isActive: boolean;
}

// ============================================================================
// EXTENDED ENTITIES
// ============================================================================

export interface SupplierMaterialExtended extends SupplierMaterial {
    transportationCost?: number;
}

export interface ProductionPlanExtended extends ProductionPlan {
    packagingSelections: {
        productId: string;
        packagingId: string;
        quantity: number;
    }[];
    labelSelections: {
        productId: string;
        labelId: string;
        quantity: number;
    }[];
    inventoryChecked: boolean;
    procurementRequired: {
        materials: MaterialRequirement[];
        packaging: { packagingId: string; packagingName: string; requiredQty: number; availableQty: number; shortage: number }[];
        labels: { labelId: string; labelName: string; requiredQty: number; availableQty: number; shortage: number }[];
    };
}

// ============================================================================
// OPTIMIZATION & ANALYTICS
// ============================================================================

export interface OptimizationSuggestion {
    type: "substitute" | "bulk" | "supplier" | "recipe" | "packaging" | "transport";
    title: string;
    description: string;
    savings: number;
    impact: "low" | "medium" | "high";
    confidence: number; // 0-100
}

export interface ScenarioData {
    name: string;
    batchSize: number;
    totalCost: number;
    costPerKg: number;
    margin: number;
    price: number;
}



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

export type CapacityUnit = "kg" | "L" | "ml" | "gm" | "pcs";


// ============================================================================
// SUPPLIERS
// ============================================================================

export interface Supplier extends BaseEntity {
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

    unit: CapacityUnit;
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


// Helper type for material with supplier count
export interface MaterialWithSuppliers extends Material {
    supplierCount: number;
    suppliersList: Supplier[];
}

/**
 * Extended SupplierMaterial with joined data
 */
export interface SupplierMaterialWithDetails extends SupplierMaterial {
    material?: Material;
    supplier?: Supplier;

    // Computed display fields (always accurate)
    displayName: string;
    displayCategory: string;
    displayUnit: string;
    priceWithTax: number;
}


// ============================================================================
// PACKAGING
// ============================================================================
export type PackagingType = "bottle" | "jar" | "can" | "box" | "pouch" | "other";
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
    bulkPrice: number;      // The actual quoted price
    quantityForBulkPrice: number;
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

/**
 * Extended SupplierPackaging with joined data
 */
export interface SupplierPackagingWithDetails extends SupplierPackaging {
    packaging?: Packaging;
    supplier?: Supplier;

    // Computed display fields (always accurate)
    displayName: string;
    displayType: string;
    displayUnit: string;
    priceWithTax: number;
}

// ============================================================================
// LABELS
// ============================================================================

export type LabelType = "sticker" | "label" | "tag" | "other";
export type PrintingType = "bw" | "color" | "foil" | "embossed";
export type LabelMaterialType = "paper" | "vinyl" | "plastic" | "other";
export type ShapeType = "rectangular" | "custom";

export interface Label extends BaseEntity {
    name: string;
    type: LabelType;
    printingType: PrintingType;
    material: LabelMaterialType;
    shape: ShapeType;
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
    tax?: number;
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

/**
 * Extended SupplierLabel with joined data
 */
export interface SupplierLabelWithDetails extends SupplierLabel {
    label?: Label;
    supplier?: Supplier;

    // Computed display fields (always accurate)
    displayName: string;
    displayType: string;
    displayPrintingType: string;
    displayMaterial: string;
    displayShape: string;
    priceWithTax: number;
}

// ============================================================================
// RECIPES
// ============================================================================

/**
 * A single ingredient in a recipe formulation.
 * Links to a SupplierMaterial and defines how much is needed.
 */
export interface RecipeIngredient extends BaseEntity {
    supplierMaterialId: string;
    quantity: number;

    // Optional: Lock pricing for cost stability
    lockedPricing?: {
        unitPrice: number;        // Locked supplier unit price
        tax: number;              // Locked tax percentage
        lockedAt: Date;
        reason?: "cost_analysis" | "quote" | "production_batch" | "other";
        notes?: string;
    };

    // Display/reference (not for calculations)
    notes?: string;
}

/**
 * Computed values for a recipe ingredient (NOT stored in DB)
 * These are calculated at runtime from SupplierMaterial data
 */
export interface RecipeIngredientCalculated extends RecipeIngredient {
    supplierMaterial: SupplierMaterialWithDetails;

    // Computed costs
    effectivePricePerKg: number;     // Uses locked price if available, else current
    effectiveTax: number;
    quantity: number;                // Normalized to kg for calculations
    costForQuantity: number;         // Total cost for this ingredient
    taxedCostForQuantity: number;
    priceSharePercentage: number;              // Percentage of total cost

    // Display helpers
    displayName: string;
    displaySupplier: string;
    displayQuantity: string;

    // Status flags
    isPriceLocked: boolean;
    priceChangedSinceLock: boolean;
    priceDifference?: number;
    isAvailable: boolean;
}

/**
 * Recipe/Formulation - The formula for making a product substance
 */
export interface Recipe extends BaseEntity {
    name: string;
    description?: string;

    // The formulation
    ingredients: RecipeIngredient[];

    // Manufacturing details
    productionTime?: number;          // Minutes
    manufacturingInstructions?: string;

    costPerKg: number;
    // Cost targets (aspirational, not enforced)
    targetCostPerKg?: number;
    targetProfitMargin?: number;

    // Status
    status: "draft" | "active" | "archived" | "discontinued";
    version?: number;                 // For version control
    parentRecipeId?: string;          // If this is a variant/version of another recipe

    // Compliance & Safety
    shelfLife?: number;               // Days
    notes?: string;
}

/**
 * Computed recipe cost analysis (NOT stored in DB)
 */
export interface RecipeCostAnalysis {
    recipeId: string;
    recipeName: string;

    // Breakdown by ingredient
    ingredientBreakdown: Array<{
        ingredientId: string;
        name: string;
        cost: number;
        costWithTax: number;
        percentageOfTotal: number;
    }>;
    percentage: number;              // Percentage of total cost

    // Top cost drivers
    topCostDrivers: string[];         // Top 3 ingredient names

    // Alerts & Warnings
    hasPriceChanges: boolean;
    warnings: string[];
}

export interface RecipeVariant extends BaseEntity {
    originalRecipeId: string;
    name: string;
    description?: string;

    // The modified formulation
    ingredients: RecipeIngredient[];

    // Computed cost
    costPerKg: number;

    // Comparison with original
    costDifference: number;           // Amount saved/increased vs original
    costDifferencePercentage: number; // % cheaper/expensive vs original

    // Business metrics
    profitMargin?: number;

    // Why was this variant created?
    optimizationGoal?: "cost_reduction" | "quality_improvement" | "supplier_diversification" | "other";

    // Status
    isActive: boolean;

    // Changelog - what was changed
    changes?: Array<{
        type: "quantity_change" | "supplier_change" | "ingredient_added" | "ingredient_removed";
        ingredientName: string;
        oldValue?: string | number;
        newValue?: string | number;
        reason?: string;
    }>;

    notes?: string;
}
/**
 * Suggestion for recipe optimization
 */
export interface RecipeOptimizationSuggestion {
    type: "reduce_quantity" | "substitute_ingredient" | "remove_ingredient";
    ingredientId: string;
    ingredientName: string;

    // For quantity reduction
    currentQuantity?: number;
    suggestedQuantity?: number;

    // For substitution
    alternativeSupplierMaterialId?: string;
    alternativeSupplierMaterialName?: string;

    // Impact
    costSaving: number;
    costSavingPercentage: number;
    qualityImpact?: "none" | "low" | "medium" | "high";

    reasoning: string;
    confidence: number;               // 0-100
}

// ============================================================================
// PRODUCT SYSTEM (Final SKU)
// ============================================================================

export type ProductComponentType = "recipe" | "packaging" | "label";

/**
 * A component that makes up a product (recipe, packaging, or label)
 */
export interface ProductComponent extends BaseEntity {
    type: ProductComponentType;

    // For recipe components
    recipeId?: string;
    packagingId?: string;
    labelId?: string;

    // For packaging/label components (these are also supplier materials)
    quantity?: number;
    unit?: string;

    // Optional: Lock pricing
    lockedPricing?: {
        unitPrice: number;
        tax: number;
        lockedAt: Date;
        reason?: string;
        notes?: string;
    };

    notes?: string;
}

/**
 * Product - The final SKU that includes recipe + packaging + labels
 */
export interface Product extends BaseEntity {
    name: string;                     // e.g., "Floor Cleaner - 5L Bottle"
    sku?: string;                     // Stock Keeping Unit
    description?: string;
    category?: string;

    // Product composition
    components: ProductComponent[];   // Recipe + Packaging + Labels

    // Unit definition (what customers buy)
    unitSize: number;                 // e.g., 5 (for 5L bottle)
    unitType: CapacityUnit;   // e.g., "L"
    unitsPerCase?: number;            // For bulk sales

    // Pricing
    sellingPricePerUnit: number;      // Price for one unit (e.g., one 5L bottle)
    sellingPricePerCase?: number;     // If selling by case
    costPerKg: number;                // Total cost per kg of product
    sellingPricePerKg: number;        // Selling price per kg

    // Business metrics (aspirational targets)
    targetProfitMargin?: number;      // Desired margin %
    minimumProfitMargin?: number;     // Don't sell below this

    // Sales & Distribution
    distributionChannels?: string[];  // e.g., ["retail", "wholesale", "online"]
    shelfLife?: number;               // Days

    // Status
    status: "draft" | "active" | "discontinued";
    isLocked?: boolean;               // Lock all component prices

    // Marketing
    barcode?: string;
    imageUrl?: string;
    tags?: string[];

    notes?: string;
}

/**
 * Computed product cost analysis (NOT stored in DB)
 */
export interface ProductCostAnalysis {
    productId: string;
    productName: string;

    // Component costs
    recipeCost: number;
    packagingCost: number;
    labelCost: number;
    totalCost: number;
    totalCostWithTax: number;

    // Per-unit calculations
    costPerUnit: number;
    costPerUnitWithTax: number;

    // If selling by case
    costPerCase?: number;
    costPerCaseWithTax?: number;

    // Profitability
    sellingPricePerUnit: number;
    grossProfit: number;
    grossProfitMargin: number;        // Actual margin %

    // Comparison with targets
    targetMargin?: number;
    marginVsTarget?: number;          // Difference from target
    meetsMinimumMargin: boolean;

    // Breakdown
    costBreakdown: Array<{
        componentType: ProductComponentType;
        name: string;
        cost: number;
        percentageOfTotal: number;
    }>;

    // Alerts
    hasAvailabilityIssues: boolean;
    hasPriceChanges: boolean;
    warnings: string[];
}

// ============================================================================
// OPTIMIZATION & ANALYSIS
// ============================================================================



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




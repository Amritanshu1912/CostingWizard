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

// Extended SupplierLabel with joined data

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

export interface LockedPricing {
    unitPrice: number;    // locked supplier unit price
    tax: number;              // Locked tax percentage
    lockedAt: Date;
    reason?: "cost_analysis" | "quote" | "production_batch" | "other";
    notes?: string;
}
// A single ingredient in a recipe formulation.

export interface RecipeIngredient extends BaseEntity {
    recipeId: string;
    supplierMaterialId: string;
    quantity: number;
    unit: CapacityUnit;
    lockedPricing?: LockedPricing;
}

// Recipe/Formulation - The formula for making a product substance

export interface Recipe extends BaseEntity {
    name: string;
    description?: string;
    totalWeight: number;
    targetCostPerKg?: number;
    status: "draft" | "testing" | "active" | "archived" | "discontinued";
    version?: number;
    instructions?: string;
    notes?: string;
}


export interface RecipeVariant extends BaseEntity {
    originalRecipeId: string;
    name: string;
    description?: string;

    // Core formulation
    ingredientIds: string[];
    // Optional full snapshot of variant ingredients to avoid referencing mutable
    // recipe ingredient records. This allows historic variants to stay immutable
    // even if the base recipe changes.
    ingredientsSnapshot?: VariantIngredientSnapshot[];

    // Business context
    optimizationGoal?: "cost_reduction" | "quality_improvement" | "supplier_diversification" | "other";
    isActive: boolean;

    // Audit trail
    changes?: RecipeVariantChange[];
    notes?: string;
}

export interface RecipeVariantChange {
    type: "quantity_change" | "supplier_change" | "ingredient_added" | "ingredient_removed";
    ingredientName?: string;
    oldValue?: string | number;
    newValue?: string | number;
    reason?: string;
    changedAt: Date; // Add timestamp for better audit
}

// --- Snapshot for variant (optional) ---
// If you need the variant to be a full snapshot of formulation at that moment,
// use this structure instead of referencing ingredientIds. This avoids future edits
// to base ingredients from changing historic variants.
export interface VariantIngredientSnapshot {
    supplierMaterialId: string;
    quantity: number;
    unit: CapacityUnit;
    lockedPricing?: LockedPricing;
    notes?: string;
}

// Computed values for a recipe ingredient (NOT stored in DB)
// These are calculated at runtime from SupplierMaterial data

export interface RecipeIngredientDisplay extends RecipeIngredient {
    displayQuantity: string;

    // Material & supplier friendly fields (populated via join)
    materialName?: string;
    supplierName?: string;
    displayName: string; // human-friendly: "Sodium Chloride (Supplier X)"

    pricePerKg: number;
    costForQuantity: number;
    taxedPriceForQuantity: number;

    priceSharePercentage: number; // share of recipe cost
    isPriceLocked: boolean;
    priceChangedSinceLock: boolean;
    priceDifference?: number; // positive if current price > locked price
    isAvailable: boolean;
}

// For UI display - computed from Recipe + RecipeIngredientDisplay[]
export interface RecipeDisplay extends Recipe {
    ingredients: RecipeIngredientDisplay[];
    ingredientCount: number;
    variantCount: number;

    totalCost: number;
    taxedTotalCost: number;
    costPerKg: number;
    taxedCostPerKg: number;

    varianceFromTarget?: number;
    variancePercentage?: number;
    isAboveTarget?: boolean;
}

//Computed recipe cost analysis (NOT stored in DB)

// Represents cost contribution of an ingredient within a recipe.
// Derived from RecipeIngredientDisplay.
export interface IngredientCostBreakdown {
    ingredientId: string;
    displayName: string;         // "Sodium Chloride (Supplier X)"
    materialName?: string;
    supplierName?: string;

    quantity: number;
    unit: CapacityUnit;
    pricePerKg: number;
    costForQuantity: number;     // total cost (excluding tax)
    taxedCostForQuantity: number; // total cost (including tax)
    percentageOfTotal: number;   // contribution % of total cost
    isPriceLocked: boolean;
}

// Represents a comparison between current supplier vs potential alternative.
// Optional, useful for cost-optimization or recommendation modules.
export interface PotentialSaving {
    ingredientId: string;
    ingredientName: string;
    currentSupplier: string;
    alternativeSupplier: string;

    currentCostPerKg: number;
    alternativeCostPerKg: number;

    currentCostTotal: number;
    alternativeCostTotal: number;

    absoluteSavings: number;   // ₹ difference
    savingsPercentage: number; // (alt - current) / current * 100
    recommendationReason?: string; // "bulk discount", "same quality lower price", etc.
}

export interface RecipeCostAnalysis {
    recipeId: string;
    recipeName: string;
    totalCost: number;
    taxedTotalCost: number;
    costPerKg: number;
    taxedCostPerKg: number;
    totalWeight: number;

    ingredientBreakdown: IngredientCostBreakdown[];
    potentialSavings?: PotentialSaving[];

    targetCostPerKg?: number;
    varianceFromTarget?: number;
    variancePercentage?: number;
    isAboveTarget?: boolean;

    // 💡 Add optimization suggestions
    optimizationSuggestions?: RecipeOptimizationSuggestion[];
}
// Suggestion for recipe optimization

export interface RecipeOptimizationSuggestion {
    // Core classification
    type: "reduce_quantity" | "substitute_ingredient" | "remove_ingredient";

    // Target ingredient
    ingredientId: string;
    ingredientName: string;

    // Quantity modification (for "reduce_quantity")
    currentQuantity?: number;
    suggestedQuantity?: number;
    unit?: CapacityUnit;

    // Substitution (for "substitute_ingredient")
    alternativeSupplierMaterialId?: string;
    alternativeSupplierMaterialName?: string;
    alternativeSupplierName?: string;

    // Expected impact (quantified)
    costSaving: number;              // absolute saving (e.g., ₹)
    costSavingPercentage: number;    // relative saving
    qualityImpact?: "none" | "low" | "medium" | "high";

    // Explanation & confidence
    reasoning: string;
    confidence: number;              // 0–100 (could later be mapped to a color scale)
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




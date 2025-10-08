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

export interface MoneyValue {
    amount: number;
    currency?: string; // default: INR
}

// ============================================================================
// CATEGORIES
// ============================================================================

export interface Category {
    id: string;
    name: string;
    description?: string;
    color?: string;
}

export interface CategoryManagerProps {
    categories: Category[];
    onCategoriesChange: (categories: Category[]) => void;
}

// ============================================================================
// MATERIALS
// ============================================================================

export interface Material extends BaseEntity {
    name: string;
    category: string;
    pricePerKg: number;
    tax?: number;
    priceWithTax?: number;
    supplierId?: string;
    minOrder?: number;
    unit?: string; // default: kg
    bulkDiscounts?: BulkDiscount[];
    status?: "active" | "low-stock" | "out-of-stock";
    notes?: string;
}

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

export interface SupplierMaterial extends BaseEntity {
    supplierId: string;
    materialId?: string; // optional if material doesn't exist in main materials yet
    materialName: string;
    materialCategory: string;
    unitPrice: number;
    currency: string;
    moq: number; // minimum order quantity
    unit: string; // kg, liters, pieces, etc.
    bulkDiscounts?: BulkDiscount[];
    leadTime: number;
    availability: "in-stock" | "limited" | "out-of-stock";
    lastUpdated: string;
    notes?: string;
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
// OPTIMIZATION & ANALYTICS
// ============================================================================

export interface OptimizationSuggestion {
    type: "substitute" | "bulk" | "supplier" | "recipe";
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

export interface AnalyticsChartsProps {
    type: "materials" | "recipes" | "production" | "procurement";
}
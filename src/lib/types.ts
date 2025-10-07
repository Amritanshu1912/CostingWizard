// from analytics chart 
export interface AnalyticsChartsProps {
    type: "materials" | "formulations" | "production" | "procurement";
}

// from category manager
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

// from cost-calculator

export interface Material {
    id: string
    name: string
    price: number
    category: string
    minOrder?: number
    bulkDiscount?: { quantity: number; discount: number }[]
}

export interface CalculatorIngredient {
    materialId: string
    materialName: string
    quantity: number
    unitPrice: number
    totalCost: number
    percentage: number
}

export interface OptimizationSuggestion {
    type: "substitute" | "bulk" | "supplier" | "formula"
    title: string
    description: string
    savings: number
    impact: "low" | "medium" | "high"
    confidence: number
}

// from formulation calculator

export interface FormulationMaterial {
    id: string;
    name: string;
    quantity: number;
    cost: number;
}

export interface SavedFormulation {
    id: string;
    name: string;
    materials: FormulationMaterial[];
    totalCost: number;
    totalWeight: number;
    timestamp: number;
}

// from formulations manager
export interface ProductIngredient {
    material_id: string;
    material_name: string;
    qty_kg: number;
    cost_per_kg: number;
    total_cost: number;
}

export interface Product {
    id: string;
    product_name: string;
    description?: string;
    composition: ProductIngredient[];
    total_cost_per_kg: number;
    selling_price_per_kg: number;
    profit_margin: number;
    batch_size_kg: number;
    status: "active" | "draft" | "discontinued";
}

// from material manager
export interface RawMaterial {
    id: string;
    material: string;
    price_per_kg: number;
    tax: number;
    price_with_tax_per_kg: number;
    supplier_id: string;
    category: string;
    notes?: string;
    status: "active" | "low-stock" | "out-of-stock";
}

// from procurement-manager
export interface Supplier {
    id: string
    name: string
    contact: string
    phone: string
    rating: number
    materials: SupplierMaterial[]
    performance: {
        onTimeDelivery: number
        qualityScore: number
        priceCompetitiveness: number
    }
}

export interface SupplierMaterial {
    material_id: string
    material_name: string
    price_per_kg: number
    moq: number
    lead_time_days: number
    availability: "in-stock" | "limited" | "out-of-stock"
}

export interface PurchaseOrder {
    id: string
    supplier_id: string
    supplier_name: string
    items: OrderItem[]
    total_cost: number
    status: "draft" | "sent" | "confirmed" | "delivered" | "cancelled"
    order_date: string
    expected_delivery: string
}

export interface OrderItem {
    material_id: string
    material_name: string
    quantity: number
    unit_price: number
    total_price: number
}

// from production-planning
export interface ProductionItem {
    product_id: string;
    product_name: string;
    quantity_kg: number;
    cost_per_kg: number;
    total_cost: number;
    materials_required: MaterialRequirement[];
}

export interface MaterialRequirement {
    material_id: string;
    material_name: string;
    required_qty: number;
    available_qty: number;
    shortage: number;
    cost_per_kg: number;
    total_cost: number;
}

export interface ProductionPlan {
    id: string;
    plan_name: string;
    description?: string;
    start_date: string;
    end_date: string;
    products: ProductionItem[];
    total_cost: number;
    total_revenue: number;
    total_profit: number;
    status: "draft" | "scheduled" | "in-progress" | "completed" | "cancelled";
    progress: number;
}

// from Supplier Management
export interface Supplier2 {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    rating: number;
    isActive: boolean;
    paymentTerms: string;
    leadTime: number; // in days
    notes: string;
    createdAt: string;
}

export interface SupplierMaterial2 {
    id: string;
    supplierId: string;
    materialName: string;
    materialCategory: string;
    unitPrice: number;
    currency: string;
    moq: number; // minimum order quantity
    unit: string; // kg, liters, pieces, etc.
    bulkDiscounts: { quantity: number; discount: number }[];
    leadTime: number;
    availability: "in-stock" | "limited" | "out-of-stock";
    lastUpdated: string;
    notes: string;
}
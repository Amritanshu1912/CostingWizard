export const DATA_TYPE_NAMES: Record<string, string> = {
    recipes: "Product Recipes",
    products: "Product Recipes",
    "production-plans": "Production Plans",
    productionPlans: "Production Plans",
    suppliers: "Supplier Data",
    supplierMaterials: "Supplier Materials",
    materials: "Raw Materials",
    packaging: "Packaging",
    supplierPackaging: "Supplier Packaging",
    labels: "Labels",
    supplierLabels: "Supplier Labels",
    inventoryItems: "Inventory Items",
    inventoryTransactions: "Inventory Transactions",
    transportationCosts: "Transportation Costs",
    recipeVariants: "Recipe Variants",
    purchaseOrders: "Purchase Orders",
    categories: "Categories",
    "cost-analysis": "Cost Analysis",
    "user-settings": "User Settings",
    "material-inventory": "Material Inventory",
    "procurement-orders": "Purchase Orders",
};

export const DATA_TYPES = [
    "recipe",
    "production-plan",
    "supplier",
    "material",
    "packaging",
    "label",
    "inventory",
    "transport",
    "recipe-variant",
    "purchase-order",
    "category",
    "cost-analysis",
    "settings",
] as const;

export type DataType = typeof DATA_TYPES[number];

export const DATA_TYPE_COLORS: Record<
    DataType,
    "default" | "destructive" | "outline" | "secondary"
> = {
    recipe: "default",
    "production-plan": "secondary",
    supplier: "outline",
    material: "default",
    packaging: "secondary",
    label: "outline",
    inventory: "destructive",
    transport: "secondary",
    "recipe-variant": "default",
    "purchase-order": "outline",
    category: "secondary",
    "cost-analysis": "destructive",
    settings: "outline",
};

export const AUTOSAVE_INTERVAL = 2000; // 2 seconds

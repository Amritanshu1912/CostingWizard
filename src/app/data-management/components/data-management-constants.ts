export const DATA_TYPE_NAMES: Record<string, string> = {
    recipes: "Product Recipes",
    "production-plans": "Production Plans",
    suppliers: "Supplier Data",
    "cost-analysis": "Cost Analysis",
    "user-settings": "User Settings",
    "material-inventory": "Material Inventory",
    "procurement-orders": "Purchase Orders",
};

export const DATA_TYPES = [
    "recipe",
    "production-plan",
    "supplier",
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
    "cost-analysis": "destructive",
    settings: "outline",
};

export const AUTOSAVE_INTERVAL = 2000; // 2 seconds

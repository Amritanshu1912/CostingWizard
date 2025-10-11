import type { DataType } from "./data-management-constants";
import { DATA_TYPE_NAMES } from "./data-management-constants";

export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
        Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
};

export const getDataName = (key: string): string => {
    return (
        DATA_TYPE_NAMES[key] ||
        key.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
};

export const getDataType = (key: string): DataType => {
    if (key === "products" || key.includes("recipe")) return "recipe";
    if (key === "productionPlans" || key.includes("production")) return "production-plan";
    if (key === "suppliers" || key === "supplierMaterials" || key.includes("supplier")) return "supplier";
    if (key === "materials") return "material";
    if (key === "packaging" || key === "supplierPackaging") return "packaging";
    if (key === "labels" || key === "supplierLabels") return "label";
    if (key === "inventoryItems" || key === "inventoryTransactions") return "inventory";
    if (key === "transportationCosts") return "transport";
    if (key === "recipeVariants") return "recipe-variant";
    if (key === "purchaseOrders") return "purchase-order";
    if (key === "categories") return "category";
    if (key.includes("cost")) return "cost-analysis";
    return "settings";
};

export const getTypeIcon = (type: DataType) => {
    const icons = {
        recipe: "FileText",
        "production-plan": "Database",
        supplier: "Database",
        material: "Package",
        packaging: "Box",
        label: "Tag",
        inventory: "Archive",
        transport: "Truck",
        "recipe-variant": "FileText",
        "purchase-order": "ShoppingCart",
        category: "Folder",
        "cost-analysis": "TrendingUp",
        settings: "Settings",
    };
    return icons[type] || "Database";
};

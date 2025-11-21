// ============================================
// FILE 1: data-management-types.ts
// ============================================
export interface TableStat {
  count: number;
  size: number;
  error?: boolean;
}

export interface ExportProgress {
  current: number;
  total: number;
}

export interface BackupSettings {
  enabled: boolean;
  interval: string;
  lastBackup: string | null;
}

export const TABLE_CATEGORIES = {
  "Core Data": ["categories", "materials", "suppliers", "supplierMaterials"],
  "Products & Recipes": [
    "recipes",
    "recipeVariants",
    "recipeIngredients",
    "products",
  ],
  Production: ["ProductionBatches", "purchaseOrders"],
  "Packaging & Labels": [
    "packaging",
    "supplierPackaging",
    "labels",
    "supplierLabels",
  ],
  Inventory: ["inventoryItems", "inventoryTransactions", "transportationCosts"],
} as const;

export const formatTableName = (name: string): string => {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

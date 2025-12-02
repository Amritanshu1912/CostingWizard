export type CapacityUnit = "kg" | "L" | "ml" | "gm" | "pcs";

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BulkDiscount {
  quantity: number;
  discount: number;
}

// ============================================================================
// CORE DATABASE INTERFACES
// ============================================================================

export interface Category extends BaseEntity {
  name: string;
  description?: string;
  color?: string;
}

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
  bulkPrice?: number;
  quantityForBulkPrice?: number;
  bulkDiscounts?: BulkDiscount[];
  leadTime?: number;
  transportationCost?: number;
  notes?: string;
}

// ============================================================================
// SHARED BASE INTERFACES
// ============================================================================

// Base for all material-related UI models
interface BaseMaterialInfo {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
}

// Base for supplier material UI models
interface BaseSupplierMaterialInfo {
  id: string;
  materialName: string;
  materialCategory: string;
  categoryColor: string;
  supplierName: string;
  supplierRating: number;
  unitPrice: number;
  priceWithTax: number;
  unit: CapacityUnit;
  moq: number;
  leadTime: number;
}

// ============================================================================
// UI MODELS
// ============================================================================

export interface MaterialListItem extends BaseMaterialInfo {
  supplierCount: number;
  updatedAt?: string;
}

export interface MaterialDetails
  extends BaseMaterialInfo,
    Pick<BaseEntity, "createdAt" | "updatedAt"> {
  notes?: string;
  suppliers: Array<{
    id: string;
    name: string;
    rating: number;
  }>;
  totalStock: number;
  stockStatus: "in-stock" | "low-stock" | "out-of-stock";
}

export interface MaterialWithSuppliers
  extends BaseMaterialInfo,
    Pick<BaseEntity, "createdAt" | "updatedAt"> {
  notes?: string;
  supplierCount: number;
  suppliers: Array<{
    id: string;
    name: string;
    rating: number;
    isActive: boolean;
  }>;
}

export interface SupplierMaterialRow
  extends BaseSupplierMaterialInfo,
    Pick<BaseEntity, "createdAt" | "updatedAt"> {
  materialId: string;
  supplierId: string;
  bulkPrice?: number;
  quantityForBulkPrice?: number;
  tax: number;
  transportationCost?: number;
  notes?: string;
}

export interface SupplierMaterialCard extends BaseSupplierMaterialInfo {
  isBestPrice?: boolean;
  savings?: number;
  currentStock: number;
}

export interface SupplierMaterialAnalytics
  extends Omit<BaseSupplierMaterialInfo, "leadTime"> {
  currentStock: number;
  stockValue: number;
  stockStatus: "in-stock" | "low-stock" | "out-of-stock" | "overstock";
  turnoverRate?: number;
  daysOfStock?: number;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface MaterialFormData extends Omit<Material, keyof BaseEntity> {}

export interface SupplierMaterialFormData {
  supplierId: string;
  materialId?: string;
  materialName: string;
  materialCategory: string;
  bulkPrice: number;
  quantityForBulkPrice: number;
  unit: CapacityUnit;
  tax: number;
  moq: number;
  leadTime: number;
  transportationCost?: number;
  bulkDiscounts?: BulkDiscount[];
  notes?: string;
}

export interface CategoryFormData
  extends Pick<Category, "name" | "description"> {}

export interface MaterialFormErrors {
  name?: string;
  category?: string;
  supplierId?: string;
  materialName?: string;
  materialCategory?: string;
  bulkPrice?: string;
  quantityForBulkPrice?: string;
  unit?: string;
  tax?: string;
  moq?: string;
  leadTime?: string;
}

// ============================================================================
// FILTER/ANALYTICS TYPES
// ============================================================================

export interface MaterialFilters {
  searchTerm?: string;
  category?: string;
  supplierId?: string;
  priceRange?: { min?: number; max?: number };
}

export interface MaterialsAnalytics {
  totalMaterials: number;
  avgPrice: number;
  avgTax: number;
  highestPrice: number;
  stockAlerts: number;
  categoryDistribution: Array<{
    category: string;
    categoryColor: string;
    count: number;
    percentage: number;
    avgPrice: number;
  }>;
  priceRanges: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

export interface MaterialPriceComparison {
  materialId: string;
  materialName: string;
  materialCategory: string;
  categoryColor: string;
  alternatives: SupplierMaterialCard[];
  cheapest: SupplierMaterialCard;
  mostExpensive: SupplierMaterialCard;
  savings: number;
  savingsPercentage: number;
  averagePrice: number;
}

export interface SupplierMaterialPerformance {
  supplierId: string;
  supplierName: string;
  supplierRating: number;
  materialCount: number;
  avgPrice: number;
  avgLeadTime: number;
  inStockCount: number;
  limitedCount: number;
  outOfStockCount: number;
  availabilityScore: number;
}

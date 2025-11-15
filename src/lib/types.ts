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
  addCategory: (category: Omit<Category, "id">) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
}

export type CapacityUnit = "kg" | "L" | "ml" | "gm" | "pcs";

// ============================================================================
// SUPPLIERS
// ============================================================================

export interface ContactPerson {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}

export interface Supplier extends BaseEntity {
  name: string;
  contactPersons?: ContactPerson[];
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

  bulkPrice?: number; // The actual quoted price
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
export type PackagingType =
  | "bottle"
  | "jar"
  | "can"
  | "box"
  | "pouch"
  | "other";
export type BuildMaterial =
  | "PET"
  | "HDPE"
  | "Glass"
  | "Plastic"
  | "Paper"
  | "Other";

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
  bulkPrice: number; // The actual quoted price
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
  bulkPrice?: number; // The actual quoted price
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
  unitPrice: number; // locked supplier unit price
  tax: number; // Locked tax percentage
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
  targetCostPerKg?: number;
  status: "draft" | "testing" | "active" | "archived" | "discontinued";
  version?: number;
  instructions?: string;
  notes?: string;
}

export type OptimizationGoalType =
  | "cost_reduction"
  | "supplier_diversification"
  | "custom";

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
  optimizationGoal?:
    | "cost_reduction"
    | "quality_improvement"
    | "supplier_diversification"
    | "other";
  isActive: boolean;

  // Audit trail
  changes?: RecipeVariantChange[];
  notes?: string;
}

export interface RecipeVariantChange {
  type:
    | "quantity_change"
    | "supplier_change"
    | "ingredient_added"
    | "ingredient_removed";
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

  totalWeight: number;
  totalCost: number;
  taxedTotalCost: number;
  costPerKg: number;
  taxedCostPerKg: number;

  varianceFromTarget?: number;
  variancePercentage?: number;
  isAboveTarget?: boolean;
}

// ============================================================================
// PRODUCT SYSTEM (Final SKU)
// ============================================================================

// Product - The master product definition/family
export interface Product extends BaseEntity {
  name: string; // e.g., "Harpic Toilet Cleaner"
  description?: string;

  // Recipe reference - can be original recipe OR a variant
  recipeId: string; // This is EITHER a Recipe.id OR RecipeVariant.id
  isRecipeVariant: boolean; // true if recipeId points to RecipeVariant

  // Product metadata
  status: "draft" | "active" | "discontinued";
  barcode?: string;
  imageUrl?: string;
  tags?: string[];
  shelfLife?: number; // Days

  notes?: string;
}

/**
 * ProductVariant - Size/packaging variations of a product
 * Each variant represents a different SKU (e.g., "Harpic 1kg", "Harpic 500gm")
 * STORED IN INDEXEDDB
 */
export interface ProductVariant extends BaseEntity {
  productId: string; // References Product.id

  // Variant identity
  name: string; // e.g., "1kg Bottle", "500gm Pouch"
  sku: string; // Unique SKU for this variant

  // Size specification
  fillQuantity: number; // e.g., 1000 for 1kg
  fillUnit: CapacityUnit; // e.g., "gm"

  // Packaging & Labels (references to supplier selections)
  packagingSelectionId: string; // References SupplierPackaging.id
  frontLabelSelectionId?: string; // References SupplierLabel.id
  backLabelSelectionId?: string; // References SupplierLabel.id

  // Quantities needed for this variant
  labelsPerUnit: number; // Usually 1 front + 1 back = 2

  // Pricing (what you sell at)
  sellingPricePerUnit: number;
  targetProfitMargin?: number; // Desired margin %
  minimumProfitMargin?: number; // Don't sell below this

  // Distribution
  distributionChannels?: string[]; // ["retail", "wholesale", "online"]
  unitsPerCase?: number; // For bulk sales
  sellingPricePerCase?: number;

  // Status
  isActive: boolean;

  // Optional: Lock component prices at a point in time
  priceSnapshot?: ProductVariantPriceSnapshot;

  notes?: string;
}

/**
 * ProductVariantPriceSnapshot - Optional price locking
 * Captures costs at a specific point in time for quotations/analysis
 */
export interface ProductVariantPriceSnapshot {
  snapshotAt: Date;
  reason?: "quotation" | "cost_analysis" | "production_batch" | "other";

  // Recipe cost at snapshot time
  recipeCostPerKg: number;
  recipeTaxPerKg: number;

  // Packaging cost at snapshot time
  packagingUnitPrice: number;
  packagingTax: number;

  // Label costs at snapshot time
  frontLabelUnitPrice?: number;
  frontLabelTax?: number;
  backLabelUnitPrice?: number;
  backLabelTax?: number;

  notes?: string;
}

// ============================================================================
// PRODUCT COMPUTED TYPES (Calculated on-the-fly, NOT stored)
// ============================================================================

/**
 * ProductVariantWithDetails - Product variant with joined data
 * Computed by joining with Product, Recipe, Packaging, Labels
 */
export interface ProductVariantWithDetails extends ProductVariant {
  // Joined product info
  product?: Product;
  productName: string;
  productCategory?: string;

  // Joined recipe info
  recipe?: Recipe;
  recipeName: string;
  recipeVariant?: RecipeVariant;

  // Joined packaging info
  packaging?: SupplierPackagingWithDetails;
  packagingName: string;
  packagingCapacity: number;
  packagingUnit: CapacityUnit;

  // Joined label info
  frontLabel?: SupplierLabelWithDetails;
  frontLabelName?: string;
  backLabel?: SupplierLabelWithDetails;
  backLabelName?: string;

  // Display helpers
  displayName: string; // "Harpic 1kg Bottle"
  displaySku: string;
}

/**
 * ProductVariantCostAnalysis - Complete cost breakdown
 * Computed from current prices of recipe, packaging, labels
 */
export interface ProductVariantCostAnalysis {
  variantId: string;
  variantName: string;
  sku: string;

  // Fill specifications
  fillQuantity: number;
  fillUnit: CapacityUnit;
  fillQuantityInKg: number; // Normalized to kg for calculations

  // Recipe costs (from RecipeCostAnalysis)
  recipeCostPerKg: number;
  recipeTaxPerKg: number;
  recipeCostForFill: number; // recipeCostPerKg * fillQuantityInKg
  recipeTaxForFill: number;
  recipeTotalForFill: number; // with tax

  // Packaging costs
  packagingUnitPrice: number;
  packagingTax: number;
  packagingTaxAmount: number;
  packagingTotal: number; // with tax

  // Label costs
  frontLabelUnitPrice: number;
  frontLabelTax: number;
  frontLabelTaxAmount: number;
  frontLabelTotal: number; // with tax

  backLabelUnitPrice?: number;
  backLabelTax?: number;
  backLabelTaxAmount?: number;
  backLabelTotal?: number; // with tax

  totalLabelsCost: number; // Sum of all labels with tax

  // Total costs
  totalCostWithoutTax: number;
  totalTaxAmount: number;
  totalCostWithTax: number;

  // Per-kg calculations
  costPerKgWithoutTax: number; // totalCostWithoutTax / fillQuantityInKg
  costPerKgWithTax: number; // totalCostWithTax / fillQuantityInKg

  // Profitability
  sellingPricePerUnit: number;
  grossProfit: number; // sellingPrice - totalCostWithTax
  grossProfitMargin: number; // (grossProfit / sellingPrice) * 100

  // Target comparison
  targetProfitMargin?: number;
  marginVsTarget?: number; // Actual margin - target margin
  meetsMinimumMargin: boolean;

  // Cost breakdown by component (for charts/tables)
  costBreakdown: {
    component: "recipe" | "packaging" | "front_label" | "back_label";
    name: string;
    cost: number; // with tax
    percentage: number; // of total cost
  }[];

  // Price comparison with snapshot (if locked)
  priceSnapshot?: ProductVariantPriceSnapshot;
  priceChangedSinceSnapshot: boolean;
  costDifferenceFromSnapshot?: number; // Current cost - snapshot cost
  costDifferencePercentage?: number;

  // Warnings/Alerts
  warnings: string[];
  hasAvailabilityIssues: boolean;
}

/**
 * ProductFamilyAnalysis - Analysis across all variants of a product
 * Useful for comparing different sizes
 */
export interface ProductFamilyAnalysis {
  productId: string;
  productName: string;

  variants: ProductVariantCostAnalysis[];
  variantCount: number;
  activeVariantCount: number;

  // Aggregate metrics
  averageMargin: number;
  bestMarginVariant?: {
    variantId: string;
    variantName: string;
    margin: number;
  };
  worstMarginVariant?: {
    variantId: string;
    variantName: string;
    margin: number;
  };

  // Size comparison
  mostEconomicalSize?: {
    variantId: string;
    variantName: string;
    costPerKg: number;
  };

  // Revenue potential (if you track sales data later)
  totalPotentialRevenue?: number;
}

/**
 * Component cost summary for a product variant
 * Used in UI tables/cards
 */
export interface ComponentCostSummary {
  componentType: "recipe" | "packaging" | "label";
  itemName: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  tax: number;
  totalCost: number;
  totalCostWithTax: number;
}

/**
 * Quick variant comparison view
 * For showing multiple variants side-by-side
 */
export interface VariantComparison {
  variantId: string;
  sku: string;
  size: string; // e.g., "1kg", "500gm"
  sellingPrice: number;
  cost: number;
  margin: number;
  costPerKg: number;
  isActive: boolean;
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
  status:
    | "draft"
    | "submitted"
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled";
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
    packaging: {
      packagingId: string;
      packagingName: string;
      requiredQty: number;
      availableQty: number;
      shortage: number;
    }[];
    labels: {
      labelId: string;
      labelName: string;
      requiredQty: number;
      availableQty: number;
      shortage: number;
    }[];
  };
}

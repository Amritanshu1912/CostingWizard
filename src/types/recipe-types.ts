import type { BaseEntity, CapacityUnit } from "@/types/shared-types";

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
  | "quality_improvement"
  | "supplier_diversification"
  | "other";

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
  optimizationGoal?: OptimizationGoalType;
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
  currentStock: number;
  stockStatus: string;
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

/**
 * Unified type for items that can be compared
 * Extends existing types instead of duplicating
 */
export type ComparisonItem =
  | (RecipeDisplay & { itemType: "recipe" })
  | (RecipeVariant & {
      itemType: "variant";
      parentRecipe: RecipeDisplay;
      // Computed fields for variants
      costPerKg: number;
      taxedCostPerKg: number;
      totalWeight: number;
      // Add missing properties to align with RecipeDisplay
      ingredients: RecipeIngredientDisplay[];
      totalCost: number;
      taxedTotalCost: number;
      ingredientCount: number;
      variantCount: number;
      status: RecipeDisplay["status"];
      description?: string;
    });

/**
 * Metric definition for comparison table
 */
export interface ComparisonMetric {
  key: string;
  label: string;
  getValue: (item: ComparisonItem) => number | string;
  format: (value: number | string) => string;
  calculateDiff?: (
    current: number,
    baseline: number
  ) => {
    value: string;
    trend: "up" | "down" | "neutral";
  };
  description?: string;
}

/**
 * Ingredient comparison data
 */
export interface ComparisonIngredient {
  materialId: string;
  materialName: string;
  values: Record<
    string,
    {
      quantity: number;
      unit: string;
      supplier: string;
      cost: number;
      present: boolean;
    }
  >;
}

/**
 * Summary statistics for comparison
 */
export interface ComparisonSummary {
  itemCount: number;
  costRange: { min: number; max: number; diff: number };
  weightRange: { min: number; max: number };
  commonIngredients: number;
  uniqueToItems: Record<string, number>;
  bestCost: { itemId: string; name: string; cost: number };
  worstCost: { itemId: string; name: string; cost: number };
}

/**
 * Extended ingredient interface for editing with temporary fields
 */
export interface EditableIngredient extends RecipeIngredient {
  _isNew?: boolean;
  // Temporary fields for two-dropdown selection
  selectedMaterialId?: string;
  lockedPricing?: LockedPricing;
}

/**
 * Extended ingredient interface for experimentation with change tracking
 */
export interface ExperimentIngredient extends RecipeIngredient {
  _changed?: boolean;
  _changeTypes?: Set<"quantity" | "supplier">; // Track multiple changes
  _originalQuantity?: number;
  _originalSupplierId?: string;
}

/**
 * Metrics for recipe experimentation
 */
export interface ExperimentMetrics {
  originalCost: number;
  modifiedCost: number;
  originalWeight: number;
  modifiedWeight: number;
  originalTotalCost: number;
  modifiedTotalCost: number;
  originalTotalCostWithTax: number;
  modifiedTotalCostWithTax: number;
  originalCostPerKgWithTax: number;
  modifiedCostPerKgWithTax: number;
  savings: number;
  savingsPercent: number;
  targetGap?: number;
  changeCount: number;
}

/**
 * Aggregate statistics across all recipes
 */
export interface RecipeStats {
  totalRecipes: number;
  activeRecipes: number;
  avgCostPerKg: number;
  totalIngredients: number;
  totalVariants: number;
  targetAchievementRate: number;
}

/**
 * Suggestion for optimizing recipe cost
 */
export interface OptimizationSuggestion {
  type: "supplier_switch" | "quantity_reduction";
  ingredientName: string;
  currentSupplier: string;
  suggestedSupplier?: string;
  currentPrice: number;
  suggestedPrice?: number;
  savings: number;
  savingsPercent: number;
  confidence: number;
}

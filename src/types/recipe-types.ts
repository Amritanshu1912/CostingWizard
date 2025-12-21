// src/types/recipe-types.ts
import type { BaseEntity, CapacityUnit } from "@/types/shared-types";

// ============================================================================
// CORE DATABASE SCHEMAS (IndexedDB Tables)
// These represent the actual structure stored in the database
// ============================================================================

/**
 * Recipe entity - The formula for making a product
 * Stored in: db.recipes
 */
export interface Recipe extends BaseEntity {
  name: string;
  description?: string;
  targetCostPerKg?: number;
  status: "draft" | "testing" | "active" | "archived" | "discontinued";
  version?: number;
  instructions?: string;
  notes?: string;
}

/**
 * Recipe ingredient entity - A single ingredient in a recipe
 * Stored in: db.recipeIngredients
 * Relationship: ingredient.recipeId → recipe.id (many-to-one)
 */
export interface RecipeIngredient extends BaseEntity {
  recipeId: string; // Points to parent recipe
  supplierMaterialId: string; // References supplier_materials table
  quantity: number;
  unit: CapacityUnit;
  lockedPricing?: LockedPricing;
}

/**
 * Price locking information for ingredients
 * Used to freeze pricing at a specific point in time
 */
export interface LockedPricing {
  unitPrice: number; // Locked supplier unit price
  tax: number; // Locked tax percentage
  lockedAt: Date;
  reason?: "cost_analysis" | "quote" | "production_batch" | "other";
  notes?: string;
}

/**
 * Recipe variant entity - An experimental version of a recipe
 * Stored in: db.recipeVariants
 *
 * Uses dual storage strategy:
 * - ingredientIds: References to original RecipeIngredient records (for tracking)
 * - ingredientsSnapshot: Immutable copy of ingredients (for historical accuracy)
 *
 * When loading: Prefer snapshot (source of truth) over IDs
 */
export interface RecipeVariant extends BaseEntity {
  originalRecipeId: string;
  name: string;
  description?: string;

  // Dual storage strategy
  ingredientIds: string[]; // References to ingredient IDs
  ingredientsSnapshot?: VariantIngredientSnapshot[]; // Immutable copy

  optimizationGoal?: OptimizationGoalType;
  isActive: boolean;
  changes?: RecipeVariantChange[];
  notes?: string;
}

/**
 * Optimization goal types for variants
 */
export type OptimizationGoalType =
  | "cost_reduction"
  | "quality_improvement"
  | "supplier_diversification"
  | "other";

/**
 * Snapshot of ingredient for variant historical record
 */
export interface VariantIngredientSnapshot extends BaseEntity {
  supplierMaterialId: string;
  quantity: number;
  unit: CapacityUnit;
  lockedPricing?: LockedPricing;
  notes?: string;
}

/**
 * Change record for variant audit trail
 */
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
  changedAt: Date;
}

// ============================================================================
// VIEW MODELS - For displaying data in UI components
// These include computed/joined data for specific use cases
// ============================================================================

/**
 * Minimal recipe data for list views
 * Used in: RecipeListView component
 * Fetched by: useRecipeList() hook
 *
 * @example
 * ```tsx
 * const recipes = useRecipeList();
 * recipes.map(r => <RecipeCard key={r.id} recipe={r} />)
 * ```
 */
export interface RecipeListItem extends BaseEntity {
  name: string;
  description?: string;
  status: Recipe["status"];
  version: number;

  // Computed costs
  costPerKg: number;
  taxedCostPerKg: number;
  targetCostPerKg?: number;

  // Counts (no actual ingredient data)
  ingredientCount: number;
  variantCount: number;

  // Variance indicators
  varianceFromTarget?: number;
  variancePercentage?: number;
  isAboveTarget?: boolean;
}

/**
 * Complete recipe data for detail views
 * Used in: RecipeDetailView, Recipe Lab
 * Fetched by: useRecipeDetail(id) hook
 *
 * Includes all recipe fields plus computed totals
 * Does NOT include ingredients array (fetch separately)
 */
export interface RecipeDetail extends Recipe {
  // Computed totals
  totalWeight: number; // in grams
  totalCost: number;
  taxedTotalCost: number;
  costPerKg: number;
  taxedCostPerKg: number;

  // Target variance
  varianceFromTarget?: number;
  variancePercentage?: number;
  isAboveTarget?: boolean;

  // Counts
  ingredientCount: number;
  variantCount: number;
}

/**
 * Ingredient data for detail views and tables
 * Used in: RecipeDetailView ingredients tab, Recipe Lab
 * Fetched by: useRecipeIngredients(recipeId) hook
 *
 * Includes enriched data from joined tables (materials, suppliers, inventory)
 */
export interface RecipeIngredientDetail extends BaseEntity {
  // Core ingredient data (from RecipeIngredient)
  recipeId: string;
  supplierMaterialId: string;
  quantity: number;
  unit: CapacityUnit;
  lockedPricing?: LockedPricing;

  // Joined display data
  materialName: string;
  supplierName: string;
  displayName: string; // "Material Name (Supplier Name)"

  // Computed costs
  pricePerKg: number;
  tax: number; // Tax percentage
  costForQuantity: number;
  taxedPriceForQuantity: number;
  priceSharePercentage: number; // % of total recipe cost

  // Price lock status
  isPriceLocked: boolean;
  priceChangedSinceLock: boolean;
  priceDifference?: number; // Current price - locked price

  // Inventory status
  currentStock: number;
  stockStatus: string; // "in-stock" | "low-stock" | "out-of-stock"
}

/**
 * Minimal supplier material data for recipe operations
 * Used in: Recipe Lab, ingredient selection dropdowns
 * Fetched by: useSupplierMaterialsForRecipe() hook
 *
 * Contains only fields needed for recipes (not all 25+ fields)
 */
export interface SupplierMaterialForRecipe {
  id: string;
  materialId: string;
  supplierId: string;

  // Display names
  materialName: string;
  supplierName: string;

  // Pricing
  unitPrice: number;
  tax: number;
  capacityUnit: CapacityUnit;

  // Terms (optional)
  moq?: number;
  leadTime?: number;

  // Status
  stockStatus?: string;
  currentStock?: number;
}

/**
 * Variant with computed cost metrics
 * Used in: Variant lists, comparison views
 * Fetched by: useRecipeVariants(recipeId) hook
 */
export interface RecipeVariantWithMetrics extends RecipeVariant {
  // Computed costs (same as parent recipe)
  totalWeight: number;
  totalCost: number;
  taxedTotalCost: number;
  costPerKg: number;
  taxedCostPerKg: number;

  // Comparison with original
  costDifference: number; // variant cost - original cost
  costDifferencePercentage: number;

  // Ingredient count
  ingredientCount: number;
}

// ============================================================================
// TEMPORARY UI STATE - For editing and experimentation
// These are NOT stored in DB, only exist in component state
// ============================================================================

/**
 * Ingredient with temporary edit state
 * Used in: Recipe edit mode (RecipeDetailView)
 *
 * Extends RecipeIngredient with UI-specific fields for form handling
 */
export interface EditableIngredient extends RecipeIngredient {
  _isNew?: boolean; // Flag for newly added ingredients
  selectedMaterialId?: string; // For two-step material selection
}

/**
 * Ingredient with experiment tracking
 * Used in: Recipe Lab experimentation
 *
 * Tracks changes made during experimentation before saving
 */
export interface ExperimentIngredient extends RecipeIngredient {
  _changed?: boolean; // Has this ingredient been modified?
  _changeTypes?: Set<"quantity" | "supplier">; // What changed?
  _originalQuantity?: number; // For reset functionality
  _originalSupplierId?: string; // For reset functionality
}

/**
 * Real-time metrics during experimentation
 * Used in: Recipe Lab metrics panel
 * Computed by: useRecipeExperiment() hook
 */
export interface ExperimentMetrics {
  // Original recipe metrics
  originalCost: number; // per kg
  originalWeight: number; // in grams
  originalTotalCost: number;
  originalTotalCostWithTax: number;
  originalCostPerKgWithTax: number;

  // Modified (experiment) metrics
  modifiedCost: number; // per kg
  modifiedWeight: number; // in grams
  modifiedTotalCost: number;
  modifiedTotalCostWithTax: number;
  modifiedCostPerKgWithTax: number;

  // Savings
  savings: number; // originalCost - modifiedCost
  savingsPercent: number;

  // Target comparison
  targetGap?: number; // modifiedCost - targetCost

  // Change tracking
  changeCount: number; // Number of modified ingredients
}

// ============================================================================
// COMPARISON TYPES - For recipe/variant comparison views
// ============================================================================

/**
 * Unified type for items that can be compared
 * Can be either a recipe or a variant
 */
export type ComparisonItem =
  | (RecipeDetail & {
      itemType: "recipe";
      uniqueSuppliers: number;
      supplierNames: string[];
    })
  | (RecipeVariantWithMetrics & {
      itemType: "variant";
      parentRecipe: RecipeDetail;
      uniqueSuppliers: number;
      supplierNames: string[];
    });

/**
 * Metric definition for comparison tables
 * Defines how to extract and format values for comparison
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
 * Ingredient comparison across multiple recipes/variants
 * Shows how the same material is used differently
 */
export interface ComparisonIngredient {
  materialId: string;
  materialName: string;

  // Values per recipe/variant (keyed by item ID)
  values: Record<
    string,
    {
      quantity: number;
      unit: string;
      supplier: string;
      cost: number;
      present: boolean; // Is this ingredient in this recipe?
    }
  >;
}

/**
 * Summary statistics for comparison view
 */
export interface ComparisonSummary {
  itemCount: number;

  // Cost range
  costRange: {
    min: number;
    max: number;
    diff: number;
  };

  // Weight range
  weightRange: {
    min: number;
    max: number;
  };

  // Ingredient overlap
  commonIngredients: number; // Present in all items
  uniqueToItems: Record<string, number>; // Unique per item

  // Best/worst performers
  bestCost: { itemId: string; name: string; cost: number };
  worstCost: { itemId: string; name: string; cost: number };
}

// ============================================================================
// ANALYTICS & STATISTICS
// ============================================================================

/**
 * Analytics-specific data structure
 * Contains recipe with ingredient details needed for charts
 */
export interface RecipeWithIngredients {
  id: string;
  name: string;
  costPerKg: number;
  targetCostPerKg?: number;
  ingredients: Array<{
    materialName: string;
    supplierName: string;
    displayName: string;
    quantity: number;
    unit: string;
    costForQuantity: number;
  }>;
}

/**
 * Aggregate statistics across all recipes
 * Used in: Recipe dashboard, analytics views
 */
export interface RecipeStats {
  totalRecipes: number;
  activeRecipes: number;
  avgCostPerKg: number;
  totalIngredients: number;
  totalVariants: number;
  targetAchievementRate: number; // % of recipes meeting target
}

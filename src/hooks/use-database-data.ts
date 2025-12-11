// src/hooks/use-database-data.ts
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";

// ============================================================================
// MATERIAL DOMAIN
// ============================================================================

/**
 * Get all material categories
 * @returns Array of categories
 */
export function useAllCategories() {
  return useLiveQuery(() => db.categories.toArray());
}

/**
 * Get all materials
 * @returns Array of materials
 */
export function useAllMaterials() {
  return useLiveQuery(() => db.materials.toArray());
}

/**
 * Get all suppliers
 * @returns Array of suppliers
 */
export function useAllSuppliers() {
  return useLiveQuery(() => db.suppliers.toArray());
}

/**
 * Get all supplier materials
 * @returns Array of supplier materials
 */
export function useAllSupplierMaterials() {
  return useLiveQuery(() => db.supplierMaterials.toArray());
}

// ============================================================================
// PACKAGING DOMAIN
// ============================================================================

/**
 * Get all packaging types
 * @returns Array of packaging
 */
export function useAllPackaging() {
  return useLiveQuery(() => db.packaging.toArray());
}

/**
 * Get all supplier packaging
 * @returns Array of supplier packaging
 */
export function useAllSupplierPackaging() {
  return useLiveQuery(() => db.supplierPackaging.toArray());
}

// ============================================================================
// LABEL DOMAIN
// ============================================================================

/**
 * Get all labels
 * @returns Array of labels
 */
export function useAllLabels() {
  return useLiveQuery(() => db.labels.toArray());
}

/**
 * Get all supplier labels
 * @returns Array of supplier labels
 */
export function useAllSupplierLabels() {
  return useLiveQuery(() => db.supplierLabels.toArray());
}

// ============================================================================
// RECIPE DOMAIN
// ============================================================================

/**
 * Get all recipes
 * @returns Array of recipes
 */
export function useAllRecipes() {
  return useLiveQuery(() => db.recipes.toArray());
}

/**
 * Get all recipe variants
 * @returns Array of recipe variants
 */
export function useAllRecipeVariants() {
  return useLiveQuery(() => db.recipeVariants.toArray());
}

/**
 * Get all recipe ingredients
 * @returns Array of recipe ingredients
 */
export function useAllRecipeIngredients() {
  return useLiveQuery(() => db.recipeIngredients.toArray());
}

// ============================================================================
// PRODUCT DOMAIN
// ============================================================================

/**
 * Get all products
 * @returns Array of products
 */
export function useAllProducts() {
  return useLiveQuery(() => db.products.toArray());
}

/**
 * Get all product variants
 * @returns Array of product variants
 */
export function useAllProductVariants() {
  return useLiveQuery(() => db.productVariants.toArray());
}

// ============================================================================
// PRODUCTION DOMAIN
// ============================================================================

/**
 * Get all production batches
 * @returns Array of production batches
 */
export function useAllProductionBatches() {
  return useLiveQuery(() => db.productionBatches.toArray());
}

/**
 * Get all purchase orders
 * @returns Array of purchase orders
 */
export function useAllPurchaseOrders() {
  return useLiveQuery(() => db.purchaseOrders.toArray());
}

// ============================================================================
// INVENTORY DOMAIN
// ============================================================================

/**
 * Get all inventory items
 * @returns Array of inventory items
 */
export function useAllInventoryItems() {
  return useLiveQuery(() => db.inventoryItems.toArray());
}

/**
 * Get active (unresolved) inventory alerts
 * @returns Array of unresolved alerts
 */
export function useAllInventoryAlerts() {
  return useLiveQuery(() =>
    db.inventoryAlerts.where("isResolved").equals(0).toArray()
  );
}

// ============================================================================
// TRANSPORTATION DOMAIN
// ============================================================================

/**
 * Get all transportation costs
 * @returns Array of transportation costs
 */
export function useAllTransportationCosts() {
  return useLiveQuery(() => db.transportationCosts.toArray());
}

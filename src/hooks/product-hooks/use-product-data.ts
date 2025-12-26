// src/hooks/products/use-product-data.ts

import { db } from "@/lib/db";
import type {
  Product,
  ProductDetail,
  ProductFormData,
  ProductListItem,
  ProductVariant,
  ProductVariantDetail,
} from "@/types/product-types";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";

// ============================================================================
// PRODUCT LIST & DETAIL HOOKS
// ============================================================================

/**
 * Hook: Get all products with minimal data for list display
 * Returns ProductListItem[] with recipe name and variant count
 *
 * @returns Array of products with enriched list data
 *
 * @example
 * const products = useProductList();
 * // Returns: [{ id, name, status, recipeName, variantCount, ... }]
 */
export function useProductList(): ProductListItem[] {
  const productsQuery = useLiveQuery(() => db.products.toArray(), []);
  const variantsQuery = useLiveQuery(() => db.productVariants.toArray(), []);
  const recipesQuery = useLiveQuery(() => db.recipes.toArray(), []);

  const products = useMemo(() => productsQuery || [], [productsQuery]);
  const variants = useMemo(() => variantsQuery || [], [variantsQuery]);
  const recipes = useMemo(() => recipesQuery || [], [recipesQuery]);

  return useMemo(() => {
    // Build variant count map
    const variantCountMap = new Map<string, number>();
    variants.forEach((v) => {
      variantCountMap.set(
        v.productId,
        (variantCountMap.get(v.productId) || 0) + 1
      );
    });

    // Build recipe map for quick lookups
    const recipeMap = new Map(recipes.map((r) => [r.id, r]));

    // Enrich products with list data
    return products.map((product) => {
      const recipe = recipeMap.get(product.recipeId);

      return {
        ...product,
        recipeName: recipe?.name || "Unknown Recipe",
        variantCount: variantCountMap.get(product.id) || 0,
      } as ProductListItem;
    });
  }, [products, variants, recipes]);
}

/**
 * Hook: Get single product with enriched detail data
 * Returns ProductDetail with recipe name and variant count
 *
 * @param productId - The product ID to fetch
 * @returns Product with enriched detail data, or null if not found
 *
 * @example
 * const product = useProductDetail("product-1");
 * // Returns: { id, name, recipeName, variantCount, ... }
 */
export function useProductDetail(
  productId: string | null
): ProductDetail | null {
  return (
    useLiveQuery(async (): Promise<ProductDetail | null> => {
      if (!productId) return null;

      const product = await db.products.get(productId);
      if (!product) return null;

      const variants = await db.productVariants
        .where("productId")
        .equals(productId)
        .toArray();

      const recipe = product.recipeId
        ? await db.recipes.get(product.recipeId)
        : null;

      return {
        ...product,
        recipeName: recipe?.name || "Unknown Recipe",
        variantCount: variants.length,
      } as ProductDetail;
    }, [productId]) || null
  );
}

// ============================================================================
// PRODUCT VARIANT HOOKS
// ============================================================================

/**
 * Hook: Get all variants for a product with enriched detail data
 * Returns ProductVariantDetail[] with recipe, packaging, and label names
 *
 * @param productId - The product ID to fetch variants for
 * @returns Array of variants with enriched detail data
 *
 * @example
 * const variants = useProductVariants("product-1");
 * // Returns: [{ id, name, recipeName, packagingName, ... }]
 */
export function useProductVariants(
  productId: string | null
): ProductVariantDetail[] {
  return (
    useLiveQuery(async (): Promise<ProductVariantDetail[]> => {
      if (!productId) return [];

      // Get variants for the product
      const variants = await db.productVariants
        .where("productId")
        .equals(productId)
        .toArray();

      if (variants.length === 0) return [];

      // Get product for recipe info
      const product = await db.products.get(productId);
      const recipe = product?.recipeId
        ? await db.recipes.get(product.recipeId)
        : null;

      // Fetch all supplier packaging/labels that variants reference
      const supplierPackagings = await db.supplierPackaging.toArray();
      const supplierLabels = await db.supplierLabels.toArray();
      const packagings = await db.packaging.toArray();
      const labels = await db.labels.toArray();

      // Build lookup maps
      const supplierPackagingMap = new Map(
        supplierPackagings.map((sp) => [sp.id, sp])
      );
      const supplierLabelMap = new Map(supplierLabels.map((sl) => [sl.id, sl]));
      const packagingMap = new Map(packagings.map((p) => [p.id, p]));
      const labelMap = new Map(labels.map((l) => [l.id, l]));

      // Enrich each variant
      return variants.map((variant) => {
        // Get packaging details
        const supplierPackaging = supplierPackagingMap.get(
          variant.packagingSelectionId
        );
        const packaging = supplierPackaging
          ? packagingMap.get(supplierPackaging.packagingId)
          : null;

        // Get label details
        const frontSupplierLabel = variant.frontLabelSelectionId
          ? supplierLabelMap.get(variant.frontLabelSelectionId)
          : null;
        const frontLabel = frontSupplierLabel?.labelId
          ? labelMap.get(frontSupplierLabel.labelId)
          : null;

        const backSupplierLabel = variant.backLabelSelectionId
          ? supplierLabelMap.get(variant.backLabelSelectionId)
          : null;
        const backLabel = backSupplierLabel?.labelId
          ? labelMap.get(backSupplierLabel.labelId)
          : null;

        return {
          ...variant,
          recipeName: recipe?.name || "Unknown Recipe",
          packagingName: packaging?.name || "Unknown Packaging",
          packagingCapacity: packaging?.capacity || 0,
          packagingUnit: packaging?.capacityUnit || "ml",
          frontLabelName: frontLabel?.name,
          backLabelName: backLabel?.name,
        } as ProductVariantDetail;
      });
    }, [productId]) || []
  );
}

// ============================================================================
// PRODUCT CRUD OPERATIONS
// ============================================================================

/**
 * Create a new product
 *
 * @param productData - Product data without generated fields
 * @returns The created product with generated ID
 *
 * @example
 * const product = await createProduct({
 *   name: "New Product",
 *   recipeId: "recipe-1",
 *   isRecipeVariant: false,
 *   status: "draft"
 * });
 */
export async function createProduct(
  productData: ProductFormData
): Promise<Product> {
  const newProduct: Product = {
    id: crypto.randomUUID(),
    ...productData,
    createdAt: new Date().toISOString(),
  };

  await db.products.add(newProduct);
  return newProduct;
}

/**
 * Update an existing product
 *
 * @param productId - The product ID to update
 * @param productData - Updated product data
 *
 * @example
 * await updateProduct("product-1", {
 *   name: "Updated Name",
 *   status: "active"
 * });
 */
export async function updateProduct(
  productId: string,
  productData: Partial<ProductFormData>
): Promise<void> {
  await db.products.update(productId, {
    ...productData,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a product and all its variants
 *
 * @param productId - The product ID to delete
 *
 * @example
 * await deleteProduct("product-1");
 */
export async function deleteProduct(productId: string): Promise<void> {
  // Delete all variants first
  await db.productVariants.where("productId").equals(productId).delete();
  // Then delete the product
  await db.products.delete(productId);
}

// ============================================================================
// VARIANT CRUD OPERATIONS
// ============================================================================

/**
 * Create or update a product variant
 * Uses put() to handle both create and update operations
 *
 * @param variant - Complete variant data
 *
 * @example
 * await saveProductVariant({
 *   id: "variant-1",
 *   productId: "product-1",
 *   name: "1kg Bottle",
 *   ...
 * });
 */
export async function saveProductVariant(
  variant: ProductVariant
): Promise<void> {
  await db.productVariants.put({
    ...variant,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a product variant
 *
 * @param variantId - The variant ID to delete
 *
 * @example
 * await deleteProductVariant("variant-1");
 */
export async function deleteProductVariant(variantId: string): Promise<void> {
  await db.productVariants.delete(variantId);
}

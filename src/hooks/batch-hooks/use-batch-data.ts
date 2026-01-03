// src/hooks/batch-hooks/use-batch-data.ts
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { db } from "@/lib/db";
import type { ProductionBatch, BatchListItem } from "@/types/batch-types";
import type {
  BatchWithDetails,
  BatchProductDetails,
  BatchVariantDetails,
} from "@/types/batch-types";
import type { Product } from "@/types/product-types";
import type { ProductVariant } from "@/types/product-types";
import { calculateBatchVariantMetrics } from "@/utils/batch-calculation-utils";

/**
 * Processed variant data with all necessary context
 */
export interface ProcessedBatchVariant {
  // IDs
  variantId: string;
  productId: string;

  // Names
  variantName: string;
  productName: string;

  // Database records
  variant: ProductVariant;
  product: Product;

  // Batch quantities
  totalFillQuantity: number;
  fillUnit: string;

  // Calculated metrics
  fillInKg: number;
  units: number;
  displayQuantity: string;

  // Recipe context
  recipeId: string | null;
}

/**
 * Processed batch structure
 */
export interface ProcessedBatch {
  batch: ProductionBatch;
  variants: ProcessedBatchVariant[];
}

/**
 * Foundation hook that processes batch structure once
 * All other batch hooks should use this as their base
 *
 * @param batchId - ID of batch to process
 * @returns Processed batch with all variant data
 */
export function useBatchFoundation(
  batchId: string | null
): ProcessedBatch | null {
  return (
    useLiveQuery(async (): Promise<ProcessedBatch | null> => {
      if (!batchId) return null;

      const batch = await db.productionBatches.get(batchId);
      if (!batch) return null;

      const variants: ProcessedBatchVariant[] = [];

      // Single iteration through all products and variants
      for (const item of batch.items) {
        const product = await db.products.get(item.productId);
        if (!product) continue;

        // Resolve recipe ID once
        const recipeId = product.isRecipeVariant
          ? (await db.recipeVariants.get(product.recipeId))?.originalRecipeId ||
            null
          : product.recipeId;

        for (const variantItem of item.variants) {
          const variant = await db.productVariants.get(variantItem.variantId);
          if (!variant) continue;

          // Calculate metrics once
          const metrics = calculateBatchVariantMetrics(
            variant.fillQuantity,
            variant.fillUnit,
            variantItem.totalFillQuantity,
            variantItem.fillUnit
          );

          // Skip variants with 0 units
          if (metrics.units === 0) continue;

          variants.push({
            variantId: variant.id,
            productId: product.id,
            variantName: variant.name,
            productName: product.name,
            variant,
            product,
            totalFillQuantity: variantItem.totalFillQuantity,
            fillUnit: variantItem.fillUnit,
            fillInKg: metrics.fillInKg,
            units: metrics.units,
            displayQuantity: metrics.displayQuantity,
            recipeId,
          });
        }
      }

      return { batch, variants };
    }, [batchId]) || null
  );
}

/**
 * Fetches all production batches
 * Returns raw batch data without joins
 */
export function useProductionBatches(): ProductionBatch[] {
  return useLiveQuery(() => db.productionBatches.toArray(), []) || [];
}

/**
 * Fetches enriched batch list with counts
 * Used for list views that need product/variant counts
 */
export function useBatchListItems(): BatchListItem[] {
  return (
    useLiveQuery(async (): Promise<BatchListItem[]> => {
      const batches = await db.productionBatches.toArray();

      return batches.map((batch) => ({
        ...batch,
        productCount: batch.items.length,
        variantCount: batch.items.reduce(
          (sum, item) => sum + item.variants.length,
          0
        ),
      }));
    }, []) || []
  );
}

/**
 * Fetches a single batch by ID
 * Returns null if not found
 */
export function useProductionBatch(
  batchId: string | null
): ProductionBatch | null {
  return (
    useLiveQuery(async () => {
      if (!batchId) return null;
      return await db.productionBatches.get(batchId);
    }, [batchId]) || null
  );
}

/**
 * Fetches complete batch details with product and variant information
 * Uses foundation hook to avoid redundant queries
 *
 * @param batchId - ID of the batch to fetch
 * @returns BatchWithDetails or null if batch not found
 */
export function useBatchDetails(
  batchId: string | null
): BatchWithDetails | null {
  const foundation = useBatchFoundation(batchId);

  return useMemo((): BatchWithDetails | null => {
    if (!foundation) return null;

    // Group variants by product
    const productMap = new Map<string, BatchProductDetails>();

    for (const pv of foundation.variants) {
      if (!productMap.has(pv.productId)) {
        productMap.set(pv.productId, {
          productId: pv.productId,
          productName: pv.productName,
          variants: [],
        });
      }

      const productDetails = productMap.get(pv.productId)!;

      const variantDetails: BatchVariantDetails = {
        variantId: pv.variantId,
        variantName: pv.variantName,
        productId: pv.productId,
        productName: pv.productName,
        fillQuantity: pv.variant.fillQuantity,
        fillUnit: pv.variant.fillUnit,
        totalFillQuantity: pv.totalFillQuantity,
        units: pv.units,
        displayQuantity: pv.displayQuantity,
      };

      productDetails.variants.push(variantDetails);
    }

    return {
      ...foundation.batch,
      products: Array.from(productMap.values()),
    };
  }, [foundation]);
}

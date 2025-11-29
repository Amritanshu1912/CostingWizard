// hooks/use-batch-operations.ts
import { db } from "@/lib/db";
import type { ProductionBatch } from "@/lib/types";

/**
 * Create a new batch
 * Calculations are done on-the-fly by hooks, not stored
 */
export async function createBatch(
  batchData: Omit<ProductionBatch, "id" | "createdAt" | "updatedAt">
): Promise<ProductionBatch> {
  const batchId = crypto.randomUUID();

  const newBatch: ProductionBatch = {
    id: batchId,
    ...batchData,
    createdAt: new Date().toISOString(),
  };

  await db.productionBatches.add(newBatch);
  return newBatch;
}

/**
 * Update existing batch
 */
export async function updateBatch(
  batchId: string,
  batchData: Omit<ProductionBatch, "id" | "createdAt" | "updatedAt">
): Promise<void> {
  const existingBatch = await db.productionBatches.get(batchId);
  if (!existingBatch) {
    throw new Error("Batch not found");
  }

  const updatedBatch: ProductionBatch = {
    ...existingBatch,
    ...batchData,
  };

  await db.productionBatches.put(updatedBatch);
}

/**
 * Delete a batch
 */
export async function deleteBatch(batchId: string): Promise<void> {
  await db.productionBatches.delete(batchId);
}

/**
 * Hook for batch operations (convenience wrapper)
 */
export function useBatchOperations() {
  return {
    createBatch,
    updateBatch,
    deleteBatch,
  };
}

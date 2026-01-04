// src/hooks/batch-hooks/use-batch-operations.ts
import { db } from "@/lib/db";
import type { ProductionBatch } from "@/types/batch-types";
import { generateId } from "@/utils/shared-utils";

/**
 * Creates a new production batch
 *
 * @param batchData - Batch data without id and timestamps
 * @returns Newly created batch with generated id and timestamps
 */
export async function createBatch(
  batchData: Omit<ProductionBatch, "id" | "createdAt" | "updatedAt">
): Promise<ProductionBatch> {
  const batchId = generateId("batch");
  const now = new Date().toISOString();

  const newBatch: ProductionBatch = {
    id: batchId,
    ...batchData,
    createdAt: now,
    updatedAt: now,
  };

  await db.productionBatches.add(newBatch);
  return newBatch;
}

/**
 * Updates an existing production batch
 *
 * @param batchId - ID of batch to update
 * @param batchData - Updated batch data
 * @throws Error if batch not found
 */
export async function updateBatch(
  batchId: string,
  batchData: Omit<ProductionBatch, "id" | "createdAt" | "updatedAt">
): Promise<void> {
  const existingBatch = await db.productionBatches.get(batchId);
  if (!existingBatch) {
    throw new Error(`Batch with id ${batchId} not found`);
  }

  const updatedBatch: ProductionBatch = {
    ...existingBatch,
    ...batchData,
    updatedAt: new Date().toISOString(),
  };

  await db.productionBatches.put(updatedBatch);
}

/**
 * Deletes a production batch
 *
 * @param batchId - ID of batch to delete
 */
export async function deleteBatch(batchId: string): Promise<void> {
  await db.productionBatches.delete(batchId);
}

/**
 * Hook that returns batch operation functions
 * Use this in components instead of importing functions directly
 */
export function useBatchOperations() {
  return {
    createBatch,
    updateBatch,
    deleteBatch,
  };
}

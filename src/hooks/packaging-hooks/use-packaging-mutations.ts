/**
 * Mutation hooks - All database write operations
 *
 * Encapsulates all CRUD operations for packaging and supplier packaging.
 * Components should never import db directly.
 *
 * Benefits:
 * - Single source for all mutations
 * - Consistent error handling
 * - Automatic timestamp management
 * - Transaction support for complex operations
 */

import { db } from "@/lib/db";
import type {
  PackagingFormData,
  SupplierPackagingFormData,
} from "@/types/packaging-types";
import { normalizeText } from "@/utils/text-utils";
import { nanoid } from "nanoid";
import { useCallback } from "react";

// ============================================================================
// PACKAGING MUTATIONS
// ============================================================================

export function useBasePackagingMutations() {
  const createPackaging = useCallback(
    async (data: PackagingFormData): Promise<string> => {
      const now = new Date().toISOString();
      const id = nanoid();

      // Check for duplicates
      const normalized = normalizeText(data.name);
      const duplicate = await db.packaging
        .filter((p) => normalizeText(p.name) === normalized)
        .first();

      if (duplicate) {
        throw new Error(`Packaging with these specifications already exists`);
      }

      // Create packaging
      await db.packaging.add({
        id,
        name: data.name.trim(),
        type: data.type,
        capacity: data.capacity,
        unit: data.unit,
        buildMaterial: data.buildMaterial,
        notes: data.notes?.trim(),
        createdAt: now,
      });

      return id;
    },
    []
  );

  const updatePackaging = useCallback(
    async (id: string, data: Partial<PackagingFormData>): Promise<void> => {
      const now = new Date().toISOString();

      // If name is being updated, check for duplicates
      if (data.name) {
        const normalized = normalizeText(data.name);
        const duplicate = await db.packaging
          .filter((p) => p.id !== id && normalizeText(p.name) === normalized)
          .first();

        if (duplicate) {
          throw new Error(`Packaging with these specifications already exists`);
        }
      }

      // Update packaging
      await db.packaging.update(id, {
        ...(data.name && { name: data.name.trim() }),
        ...(data.type && { type: data.type }),
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.unit && { unit: data.unit }),
        ...(data.buildMaterial !== undefined && {
          buildMaterial: data.buildMaterial,
        }),
        ...(data.notes !== undefined && { notes: data.notes?.trim() }),
        updatedAt: now,
      });
    },
    []
  );

  const deletePackaging = useCallback(async (id: string): Promise<void> => {
    // Check if packaging is in use by any supplier packaging
    const inUse = await db.supplierPackaging
      .where("packagingId")
      .equals(id)
      .count();

    if (inUse > 0) {
      throw new Error("Cannot delete packaging that is used by suppliers");
    }

    await db.packaging.delete(id);
  }, []);

  return {
    createPackaging,
    updatePackaging,
    deletePackaging,
  };
}

// ============================================================================
// SUPPLIER PACKAGING MUTATIONS
// ============================================================================

export function useSupplierPackagingMutations() {
  const createSupplierPackaging = useCallback(
    async (data: SupplierPackagingFormData): Promise<string> => {
      const now = new Date().toISOString();

      return await db.transaction(
        "rw",
        [db.packaging, db.supplierPackaging],
        async () => {
          // Step 1: Get or create packaging
          let packagingId: string;

          // Check if packaging with exact combination already exists
          // Business rule: each unique combination of (name + type + material + capacity + unit) is separate
          const existingPackaging = await db.packaging
            .filter(
              (p) =>
                normalizeText(p.name) === normalizeText(data.packagingName) &&
                p.type === data.packagingType &&
                p.capacity === data.capacity &&
                p.unit === data.unit &&
                p.buildMaterial === data.buildMaterial
            )
            .first();

          if (existingPackaging) {
            // Use existing packaging with exact match
            packagingId = existingPackaging.id;
          } else {
            // Create new packaging - no exact match found
            packagingId = nanoid();
            await db.packaging.add({
              id: packagingId,
              name: data.packagingName.trim(),
              type: data.packagingType!,
              capacity: data.capacity,
              unit: data.unit,
              buildMaterial: data.buildMaterial,
              notes: data.notes?.trim(),
              createdAt: now,
            });
          }

          // Step 3: Create supplier packaging
          const supplierPackagingId = nanoid();
          await db.supplierPackaging.add({
            id: supplierPackagingId,
            supplierId: data.supplierId,
            packagingId,
            bulkPrice: data.bulkPrice,
            quantityForBulkPrice: data.quantityForBulkPrice || 1,
            unit: data.unit,
            tax: data.tax,
            moq: data.moq,
            leadTime: data.leadTime,
            transportationCost: data.transportationCost,
            bulkDiscounts: data.bulkDiscounts || [],
            notes: data.notes?.trim(),
            createdAt: now,
            unitPrice: data.unitPrice,
          });

          return supplierPackagingId;
        }
      );
    },
    []
  );

  const updateSupplierPackaging = useCallback(
    async (
      id: string,
      data: Partial<SupplierPackagingFormData>
    ): Promise<void> => {
      const now = new Date().toISOString();

      return await db.transaction(
        "rw",
        [db.packaging, db.supplierPackaging],
        async () => {
          const supplierPackaging = await db.supplierPackaging.get(id);
          if (!supplierPackaging) {
            throw new Error("Supplier packaging not found");
          }

          // Handle packaging changes - use combination logic like createSupplierPackaging
          if (
            data.packagingName ||
            data.packagingType ||
            data.capacity ||
            data.unit ||
            data.buildMaterial
          ) {
            // Ensure required fields are present for combination check
            if (
              !data.packagingName ||
              !data.packagingType ||
              data.capacity === undefined ||
              !data.unit ||
              data.buildMaterial === undefined
            ) {
              throw new Error(
                "All packaging properties are required for updates"
              );
            }

            // Check if the new packaging combination already exists
            // Business rule: each unique combination is separate
            const existingPackaging = await db.packaging
              .filter(
                (p) =>
                  normalizeText(p.name) ===
                    normalizeText(data.packagingName!) &&
                  p.type === data.packagingType &&
                  p.capacity === data.capacity &&
                  p.unit === data.unit &&
                  p.buildMaterial === data.buildMaterial
              )
              .first();

            let newPackagingId: string;

            if (existingPackaging) {
              // Use existing packaging with exact match
              newPackagingId = existingPackaging.id;
            } else {
              // Create new packaging - no exact match found
              newPackagingId = nanoid();
              await db.packaging.add({
                id: newPackagingId,
                name: data.packagingName.trim(),
                type: data.packagingType,
                capacity: data.capacity,
                unit: data.unit,
                buildMaterial: data.buildMaterial,
                notes: data.notes?.trim(),
                createdAt: now,
              });
            }

            // Update supplier packaging to reference the new/correct packaging
            await db.supplierPackaging.update(id, {
              packagingId: newPackagingId,
              updatedAt: now,
            });
          }

          // Update supplier packaging
          await db.supplierPackaging.update(id, {
            ...(data.supplierId && { supplierId: data.supplierId }),
            ...(data.bulkPrice !== undefined && { bulkPrice: data.bulkPrice }),
            ...(data.quantityForBulkPrice !== undefined && {
              quantityForBulkPrice: data.quantityForBulkPrice,
            }),
            ...(data.unitPrice !== undefined && { unitPrice: data.unitPrice }),
            ...(data.tax !== undefined && { tax: data.tax }),
            ...(data.moq !== undefined && { moq: data.moq }),
            ...(data.leadTime !== undefined && { leadTime: data.leadTime }),
            ...(data.transportationCost !== undefined && {
              transportationCost: data.transportationCost,
            }),
            ...(data.bulkDiscounts && { bulkDiscounts: data.bulkDiscounts }),
            ...(data.notes !== undefined && { notes: data.notes?.trim() }),
            updatedAt: now,
          });
        }
      );
    },
    []
  );

  const deleteSupplierPackaging = useCallback(
    async (id: string): Promise<void> => {
      await db.supplierPackaging.delete(id);
    },
    []
  );

  return {
    createSupplierPackaging,
    updateSupplierPackaging,
    deleteSupplierPackaging,
  };
}

// ============================================================================
// COMBINED MUTATIONS HOOK
// ============================================================================

/**
 * Get all mutation hooks in one place
 * Convenient for components that need multiple mutation types
 */
export function usePackagingMutations() {
  const packagingMutations = useBasePackagingMutations();
  const supplierPackagingMutations = useSupplierPackagingMutations();

  return {
    ...packagingMutations,
    ...supplierPackagingMutations,
  };
}
